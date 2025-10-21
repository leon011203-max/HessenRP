import { config } from 'dotenv';
config();

/**
 * Prüft ob ein User Admin ist
 */
export function isAdmin(userId) {
    const adminIds = process.env.ADMIN_IDS?.split(',').map(id => id.trim()) || [];
    return adminIds.includes(userId);
}

/**
 * Prüft ob der User die Berechtigung hat, den Command auszuführen
 */
export function hasPermission(interaction) {
    return isAdmin(interaction.user.id);
}

/**
 * Sendet eine Fehlermeldung wenn keine Berechtigung vorliegt
 */
export async function noPermissionReply(interaction) {
    return interaction.reply({
        content: '❌ Du hast keine Berechtigung, diesen Command zu verwenden!',
        ephemeral: true
    });
}
