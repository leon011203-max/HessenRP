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
        if (!hasPermission(interaction, 'clear')) {
            return noPermissionReply(interaction);
        }

        const anzahl = interaction.options.getInteger('anzahl');

        // Erstelle sofort eine Antwort
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            let deletedCount = 0;
            const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
            const now = Date.now();

            // Hole die Nachrichten
            const messages = await interaction.channel.messages.fetch({ limit: anzahl });

            // Trenne neue und alte Nachrichten
            const recentMessages = messages.filter(msg => (now - msg.createdTimestamp) < TWO_WEEKS);
            const oldMessages = messages.filter(msg => (now - msg.createdTimestamp) >= TWO_WEEKS);

            // Lösche neue Nachrichten mit bulkDelete (schneller)
            if (recentMessages.size > 0) {
                const deleted = await interaction.channel.bulkDelete(recentMessages, true);
                deletedCount += deleted.size;
            }

            // Lösche alte Nachrichten einzeln
            if (oldMessages.size > 0) {
                for (const [, message] of oldMessages) {
                    try {
                        await message.delete();
                        deletedCount++;
                        // Kleine Pause um Rate Limits zu vermeiden
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (err) {
                        console.error(`Konnte Nachricht ${message.id} nicht löschen:`, err);
                    }
                }
            }

            const embed = successEmbed(
                '🗑️ Nachrichten gelöscht',
                `**${deletedCount}** von ${messages.size} Nachricht(en) wurden erfolgreich gelöscht.`
            );

            await interaction.editReply({ embeds: [embed] });

            console.log(`✅ ${deletedCount} Nachrichten in #${interaction.channel.name} gelöscht von ${interaction.user.tag}`);
        } catch (error) {
            console.error('Fehler beim Löschen der Nachrichten:', error);

            let errorMessage = 'Es gab einen Fehler beim Löschen der Nachrichten.';

            if (error.code === 50013) {
                errorMessage = 'Der Bot hat nicht die erforderlichen Berechtigungen um Nachrichten zu löschen.';
            }

            const embed = errorEmbed(
                'Fehler beim Löschen',
                errorMessage
            );

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
