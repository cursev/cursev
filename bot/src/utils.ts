import { Config } from "../../server/src/config";

export enum Command {
    DecodeIp = "decode-ip",
    BanIp = "ban-ip",
    IsBanned = "is-banned",
    UnbanIp = "unban-ip",
    UnbanAll = "unban-all",
}

type Payload = {
    action: "ban" | "unban" | "clear" | "isbanned";
    ip: string;
};

export async function postAction(payload: Payload): Promise<{ message: string }> {
    try {
        // hardcoded for now
        const response = await fetch("http://resurviv.biz/api/moderation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apiKey: Config.apiKey,
                data: payload,
            }),
        });
        const data = await response.json();
        return { message: data?.message ?? "Ooops, something went wrong" };
    } catch (err) {
        console.log("Failed to execute action", err);
        return { message: "Failed to execute action" };
    }
}
