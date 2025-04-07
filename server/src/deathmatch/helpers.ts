import { GameConfig } from "../../../shared/gameConfig";

export function loadAirstrike(wait: number) {
    return {
        circleIdx: 0,
        wait: wait,
        options: {
            type: GameConfig.Plane.Airstrike,
            numPlanes: [
                { count: 3, weight: 5 },
                { count: 4, weight: 1 },
                { count: 5, weight: 0.1 },
            ],
            airstrikeZoneRad: 60,
            wait: 1.5,
            delay: 1,
        },
    };
}
