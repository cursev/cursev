import { encodeIP } from "./ipLogging";

const bannedIPs: string[] = [];

export function isBanned(ip: string): boolean {
  const encodedIP = encodeIP(ip);
  console.log({
    ip,
    encodedIP
  })
  return bannedIPs.includes(encodedIP);
};
