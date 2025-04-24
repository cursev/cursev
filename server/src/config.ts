import { getConfig } from "../../config";
import { util } from "../../shared/utils/util";
import { CustomConfig } from "./resurviv-config";

const isProd = process.env["NODE_ENV"] === "production";
export const serverConfigPath = isProd ? "../../" : "";
// to remove "server/dist" from the path to load the config from...
export const Config = getConfig(isProd, serverConfigPath);
util.mergeDeep(Config, CustomConfig);
