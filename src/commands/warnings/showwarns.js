import { SlashCommandBuilder } from 'discord.js';
import { getUserWarnings, getTeamWarnings } from '../../database/warnings.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { infoEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('showwarns')
        .setDescription('Zeigt alle Warnungen an')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Typ der Warnung')
                .setRequired(true)
                .addChoices(
                    { name: 'User Warnung', value: 'user' },
                    { name: 'Team Warnung', value: 'team' }
                ))
        .addStringOption(option =>
            option.setName('target')
                .setDescription('User-ID oder Rollen-ID')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const type = interaction.options.getString('type');
        const targetId = interaction.options.getString('target');

        let warnings = [];
        let title = '';

        if (type === 'user') {
            warnings = getUserWarnings(interaction.guildId, targetId);
            title = `Warnungen für User <@${targetId}>`;
        } else if (type === 'team') {
            warnings = getTeamWarnings(interaction.guildId, targetId);
            title = `Warnungen für Team <@&${targetId}>`;
        }

        if (warnings.length === 0) {
            const embed = infoEmbed(title, 'Keine Warnungen vorhanden.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let description = '';
        for (const warn of warnings) {
            const date = new Date(warn.timestamp).toLocaleString('de-DE');
            description += `**ID:** #${warn.id}\n`;
            description += `**Grund:** ${warn.reason}\n`;
            description += `**Von:** <@${warn.warned_by}>\n`;
            description += `**Datum:** ${date}\n\n`;
        }

        const embed = infoEmbed(title, description);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
