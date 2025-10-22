import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { initDatabase } from './database/init.js';
import { getConfig } from './database/config.js';
import { successEmbed } from './utils/embeds.js';
import { cleanupOldWarnings } from './database/warnings.js';

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

// Alte Warnungen bereinigen
cleanupOldWarnings();

// Event Handler
client.once('ready', () => {
    console.log(`\n🤖 Bot ist online als ${client.user.tag}`);

    // Täglich alte Warnungen bereinigen (alle 24 Stunden)
    setInterval(() => {
        cleanupOldWarnings();
    }, 24 * 60 * 60 * 1000);
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

// Willkommens-Event für neue Mitglieder
client.on('guildMemberAdd', async member => {
    try {
        const welcomeChannelId = getConfig(member.guild.id, 'welcome_channel');

        if (!welcomeChannelId) {
            console.log('Kein Welcome Channel konfiguriert');
            return;
        }

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

        if (!welcomeChannel) {
            console.log('Welcome Channel nicht gefunden');
            return;
        }

        const embed = successEmbed(
            'Willkommen auf dem Server! 🎉',
            `Herzlich willkommen ${member}!\n\nSchön, dass du da bist! Wir wünschen dir viel Spaß auf unserem Server.\n\nViel Erfolg und eine tolle Zeit! 🚀`
        );

        await welcomeChannel.send({ embeds: [embed] });
        console.log(`Willkommensnachricht für ${member.user.tag} gesendet`);
    } catch (error) {
        console.error('Fehler beim Senden der Willkommensnachricht:', error);
    }
});

// Bot starten
console.log('\n🔌 Verbinde mit Discord...');
client.login(process.env.DISCORD_TOKEN);
