export enum TeamMode {
    Solo = 1,
    Duo = 2,
    Squad = 4,
}

export enum EmoteSlot {
    Top,
    Right,
    Bottom,
    Left,
    Win,
    Death,
    Count,
}

export enum DamageType {
    Player,
    Bleeding,
    Gas,
    Airdrop,
    Airstrike,
}

export enum Action {
    None,
    Reload,
    ReloadAlt,
    UseItem,
    Revive,
}

export enum WeaponSlot {
    Primary,
    Secondary,
    Melee,
    Throwable,
    Count,
}

export enum GasMode {
    Inactive,
    Waiting,
    Moving,
}

export enum Anim {
    None,
    Melee,
    Cook,
    Throw,
    CrawlForward,
    CrawlBackward,
    Revive,
}

export enum Plane {
    Airdrop,
    Airstrike,
}

export enum HasteType {
    None,
    Windwalk,
    Takedown,
    Inspire,
}

export enum Input {
    MoveLeft,
    MoveRight,
    MoveUp,
    MoveDown,
    Fire,
    Reload,
    Cancel,
    Interact,
    Revive,
    Use,
    Loot,
    EquipPrimary,
    EquipSecondary,
    EquipMelee,
    EquipThrowable,
    EquipFragGrenade,
    EquipSmokeGrenade,
    EquipNextWeap,
    EquipPrevWeap,
    EquipLastWeap,
    EquipOtherGun,
    EquipPrevScope,
    EquipNextScope,
    UseBandage,
    UseHealthKit,
    UseSoda,
    UsePainkiller,
    StowWeapons,
    SwapWeapSlots,
    ToggleMap,
    CycleUIMode,
    EmoteMenu,
    TeamPingMenu,
    Fullscreen,
    HideUI,
    TeamPingSingle,
    Count,
}

