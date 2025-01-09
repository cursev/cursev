import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { API_URL, Command } from "../../utils";
import { Config } from "../../hidden_config";

export const unbanCommand = new SlashCommandBuilder()
    .setName(Command.UnbanIp)
    .setDescription('unban an IP')
    .addStringOption(option =>
        option.setName('ip')
            .setDescription('The IP to unban')
            .setRequired(true)
    );

export async function executeUnban(interaction: ChatInputCommandInteraction) {
  const ip = interaction.options.getString('ip');

  const payload = {
    ip,
    days: 0, 
    action: "unban",
    apiKey: Config.apiKey,
  }
console.log(`${API_URL}/api/moderation`)
  fetch(`${API_URL}/api/moderation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await interaction.reply("Unbanned the IP, I hope..");
}
