import type { MapDef } from "../../../../shared/defs/mapDefs";
import { Main } from "../../../../shared/defs/maps/baseDefs";
import { GameConfig } from "../../../../shared/gameConfig";
import { util } from "../../../../shared/utils/util";
import { v2 } from "../../../../shared/utils/v2";
import { THIS_REGION } from "../../resurviv-config";

const switchToSmallMap = THIS_REGION === "eu" || THIS_REGION === "as";

const config = {
    mapSize: switchToSmallMap ? "small" : "large",
    places: 3,
    mapWidth: { large: 270, small: 230 },
    spawnDensity: { large: 37, small: 27 },
} as const;

const mapDef = {
    mapId: 6,
    desc: {
        name: "Halloween",
        icon: "img/gui/pumpkin-play.svg",
        buttonCss: "btn-mode-halloween",
    },
    assets: {
        audio: [
            {
                name: "log_01",
                channel: "sfx",
            },
            {
                name: "log_02",
                channel: "sfx",
            },
            {
                name: "pumpkin_break_01",
                channel: "sfx",
            },
            {
                name: "vault_change_02",
                channel: "sfx",
            },
            {
                name: "kill_leader_assigned_01",
                channel: "ui",
            },
            {
                name: "kill_leader_assigned_02",
                channel: "ui",
            },
            {
                name: "kill_leader_dead_01",
                channel: "ui",
            },
            {
                name: "kill_leader_dead_02",
                channel: "ui",
            },
            {
                name: "trick_01",
                channel: "ui",
            },
            {
                name: "trick_02",
                channel: "ui",
            },
            {
                name: "trick_03",
                channel: "ui",
            },
            {
                name: "treat_01",
                channel: "ui",
            },
            {
                name: "xp_pickup_01",
                channel: "ui",
            },
            {
                name: "xp_pickup_02",
                channel: "ui",
            },
            {
                name: "xp_drop_01",
                channel: "sfx",
            },
            {
                name: "xp_drop_02",
                channel: "sfx",
            },
        ],
        atlases: ["gradient", "loadout", "shared", "halloween"],
    },
    biome: {
        colors: {
            background: 1507328,
            water: 2621440,
            waterRipple: 1048833,
            beach: 6570254,
            riverbank: 3939077,
            grass: 2171908,
            underground: 1181697,
            playerSubmerge: 1310720,
        },
        particles: {
            camera: "falling_leaf_halloween",
        },
        valueAdjust: 0.3,
    },
    gameMode: {
        maxPlayers: 80,
        killLeaderEnabled: true,
        spookyKillSounds: true,
    },
    /* STRIP_FROM_PROD_CLIENT:START */
    gameConfig: {
        planes: {
            timings: [
                {
                    circleIdx: 1,
                    wait: 10,
                    options: { type: GameConfig.Plane.Airdrop },
                },
                {
                    circleIdx: 3,
                    wait: 2,
                    options: {
                        type: GameConfig.Plane.Airdrop,
                        airdropType: "airdrop_crate_02h",
                    },
                },
            ],
            crates: [
                { name: "airdrop_crate_01", weight: 10 },
                { name: "airdrop_crate_02", weight: 1 },
            ],
        },
    },
    lootTable: {
        tier_throwables: [
            { name: "frag", count: 2, weight: 0.5 },
            { name: "smoke", count: 1, weight: 1 },
            { name: "mirv", count: 2, weight: 0.05 },
        ],
        tier_airdrop_outfits: [
            { name: "", count: 1, weight: 4 },
            { name: "outfitAirdrop", count: 1, weight: 1 },
        ],
        tier_toilet: [
            { name: "tier_guns", count: 1, weight: 0.1 },
            { name: "tier_scopes", count: 1, weight: 0.05 },
            { name: "tier_medical", count: 1, weight: 0.6 },
            {
                name: "tier_throwables",
                count: 1,
                weight: 0.05,
            },
            { name: "tier_outfits", count: 1, weight: 0 },
        ],
        tier_container: [
            { name: "tier_guns", count: 1, weight: 0.29 },
            { name: "tier_ammo", count: 1, weight: 0.04 },
            { name: "tier_scopes", count: 1, weight: 0.15 },
            { name: "tier_armor", count: 1, weight: 0.1 },
            {
                name: "tier_medical",
                count: 1,
                weight: 0.17,
            },
            {
                name: "tier_throwables",
                count: 1,
                weight: 0.05,
            },
            { name: "tier_packs", count: 1, weight: 0.09 },
            { name: "tier_outfits", count: 1, weight: 0 },
        ],
        tier_scopes: [
            { name: "2xscope", count: 1, weight: 24 },
            { name: "4xscope", count: 1, weight: 5 },
        ],
        tier_airdrop_scopes: [
            { name: "", count: 1, weight: 18 },
            { name: "4xscope", count: 1, weight: 0 },
        ],
        tier_outfits: [
            { name: "outfitBarrel", count: 1, weight: 1 },
            { name: "outfitWoodBarrel", count: 1, weight: 1 },
            { name: "outfitStone", count: 1, weight: 1 },
            { name: "outfitTree", count: 1, weight: 1 },
            { name: "outfitStump", count: 1, weight: 1 },
            { name: "outfitBush", count: 1, weight: 1 },
            { name: "outfitLeafPile", count: 1, weight: 1 },
            { name: "outfitCrate", count: 1, weight: 1 },
            { name: "outfitTable", count: 1, weight: 1 },
            { name: "outfitSoviet", count: 1, weight: 1 },
            { name: "outfitOven", count: 1, weight: 1 },
            { name: "outfitRefrigerator", count: 1, weight: 1 },
            { name: "outfitVending", count: 1, weight: 1 },
            { name: "outfitPumpkin", count: 1, weight: 1 },
            { name: "outfitWoodpile", count: 1, weight: 1 },
            { name: "outfitToilet", count: 1, weight: 1 },
            { name: "outfitBushRiver", count: 1, weight: 1 },
            { name: "outfitCrab", count: 1, weight: 1 },
            { name: "outfitStumpAxe", count: 1, weight: 1 },
        ],
        // seems to be unused? so adding this to suppress the warning
        tier_pumpkin_candy: [{ name: "", weight: 1, count: 1 }],
    },
    mapGen: {
        map: {
            baseWidth: config.mapWidth[config.mapSize],
            baseHeight: config.mapWidth[config.mapSize],
            shoreInset: 40,
            rivers: {
                weights: [],
            },
        },
        places: Main.mapGen
            ? Array(config.places)
                  .fill(false)
                  .map(() => {
                      return Main.mapGen?.places[
                          Math.floor(Math.random() * Main.mapGen.places.length)
                      ];
                  })
            : {},
        densitySpawns: Main.mapGen
            ? Main.mapGen.densitySpawns.reduce(
                  (array, item) => {
                      let object: Record<string, number> = {};
                      for (const [key, value] of Object.entries(item)) {
                          object[key] =
                              (value * config.spawnDensity[config.mapSize]) / 100;
                      }
                      array.push(object);
                      return array;
                  },
                  [] as Record<string, number>[],
              )
            : {},
        fixedSpawns: [
            {
                junkyard_01: 1,
                warehouse_01h: 1,
                house_red_01h: 3,
                cache_03: 10,
                cache_01: 1,
                cache_02: 1,
                mansion_structure_02: 1,
                mil_crate_02: { odds: 0.25 },
                tree_05: 30,
                tree_08: 20,
                tree_09: 10,
                barrel_02: 5,
                oven_01: 5,
                refrigerator_01: 5,
                table_01: 5,
                vending_01: 5,
                woodpile_01: 5,
                cache_pumpkin_02: 40,
            },
        ],
        randomSpawns: [],
        spawnReplacements: [
            {
                tree_01: "tree_07",
                stone_03: "stone_01",
                cabin_01: "cabin_02",
                house_red_01: "house_red_01b",
                house_red_02: "house_red_01b",
            },
        ],
    },
    /* STRIP_FROM_PROD_CLIENT:END */
};

export const Halloween = util.mergeDeep({}, Main, mapDef) as MapDef;
