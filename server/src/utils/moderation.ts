import storage from "node-persist";
import { encodeIP } from "./ipLogging";

storage.init();

export async function banIp(encodedIP: string, days: number) {
  days = Math.max(0, days ?? 0); 
  const now = Date.now();
  const timestamp = now + (days * 24 * 60 * 60 * 1000);
  await storage.setItem(encodedIP, timestamp);
}

export async function isBanned(ip: string): Promise<boolean> {
  const encodedIP = encodeIP(ip);
  const banTimestamp = await storage.getItem(encodedIP);
  
  if (!banTimestamp) {
    return false;
  }

  const now = Date.now();
  if (now >= banTimestamp) {
    await storage.removeItem(encodedIP);
    return false;
  }

  return true;
}

export async function unbanIp(encodedIP: string) {
  await storage.removeItem(encodedIP);
}

export async function unbanAll() {
  await storage.clear();
}
