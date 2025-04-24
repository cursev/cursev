
import type {
    ClientToServerTeamMsg,
    RoomData,
    ServerToClientTeamMsg,
    TeamErrorMsg,
    TeamMenuPlayer,
} from "../../shared/net/team";
import type { ApiServer } from "./apiServer";
import { Config } from "./config";
import { Logger } from "./utils/logger";
import {
    HTTPRateLimit,
    WebSocketRateLimit,
    getIp,
    validateUserName,
    verifyTurnsStile,
} from "./utils/serverHelpers";

export interface TeamSocketData {
    sendMsg: (response: string) => void;
    closeSocket: () => void;
    roomUrl: string;
    rateLimit: Record<symbol, number>;
    ip: string;
}

class Player {
    room?: Room;

    name = "Player";

    inGame = false;

    get isLeader() {
        // first player is always leader
        return !!this.room && this.room.players[0] == this;
    }

    get playerId() {
        return this.room ? this.room.players.indexOf(this) : -1;
    }

    get data(): TeamMenuPlayer {
        return {
            name: this.name,
            inGame: this.inGame,
            isLeader: this.isLeader,
            playerId: this.playerId,
        };
    }

    lastMsgTime = Date.now();

    disconnectTimeout: ReturnType<typeof setTimeout>;

    constructor(
        public socket: WSContext<SocketData>,
        public teamMenu: TeamMenu,
        public userId: string | null,
        public ip: string,
    ) {
        // disconnect if didn't join a room in 5 seconds
        this.disconnectTimeout = setTimeout(() => {
            if (!this.room) {
                this.socket.close();
            }
        }, 5000);
    }

    setName(name: string) {
        this.name = validateUserName(name).validName;
    }

    send<T extends ServerToClientTeamMsg["type"]>(
        type: T,
        data: (ServerToClientTeamMsg & { type: T })["data"],
    ) {
        this.socket.send(
            JSON.stringify({
                type,
                data,
            }),
        );
    }
}

class Room {
    players: Player[] = [];

    data: RoomData = {
        roomUrl: "",
        findingGame: false,
        lastError: "",
        region: "",
        autoFill: true,
        enabledGameModeIdxs: [],
        gameModeIdx: 1,
        maxPlayers: 4,
    };

    constructor(
        public teamMenu: TeamMenu,
        public id: string,
        initialData: ClientRoomData,
    ) {
        this.data.roomUrl = `#${id}`;
        this.data.enabledGameModeIdxs = teamMenu.allowedGameModeIdxs();

        this.setProps(initialData);
    }

    addPlayer(player: Player) {
        if (this.players.length >= this.data.maxPlayers) return;

        this.players.push(player);
        player.room = this;

        clearTimeout(player.disconnectTimeout);

        this.sendState();
    }

    onMsg(player: Player, msg: ClientToServerTeamMsg) {
        if (player.room !== this) return;

        switch (msg.type) {
            case "changeName": {
                player.setName(msg.data.name);
                this.sendState();
                break;
            }
            case "keepAlive": {
                player.lastMsgTime = Date.now();
                player.send("keepAlive", {});
                break;
            }
            case "gameComplete": {
                player.inGame = false;
                this.sendState();
                break;
            }
            case "setRoomProps": {
                if (!player.isLeader) break;
                this.setProps(msg.data);
                break;
            }
            case "kick": {
                if (!player.isLeader) break;
                this.kick(msg.data.playerId);
                break;
            }
            case "playGame": {
                if (!player.isLeader) break;
                this.findGame(msg.data);
                break;
            }
        }
    }

    setProps(props: ClientRoomData) {
        let region = props.region;
        if (!(region in Config.regions)) {
            region = Object.keys(Config.regions)[0];
        }
        this.data.region = region;

        let gameModeIdx = props.gameModeIdx;

        const modes = this.teamMenu.server.modes;

        if (!this.data.enabledGameModeIdxs.includes(gameModeIdx)) {
            // we don't allow creating teams if there's no valid team mode
            // so this will never be -1
            gameModeIdx = modes.findIndex((mode) => mode.enabled && mode.teamMode > 1);
        }

        this.data.gameModeIdx = gameModeIdx;

        this.data.maxPlayers = modes[gameModeIdx].teamMode;
        this.data.autoFill = props.autoFill;

        // kick players that don't fit on the new max players
        while (this.players.length > this.data.maxPlayers) {
            this.kick(this.players.length - 1);
        }

        this.sendState();
    }

