import { allowedGuns } from "../../deathmatch/loadoutItems";
import { GameObjectDefs } from "../gameObjectDefs";
import { CrosshairDefs } from "./crosshairDefs";
import { EmotesDefs } from "./emoteDefs";
import { HealEffectDefs } from "./healEffectDefs";
import { SkinDefsForMele } from "./meleeDefs";
import { SkinDefs } from "./outfitDefs";
import { PassDefs } from "./passDefs";

/**
 * Checks if an item is present in the player's loadout
 */
export const isItemInLoadout = (item: string, category: string) => {
    if (!UnlockDefs.unlock_default.unlocks.includes(item)) return false;

    const def = GameObjectDefs[item];
    if (!def || def.type !== category) return false;

    return true;
};

export const privateOutfits = [
    "outfitToilet",
    "outfitGreenEyes",
    "outfitOwnr",
    "outfitShinyGold",
    "outfitPreacher",
    "outfitBoutique",
    "outfitNotEnough",
    "outfitDev",
    "outfitTheSurvivor",
];

const _allowedHealEffects = Object.keys(HealEffectDefs);
const _allowedMeleeSkins = Object.keys(SkinDefsForMele)
const _allowedOutfits = Object.keys(SkinDefs)
const _allowedEmotes = Object.keys(EmotesDefs)

export interface UnlockDef {
    readonly type: "unlock";
    name: string;
    unlocks: string[];
    free?: boolean;
}

export const UnlockDefs: Record<string, UnlockDef> = {
    unlock_default: {
        type: "unlock",
        name: "standard-issue",
        unlocks: [
            ...new Set([
                ..._allowedOutfits,
                ..._allowedMeleeSkins,
                ..._allowedEmotes,
                ..._allowedHealEffects,
                ...Object.keys(CrosshairDefs),
                ...PassDefs.pass_survivr1.items.map((item) => item.item),
                // ...allowedGuns,
            ]),
        ],
    },
    unlock_new_account: {
        type: "unlock",
        name: "new-account",
        free: true,
        unlocks: ["outfitDarkShirt"],
    },
};
