import db from './init.js';

/**
 * Warnung für einen User hinzufügen
 */
export function addWarning(guildId, userId, warnedBy, reason) {
    const stmt = db.prepare(`
        INSERT INTO warnings (guild_id, user_id, warned_by, reason, timestamp)
        VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(guildId, userId, warnedBy, reason, Date.now());
    return result.lastInsertRowid;
}

/**
 * Team-Warnung hinzufügen
 */
export function addTeamWarning(guildId, teamRoleId, warnedBy, reason) {
    const stmt = db.prepare(`
        INSERT INTO team_warnings (guild_id, team_role_id, warned_by, reason, timestamp)
        VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(guildId, teamRoleId, warnedBy, reason, Date.now());
    return result.lastInsertRowid;
}

/**
 * Warnung löschen
 */
export function deleteWarning(warnId) {
    const stmt = db.prepare('DELETE FROM warnings WHERE id = ?');
    const result = stmt.run(warnId);
    return result.changes > 0;
}

/**
 * Team-Warnung löschen
 */
export function deleteTeamWarning(warnId) {
    const stmt = db.prepare('DELETE FROM team_warnings WHERE id = ?');
    const result = stmt.run(warnId);
    return result.changes > 0;
}

/**
 * Alle Warnungen eines Users abrufen
 */
export function getUserWarnings(guildId, userId) {
    const stmt = db.prepare(`
        SELECT * FROM warnings
        WHERE guild_id = ? AND user_id = ?
        ORDER BY timestamp DESC
    `);

    return stmt.all(guildId, userId);
}

/**
 * Alle Warnungen eines Teams abrufen
 */
export function getTeamWarnings(guildId, teamRoleId) {
    const stmt = db.prepare(`
        SELECT * FROM team_warnings
        WHERE guild_id = ? AND team_role_id = ?
        ORDER BY timestamp DESC
    `);

    return stmt.all(guildId, teamRoleId);
}

/**
 * Warnung nach ID abrufen
 */
export function getWarning(warnId) {
    const stmt = db.prepare('SELECT * FROM warnings WHERE id = ?');
    return stmt.get(warnId);
}

/**
 * Team-Warnung nach ID abrufen
 */
export function getTeamWarning(warnId) {
    const stmt = db.prepare('SELECT * FROM team_warnings WHERE id = ?');
    return stmt.get(warnId);
}
