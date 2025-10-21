import { Client, GatewayIntentBits, Collection } from 'discord.js';
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
const commandFolders = readdirSync(join(__dirname, 'commands'));

for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, 'commands', folder)).filter(
        file => file.endsWith('.js')
    );

    for (const file of commandFiles) {
        const filePath = join(__dirname, 'commands', folder, file);
        const command = await import(`file://${filePath}`);

        if ('data' in command.default && 'execute' in command.default) {
            client.commands.set(command.default.data.name, command.default);
            console.log(`✅ Command geladen: ${command.default.data.name}`);
        }
    }
}

// Event Handler
client.once('ready', () => {
    console.log(`🤖 Bot ist online als ${client.user.tag}`);
    initDatabase();
    console.log('📊 Datenbank initialisiert');
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
client.login(process.env.DISCORD_TOKEN);
