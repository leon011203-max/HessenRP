import { config } from 'dotenv';
import { getCommandPermissions } from '../database/config.js';
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
 * Admins haben immer Zugriff
 * Andere User benötigen eine zugewiesene Rolle
 */
export function hasPermission(interaction, commandName = null) {
    // Admins haben immer Zugriff
    if (isAdmin(interaction.user.id)) {
        return true;
    }

    // Wenn kein Command-Name angegeben wurde, nur Admin-Check
    if (!commandName) {
        return false;
    }

    // Prüfe ob der User eine Rolle hat die für diesen Command freigegeben ist
    const allowedRoles = getCommandPermissions(interaction.guildId, commandName);

    if (allowedRoles.length === 0) {
        // Kein Role-Zugriff konfiguriert, nur Admins
        return false;
    }

    // Prüfe ob User eine der erlaubten Rollen hat
    return allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId));
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
