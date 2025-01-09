import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { API_URL, Command } from "../../utils";
import { Config } from "../../hidden_config";


export const unbanAllCommand = new SlashCommandBuilder()
    .setName(Command.UnbanAll)
    .setDescription('Unban all ips');

export async function executeUnbanAll(interaction: ChatInputCommandInteraction) {
  const payload = {
    ip: "",
    days: 0, 
    action: "clear",
    apiKey: Config.apiKey,
  }

  const res = await fetch(`${API_URL}/api/moderation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  try {
    console.log(res.json())
  } catch (error) {
    console.error(error);
  }

  await interaction.reply("All clear, I hope..");
}
