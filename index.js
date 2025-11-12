import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error('❌ Missing environment variables (BOT_TOKEN, CLIENT_ID, or GUILD_ID).');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').toJSON(),
  new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Repeats your message')
    .addStringOption(opt =>
      opt.setName('text').setDescription('Text to repeat').setRequired(true)
    ).toJSON()
];

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(token);
  try {
    console.log('📝 Registering slash commands…');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('✅ Commands registered.');
  } catch (err) {
    console.error('⚠️ Command registration failed:', err);
  }
}

async function main() {
  await registerCommands();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
  });

  client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: 'helping users', type: 0 }],
      status: 'online'
    });
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'ping') {
      await interaction.reply('Pong! 🏓');
    } else if (interaction.commandName === 'echo') {
      const text = interaction.options.getString('text');
      await interaction.reply(text);
    }
  });

  client.on('error', console.error);
  await client.login(token);
}

main().catch(console.error);
