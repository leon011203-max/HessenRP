import db from './init.js';

/**
 * Konfigurationswert setzen
 */
export function setConfig(guildId, key, value) {
    const stmt = db.prepare(`
        INSERT INTO config (guild_id, key, value)
        VALUES (?, ?, ?)
        ON CONFLICT(guild_id, key) DO UPDATE SET value = ?
    `);

    stmt.run(guildId, key, value, value);
}

/**
 * Konfigurationswert abrufen
 */
export function getConfig(guildId, key, defaultValue = null) {
    const stmt = db.prepare('SELECT value FROM config WHERE guild_id = ? AND key = ?');
    const result = stmt.get(guildId, key);

    return result ? result.value : defaultValue;
}

/**
 * Alle Konfigurationswerte eines Servers abrufen
 */
export function getAllConfig(guildId) {
    const stmt = db.prepare('SELECT key, value FROM config WHERE guild_id = ?');
    const results = stmt.all(guildId);

    const config = {};
    for (const row of results) {
        config[row.key] = row.value;
    }

    return config;
}

/**
 * Konfigurationswert löschen
 */
export function deleteConfig(guildId, key) {
    const stmt = db.prepare('DELETE FROM config WHERE guild_id = ? AND key = ?');
    stmt.run(guildId, key);
}
