import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { initDatabase } from './database/init.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Discord Client erstellen
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ]
});

// Commands Collection
client.commands = new Collection();

// Commands laden
console.log('📝 Lade Commands...');
const commandFolders = readdirSync(join(__dirname, 'commands'));
const commandsData = [];

for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, 'commands', folder)).filter(
        file => file.endsWith('.js')
    );

    for (const file of commandFiles) {
        const filePath = join(__dirname, 'commands', folder, file);
        const command = await import(`file://${filePath}`);

        if ('data' in command.default && 'execute' in command.default) {
            client.commands.set(command.default.data.name, command.default);
            commandsData.push(command.default.data.toJSON());
            console.log(`✅ ${command.default.data.name}`);
        }
    }
}

// Commands automatisch deployen
console.log(`\n🚀 Deploye ${commandsData.length} Commands...`);
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

try {
    const data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commandsData }
    );
    console.log(`✅ ${data.length} Commands erfolgreich deployed!`);
} catch (error) {
    console.error('❌ Fehler beim Deployen der Commands:', error);
}

// Datenbank initialisieren
initDatabase();

// Event Handler
client.once('ready', () => {
    console.log(`\n🤖 Bot ist online als ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Kein Command gefunden: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Fehler beim Ausführen des Commands:', error);

        const errorMessage = {
            content: '❌ Es gab einen Fehler beim Ausführen dieses Commands!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Bot starten
console.log('\n🔌 Verbinde mit Discord...');
client.login(process.env.DISCORD_TOKEN);
