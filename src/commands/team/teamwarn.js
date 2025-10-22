import { SlashCommandBuilder } from 'discord.js';
import { addWarning, getUserWarnings } from '../../database/warnings.js';
import { getConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { warningEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('teamwarn')
        .setDescription('Warnt einen Team-Member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User, der gewarnt werden soll')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Grund für die Warnung')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        const warnId = addWarning(
            interaction.guildId,
            user.id,
            interaction.user.id,
            reason
        );

        const warnings = getUserWarnings(interaction.guildId, user.id);

        const embed = warningEmbed(
            'Team-Member gewarnt',
            `**User:** ${user}\n**Grund:** ${reason}\n**Gewarnt von:** ${interaction.user}\n**Anzahl Warnungen:** ${warnings.length}\n**Warn-ID:** #${warnId}`
        );

        // TeamUpdates Channel
        const teamUpdatesChannelId = getConfig(interaction.guildId, 'teamupdates_channel');
        if (teamUpdatesChannelId) {
            const teamUpdatesChannel = interaction.guild.channels.cache.get(teamUpdatesChannelId);
            if (teamUpdatesChannel) {
                await teamUpdatesChannel.send({ embeds: [embed] });
            }
        }

        await interaction.reply({ embeds: [embed] });
    }
};
