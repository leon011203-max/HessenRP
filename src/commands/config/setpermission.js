import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { isAdmin } from '../../utils/permissions.js';
import { addCommandPermission, removeCommandPermission, getAllCommandPermissions } from '../../database/config.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setpermission')
        .setDescription('Verwaltet Command-Berechtigungen für Rollen (nur Admins)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Fügt einer Rolle Zugriff auf einen Command hinzu')
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription('Name des Commands')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('rolle')
                        .setDescription('Die Rolle die Zugriff erhalten soll')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Entfernt Zugriff einer Rolle auf einen Command')
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription('Name des Commands')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('rolle')
                        .setDescription('Die Rolle die entfernt werden soll')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Zeigt alle Command-Berechtigungen an')),

    async execute(interaction) {
        // Nur Admins dürfen Permissions verwalten
        if (!isAdmin(interaction.user.id)) {
            const embed = errorEmbed(
                'Keine Berechtigung',
                'Nur Admins können Command-Berechtigungen verwalten.'
            );
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const commandName = interaction.options.getString('command');
            const role = interaction.options.getRole('rolle');

            addCommandPermission(interaction.guildId, commandName, role.id);

            const embed = successEmbed(
                '✅ Berechtigung hinzugefügt',
                `Die Rolle ${role} kann nun den Command \`/${commandName}\` verwenden.\n\n` +
                `**Hinweis:** Admins haben immer Zugriff auf alle Commands.`
            );

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        } else if (subcommand === 'remove') {
            const commandName = interaction.options.getString('command');
            const role = interaction.options.getRole('rolle');

            const removed = removeCommandPermission(interaction.guildId, commandName, role.id);

            if (removed) {
                const embed = successEmbed(
                    '✅ Berechtigung entfernt',
                    `Die Rolle ${role} kann nun den Command \`/${commandName}\` nicht mehr verwenden.`
                );
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else {
                const embed = errorEmbed(
                    'Nicht gefunden',
                    `Die Rolle ${role} hatte keinen Zugriff auf \`/${commandName}\`.`
                );
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

        } else if (subcommand === 'list') {
            const permissions = getAllCommandPermissions(interaction.guildId);

            if (Object.keys(permissions).length === 0) {
                const embed = errorEmbed(
                    'Keine Berechtigungen',
                    'Es wurden noch keine Command-Berechtigungen konfiguriert.\n\n' +
                    'Verwende `/setpermission add` um Rollen Zugriff zu geben.'
                );
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            let description = '**Command-Berechtigungen:**\n\n';

            for (const [commandName, roleIds] of Object.entries(permissions)) {
                const roles = roleIds.map(id => `<@&${id}>`).join(', ');
                description += `\`/${commandName}\` → ${roles}\n`;
            }

            description += '\n**Hinweis:** Admins haben immer Zugriff auf alle Commands.';

            const embed = successEmbed('📋 Command-Berechtigungen', description);
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};
