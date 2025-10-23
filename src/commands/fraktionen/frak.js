import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { addFrakWarn, getFrakWarns, deleteFrakWarn, getFrakWarnById } from '../../database/fraktionen.js';
import { getConfig } from '../../database/config.js';
import { errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('frak')
        .setDescription('Fraktions-Management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('offiziell')
                .setDescription('Macht eine Fraktion offiziell')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name der Fraktion')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('beschreibung')
                        .setDescription('Beschreibung/Info zur Fraktion')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('warn')
                .setDescription('Warnt eine Fraktion')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name der Fraktion')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('grund')
                        .setDescription('Grund der Warnung')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('warndelete')
                .setDescription('Löscht eine Fraktions-Warnung')
                .addIntegerOption(option =>
                    option.setName('warn_id')
                        .setDescription('ID der Warnung')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('aufgelöst')
                .setDescription('Löst eine Fraktion auf')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name der Fraktion')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('grund')
                        .setDescription('Grund der Auflösung')
                        .setRequired(true))),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const subcommand = interaction.options.getSubcommand();
        const fraktionenChannelId = getConfig(interaction.guildId, 'fraktionen_channel');

        if (!fraktionenChannelId && subcommand !== 'warndelete') {
            const embed = errorEmbed(
                'Channel nicht konfiguriert',
                'Bitte konfiguriere zuerst den Fraktionen-Channel:\n`/setconfig key:fraktionen_channel value:<ChannelID>`'
            );
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const fraktionenChannel = subcommand !== 'warndelete' ? interaction.guild.channels.cache.get(fraktionenChannelId) : null;

        if (!fraktionenChannel && subcommand !== 'warndelete') {
            const embed = errorEmbed(
                'Channel nicht gefunden',
                'Der konfigurierte Fraktionen-Channel existiert nicht mehr.'
            );
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'offiziell') {
            const name = interaction.options.getString('name');
            const beschreibung = interaction.options.getString('beschreibung') || 'Keine Beschreibung angegeben';

            // Grünes Embed für offizielle Fraktion
            const offiziellEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Fraktion offiziell gemacht')
                .setDescription(`Die Fraktion **${name}** ist nun offiziell!`)
                .addFields(
                    { name: '📋 Fraktionsname', value: name, inline: true },
                    { name: '👤 Offiziell gemacht von', value: `${interaction.user}`, inline: true },
                    { name: '📝 Beschreibung', value: beschreibung, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'HessenRP Fraktions-System' });

            await fraktionenChannel.send({ embeds: [offiziellEmbed] });

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Erfolgreich')
                .setDescription(`**${name}** wurde offiziell gemacht und im Fraktionen-Channel gepostet.`);

            await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });

        } else if (subcommand === 'warn') {
            const name = interaction.options.getString('name');
            const grund = interaction.options.getString('grund');

            // Warnung hinzufügen
            const warn = addFrakWarn(interaction.guildId, name, grund, interaction.user.id);
            const warnCount = getFrakWarns(interaction.guildId, name).length;

            // Gelbes Embed für Warnung
            const warnEmbed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('⚠️ Fraktions-Warnung')
                .setDescription(`Die Fraktion **${name}** hat eine Warnung erhalten!`)
                .addFields(
                    { name: '📋 Fraktionsname', value: name, inline: true },
                    { name: '🔢 Warn-ID', value: `#${warn.id}`, inline: true },
                    { name: '👤 Gewarnt von', value: `${interaction.user}`, inline: true },
                    { name: '📝 Grund', value: grund, inline: false },
                    { name: '📊 Gesamt Warnungen', value: `${warnCount}`, inline: true },
                    { name: '⏰ Ablauf', value: 'Nach 2 Wochen', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'HessenRP Fraktions-System' });

            await fraktionenChannel.send({ embeds: [warnEmbed] });

            const successEmbed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('⚠️ Warnung erstellt')
                .setDescription(
                    `**${name}** hat eine Warnung erhalten (ID: #${warn.id}).\n` +
                    `Gesamt Warnungen: **${warnCount}**`
                );

            await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });

        } else if (subcommand === 'warndelete') {
            const warnId = interaction.options.getInteger('warn_id');

            const warn = getFrakWarnById(warnId);

            if (!warn) {
                const embed = errorEmbed(
                    'Warnung nicht gefunden',
                    `Es gibt keine Warnung mit der ID #${warnId}`
                );
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            if (warn.guild_id !== interaction.guildId) {
                const embed = errorEmbed(
                    'Fehler',
                    'Diese Warnung gehört nicht zu diesem Server.'
                );
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            deleteFrakWarn(warnId);
            const remainingWarns = getFrakWarns(interaction.guildId, warn.fraktion_name).length;

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Warnung gelöscht')
                .setDescription(
                    `Warnung #${warnId} für **${warn.fraktion_name}** wurde gelöscht.\n` +
                    `Verbleibende Warnungen: **${remainingWarns}**`
                );

            await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });

        } else if (subcommand === 'aufgelöst') {
            const name = interaction.options.getString('name');
            const grund = interaction.options.getString('grund');

            // Rotes Embed für Auflösung
            const aufgelöstEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Fraktion aufgelöst')
                .setDescription(`Die Fraktion **${name}** wurde aufgelöst!`)
                .addFields(
                    { name: '📋 Fraktionsname', value: name, inline: true },
                    { name: '👤 Aufgelöst von', value: `${interaction.user}`, inline: true },
                    { name: '📝 Grund', value: grund, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'HessenRP Fraktions-System' });

            await fraktionenChannel.send({ embeds: [aufgelöstEmbed] });

            const successEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Fraktion aufgelöst')
                .setDescription(`**${name}** wurde aufgelöst und im Fraktionen-Channel gepostet.`);

            await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
        }
    }
};
