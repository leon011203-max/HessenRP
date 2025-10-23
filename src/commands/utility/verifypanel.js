import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags } from 'discord.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('verifypanel')
        .setDescription('Erstellt das Verify-Panel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel wo das Verify-Panel erscheinen soll')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        // Prüfe ob Verify-Rolle konfiguriert ist
        if (!process.env.VERIFY_ROLE_ID) {
            const embed = errorEmbed(
                'Verify-Rolle nicht konfiguriert',
                'Bitte setze `VERIFY_ROLE_ID` in der `.env` Datei.'
            );
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        // Prüfe ob die Rolle existiert
        const verifyRole = interaction.guild.roles.cache.get(process.env.VERIFY_ROLE_ID);
        if (!verifyRole) {
            const embed = errorEmbed(
                'Verify-Rolle nicht gefunden',
                `Die Rolle mit ID \`${process.env.VERIFY_ROLE_ID}\` existiert nicht auf diesem Server.`
            );
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const channel = interaction.options.getChannel('channel') || interaction.channel;

        // Erstelle Verify-Embed
        const verifyEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Verifizierung')
            .setDescription(
                '**Willkommen auf dem Server!**\n\n' +
                'Um Zugriff auf alle Channels zu erhalten, musst du dich verifizieren.\n\n' +
                'Klicke einfach auf den Button unten um dich zu verifizieren!'
            )
            .addFields(
                { name: '📋 Du erhältst folgende Rolle:', value: `${verifyRole}`, inline: false }
            )
            .setFooter({ text: 'HessenRP Verify-System' })
            .setTimestamp();

        // Erstelle Verify-Button
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify_user')
            .setLabel('Verifizieren')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const row = new ActionRowBuilder().addComponents(verifyButton);

        try {
            // Sende Verify-Panel
            await channel.send({
                embeds: [verifyEmbed],
                components: [row]
            });

            const embed = successEmbed(
                'Verify-Panel erstellt',
                `Das Verify-Panel wurde in ${channel} erstellt.`
            );

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('Fehler beim Erstellen des Verify-Panels:', error);

            const embed = errorEmbed(
                'Fehler',
                'Konnte das Verify-Panel nicht erstellen. Bitte überprüfe die Bot-Berechtigungen.'
            );

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};
