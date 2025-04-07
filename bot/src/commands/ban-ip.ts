import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, postAction } from "../utils";

export default {
    command: new SlashCommandBuilder()
        .setName(Command.BanIp)
        .setDescription("ban an IP")
        .addStringOption((option) =>
            option.setName("ip").setDescription("The IP to ban").setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const ip = interaction.options.getString("ip")!;
        const { message } = await postAction({ action: "ban", ip });
        await interaction.reply(message);
    },
};
