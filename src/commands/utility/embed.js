import { SlashCommandBuilder, EmbedBuilder, ChannelType, MessageFlags } from 'discord.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

const ALLOWED_ROLE_ID = '1430289484993269770';

export default {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Erstellt ein Embed mit einer benutzerdefinierten Nachricht')
        .addStringOption(option =>
            option.setName('titel')
                .setDescription('Titel des Embeds')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nachricht')
                .setDescription('Nachricht/Beschreibung des Embeds')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel wo das Embed gepostet werden soll (Standard: aktueller Channel)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('farbe')
                .setDescription('Farbe des Embeds (hex z.B. #ff0000 oder Farbnamen)')
                .setRequired(false)
                .addChoices(
                    { name: 'Rot', value: '#ff0000' },
                    { name: 'Grün', value: '#00ff00' },
                    { name: 'Blau', value: '#0099ff' },
                    { name: 'Gelb', value: '#ffff00' },
                    { name: 'Orange', value: '#ff9900' },
                    { name: 'Lila', value: '#9900ff' },
                    { name: 'Rosa', value: '#ff69b4' },
                    { name: 'Schwarz', value: '#000000' }
                ))
        .addStringOption(option =>
            option.setName('bild_url')
                .setDescription('URL eines Bildes für das Embed (optional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('thumbnail_url')
                .setDescription('URL eines Thumbnails für das Embed (optional)')
                .setRequired(false)),

    async execute(interaction) {
        // Rollenprüfung
        const hasRole = interaction.member.roles.cache.has(ALLOWED_ROLE_ID);

        if (!hasRole) {
            const embed = errorEmbed(
                'Keine Berechtigung',
                'Du benötigst die erforderliche Rolle um Embeds zu erstellen.'
            );
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const titel = interaction.options.getString('titel');
        const nachricht = interaction.options.getString('nachricht');
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const farbe = interaction.options.getString('farbe') || '#0099ff';
        const bildUrl = interaction.options.getString('bild_url');
        const thumbnailUrl = interaction.options.getString('thumbnail_url');

        try {
            // Erstelle das Embed
            const customEmbed = new EmbedBuilder()
                .setColor(farbe)
                .setTitle(titel)
                .setDescription(nachricht)
                .setTimestamp()
                .setFooter({ text: `Erstellt von ${interaction.user.tag}` });

            // Füge optionales Bild hinzu
            if (bildUrl) {
                customEmbed.setImage(bildUrl);
            }

            // Füge optionales Thumbnail hinzu
            if (thumbnailUrl) {
                customEmbed.setThumbnail(thumbnailUrl);
            }

            // Sende das Embed in den gewählten Channel
            await channel.send({ embeds: [customEmbed] });

            // Bestätigung
            const confirmEmbed = successEmbed(
                'Embed erstellt',
                `Dein Embed wurde erfolgreich in ${channel} gepostet!`
            );

            await interaction.reply({ embeds: [confirmEmbed], flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('Fehler beim Erstellen des Embeds:', error);

            const embed = errorEmbed(
                'Fehler',
                'Konnte das Embed nicht erstellen. Bitte überprüfe die URLs und versuche es erneut.'
            );

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};
