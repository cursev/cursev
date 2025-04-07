import {
    type CacheType,
    type ChatInputCommandInteraction,
    Client,
    Events,
    GatewayIntentBits,
    REST,
    Routes,
} from "discord.js";
import { secrets } from "../../shared/utils/secrets";
import banIpHandler from "./commands/ban-ip";
import isBanned from "./commands/is-banned";
import unbanIpHandler from "./commands/unban-ip";
import { Command } from "./utils";

type CommandHandlers = {
    [key in Command]: (
        interaction: ChatInputCommandInteraction<CacheType>,
    ) => Promise<void> | void;
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function registerCommands() {
    const commands = [banIpHandler.command, unbanIpHandler.command, isBanned.command];

    const rest = new REST({ version: "10" }).setToken(secrets.BOT_TOKEN);

    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(secrets.BOT_CLIENT_ID), {
            body: commands.map((command) => command.toJSON()),
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error("Failed to refresh application commands:", error);
    }
}

function setupInteractionHandlers() {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const commandHandlers: CommandHandlers = {
            [Command.BanIp]: banIpHandler.execute,
            [Command.UnbanIp]: unbanIpHandler.execute,
            [Command.IsBanned]: isBanned.execute,
            [Command.UnbanAll]: async () => {
                await interaction.reply({
                    content: "Not implemented yet!",
                });
            },
            [Command.DecodeIp]: async () => {
                await interaction.reply({
                    content: "Not implemented yet!",
                });
            },
        };

        const commandName = interaction.commandName as Command;

        if (!commandHandlers[commandName]) {
            console.warn(`Unknown command: ${commandName}`);
            return;
        }

        try {
            await commandHandlers[commandName](interaction);
        } catch (error) {
            console.error(`Error executing command "${commandName}":`, error);
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    });
}

async function startBot() {
    try {
        await registerCommands();

        client.once(Events.ClientReady, (readyClient) => {
            console.log(`Logged in as ${readyClient.user.tag}!`);
        });

        setupInteractionHandlers();

        await client.login(secrets.BOT_TOKEN);
    } catch (error) {
        console.error("Failed to start the bot:", error);
        process.exit(1);
    }
}
startBot();
