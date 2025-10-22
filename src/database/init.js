import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../../data/bot.db'));

export function initDatabase() {
    // Config Tabelle
    db.exec(`
        CREATE TABLE IF NOT EXISTS config (
            guild_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            PRIMARY KEY (guild_id, key)
        )
    `);

    // Warnungen Tabelle
    db.exec(`
        CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            warned_by TEXT NOT NULL,
            reason TEXT,
            timestamp INTEGER NOT NULL
        )
    `);

    // Team Warnungen Tabelle
    db.exec(`
        CREATE TABLE IF NOT EXISTS team_warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            team_role_id TEXT NOT NULL,
            warned_by TEXT NOT NULL,
            reason TEXT,
            timestamp INTEGER NOT NULL
        )
    `);

    console.log('✅ Datenbanktabellen erstellt/überprüft');
}

export function getDatabase() {
    return db;
}

export default db;
