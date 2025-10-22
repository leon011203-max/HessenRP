import { SlashCommandBuilder } from 'discord.js';
import { getConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('teamdownrank')
        .setDescription('Entfernt eine Rolle von einem Team-Mitglied')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User, der downgerankt werden soll')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rolle')
                .setDescription('Die Rolle, die entfernt werden soll')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('rolle');
        const member = await interaction.guild.members.fetch(user.id);

        // Prüfen ob User die Rolle hat
        if (!member.roles.cache.has(role.id)) {
            const embed = errorEmbed(
                'Rolle nicht vorhanden',
                `${user} hat die Rolle ${role} nicht.`
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await member.roles.remove(role);

            const embed = successEmbed(
                'Team-Mitglied downgerankt 📉',
                `**User:** ${user}\n**Entfernte Rolle:** ${role}\n**Downgerankt von:** ${interaction.user}`
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
            console.error('Fehler beim Entfernen der Rolle:', error);
            const embed = errorEmbed(
                'Fehler',
                'Konnte die Rolle nicht entfernen. Stelle sicher, dass der Bot die nötigen Berechtigungen hat.'
            );
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
