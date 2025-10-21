import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];
const commandFolders = readdirSync(join(__dirname, 'commands'));

// Commands laden
console.log('📝 Lade Commands...');

for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, 'commands', folder)).filter(
        file => file.endsWith('.js')
    );

    for (const file of commandFiles) {
        const filePath = join(__dirname, 'commands', folder, file);
        const command = await import(`file://${filePath}`);

        if ('data' in command.default && 'execute' in command.default) {
            commands.push(command.default.data.toJSON());
            console.log(`✅ ${command.default.data.name}`);
        }
    }
}

// REST API setup
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Commands deployen
(async () => {
    try {
        console.log(`\n🚀 Starte Deployment von ${commands.length} Commands...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log(`✅ Erfolgreich ${data.length} Commands deployed!`);
    } catch (error) {
        console.error('❌ Fehler beim Deployen der Commands:', error);
    }
})();
