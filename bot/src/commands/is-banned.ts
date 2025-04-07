import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, postAction } from "../utils";

export default {
    command: new SlashCommandBuilder()
        .setName(Command.IsBanned)
        .setDescription("is IP banned?")
        .addStringOption((option) =>
            option
                .setName("ip")
                .setDescription("IP to check if it's banned")
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const ip = interaction.options.getString("ip")!;
        if (!ip) await interaction.reply("Please provide an IP to check");
        const { message } = await postAction({ action: "isbanned", ip });
        await interaction.reply(message);
    },
};