    kick(playerId: number) {
        const player = this.players[playerId];
        if (!player) return;

        player.send("kicked", {});

        this.removePlayer(player);
    }

    removePlayer(player: Player) {
        const idx = this.players.indexOf(player);
        if (idx === -1) return;

        this.players.splice(idx, 1);
        player.room = undefined;
        player.socket.close();

        this.sendState();

        if (!this.players.length) {
            this.teamMenu.removeRoom(this);
        }
    }

    findGameCooldown = 0;

    async findGame(data: TeamPlayGameMsg["data"]) {
        if (this.data.findingGame) return;
        if (this.players.some((p) => p.inGame)) return;
        const roomLeader = this.players[0];
        if (!roomLeader) return;

        this.data.findingGame = true;
        this.sendState();

        let region = data.region;
        if (!(region in Config.regions)) {
            region = Object.keys(Config.regions)[0];
        }
        this.data.region = region;

        const tokenMap = new Map<Player, string>();

        const playerData = this.players.map((p) => {
            const token = randomUUID();
            tokenMap.set(p, token);
            return {
                token,
                userId: p.userId,
                ip: p.ip,
            };
        });

        const mode = this.teamMenu.server.modes[this.data.gameModeIdx];
        if (!mode || !mode.enabled) {
            return;
        }

        if (this.teamMenu.server.captchaEnabled) {
            if (!data.turnstileToken) {
                this.data.lastError = "find_game_invalid_captcha";
                this.sendState();
                return;
            }

            try {
                if (!(await verifyTurnsStile(data.turnstileToken, roomLeader.ip))) {
                    this.data.lastError = "find_game_invalid_captcha";
                    this.sendState();
                    return;
                }
            } catch (err) {
                this.teamMenu.logger.error("Failed verifying turnstile:", err);
                this.data.lastError = "find_game_error";
                this.sendState();
                return;
            }
        }

        const res = await this.teamMenu.server.findGame({
            mapName: mode.mapName,
            teamMode: mode.teamMode,
            autoFill: this.data.autoFill,
            region: region,
            version: data.version,
            playerData,
        });

        if ("error" in res) {
            const errMap: Partial<Record<FindGameError, TeamMenuErrorType>> = {
                full: "find_game_full",
                invalid_protocol: "find_game_invalid_protocol",
            };

            this.data.lastError = errMap[res.error] || "find_game_error";
            this.sendState();
            // 1 second cooldown on error
            this.findGameCooldown = Date.now() + 1000;
            return;
        }

        this.findGameCooldown = Date.now() + 5000;

        const joinData = res;
        if (!joinData) return;

        this.data.lastError = "";

        for (const player of this.players) {
            player.inGame = true;
            const token = tokenMap.get(player);

            if (!token) {
                this.teamMenu.logger.warn(`Missing token for player ${player.name}`);
                continue;
            }

            player.send("joinGame", {
                zone: "",
                data: token,
                gameId: res.gameId,
                addrs: res.addrs,
                hosts: res.hosts,
                useHttps: res.useHttps,
            });
        }

        this.sendState();
    }

    sendState() {
        const players = this.players.map((p) => p.data);

        for (const player of this.players) {
            player.send("state", {
                localPlayerId: player.playerId,
                room: this.data,
                players,
            });
        }
    }
}

const alphanumerics = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
function randomString(len: number) {
    let str = "";
    let i = 0;
    while (i < len) {
        str += alphanumerics.charAt(Math.floor(Math.random() * alphanumerics.length));
        i++;
    }
    return `${str}`;
}

export class TeamMenu {
    rooms = new Map<string, Room>();

    logger = new Logger("TeamMenu");

