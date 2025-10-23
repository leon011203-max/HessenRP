import { EmbedBuilder, MessageFlags } from 'discord.js';

export async function handleVerify(interaction) {
    // Prüfe ob Verify-Rolle konfiguriert ist
    if (!process.env.VERIFY_ROLE_ID) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Fehler')
            .setDescription('Verify-Rolle ist nicht konfiguriert. Bitte kontaktiere einen Admin.');

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    const verifyRoleId = process.env.VERIFY_ROLE_ID;
    const member = interaction.member;

    // Prüfe ob User bereits die Rolle hat
    if (member.roles.cache.has(verifyRoleId)) {
        const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle('⚠️ Bereits verifiziert')
            .setDescription('Du bist bereits verifiziert!');

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    try {
        // Füge die Verify-Rolle hinzu
        await member.roles.add(verifyRoleId);

        const role = interaction.guild.roles.cache.get(verifyRoleId);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Erfolgreich verifiziert')
            .setDescription(
                `Willkommen ${member}!\n\n` +
                `Du hast die Rolle ${role} erhalten und hast nun Zugriff auf alle Channels.`
            )
            .setTimestamp()
            .setFooter({ text: 'HessenRP Verify-System' });

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        console.log(`✅ ${member.user.tag} wurde verifiziert`);
    } catch (error) {
        console.error('Fehler beim Verifizieren:', error);

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Fehler')
            .setDescription('Es gab einen Fehler bei der Verifizierung. Bitte kontaktiere einen Admin.');

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
}
