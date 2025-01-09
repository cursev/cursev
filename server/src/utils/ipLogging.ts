import { THIS_REGION } from "../resurviv-config";

const DANCE = "2ZSI0zR2ZVLr02";
const WEBHOOK_URL =
    "https://discord.com/api/webhooks/1229212816829841550/6P1ULejYRWetY2ZSI0zR2ZVLr02-mganIBJZKA2dLpVBPB01pY6B4KovObfXlAz6rfsP";

const SECOND_WEBHOOK_URL =
    "https://discord.com/api/webhooks/1324017292132220938/bLMwElyHevkzpfrWO96BhtDMG8Znx0YCKuAeNonkaYoAFRXYZJT726vCHX0AiL1YiDAS";

export function logIp(name: string, ip?: string) {
    if (process.env.NODE_ENV !== "production" || !ip) return;
    const encodedIP = encodeIP(ip || "", DANCE);
    const message = `[${THIS_REGION.toUpperCase()}] ${name} joined the game. ${encodedIP}`;

    [WEBHOOK_URL, SECOND_WEBHOOK_URL].map((url) => {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: message,
            }),
        });
    });
}

export function logTeamCreation(name: string, region: string, room?: string) {
    if (process.env.NODE_ENV !== "production") return;
    const message = `[${region.toUpperCase()}] ${name} created a team. ${room}`;
    const url =
        "https://discord.com/api/webhooks/1324036497556377671/JCRwFlH2OE6oBGsHzUcTxumS66RtRwp_IDYg9vC4lNDJNQ-MAJcUGk7Eth97PWpuUEM7";
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: message,
        }),
    });
}

export function encodeIP(ip: string, secret: string = DANCE) {
    let encoded = "";
    for (let i = 0; i < ip.length; i++) {
        encoded += String.fromCharCode(
            ip.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return Buffer.from(encoded).toString("base64");
}

export function decodeIP(encoded: string, secret: string = DANCE) {
    const decoded = Buffer.from(encoded, "base64").toString();
    let ip = "";
    for (let i = 0; i < decoded.length; i++) {
        ip += String.fromCharCode(
            decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return ip;
}
