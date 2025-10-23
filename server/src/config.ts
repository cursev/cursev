import { getConfig } from "../../config";
import { GameConfig, TeamMode } from "../../shared/gameConfig";
import { util } from "../../shared/utils/util";

const isProd = process.env["NODE_ENV"] === "production";
export const serverConfigPath = isProd ? "../../" : "";
// to remove "server/dist" from the path to load the config from...
export const Config = getConfig(isProd, serverConfigPath);

// Ajouter la propriété apiKey si elle n'existe pas déjà
if (!Config.apiKey) {
    Config.apiKey = process.env.API_KEY || "default_api_key";
}

const BACKPACK_LEVEL = 3;

util.mergeDeep(Config, {
    modes: [
        { mapName: "main", teamMode: TeamMode.Solo, enabled: true },
        // { mapName: "main", teamMode: TeamMode.Duo, enabled: false },
        // { mapName: "main", teamMode: TeamMode.Squad, enabled: false },
    ],
    defaultItems: {
        backpack: "backpack03",
        helmet: "helmet03",
        chest: "chest03",
        scope: "4xscope",
        inventory: {
            frag: GameConfig.bagSizes["frag"][BACKPACK_LEVEL],
            smoke: GameConfig.bagSizes["smoke"][BACKPACK_LEVEL],
            strobe: GameConfig.bagSizes["strobe"][BACKPACK_LEVEL],
            mine: GameConfig.bagSizes["mine"][BACKPACK_LEVEL],
            mirv: GameConfig.bagSizes["mirv"][BACKPACK_LEVEL],
            bandage: GameConfig.bagSizes["bandage"][BACKPACK_LEVEL],
            healthkit: GameConfig.bagSizes["healthkit"][BACKPACK_LEVEL],
            soda: GameConfig.bagSizes["soda"][BACKPACK_LEVEL],
            painkiller: GameConfig.bagSizes["painkiller"][BACKPACK_LEVEL],
            "1xscope": 1,
            "2xscope": 1,
            "4xscope": 1,
            "8xscope": 0,
            "15xscope": 0,
            "30xscope": 0,
            "60xscope": 0,
            "120xscope": 0,
            "240xscope": 0,
            "580xscope": 0,
            "1160xscope": 0
        },
    },
});
