import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Löscht eine bestimmte Anzahl von Nachrichten im aktuellen Channel')
        .addIntegerOption(option =>
            option.setName('anzahl')
                .setDescription('Anzahl der zu löschenden Nachrichten (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const anzahl = interaction.options.getInteger('anzahl');

        try {
            // Lösche die Nachrichten
            const deletedMessages = await interaction.channel.bulkDelete(anzahl, true);

            const embed = successEmbed(
                '🗑️ Nachrichten gelöscht',
                `**${deletedMessages.size}** Nachricht(en) wurden erfolgreich gelöscht.`
            );

            // Sende Bestätigung (ephemeral)
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

            console.log(`✅ ${deletedMessages.size} Nachrichten in #${interaction.channel.name} gelöscht von ${interaction.user.tag}`);
        } catch (error) {
            console.error('Fehler beim Löschen der Nachrichten:', error);

            let errorMessage = 'Es gab einen Fehler beim Löschen der Nachrichten.';

            // Spezifische Fehlermeldungen
            if (error.code === 50034) {
                errorMessage = 'Du kannst nur Nachrichten löschen, die jünger als 14 Tage sind.';
            } else if (error.code === 50013) {
                errorMessage = 'Der Bot hat nicht die erforderlichen Berechtigungen um Nachrichten zu löschen.';
            }

            const embed = errorEmbed(
                'Fehler beim Löschen',
                errorMessage
            );

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};
