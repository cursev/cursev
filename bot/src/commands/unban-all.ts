import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../utils";

export const unbanAllCommand = new SlashCommandBuilder()
    .setName(Command.UnbanAll)
    .setDescription("Unban all ips");
export async function executeUnbanAll(interaction: ChatInputCommandInteraction) {
    // NOTE: not implemented yet;
    // unbanAll()
    await interaction.reply("not implemented yet..");
}
