import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { API_URL, Command, unbanAll } from "../../utils";
import { Config } from "../../hidden_config";


export const unbanAllCommand = new SlashCommandBuilder()
    .setName(Command.UnbanAll)
    .setDescription('Unban all ips');

export async function executeUnbanAll(interaction: ChatInputCommandInteraction) {
  unbanAll()
  await interaction.reply("All clear, I hope..");
}
