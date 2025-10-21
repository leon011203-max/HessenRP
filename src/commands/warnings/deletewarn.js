import { SlashCommandBuilder } from 'discord.js';
import { deleteWarning, deleteTeamWarning, getWarning, getTeamWarning } from '../../database/warnings.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('deletewarn')
        .setDescription('Löscht eine Warnung')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Typ der Warnung')
                .setRequired(true)
                .addChoices(
                    { name: 'User Warnung', value: 'user' },
                    { name: 'Team Warnung', value: 'team' }
                ))
        .addIntegerOption(option =>
            option.setName('warn_id')
                .setDescription('Die ID der Warnung')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const type = interaction.options.getString('type');
        const warnId = interaction.options.getInteger('warn_id');

        let success = false;
        let warnData = null;

        if (type === 'user') {
            warnData = getWarning(warnId);
            success = deleteWarning(warnId);
        } else if (type === 'team') {
            warnData = getTeamWarning(warnId);
            success = deleteTeamWarning(warnId);
        }

        if (!success || !warnData) {
            const embed = errorEmbed(
                'Warnung nicht gefunden',
                `Keine Warnung mit der ID #${warnId} gefunden.`
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = successEmbed(
            'Warnung gelöscht',
            `Warnung #${warnId} wurde erfolgreich gelöscht.`
        );

        await interaction.reply({ embeds: [embed] });
    }
};
