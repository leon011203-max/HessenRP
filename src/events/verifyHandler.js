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

    // Parse mehrere Rollen-IDs (kommagetrennt)
    const verifyRoleIds = process.env.VERIFY_ROLE_ID.split(',').map(id => id.trim());
    const member = interaction.member;

    // Prüfe ob User bereits eine der Verify-Rollen hat
    const hasVerifyRole = verifyRoleIds.some(roleId => member.roles.cache.has(roleId));

    if (hasVerifyRole) {
        const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle('⚠️ Bereits verifiziert')
            .setDescription('Du bist bereits verifiziert!');

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    try {
        // Füge alle Verify-Rollen hinzu
        const addedRoles = [];
        for (const roleId of verifyRoleIds) {
            const role = interaction.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(roleId);
                addedRoles.push(role);
            }
        }

        if (addedRoles.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Fehler')
                .setDescription('Keine gültigen Verify-Rollen gefunden. Bitte kontaktiere einen Admin.');

            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const roleNames = addedRoles.map(r => r.toString()).join(', ');

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Erfolgreich verifiziert')
            .setDescription(
                `Willkommen ${member}!\n\n` +
                `Du hast ${addedRoles.length > 1 ? 'die Rollen' : 'die Rolle'} ${roleNames} erhalten und hast nun Zugriff auf alle Channels.`
            )
            .setTimestamp()
            .setFooter({ text: 'HessenRP Verify-System' });

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        console.log(`✅ ${member.user.tag} wurde verifiziert (${addedRoles.length} Rolle(n))`);
    } catch (error) {
        console.error('Fehler beim Verifizieren:', error);

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Fehler')
            .setDescription('Es gab einen Fehler bei der Verifizierung. Bitte kontaktiere einen Admin.');

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
}
