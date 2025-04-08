import type { MapDef } from "../../../../shared/defs/mapDefs";
import { Cobalt } from "../../../../shared/defs/maps/cobaltDefs";
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

export const DeatchmatchCobalt: MapDef = util.mergeDeep(structuredClone(Cobalt), {
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
        places: Cobalt.mapGen
            ? Array(config.places)
                  .fill(false)
                  .map(() => {
                      return Cobalt.mapGen?.places[
                          Math.floor(Math.random() * Cobalt.mapGen.places.length)
                      ];
                  })
            : {},
    },
});

DeatchmatchCobalt.lootTable = {
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
        { name: "mine", count: 3, weight: 1 },
    ],
    tier_airdrop_throwables: [
        { name: "strobe", count: 1, weight: 1 },
        { name: "frag", count: 3, weight: 0.1 },
        { name: "mine", count: 3, weight: 1 },
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
    tier_class_crate_mythic: [
        { name: "scavenger_adv", count: 1, weight: 1 },
        { name: "explosive", count: 1, weight: 2 },
        { name: "splinter", count: 1, weight: 3 },
    ],
};
