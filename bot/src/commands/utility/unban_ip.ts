import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { API_URL, Command, unbanIp } from "../../utils";
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
  const ip = interaction.options.getString('ip')!;
  unbanIp(ip)
  await interaction.reply("Unbanned the IP, I hope..");
}
