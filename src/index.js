import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { initDatabase } from './database/init.js';
import { getConfig } from './database/config.js';
import { successEmbed } from './utils/embeds.js';
import { cleanupOldWarnings } from './database/warnings.js';
import { initTicketFiles } from './database/tickets.js';
import { initFrakWarnsFile, cleanupOldFrakWarns } from './database/fraktionen.js';
import { handleTicketCreate, handleTicketClaim, handleTicketAccept, handleTicketDeny, handleTicketClose } from './events/ticketHandler.js';
import { handleVerify } from './events/verifyHandler.js';

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

// Ticket-System initialisieren
initTicketFiles();

// Fraktions-Warn System initialisieren
initFrakWarnsFile();

// Alte Fraktions-Warnungen bereinigen
cleanupOldFrakWarns();

// Event Handler
client.once('ready', () => {
    console.log(`\n🤖 Bot ist online als ${client.user.tag}`);

    // Täglich alte Warnungen bereinigen (alle 24 Stunden)
    setInterval(() => {
        cleanupOldWarnings();
        cleanupOldFrakWarns();
    }, 24 * 60 * 60 * 1000);
});

client.on('interactionCreate', async interaction => {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
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
    }

    // Select Menu für Ticket-Erstellung
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_create') {
        try {
            await handleTicketCreate(interaction);
        } catch (error) {
            console.error('Fehler beim Erstellen des Tickets:', error);
        }
    }

    // Ticket Buttons & Verify Button
    if (interaction.isButton()) {
        try {
            switch (interaction.customId) {
                case 'ticket_claim':
                    await handleTicketClaim(interaction);
                    break;
                case 'ticket_accept':
                    await handleTicketAccept(interaction);
                    break;
                case 'ticket_deny':
                    await handleTicketDeny(interaction);
                    break;
                case 'ticket_close':
                    await handleTicketClose(interaction);
                    break;
                case 'verify_user':
                    await handleVerify(interaction);
                    break;
            }
        } catch (error) {
            console.error('Fehler beim Bearbeiten des Buttons:', error);
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

// Leave-Event für User die den Server verlassen
client.on('guildMemberRemove', async member => {
    try {
        const leaveChannelId = getConfig(member.guild.id, 'leave_channel');

        if (!leaveChannelId) {
            console.log('Kein Leave Channel konfiguriert');
            return;
        }

        const leaveChannel = member.guild.channels.cache.get(leaveChannelId);

        if (!leaveChannel) {
            console.log('Leave Channel nicht gefunden');
            return;
        }

        const { EmbedBuilder } = await import('discord.js');
        const leaveEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Auf Wiedersehen! 👋')
            .setDescription(
                `**${member.user.tag}** hat den Server verlassen.\n\n` +
                `Wir wünschen dir alles Gute für die Zukunft!`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Mitglied seit ${member.joinedAt ? member.joinedAt.toLocaleDateString('de-DE') : 'Unbekannt'}` });

        await leaveChannel.send({ embeds: [leaveEmbed] });
        console.log(`Leave-Nachricht für ${member.user.tag} gesendet`);
    } catch (error) {
        console.error('Fehler beim Senden der Leave-Nachricht:', error);
    }
});

// Bot starten
console.log('\n🔌 Verbinde mit Discord...');
client.login(process.env.DISCORD_TOKEN);
