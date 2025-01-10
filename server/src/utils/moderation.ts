import { encodeIP } from "./ipLogging";
import Database from "better-sqlite3";

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
}

export async function isBanned(ip: string): Promise<boolean> {
  try {
    const encodedIP = encodeIP(ip);
    const now = Date.now();
    
    const ban = db.prepare(
      'SELECT expires_at FROM ip_bans WHERE ip = ? AND expires_at > ?'
    ).get(encodedIP, now);

    return !!ban;
  } catch (error) {
    console.error('Error checking ban status:', error);
    return false;
  }
}

export async function unbanIp(encodedIP: string) {
  db.prepare('DELETE FROM ip_bans WHERE ip = ?').run(encodedIP);
}

export async function unbanAll() {
  db.prepare('DELETE FROM ip_bans').run();
}
