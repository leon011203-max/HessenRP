import { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
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

    if (!config.categoryChannels || !config.categoryChannels[category]) {
        const embed = errorEmbed(
            'Setup unvollständig',
            `Die Kategorie **${category}** wurde nicht konfiguriert.\nBitte konfiguriere sie mit:\n\`/ticketsetup category ticketcategory:${category}\``
        );
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Erstelle Ticket-Channel
    try {
        const ticketCategory = interaction.guild.channels.cache.get(config.categoryChannels[category]);

        if (!ticketCategory) {
            const embed = errorEmbed('Fehler', `Kategorie für **${category}** nicht gefunden.`);
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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
        if (config.categoryPermissions && config.categoryPermissions[category]) {
            for (const roleId of config.categoryPermissions[category]) {
                await ticketChannel.permissionOverwrites.create(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
            }
        }

        // Speichere Ticket in Datenbank
        const ticket = createTicket(interaction.guild.id, ticketChannel.id, interaction.user.id, category);

        // Erstelle Embed
        const ticketEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`🎫 Ticket: ${CATEGORY_NAMES[category]}`)
            .setDescription(
                `Hallo ${interaction.user}!\n\n` +
                `Dein Ticket wurde erstellt. Ein Team-Mitglied wird sich bald um dein Anliegen kümmern.`
            )
            .addFields(
                { name: '📋 Kategorie', value: CATEGORY_NAMES[category], inline: true },
                { name: '🔢 Ticket-ID', value: `#${ticket.id}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'HessenRP Ticket-System' });

        // Erstelle Buttons
        const claimButton = new ButtonBuilder()
            .setCustomId('ticket_claim')
            .setLabel('Claim')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(claimButton);

        await ticketChannel.send({
            embeds: [ticketEmbed],
            components: [row]
        });

        const embed = successEmbed(
            'Ticket erstellt',
            `Dein Ticket wurde erstellt: ${ticketChannel}`
        );

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error('Fehler beim Erstellen des Tickets:', error);
        const embed = errorEmbed('Fehler', 'Konnte Ticket nicht erstellen.');
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
}

export async function handleTicketClaim(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    if (ticket.claimed_by) {
        const embed = errorEmbed('Bereits beansprucht', `Dieses Ticket wurde bereits von <@${ticket.claimed_by}> beansprucht.`);
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Update Ticket-Status
    updateTicketStatus(interaction.channel.id, 'claimed', interaction.user.id);

    // Update Channel-Name mit orangenem Kreis
    await interaction.channel.setName(`🟠-${interaction.channel.name}`);

    // Erstelle Embed
    const claimedEmbed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('✋ Ticket beansprucht')
        .setDescription(
            `${interaction.user} bearbeitet nun dieses Ticket.\n\n` +
            `Nutze die Buttons um das Ticket anzunehmen oder abzulehnen.`
        )
        .setTimestamp()
        .setFooter({ text: 'HessenRP Ticket-System' });

    // Erstelle Buttons
    const acceptButton = new ButtonBuilder()
        .setCustomId('ticket_accept')
        .setLabel('Annehmen')
        .setStyle(ButtonStyle.Success);

    const denyButton = new ButtonBuilder()
        .setCustomId('ticket_deny')
        .setLabel('Ablehnen')
        .setStyle(ButtonStyle.Danger);

    const closeButton = new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Schließen')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(acceptButton, denyButton, closeButton);

    await interaction.update({
        embeds: [claimedEmbed],
        components: [row]
    });
}

export async function handleTicketAccept(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Update Ticket-Status
    updateTicketStatus(interaction.channel.id, 'accepted', interaction.user.id);

    // Update Channel-Name mit grünem Haken
    const newName = interaction.channel.name.replace(/🟠-/, '✅-');
    await interaction.channel.setName(newName);

    // Erstelle Embed
    const acceptedEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Ticket angenommen')
        .setDescription(`Dieses Ticket wurde von ${interaction.user} angenommen.`)
        .setTimestamp()
        .setFooter({ text: 'HessenRP Ticket-System' });

    // Erstelle Schließen-Button
    const closeButton = new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Schließen')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    await interaction.update({
        embeds: [acceptedEmbed],
        components: [row]
    });
}

export async function handleTicketDeny(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Update Ticket-Status
    updateTicketStatus(interaction.channel.id, 'denied', interaction.user.id);

    // Update Channel-Name mit rotem X
    const newName = interaction.channel.name.replace(/🟠-/, '❌-');
    await interaction.channel.setName(newName);

    // Erstelle Embed
    const deniedEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Ticket abgelehnt')
        .setDescription(`Dieses Ticket wurde von ${interaction.user} abgelehnt.`)
        .setTimestamp()
        .setFooter({ text: 'HessenRP Ticket-System' });

    // Erstelle Schließen-Button
    const closeButton = new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Schließen')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    await interaction.update({
        embeds: [deniedEmbed],
        components: [row]
    });
}

export async function handleTicketClose(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Erstelle Embed
    const closingEmbed = new EmbedBuilder()
        .setColor('#808080')
        .setTitle('🔒 Ticket wird geschlossen')
        .setDescription('Dieser Channel wird in **5 Sekunden** gelöscht.')
        .setTimestamp()
        .setFooter({ text: 'HessenRP Ticket-System' });

    await interaction.update({
        embeds: [closingEmbed],
        components: []
    });

    // Lösche Ticket aus Datenbank
    deleteTicket(interaction.channel.id);

    // Lösche Channel nach 5 Sekunden
    setTimeout(async () => {
        await interaction.channel.delete();
    }, 5000);
}
