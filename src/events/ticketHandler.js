import { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createTicket, getTicketByChannel, updateTicketStatus, deleteTicket, getTicketConfig } from '../database/tickets.js';
import { successEmbed, errorEmbed } from '../utils/embeds.js';

const CATEGORY_NAMES = {
    support: 'Support',
    analyse: 'Analyse',
    donator: 'Donator',
    fraktion: 'Fraktions-Antrag',
    highteam: 'High-Team',
    sonstiges: 'Sonstiges'
};

export async function handleTicketCreate(interaction) {
    const category = interaction.values[0];
    const config = getTicketConfig(interaction.guild.id);

    if (!config.ticketCategoryId) {
        const embed = errorEmbed('Setup unvollständig', 'Ticket-Kategorie wurde nicht konfiguriert.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Erstelle Ticket-Channel
    try {
        const ticketCategory = interaction.guild.channels.cache.get(config.ticketCategoryId);

        if (!ticketCategory) {
            const embed = errorEmbed('Fehler', 'Ticket-Kategorie nicht gefunden.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${CATEGORY_NAMES[category].toLowerCase()}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: ticketCategory.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                }
            ]
        });

        // Füge Berechtigungen für die konfigurierten Rollen hinzu
        if (config.categories && config.categories[category]) {
            for (const roleId of config.categories[category]) {
                await ticketChannel.permissionOverwrites.create(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
            }
        }

        // Speichere Ticket in Datenbank
        const ticket = createTicket(interaction.guild.id, ticketChannel.id, interaction.user.id, category);

        // Erstelle Ticket-Embed mit Buttons
        const ticketEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`🎫 Ticket: ${CATEGORY_NAMES[category]}`)
            .setDescription(
                `Hallo ${interaction.user}!\n\n` +
                `Dein Ticket wurde erstellt. Ein Team-Mitglied wird sich bald um dein Anliegen kümmern.\n\n` +
                `**Kategorie:** ${CATEGORY_NAMES[category]}\n` +
                `**Ticket-ID:** #${ticket.id}`
            )
            .setFooter({ text: 'Bitte beschreibe dein Anliegen' })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim')
                    .setEmoji('✋')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Schließen')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

        await ticketChannel.send({ embeds: [ticketEmbed], components: [buttons] });

        const embed = successEmbed(
            'Ticket erstellt',
            `Dein Ticket wurde erstellt: ${ticketChannel}`
        );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error('Fehler beim Erstellen des Tickets:', error);
        const embed = errorEmbed('Fehler', 'Konnte Ticket nicht erstellen.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

export async function handleTicketClaim(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (ticket.claimed_by) {
        const embed = errorEmbed('Bereits beansprucht', `Dieses Ticket wurde bereits von <@${ticket.claimed_by}> beansprucht.`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Update Ticket-Status
    updateTicketStatus(interaction.channel.id, 'claimed', interaction.user.id);

    // Update Channel-Name mit orangenem Kreis
    await interaction.channel.setName(`🟠-${interaction.channel.name}`);

    const embed = successEmbed(
        'Ticket beansprucht',
        `${interaction.user} bearbeitet nun dieses Ticket.`
    );

    // Neue Buttons
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_accept')
                .setLabel('Annehmen')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('ticket_deny')
                .setLabel('Ablehnen')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Schließen')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.update({ components: [buttons] });
    await interaction.channel.send({ embeds: [embed] });
}

export async function handleTicketAccept(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Update Ticket-Status
    updateTicketStatus(interaction.channel.id, 'accepted', interaction.user.id);

    // Update Channel-Name mit grünem Haken
    const newName = interaction.channel.name.replace(/🟠-/, '✅-');
    await interaction.channel.setName(newName);

    const embed = successEmbed(
        'Ticket angenommen',
        `Dieses Ticket wurde von ${interaction.user} angenommen.`
    );

    // Button zum Schließen
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Schließen')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.update({ components: [buttons] });
    await interaction.channel.send({ embeds: [embed] });
}

export async function handleTicketDeny(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Update Ticket-Status
    updateTicketStatus(interaction.channel.id, 'denied', interaction.user.id);

    // Update Channel-Name mit rotem X
    const newName = interaction.channel.name.replace(/🟠-/, '❌-');
    await interaction.channel.setName(newName);

    const embed = errorEmbed(
        'Ticket abgelehnt',
        `Dieses Ticket wurde von ${interaction.user} abgelehnt.`
    );

    // Button zum Schließen
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Schließen')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.update({ components: [buttons] });
    await interaction.channel.send({ embeds: [embed] });
}

export async function handleTicketClose(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = successEmbed(
        'Ticket wird geschlossen',
        'Dieser Channel wird in 5 Sekunden gelöscht.'
    );

    await interaction.reply({ embeds: [embed] });

    // Lösche Ticket aus Datenbank
    deleteTicket(interaction.channel.id);

    // Lösche Channel nach 5 Sekunden
    setTimeout(async () => {
        await interaction.channel.delete();
    }, 5000);
}
