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
    const ban = await db.prepare('SELECT expires_at FROM ip_bans WHERE ip = ?')
      .get(encodedIP) as { expires_at: number } ;
    
    if (!ban) {
      return false;
    }

    const now = Date.now();
    if (now >= ban.expires_at) {
      db.prepare('DELETE FROM ip_bans WHERE ip = ?').run(encodedIP);
      return false;
    }

    return true;
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
