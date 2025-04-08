import type { MapDefs } from "../../shared/defs/mapDefs";
import { GameConfig } from "../../shared/gameConfig";
import type { ConfigType, DeepPartial } from "./config";
import { THIS_REGION } from "./region";

const BACKPACK_LEVEL = 3;

const mapName: Record<typeof THIS_REGION, keyof typeof MapDefs> = {
    local: "cobalt",
    na: "cobalt",
    eu: "main",
};

const serverDataConfig = {
    local: {},
    na: {
        apiKey: "Vn3XPEgB7aXFJM98tucBZtYE0LOcJ+a9okNbm6m1rnc=",
        gameServer: {
            apiServerUrl: "http://resurviv.biz",
        },
        regions: {
            na: {
                https: false,
                address: "resurviv.biz:8001",
                l10n: "index-north-america",
            },
            eu: {
                https: true,
                address: "217.160.224.171:8001",
                l10n: "index-europe",
            },
        },
        thisRegion: "na",
    },
    eu: {
        gameServer: {
            apiServerUrl: "http://resurviv.biz",
        },
        regions: {
            eu: {
                https: true,
                address: "217.160.224.171:8001",
                l10n: "index-europe",
            },
        },
        thisRegion: "eu",
    },
};

export const CustomConfig: DeepPartial<ConfigType> = {
    ...serverDataConfig[THIS_REGION],
    client: {
        theme: "cobalt",
    },
    modes: [
        {
            mapName: "main",
            teamMode: 1,
            enabled: false,
        },
        {
            mapName: mapName[THIS_REGION],
            teamMode: 2,
            enabled: true,
        },
        {
            mapName: "main",
            teamMode: 4,
            enabled: false,
        },
    ],
    defaultItems: {
        backpack: "backpack03",
        helmet: "helmet03",
        chest: "chest03",
        scope: "4xscope",
        inventory: {
            frag: 3,
            smoke: 1,
            strobe: 1,
            mirv: 1,
            bandage: GameConfig.bagSizes["bandage"][BACKPACK_LEVEL],
            healthkit: GameConfig.bagSizes["healthkit"][BACKPACK_LEVEL],
            soda: GameConfig.bagSizes["soda"][BACKPACK_LEVEL],
            painkiller: GameConfig.bagSizes["painkiller"][BACKPACK_LEVEL],
            "1xscope": 1,
            "2xscope": 1,
            "4xscope": 1,
        },
    },
};
