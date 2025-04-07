import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, postAction } from "../utils";

export default {
    command: new SlashCommandBuilder()
        .setName(Command.UnbanIp)
        .setDescription("unban an IP")
        .addStringOption((option) =>
            option.setName("ip").setDescription("The IP to unban").setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const ip = interaction.options.getString("ip")!;
        if (!ip) await interaction.reply("Please provide an IP to unban");
        const { message } = await postAction({ action: "unban", ip });
        await interaction.reply(message);
    },
};
