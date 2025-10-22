import { SlashCommandBuilder } from 'discord.js';
import { getConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('teamnew')
        .setDescription('Fügt ein neues Team-Mitglied hinzu')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User, der die Rolle bekommen soll')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rolle')
                .setDescription('Die Rolle, die der User bekommen soll')
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

            // Willkommensnachricht
            const welcomeEmbed = successEmbed(
                'Willkommen im Team! 🎉',
                `Herzlich willkommen ${user}!\n\nDu wurdest dem Team hinzugefügt und hast die Rolle ${role} erhalten.\n\nViel Erfolg! 💪`
            );

            // Versuche dem User eine DM zu senden
            try {
                await user.send({ embeds: [welcomeEmbed] });
            } catch (dmError) {
                console.log(`Konnte keine DM an ${user.tag} senden:`, dmError.message);
            }

            // TeamUpdates Embed
            const updateEmbed = successEmbed(
                'Neues Team-Mitglied 🎉',
                `**User:** ${user}\n**Rolle:** ${role}\n**Hinzugefügt von:** ${interaction.user}`
            );

            // TeamUpdates Channel
            const teamUpdatesChannelId = getConfig(interaction.guildId, 'teamupdates_channel');
            if (teamUpdatesChannelId) {
                const teamUpdatesChannel = interaction.guild.channels.cache.get(teamUpdatesChannelId);
                if (teamUpdatesChannel) {
                    await teamUpdatesChannel.send({ embeds: [updateEmbed] });
                }
            }

            await interaction.reply({ embeds: [updateEmbed], ephemeral: true });
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