export const GameConfig = {
    // started with 1000 to distinguish us from the original surviv protocol
    // the protocol we originated from was 78
    // remember to bump this every time a serialization function is changed
    // or a definition item added, removed or moved
    protocolVersion: 1004,
    Input,
    EmoteSlot,
    WeaponSlot,
    WeaponType: ["gun", "gun", "melee", "throwable"] as const,
    DamageType,
    Action,
    Anim,
    GasMode,
    Plane,
    HasteType,
    gas: {
        damageTickRate: 2,
    },
    map: {
        gridSize: 16,
        shoreVariation: 3,
        grassVariation: 2,
    },
    player: {
        radius: 1,
        maxVisualRadius: 3.75,
        maxInteractionRad: 3.5,
        health: 100,
        reviveHealth: 24,
        minActiveTime: 10,
        boostDecay: 0.33,
        boostMoveSpeed: 1.85,
        boostHealAmount: 0.33,
        boostBreakpoints: [1, 1, 1.5, 0.5],
        scopeDelay: 0.25,
        baseSwitchDelay: 0.25,
        freeSwitchCooldown: 1,
        headshotChance: 0.15,
        moveSpeed: 12,
        waterSpeedPenalty: 3,
        cookSpeedPenalty: 3,
        frozenSpeedPenalty: 3,
        hasteSpeedBonus: 4.8,
        bleedTickRate: 1,
        downedMoveSpeed: 4,
        downedRezMoveSpeed: 2,
        downedDamageBuffer: 0.1, //time buffer after being downed where a player can't take damage
        keepZoomWhileDowned: false,
        reviveDuration: 8,
        reviveRange: 5,
        crawlTime: 0.75,
        teammateSpawnRadius: 5, // radius of circle that teammates spawn inside of, relative to the first player on the team to join
        emoteSoftCooldown: 2,
        emoteHardCooldown: 6,
        emoteThreshold: 6,
        throwableMaxMouseDist: 18,
        cookTime: 0.1,
        throwTime: 0.3,
        meleeHeight: 0.25,
        touchLootRadMult: 1.4,
        medicHealRange: 8,
        medicReviveRange: 6,
        spectateDeadTimeout: 2,
        killLeaderMinKills: 3,
        minSpawnRad: 25,
        perkModeRoleSelectDuration: 20,

        /* STRIP_FROM_PROD_CLIENT:START */
        defaultItems: {
            weapons: [
                { type: "", ammo: 0 },
                { type: "", ammo: 0 },
                { type: "fists", ammo: 0 },
                { type: "", ammo: 0 },
            ],
            outfit: "outfitBase",
            backpack: "backpack00",
            helmet: "",
            chest: "",
            scope: "1xscope",
            perks: [] as Array<{ type: string; droppable?: boolean }>,
            inventory: {
                "9mm": 0,
                "762mm": 0,
                "556mm": 0,
                "12gauge": 0,
                "50AE": 0,
                "308sub": 0,
                flare: 1,
                "40mm": 0,
                "45acp": 0,
                frag: 0,
                smoke: 0,
                strobe: 0,
                mirv: 0,
                mine: 0,
                snowball: 0,
                water_balloon: 0,
                potato: 0,
                bandage: 0,
                healthkit: 0,
                soda: 0,
                pulseBox: 0,
                painkiller: 0,
                "1xscope": 1,
                "2xscope": 0,
                "4xscope": 0,
                "8xscope": 0,
                "15xscope": 0,
                "30xscope": 0,
                "60xscope": 0,
                "120xscope": 0,
                "240xscope": 0,
                "580xscope": 0,
                "1160xscope": 0,
            } as Record<string, number>,
        },
        /* STRIP_FROM_PROD_CLIENT:END */
    },
    defaultEmoteLoadout: [
        "emote_happyface",
        "emote_thumbsup",
        "emote_surviv",
        "emote_sadface",
        "",
        "",
    ],
    airdrop: {
        actionOffset: 0,
        fallTime: 8,
        crushDamage: 100,
        planeVel: 48,
        planeRad: 150,
        soundRangeMult: 2.5,
        soundRangeDelta: 0.25,
        soundRangeMax: 92,
        fallOff: 0,
    },
    airstrike: {
        actionOffset: 0,
        bombJitter: 4,
        bombOffset: 2,
        bombVel: 3,
        bombCount: 20,
        planeVel: 350,
        planeRad: 120,
        soundRangeMult: 18,
        soundRangeDelta: 18,
        soundRangeMax: 48,
        fallOff: 1.25,
    },
    groupColors: [0xffff00, 0xff00ff, 0xffff, 0xff5400],
    teamColors: [0xcc0000, 0x7eff],
    bullet: {
        maxReflect: 3,
        reflectDistDecay: 1.5,
        height: 0.25,
        falloff: true,
    },
    projectile: {
        maxHeight: 5,
    },
    structureLayerCount: 2,
    tracerColors: {
        "9mm": {
            regular: 0x90caf9,       // bleu clair
            saturated: 0x64b5f6,
            chambered: 0x1976d2,     // bleu foncé
            alphaRate: 0.88,
            alphaMin: 0.2,
        },
        "9mm_suppressed_bonus": {
            regular: 0x80cbc4,       // turquoise
            saturated: 0x4db6ac,
            chambered: 0x00695c,
            alphaRate: 0.94,
            alphaMin: 0.3,
        },
        "9mm_cursed": {
            regular: 0x311b92,       // violet profond
            saturated: 0x4527a0,
            chambered: 0x1a237e,
            alphaRate: 0.85,
            alphaMin: 0.1,
        },
        "762mm": {
            regular: 0xffcc80,       // orange doux
            saturated: 0xffb74d,
            chambered: 0xff6f00,     // orange vif
            alphaRate: 0.9,
            alphaMin: 0.15,
        },
        "12gauge": {
            regular: 0xff8a80,       // rouge saumon
            saturated: 0xff5252,
            chambered: 0xd50000,     // rouge sang
        },
        "556mm": {
            regular: 0xc5e1a5,       // vert clair
            saturated: 0xaed581,
            chambered: 0x689f38,
            alphaRate: 0.91,
            alphaMin: 0.16,
        },
        "50AE": {
            regular: 0xfff59d,       // jaune pâle
            saturated: 0xfff176,
            chambered: 0xffca28,
        },
        "308sub": {
            regular: 0x8d6e63,       // brun
            saturated: 0x6d4c41,
            chambered: 0x4e342e,
            alphaRate: 0.89,
            alphaMin: 0.08,
        },
        flare: {
            regular: 0xfff3e0,       // blanc chaud
            saturated: 0xffe0b2,
            chambered: 0xffcc80,
        },
        "45acp": {
            regular: 0xce93d8,       // violet pastel
            saturated: 0xba68c8,
            chambered: 0x8e24aa,
        },
        laser: {
            regular: 0xff1744,       // rouge laser
            saturated: 0xf50057,
            chambered: 0xc51162,
        },
        water: {
            regular: 0x81d4fa,       // bleu eau
            saturated: 0x4fc3f7,
            chambered: 0x0288d1,
        },
        rainbowTrail: {
            regular: 0xffffff,       // blanc arc-en-ciel
            saturated: 0xffffff,
            chambered: 0xffffff,
            alphaRate: 0.95,
            alphaMin: 0.12,
        },
        shrapnel: {
            regular: 0x616161,       // gris foncé
            saturated: 0x424242,
        },
        frag: {
            regular: 0xe53935,       // rouge grenade
            saturated: 0xb71c1c,
        },
        invis: {
            regular: 0x000000,
            saturated: 0x000000,
            chambered: 0x000000,
        },
    },
    scopeZoomRadius: {
        desktop: {
            "1xscope": 28,
            "2xscope": 36,
            "4xscope": 48,
            "8xscope": 68,
            "15xscope": 104,
            "30xscope": 208,
            "60xscope": 300,
            "120xscope": 400,
            "240xscope": 500,
            "580xscope": 600,
            "1160xscope": -700,
        } as Record<string, number>,
        mobile: {
            "1xscope": 32,
            "2xscope": 40,
            "4xscope": 48,
            "8xscope": 64,
            "15xscope": 88,
            "30xscope": 176,
            "60xscope": 352,
            "120xscope": 500,
            "240xscope": 700,
            "580xscope": 800,
            "1160xscope": 900,
        } as Record<string, number>,
    },
    bagSizes: {
        "9mm": [120, 240, 330, 420],
        "762mm": [90, 180, 240, 300],
        "556mm": [90, 180, 240, 300],
        "40mm": [10, 20, 30, 40],
        "12gauge": [15, 30, 60, 90],
        "50AE": [49, 98, 147, 196],
        "308sub": [10, 20, 40, 80],
        flare: [20, 40, 60, 800],
        "45acp": [90, 180, 240, 300],
        mine: [3, 6, 9, 12],
        frag: [3, 6, 9, 12],
        smoke: [3, 6, 9, 12],
        strobe: [2, 3, 4, 5],
        mirv: [2, 4, 6, 8],
        snowball: [10, 20, 30, 40],
        water_balloon: [10, 20, 30, 40],
        potato: [10, 20, 30, 40],
        bandage: [5, 10, 15, 30],
        healthkit: [1, 2, 3, 4],
        soda: [2, 5, 10, 15],
        pulseBox: [2, 5, 10, 15],
        painkiller: [1, 2, 3, 4],
        "1xscope": [1, 1, 1, 1],
        "2xscope": [1, 1, 1, 1],
        "4xscope": [1, 1, 1, 1],
        "8xscope": [1, 1, 1, 1],
        "15xscope": [1, 1, 1, 1],
        "30xscope": [1, 1, 1, 1],
        "60xscope": [1, 1, 1, 1],
        "120xscope": [1, 1, 1, 1],
        "240xscope": [1, 1, 1, 1],
        "580xscope": [1, 1, 1, 1],
        "1160xscope": [1, 1, 1, 1],
    } as Record<string, number[]>,
    lootRadius: {
        outfit: 1,
        melee: 1.25,
        gun: 1.25,
        throwable: 1,
        ammo: 1.2,
        heal: 1,
        boost: 1,
        backpack: 1,
        helmet: 1,
        chest: 1,
        scope: 1,
        perk: 1.25,
        xp: 1,
    } as Record<string, number>,
};
