import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { API_URL, banIp, Command } from "../../utils";
import { Config } from "../../hidden_config";


export const banCommand = new SlashCommandBuilder()
    .setName(Command.BanIp)
    .setDescription('ban an IP')
    .addStringOption(option =>
        option.setName('ip')
            .setDescription('The IP to ban')
            .setRequired(true)
    )
    .addNumberOption(option => option
      .setName("days")
      .setDescription("Number of days to ban the IP for")
      .setRequired(false)
    );

export async function executeBan(interaction: ChatInputCommandInteraction) {
  const ip = interaction.options.getString('ip')!;
  const days = Number(interaction.options.getString('days')) || 7;

  banIp(ip, days)

  await interaction.reply("Banned the IP, I hope..");
}
