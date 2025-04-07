import type { MapDef } from "../../../../shared/defs/mapDefs";
import { Desert } from "../../../../shared/defs/maps/desertDefs";
import { GameConfig } from "../../../../shared/gameConfig";
import { util } from "../../../../shared/utils/util";
import { loadAirstrike } from "../helpers";

const switchToSmallMap = false;

const config = {
    mapSize: switchToSmallMap ? "small" : "large",
    places: 3,
    mapWidth: { large: 280, small: 240 },
    spawnDensity: { large: 44, small: 37 },
} as const;

export const DeatchmatchDesert: MapDef = util.mergeDeep(structuredClone(Desert), {
    biome: {
        particles: { camera: "falling_leaf_spring" },
    },
    gameConfig: {
        planes: {
            timings: [
                {
                    circleIdx: 0,
                    wait: 2,
                    options: { type: GameConfig.Plane.Airdrop },
                },
                ...Array.from({ length: 7 }, (_, idx) => loadAirstrike(idx * 50)),
            ],
        },
    },
    mapGen: {
        map: {
            baseWidth: config.mapWidth[config.mapSize],
            baseHeight: config.mapWidth[config.mapSize],
            shoreInset: 10,
            rivers: {
                weights: [],
            },
        },
        places: Desert.mapGen
            ? Array(config.places)
                  .fill(false)
                  .map(() => {
                      return Desert.mapGen?.places[
                          Math.floor(Math.random() * Desert.mapGen.places.length)
                      ];
                  })
            : {},
        densitySpawns: Desert.mapGen
            ? Desert.mapGen.densitySpawns.reduce(
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
                cache_01: 1,
                cache_02: 1,
                bunker_structure_01: { odds: 0.05 },
                bunker_structure_03: 1,
                chest_01: 1,
                chest_03d: { odds: 1 },
                mil_crate_02: { odds: 0.25 },
                crate_18: 12,
                tree_02: 3,
                desert_town_01: 1,
                desert_town_02: 1,
                river_town_02: 1,
                greenhouse_02: config["mapSize"] === "small" ? { odds: 0.25 } : 1,
                stone_05: 6,
            },
        ],
        randomSpawns: [
            {
                spawns: ["warehouse_01", "house_red_01", "barn_02d"],
                choose: 1,
            },
        ],
        spawnReplacements: [
            {
                tree_01: "tree_06",
                bush_01: "bush_05",
                crate_02: "crate_18",
                stone_01: "stone_01b",
                stone_03: "stone_03b",
            },
        ],
        importantSpawns: ["desert_town_01", "desert_town_02", "river_town_02"],
    },
});

DeatchmatchDesert.lootTable = {
    tier_guns: [
        { name: "flare_gun", count: 1, weight: 14.5 },
        {
            name: "flare_gun_dual",
            count: 1,
            weight: 0.25,
        },
    ],
    tier_airdrop_uncommon: [
        { name: "saiga", count: 1, weight: 1 },
        { name: "deagle", count: 1, weight: 1 },
        { name: "sv98", count: 1, weight: 0.5 },
        { name: "m9", count: 1, weight: 0.01 },
        { name: "flare_gun", count: 1, weight: 0.5 },
        { name: "model94", count: 1, weight: 2 },
        { name: "an94", count: 1, weight: 1 },
    ],
    tier_airdrop_rare: [
        { name: "garand", count: 1, weight: 6 },
        { name: "awc", count: 1, weight: 3 },
        { name: "pkp", count: 1, weight: 3 },
        { name: "m249", count: 1, weight: 0.1 },
        { name: "m4a1", count: 1, weight: 4 },
        { name: "ots38_dual", count: 1, weight: 4.5 },
    ],
    tier_ammo_crate: [{ name: "flare", count: 2, weight: 1 }],
    tier_airdrop_outfits: [
        { name: "", count: 1, weight: 20 },
        { name: "outfitMeteor", count: 1, weight: 5 },
        { name: "outfitHeaven", count: 1, weight: 1 },
        {
            name: "outfitGhillie",
            count: 1,
            weight: 0.5,
        },
    ],
    tier_airdrop_melee: [
        { name: "", count: 1, weight: 19 },
        { name: "stonehammer", count: 1, weight: 1 },
        { name: "pan", count: 1, weight: 1 },
    ],
    tier_throwables: [
        { name: "frag", count: 2, weight: 1 },
        { name: "smoke", count: 1, weight: 1 },
        { name: "strobe", count: 1, weight: 0.2 },
        { name: "mirv", count: 2, weight: 0.05 },
    ],
    tier_airdrop_throwables: [
        { name: "strobe", count: 1, weight: 1 },
        { name: "frag", count: 3, weight: 0.1 },
    ],
    tier_perks: [
        { name: "broken_arrow", count: 1, weight: 1 },
        { name: "fabricate", count: 1, weight: 1 },
        { name: "flak_jacket", count: 1, weight: 1 },
        { name: "bonus_45", count: 1, weight: 1 },
    ],
    tier_eye_stone: [
        { name: "garand", count: 1, weight: 2 },
        { name: "awc", count: 1, weight: 0.1 },
    ],
};
