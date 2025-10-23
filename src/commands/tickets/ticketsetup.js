import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { getTicketConfig, setTicketConfig, setCategoryChannel, addCategoryPermission } from '../../database/tickets.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticketsetup')
        .setDescription('Konfiguriert das Ticket-System')
        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('Setzt den Channel für das Ticket-Panel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Der Channel für das Ticket-Panel')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('category')
                .setDescription('Setzt die Discord-Kategorie für eine Ticket-Kategorie')
                .addStringOption(option =>
                    option.setName('ticketcategory')
                        .setDescription('Ticket-Kategorie')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Support', value: 'support' },
                            { name: 'Analyse', value: 'analyse' },
                            { name: 'Donator', value: 'donator' },
                            { name: 'Fraktions-Antrag', value: 'fraktion' },
                            { name: 'High Team', value: 'highteam' },
                            { name: 'Sonstiges', value: 'sonstiges' }
                        ))
                .addChannelOption(option =>
                    option.setName('discordcategory')
                        .setDescription('Discord-Kategorie wo Tickets erstellt werden')
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('permissions')
                .setDescription('Fügt eine Rolle zu den Berechtigungen einer Ticket-Kategorie hinzu')
                .addStringOption(option =>
                    option.setName('ticketcategory')
                        .setDescription('Ticket-Kategorie')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Support', value: 'support' },
                            { name: 'Analyse', value: 'analyse' },
                            { name: 'Donator', value: 'donator' },
                            { name: 'Fraktions-Antrag', value: 'fraktion' },
                            { name: 'High Team', value: 'highteam' },
                            { name: 'Sonstiges', value: 'sonstiges' }
                        ))
                .addRoleOption(option =>
                    option.setName('rolle')
                        .setDescription('Rolle mit Berechtigung (kann mehrfach ausgeführt werden)')
                        .setRequired(true))),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const subcommand = interaction.options.getSubcommand();
        const config = getTicketConfig(interaction.guildId);

        if (subcommand === 'panel') {
            const channel = interaction.options.getChannel('channel');
            config.panelChannelId = channel.id;
            setTicketConfig(interaction.guildId, config);

            const embed = successEmbed(
                'Ticket-Panel Channel gesetzt',
                `Ticket-Panel wird in ${channel} angezeigt.`
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'category') {
            const ticketCategory = interaction.options.getString('ticketcategory');
            const discordCategory = interaction.options.getChannel('discordcategory');

            setCategoryChannel(interaction.guildId, ticketCategory, discordCategory.id);

            const embed = successEmbed(
                'Ticket-Kategorie gesetzt',
                `**${ticketCategory}**-Tickets werden in der Kategorie **${discordCategory.name}** erstellt.`
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'permissions') {
            const ticketCategory = interaction.options.getString('ticketcategory');
            const role = interaction.options.getRole('rolle');

            addCategoryPermission(interaction.guildId, ticketCategory, role.id);

            const config = getTicketConfig(interaction.guildId);
            const roleCount = config.categoryPermissions[ticketCategory]?.length || 0;

            const embed = successEmbed(
                'Berechtigung hinzugefügt',
                `Rolle ${role} hat nun Zugriff auf **${ticketCategory}**-Tickets.\n\n` +
                `**Gesamt Rollen:** ${roleCount}`
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
