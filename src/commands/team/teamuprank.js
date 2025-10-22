import { SlashCommandBuilder } from 'discord.js';
import { getConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('teamuprank')
        .setDescription('Gibt einem Mitglied die konfigurierte Uprank-Rolle')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User, der hochgestuft werden soll')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        const roleId = getConfig(interaction.guildId, 'team_uprank_role');

        if (!roleId) {
            const embed = errorEmbed(
                'Keine Rolle konfiguriert',
                'Bitte konfiguriere zuerst eine Rolle mit `/setconfig key:team_uprank_role value:<RollenID>`'
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            const embed = errorEmbed(
                'Rolle nicht gefunden',
                'Die konfigurierte Rolle existiert nicht mehr!'
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await member.roles.add(role);

            const embed = successEmbed(
                'Team-Mitglied hochgestuft',
                `${user} wurde die Rolle ${role} gegeben.`
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
            console.error('Fehler beim Hinzufügen der Rolle:', error);
            const embed = errorEmbed(
                'Fehler',
                'Konnte die Rolle nicht hinzufügen. Stelle sicher, dass der Bot die nötigen Berechtigungen hat.'
            );
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
