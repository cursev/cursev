import type { Hono } from "hono";
import type { UpgradeWebSocket } from "hono/ws";
import { GameConfig } from "../../../shared/gameConfig";
import type { Info } from "../../../shared/types/api";
import { Config } from "../config";
import { TeamMenu } from "../teamMenu";
import { GIT_VERSION } from "../utils/gitRevision";
import { Logger, defaultLogger } from "../utils/logger";
import type { FindGamePrivateBody, FindGamePrivateRes } from "../utils/types";

class Region {
    data: (typeof Config)["regions"][string];
    playerCount = 0;

    lastUpdateTime = Date.now();

    constructor(readonly id: string) {
        this.data = Config.regions[this.id];
    }

    async fetch<Data extends object>(endPoint: string, body: object) {
        const url = `http${this.data.https ? "s" : ""}://${this.data.address}/${endPoint}`;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "survev-api-key": Config.secrets.SURVEV_API_KEY,
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                return (await res.json()) as Data;
            }
        } catch (err) {
            defaultLogger.error(`Error fetching region ${this.id}`, err);
            return undefined;
        }
    }

    async findGame(body: FindGamePrivateBody): Promise<FindGamePrivateRes> {
        const data = await this.fetch<FindGamePrivateRes>("api/find_game", body);
        if (!data) {
            return { error: "full" };
        }
        return data;
    }
}

interface RegionData {
    playerCount: number;
}

export class ApiServer {
    readonly logger = new Logger("Server");

    teamMenu = new TeamMenu(this);

    regions: Record<string, Region> = {};

    modes = [...Config.modes];

    captchaEnabled = Config.captchaEnabled;

    constructor() {
        for (const region in Config.regions) {
            this.regions[region] = new Region(region);
        }
    }

    init(app: Hono, upgradeWebSocket: UpgradeWebSocket) {
        this.teamMenu.init(app, upgradeWebSocket);
    }

    getSiteInfo(): Info {
        const data: Info = {
            modes: this.modes,
            pops: {},
            youtube: { name: "", link: "" },
            twitch: [],
            country: "US",
            gitRevision: GIT_VERSION,
            captchaEnabled: this.captchaEnabled,
        };

        for (const region in this.regions) {
            data.pops[region] = {
                playerCount: this.regions[region].playerCount,
                l10n: Config.regions[region].l10n,
            };
        }
        return data;
    }

    updateRegion(regionId: string, regionData: RegionData) {
        const region = this.regions[regionId];
        if (!region) {
            this.logger.warn("updateRegion: Invalid region", regionId);
            return;
        }
        region.playerCount = regionData.playerCount;
        region.lastUpdateTime = Date.now();
    }

    async findGame(body: FindGamePrivateBody, hostname?: string): Promise<FindGamePrivateRes> {
        if (body.version !== GameConfig.protocolVersion) {
            return { error: "invalid_protocol" };
        }

        // Si un accessCode est fourni et qu'un hostname est disponible, 
        // essayer de déterminer la région à partir du hostname pour les serveurs customs
        let region = body.region;
        if (body.accessCode && body.accessCode !== "" && hostname) {
            // Extraire le hostname sans le port
            const hostnameWithoutPort = hostname.split(':')[0];
            
            // Chercher si le hostname correspond à un proxy configuré
            if (Config.proxies) {
                for (const proxyHost in Config.proxies) {
                    if (hostnameWithoutPort.includes(proxyHost) || proxyHost.includes(hostnameWithoutPort)) {
                        // Si le proxy a une apiUrl, extraire la région depuis l'URL
                        const proxyDef = Config.proxies[proxyHost];
                        if (proxyDef.apiUrl) {
                            try {
                                const url = new URL(proxyDef.apiUrl);
                                // Chercher une région qui correspond à cette URL
                                for (const regionId in this.regions) {
                                    const regionData = Config.regions[regionId];
                                    if (regionData && url.hostname.includes(regionData.address.split(':')[0])) {
                                        region = regionId;
                                        break;
                                    }
                                }
                            } catch (e) {
                                // Si l'URL n'est pas valide, continuer avec la région originale
                            }
                        }
                        break;
                    }
                }
            }
            
            // Si aucune correspondance de proxy, chercher si le hostname correspond directement à une région
            if (region === body.region) {
                for (const regionId in this.regions) {
                    const regionData = Config.regions[regionId];
                    if (regionData && hostnameWithoutPort.includes(regionData.address.split(':')[0])) {
                        region = regionId;
                        break;
                    }
                }
            }
        }

        if (region in this.regions) {
            return await this.regions[region].findGame(body);
        }
        return { error: "full" };
    }
}

export const server = new ApiServer();
