import { ChannelType, PermissionFlagsBits, SectionBuilder, ButtonStyle, MessageFlags } from 'discord.js';
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
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Erstelle Ticket-Channel
    try {
        const ticketCategory = interaction.guild.channels.cache.get(config.categoryChannels[category]);

        if (!ticketCategory) {
            const embed = errorEmbed('Fehler', `Kategorie für **${category}** nicht gefunden.`);
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

        // Erstelle Section mit Text und Button
        const ticketSection = new SectionBuilder()
            .addTextDisplayComponents(
                (textDisplay) =>
                    textDisplay.setContent(
                        `**🎫 Ticket: ${CATEGORY_NAMES[category]}**\n\n` +
                        `Hallo ${interaction.user}!\n\n` +
                        `Dein Ticket wurde erstellt. Ein Team-Mitglied wird sich bald um dein Anliegen kümmern.\n\n` +
                        `**Kategorie:** ${CATEGORY_NAMES[category]}\n` +
                        `**Ticket-ID:** #${ticket.id}`
                    )
            )
            .setButtonAccessory((button) =>
                button
                    .setCustomId('ticket_claim')
                    .setLabel('Claim')
                    .setStyle(ButtonStyle.Primary)
            );

        await ticketChannel.send({
            components: [ticketSection],
            flags: MessageFlags.IsComponentsV2
        });

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

    // Neue Section mit Annehmen/Ablehnen Buttons
    const claimedSection = new SectionBuilder()
        .addTextDisplayComponents(
            (textDisplay) =>
                textDisplay.setContent(
                    `**✋ Ticket beansprucht**\n\n` +
                    `${interaction.user} bearbeitet nun dieses Ticket.\n\n` +
                    `Nutze die Buttons um das Ticket anzunehmen oder abzulehnen.`
                )
        )
        .setButtonAccessory((button) =>
            button
                .setCustomId('ticket_accept')
                .setLabel('Annehmen')
                .setStyle(ButtonStyle.Success)
        );

    const denySection = new SectionBuilder()
        .setButtonAccessory((button) =>
            button
                .setCustomId('ticket_deny')
                .setLabel('Ablehnen')
                .setStyle(ButtonStyle.Danger)
        );

    const closeSection = new SectionBuilder()
        .setButtonAccessory((button) =>
            button
                .setCustomId('ticket_close')
                .setLabel('Schließen')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.update({
        components: [claimedSection, denySection, closeSection],
        flags: MessageFlags.IsComponentsV2
    });
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

    // Section mit Erfolg und Schließen-Button
    const acceptedSection = new SectionBuilder()
        .addTextDisplayComponents(
            (textDisplay) =>
                textDisplay.setContent(
                    `**✅ Ticket angenommen**\n\n` +
                    `Dieses Ticket wurde von ${interaction.user} angenommen.`
                )
        )
        .setButtonAccessory((button) =>
            button
                .setCustomId('ticket_close')
                .setLabel('Schließen')
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.update({
        components: [acceptedSection],
        flags: MessageFlags.IsComponentsV2
    });
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

    // Section mit Ablehnung und Schließen-Button
    const deniedSection = new SectionBuilder()
        .addTextDisplayComponents(
            (textDisplay) =>
                textDisplay.setContent(
                    `**❌ Ticket abgelehnt**\n\n` +
                    `Dieses Ticket wurde von ${interaction.user} abgelehnt.`
                )
        )
        .setButtonAccessory((button) =>
            button
                .setCustomId('ticket_close')
                .setLabel('Schließen')
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.update({
        components: [deniedSection],
        flags: MessageFlags.IsComponentsV2
    });
}

export async function handleTicketClose(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
        const embed = errorEmbed('Fehler', 'Ticket nicht gefunden.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Section mit Schließen-Nachricht
    const closingSection = new SectionBuilder()
        .addTextDisplayComponents(
            (textDisplay) =>
                textDisplay.setContent(
                    `**🔒 Ticket wird geschlossen**\n\n` +
                    `Dieser Channel wird in **5 Sekunden** gelöscht.`
                )
        );

    await interaction.reply({
        components: [closingSection],
        flags: MessageFlags.IsComponentsV2
    });

    // Lösche Ticket aus Datenbank
    deleteTicket(interaction.channel.id);

    // Lösche Channel nach 5 Sekunden
    setTimeout(async () => {
        await interaction.channel.delete();
    }, 5000);
}
