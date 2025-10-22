import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getTicketConfig } from '../../database/tickets.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticketpanel')
        .setDescription('Erstellt das Ticket-Panel'),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const config = getTicketConfig(interaction.guildId);

        if (!config.panelChannelId || !config.ticketCategoryId) {
            const embed = errorEmbed(
                'Setup unvollständig',
                'Bitte konfiguriere zuerst:\n`/ticketsetup panel` und `/ticketsetup category`'
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(config.panelChannelId);

        if (!channel) {
            const embed = errorEmbed(
                'Channel nicht gefunden',
                'Der konfigurierte Panel-Channel existiert nicht mehr.'
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const panelEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎫 Ticket-System')
            .setDescription(
                '**Willkommen beim Ticket-System!**\n\n' +
                'Wähle unten eine Kategorie aus, um ein Ticket zu erstellen.\n\n' +
                '**Verfügbare Kategorien:**\n' +
                '🛠️ **Support** - Allgemeine Hilfe und Support\n' +
                '🔍 **Analyse** - RP-Situationen analysieren\n' +
                '💎 **Donator** - Fragen zu Donator-Perks\n' +
                '🏛️ **Fraktions-Antrag** - Bewerbungen für Fraktionen\n' +
                '👑 **High Team** - Wichtige Team-Angelegenheiten\n' +
                '📋 **Sonstiges** - Andere Anliegen'
            )
            .setFooter({ text: 'Wähle eine Kategorie aus dem Dropdown-Menü' })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_create')
            .setPlaceholder('Wähle eine Ticket-Kategorie')
            .addOptions([
                {
                    label: 'Support',
                    description: 'Allgemeine Hilfe und Support',
                    value: 'support',
                    emoji: '🛠️'
                },
                {
                    label: 'Analyse',
                    description: 'RP-Situationen analysieren',
                    value: 'analyse',
                    emoji: '🔍'
                },
                {
                    label: 'Donator',
                    description: 'Fragen zu Donator-Perks',
                    value: 'donator',
                    emoji: '💎'
                },
                {
                    label: 'Fraktions-Antrag',
                    description: 'Bewerbungen für Fraktionen',
                    value: 'fraktion',
                    emoji: '🏛️'
                },
                {
                    label: 'High Team',
                    description: 'Wichtige Team-Angelegenheiten',
                    value: 'highteam',
                    emoji: '👑'
                },
                {
                    label: 'Sonstiges',
                    description: 'Andere Anliegen',
                    value: 'sonstiges',
                    emoji: '📋'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await channel.send({ embeds: [panelEmbed], components: [row] });

        const embed = successEmbed(
            'Ticket-Panel erstellt',
            `Das Ticket-Panel wurde in ${channel} erstellt.`
        );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
