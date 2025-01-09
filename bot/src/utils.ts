import { Config } from "./hidden_config";

const server = Config.apiServer
export const API_URL = `http://${server.host}:${server.port}`;

export enum Command {
  DecodeIp = "decode-ip",
  BanIp = "ban-ip",
  UnbanIp = "unban-ip",
  UnbanAll = "unban-all",
}
