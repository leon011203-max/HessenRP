import { SlashCommandBuilder } from 'discord.js';
import { setConfig } from '../../database/config.js';
import { hasPermission, noPermissionReply } from '../../utils/permissions.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setconfig')
        .setDescription('Setzt eine Bot-Konfiguration')
        .addStringOption(option =>
            option.setName('key')
                .setDescription('Konfigurationsschlüssel')
                .setRequired(true)
                .addChoices(
                    { name: 'TeamUpdates Channel', value: 'teamupdates_channel' },
                    { name: 'Welcome Channel', value: 'welcome_channel' }
                ))
        .addStringOption(option =>
            option.setName('value')
                .setDescription('Wert (Channel-ID)')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasPermission(interaction)) {
            return noPermissionReply(interaction);
        }

        const key = interaction.options.getString('key');
        const value = interaction.options.getString('value');

        setConfig(interaction.guildId, key, value);

        const embed = successEmbed(
            'Konfiguration gesetzt',
            `**${key}** wurde auf \`${value}\` gesetzt.`
        );

        await interaction.reply({ embeds: [embed] });
    }
};
