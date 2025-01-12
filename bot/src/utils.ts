import { Config } from "./hidden_config";
import Database from "better-sqlite3";

const server = Config.apiServer
export const API_URL = `http://${server.host}:${server.port}`;

export enum Command {
  DecodeIp = "decode-ip",
  BanIp = "ban-ip",
  UnbanIp = "unban-ip",
  UnbanAll = "unban-all",
}

const db = new Database("game.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS ip_bans (
    ip TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  )
`);

export async function banIp(encodedIP: string, days: number) {
  days = Math.max(0, days ?? 0); 
  const expiresAt = Date.now() + (days * 24 * 60 * 60 * 1000);

  db.prepare('INSERT OR REPLACE INTO ip_bans (ip, expires_at) VALUES (?, ?)')
  .run(encodedIP, expiresAt);
  console.log(`Banned ${encodedIP} for ${days} days`);
}

export async function unbanIp(encodedIP: string) {
  db.prepare('DELETE FROM ip_bans WHERE ip = ?').run(encodedIP);
  console.log(`Unbanned ${encodedIP}`);
}

export async function unbanAll() {
  db.prepare('DELETE FROM ip_bans').run();
  console.log("Unbanned all IPs");
}
