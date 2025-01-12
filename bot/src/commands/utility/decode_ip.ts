import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js'; 
import { Command } from '../../utils';


const DANCE = "2ZSI0zR2ZVLr02";
export function decodeIP(encoded: string, secret = DANCE) {
  const decoded = Buffer.from(encoded, "base64").toString();
  let ip = "";
  for (let i = 0; i < decoded.length; i++) {
      ip += String.fromCharCode(
          decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
      );
  }
  return ip;
}

export const echoCommand = new SlashCommandBuilder()
    .setName(Command.DecodeIp)
    .setDescription('Decodes an IP')
    .addStringOption(option =>
        option.setName('ip')
            .setDescription('The IP to decode')
            .setRequired(true)
    );

export async function executeEcho(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString('ip');
    const result = decodeIP(message!);
    await interaction.reply(JSON.stringify(result, null, 2));
}
