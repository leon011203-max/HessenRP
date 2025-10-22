import { SlashCommandBuilder } from 'discord.js';
import { getConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('teamuprank')
        .setDescription('Stuft ein Team-Mitglied hoch')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User, der hochgestuft werden soll')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rolle')
                .setDescription('Die neue Rolle für den User')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('rolle');
        const member = await interaction.guild.members.fetch(user.id);

        try {
            await member.roles.add(role);

            const embed = successEmbed(
                'Team-Mitglied hochgestuft 🎊',
                `**User:** ${user}\n**Neue Rolle:** ${role}\n**Hochgestuft von:** ${interaction.user}`
            );

            // TeamUpdates Channel
            const teamUpdatesChannelId = getConfig(interaction.guildId, 'teamupdates_channel');
            if (teamUpdatesChannelId) {
                const teamUpdatesChannel = interaction.guild.channels.cache.get(teamUpdatesChannelId);
                if (teamUpdatesChannel) {
                    await teamUpdatesChannel.send({ embeds: [embed] });
                }
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Rolle:', error);
            const embed = errorEmbed(
                'Fehler',
                'Konnte die Rolle nicht hinzufügen. Stelle sicher, dass der Bot die nötigen Berechtigungen hat.'
            );
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
