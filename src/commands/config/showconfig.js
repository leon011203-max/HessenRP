import { SlashCommandBuilder } from 'discord.js';
import { getAllConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { infoEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('showconfig')
        .setDescription('Zeigt alle Bot-Konfigurationen an'),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const config = getAllConfig(interaction.guildId);

        let description = '';

        if (Object.keys(config).length === 0) {
            description = 'Keine Konfigurationen vorhanden.';
        } else {
            for (const [key, value] of Object.entries(config)) {
                description += `**${key}**: \`${value}\`\n`;
            }
        }

        const embed = infoEmbed('Bot Konfiguration', description);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
