import { encodeIP } from "./ipLogging";
import Database from "better-sqlite3";

const db = new Database("game.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS ip_bans (
    ip TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  )
`);

export async function isBanned(ip: string): Promise<boolean> {
  try {
    const encodedIP = encodeIP(ip);

    const ban = db.prepare(
      'SELECT ip FROM ip_bans WHERE ip = ?'
    ).get(encodedIP);

    console.log({
      ip,
      encodedIP,
      ban
    })
    return !!ban;
  } catch (error) {
    console.error('Error checking ban status:', error);
    return false;
  }
}
