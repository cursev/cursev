import { THIS_REGION } from "../resurviv-config";
import { links } from "./private_webhook";

const DANCE = "2ZSI0zR2ZVLr02";

export function logIp(name: string, ip?: string) {
    if (process.env.NODE_ENV !== "production" || !ip) return;
    const encodedIP = encodeIP(ip || "", DANCE);
    const message = `[${THIS_REGION.toUpperCase()}] ${name} joined the game. ${encodedIP}`;

    [links["namerio_server"]["ip_logs"], links["private_logs"]["ip_logs"]].map((url) => {
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
    [links["namerio_server"]["team_creation"], links["private_logs"]["team_creation"]].map((url) => {
      if (!url) return;
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
