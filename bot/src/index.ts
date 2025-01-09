import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { banCommand, executeBan } from './commands/utility/ban_ip';
import { echoCommand, executeEcho } from './commands/utility/decode_ip';
import { executeUnbanAll, unbanAllCommand } from './commands/utility/unban_all';
import { executeUnban, unbanCommand } from './commands/utility/unban_ip';
import { Command } from './utils';
import { Config } from './hidden_config';

async function main() {
const commands = [echoCommand, banCommand, unbanCommand, unbanAllCommand];

const rest = new REST({
  version: '10'
}).setToken(Config.botToken);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(Config.botClientId), { body: commands.map(command => command.toJSON()) });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const obj = {
    [Command.DecodeIp]: executeEcho,
    [Command.BanIp]: executeBan,
    [Command.UnbanIp]: executeUnban,  
    [Command.UnbanAll]: executeUnbanAll,
  }
  
  const commandName = interaction.commandName;
  if (!( commandName in obj)) return;
  
  try {
    const fn = obj[commandName as Command];
    fn(interaction);
  } catch(_err) {
    console.log("Excuting command failed", commandName)
  }
});

client.login(Config.botToken);
}

main();
