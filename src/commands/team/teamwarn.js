import { SlashCommandBuilder } from 'discord.js';
import { addTeamWarning, getTeamWarnings } from '../../database/warnings.js';
import { getConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, warningEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('teamwarn')
        .setDescription('Warnt ein ganzes Team (Rolle)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Die Team-Rolle, die gewarnt werden soll')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Grund für die Warnung')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason');

        const warnId = addTeamWarning(
            interaction.guildId,
            role.id,
            interaction.user.id,
            reason
        );

        const warnings = getTeamWarnings(interaction.guildId, role.id);

        const embed = warningEmbed(
            'Team gewarnt',
            `**Team:** ${role}\n**Grund:** ${reason}\n**Gewarnt von:** ${interaction.user}\n**Anzahl Warnungen:** ${warnings.length}\n**Warn-ID:** #${warnId}`
        );

        // Log Channel
        const logChannelId = getConfig(interaction.guildId, 'warn_log_channel');
        if (logChannelId) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }
        }

        await interaction.reply({ embeds: [embed] });
    }
};