    constructor(public server: ApiServer) {
        setInterval(() => {
            for (const room of this.rooms.values()) {
                // just making sure ig
                if (!room.players.length) {
                    this.removeRoom(room);
                    continue;
                }
                if (room.data.findingGame && room.findGameCooldown < Date.now()) {
                    room.data.findingGame = false;
                    room.sendState();
                }

                // kick players that haven't sent a keep alive msg in over a minute
                // client sends it every 45 seconds
                for (const player of room.players) {
                    if (player.lastMsgTime < Date.now() - 60 * 1000) {
                        room.removePlayer(player);
                    }
                }
            }
        }, 1000);
    }

    allowedGameModeIdxs() {
        return this.server.modes
            .map((_, i) => i)
            .filter((i) => {
                const mode = this.server.modes[i];
                return mode.enabled && mode.teamMode > 1;
            });
    }

    init(app: Hono, upgradeWebSocket: UpgradeWebSocket) {
        const teamMenu = this;

        const httpRateLimit = new HTTPRateLimit(1, 2000);
        const wsRateLimit = new WebSocketRateLimit(5, 1000, 10);

        app.ws("/team_v2", {
            idleTimeout: 30,
            /**
             * Upgrade the connection to WebSocket.
             */
            upgrade(res, req, context) {
                res.onAborted((): void => {});

                const ip = getIp(res, req, Config.apiServer.proxyIPHeader);

                let closeReason: TeamMenuErrorType | undefined;

                if (
                    !ip ||
                    httpRateLimit.isRateLimited(ip) ||
                    wsRateLimit.isIpRateLimited(ip)
                ) {
                    closeReason = "rate_limited";
                }

                if (!closeReason && (await isBehindProxy(ip!))) {
                    closeReason = "behind_proxy";
                }

                try {
                    if (await isBanned(ip!)) {
                        closeReason = "banned";
                    }
                } catch (err) {
                    this.logger.error("Failed to check if IP is banned", err);
                }

                wsRateLimit.ipConnected(ip!);

                let userId: string | null = null;
                const sessionId = getCookie(c, "session") ?? null;

                if (sessionId) {
                    try {
                        const account = await validateSessionToken(sessionId);
                        userId = account.user?.id || null;

                        if (account.user?.banned) {
                            userId = null;
                        }
                    } catch (err) {
                        this.logger.error(`Failed to validate session:`, err);
                        userId = null;
                    }
                }

                return {
                    onOpen(_event, ws) {
                        ws.raw = {
                            ip,
                            rateLimit: {},
                            player: undefined,
                        };

                        if (closeReason) {
                            ws.send(
                                JSON.stringify({
                                    type: "error",
                                    data: {
                                        type: closeReason as TeamMenuErrorType,
                                    },
                                } satisfies TeamErrorMsg),
                            );
                            ws.close();
                            return;
                        }
                        teamMenu.onOpen(ws as WSContext<SocketData>, userId, ip!);
                    },

                    onMessage(event, ws) {
                        const data = ws.raw! as SocketData;

                        if (wsRateLimit.isRateLimited(data.rateLimit)) {
                            ws.close();
                            return;
                        }

                        try {
                            teamMenu.onMsg(
                                ws as WSContext<SocketData>,
                                event.data as string,
                            );
                        } catch (err) {
                            teamMenu.logger.error("Error processing message:", err);
                            ws.close();
                        }
                    },

                    onClose(_event, ws) {
                        teamMenu.onClose(ws as WSContext<SocketData>);

                        const data = ws.raw! as SocketData;
                        wsRateLimit.ipDisconnected(data.ip);
                    },
                };
            }),
        );
    }

    onOpen(ws: WSContext<SocketData>, userId: string | null, ip: string) {
        const player = new Player(ws, this, userId, ip);
        ws.raw!.player = player;
    }

