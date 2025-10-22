import { SlashCommandBuilder } from 'discord.js';
import { getConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('teamkick')
        .setDescription('Kickt ein Mitglied vom Server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User, der gekickt werden soll')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Grund für den Kick')
                .setRequired(false)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.kickable) {
            const embed = errorEmbed(
                'Kick fehlgeschlagen',
                'Dieser User kann nicht gekickt werden (höhere Rolle oder Bot-Owner).'
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await member.kick(reason);

            const embed = successEmbed(
                'Team-Mitglied gekickt 👋',
                `**User:** ${user}\n**Grund:** ${reason}\n**Gekickt von:** ${interaction.user}`
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
        } catch (error) {
            console.error('Fehler beim Kicken:', error);
            const embed = errorEmbed(
                'Fehler',
                'Konnte den User nicht kicken. Stelle sicher, dass der Bot die nötigen Berechtigungen hat.'
            );
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
