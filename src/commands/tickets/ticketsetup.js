import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { getTicketConfig, setTicketConfig } from '../../database/tickets.js';
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
                .setDescription('Setzt die Kategorie für Ticket-Channels')
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Die Kategorie für Ticket-Channels')
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('permissions')
                .setDescription('Setzt Berechtigungen für eine Ticket-Kategorie')
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
                        .setDescription('Rolle mit Berechtigung')
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
            const category = interaction.options.getChannel('category');
            config.ticketCategoryId = category.id;
            setTicketConfig(interaction.guildId, config);

            const embed = successEmbed(
                'Ticket-Kategorie gesetzt',
                `Neue Tickets werden in der Kategorie ${category.name} erstellt.`
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'permissions') {
            const ticketCategory = interaction.options.getString('ticketcategory');
            const role = interaction.options.getRole('rolle');

            if (!config.categories) config.categories = {};
            if (!config.categories[ticketCategory]) {
                config.categories[ticketCategory] = [];
            }

            if (!config.categories[ticketCategory].includes(role.id)) {
                config.categories[ticketCategory].push(role.id);
            }

            setTicketConfig(interaction.guildId, config);

            const embed = successEmbed(
                'Berechtigung hinzugefügt',
                `Rolle ${role} hat nun Zugriff auf **${ticketCategory}**-Tickets.`
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