    onMsg(ws: WSContext<SocketData>, data: string) {
        let msg: ClientToServerTeamMsg;
        try {
            parsedMessage = JSON.parse(new TextDecoder().decode(message));
            this.validateMsg(parsedMessage);
        } catch {
            localPlayerData.closeSocket();
            return;
        }

        const player = ws.raw?.player;
        // i really don't think this is necessary but /shrug
        if (!player) {
            ws.close();
            return;
        }

        // handle creation and joining messages
        // other messages are handled on the player class
        if (!player.room) {
            switch (msg.type) {
                case "create": {
                    // don't allow creating a team if there's no team mode enabled
                    if (!this.allowedGameModeIdxs().length) {
                        player.send("error", { type: "create_failed" });
                        break;
                    }

                const activeCodes = new Set(this.rooms.keys());
                let roomUrl = `#${randomString(4)}`;
                while (activeCodes.has(roomUrl)) {
                    roomUrl = `#${randomString(4)}`;
                }

                localPlayerData.roomUrl = roomUrl;

                const room = this.addRoom(roomUrl, parsedMessage.data.roomData, player);
                if (!room) {
                    response = teamErrorMsg("create_failed");
                    this.sendResponse(response, player);
                    break;
                }

                this.sendRoomState(room);
                break;
            }
            case "join": {
                const roomUrl = `#${parsedMessage.data.roomUrl}`;
                const room = this.rooms.get(roomUrl);
                // join fail if room doesnt exist or if room is already full
                if (!room) {
                    response = teamErrorMsg("join_failed");
                    localPlayerData.sendMsg(JSON.stringify(response));
                    break;
                }
                if (room.roomData.maxPlayers == room.players.length) {
                    response = teamErrorMsg("join_full");
                    localPlayerData.sendMsg(JSON.stringify(response));
                    break;
                }

                const name = validateUserName(parsedMessage.data.playerData.name);

                const player = {
                    name,
                    isLeader: false,
                    inGame: false,
                    playerId: room.players.length,
                    socketData: localPlayerData,
                } as RoomPlayer;
                room.players.push(player);

                localPlayerData.roomUrl = roomUrl;

                this.sendRoomState(room);
                break;
            }
            case "changeName": {
                const newName = validateUserName(parsedMessage.data.name);
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;
                player.name = newName;

                this.sendRoomState(room);
                break;
            }
            case "setRoomProps": {
                const newRoomData = parsedMessage.data;
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;
                if (!player.isLeader) {
                    return;
                }

                // do nothing if player tries to select disabled gamemode
                if (
                    !room.roomData.enabledGameModeIdxs.includes(newRoomData.gameModeIdx)
                ) {
                    return;
                }

                this.modifyRoom(newRoomData, room);
                this.sendRoomState(room);
                break;
            }
            case "kick": {
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;
                if (!player.isLeader) {
                    return;
                }
                const pToKick = room.players[parsedMessage.data.playerId];
                if (!pToKick || pToKick === player) {
                    return;
                }

                response = {
                    type: "kicked",
                    data: {},
                };
                this.sendResponse(response, pToKick);
                // player is removed and new room state is sent when the socket is inevitably closed after the kick
                break;
            }
            case "keepAlive": {
                const room = this.rooms.get(localPlayerData.roomUrl);
                if (!room) return;
                response = {
                    type: "keepAlive",
                    data: {},
                };
                this.sendResponses(response, room.players);
                break;
            }
            case "playGame": {
                // this message can only ever be sent by the leader
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;

                // if (!player.isLeader) {
                //     return;
                // }

                room.roomData.findingGame = true;
                this.sendRoomState(room);

                const data = parsedMessage.data;
                const playData = (
                    await this.server.findGame({
                        version: data.version,
                        region: data.region,
                        zones: data.zones,
                        gameModeIdx: room.roomData.gameModeIdx,
                        autoFill: room.roomData.autoFill,
                        playerCount: room.players.length,
                    })
                ).res[0];

                if ("err" in playData) {
                    response = teamErrorMsg("find_game_error");
                    this.sendResponse(response, player);
                    return;
                }

                if (room.groupHash) {
                    playData.data = room.groupHash;
                } else {
                    room.groupHash = playData.data;
                }

                response = {
                    type: "joinGame",
                    data: {
                        ...playData,
                        data: playData.data,
                    },
                };
                // this.sendResponses(response, room.players);

                // room.players.forEach((p) => {
                //     p.inGame = true;
                // });
                this.sendResponse(response, player);
                player.inGame = true;
                room.roomData.findingGame = false;

                this.sendRoomState(room);
                break;
            }
            case "gameComplete": {
                // doesn't necessarily mean game is over, sent when player leaves game and returns to team menu
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;
                player.inGame = false;
                room.roomData.findingGame = false;

                this.sendRoomState(room);
                break;
            }
        }
    }
}
