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
                'Team-Mitglied gekickt',
                `${user} wurde vom Server gekickt.\n**Grund:** ${reason}`
            );

            // Log Channel
            const logChannelId = getConfig(interaction.guildId, 'team_log_channel');
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
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
