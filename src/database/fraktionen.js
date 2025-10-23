import { readJsonFile, writeJsonFile } from './init.js';
import { existsSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FRAK_WARNS_FILE = join(__dirname, '../../data/frak_warns.json');

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Initialisiert Fraktions-Warn Datei
 */
export function initFrakWarnsFile() {
    if (!existsSync(FRAK_WARNS_FILE)) {
        writeFileSync(FRAK_WARNS_FILE, JSON.stringify([], null, 2));
        console.log('✅ frak_warns.json erstellt');
    }
}

/**
 * Fügt eine Warnung zu einer Fraktion hinzu
 */
export function addFrakWarn(guildId, fraktionName, reason, warnedBy) {
    const warns = readJsonFile(FRAK_WARNS_FILE) || [];

    const warn = {
        id: warns.length > 0 ? Math.max(...warns.map(w => w.id)) + 1 : 1,
        guild_id: guildId,
        fraktion_name: fraktionName,
        reason: reason,
        warned_by: warnedBy,
        timestamp: Date.now()
    };

    warns.push(warn);
    writeJsonFile(FRAK_WARNS_FILE, warns);

    return warn;
}

/**
 * Holt alle Warnungen einer Fraktion
 */
export function getFrakWarns(guildId, fraktionName) {
    const warns = readJsonFile(FRAK_WARNS_FILE) || [];
    const now = Date.now();

    return warns.filter(w =>
        w.guild_id === guildId &&
        w.fraktion_name.toLowerCase() === fraktionName.toLowerCase() &&
        (now - w.timestamp) < TWO_WEEKS_MS
    );
}

/**
 * Löscht eine Warnung
 */
export function deleteFrakWarn(warnId) {
    const warns = readJsonFile(FRAK_WARNS_FILE) || [];
    const warn = warns.find(w => w.id === warnId);

    if (!warn) {
        return null;
    }

    const filtered = warns.filter(w => w.id !== warnId);
    writeJsonFile(FRAK_WARNS_FILE, filtered);

    return warn;
}

/**
 * Bereinigt alte Warnungen (älter als 2 Wochen)
 */
export function cleanupOldFrakWarns() {
    const warns = readJsonFile(FRAK_WARNS_FILE) || [];
    const now = Date.now();

    const validWarns = warns.filter(w => {
        const age = now - w.timestamp;
        return age < TWO_WEEKS_MS;
    });

    const removedCount = warns.length - validWarns.length;

    if (removedCount > 0) {
        writeJsonFile(FRAK_WARNS_FILE, validWarns);
        console.log(`🧹 ${removedCount} abgelaufene Fraktions-Warnungen gelöscht`);
    }

    return removedCount;
}

/**
 * Holt eine Warnung per ID
 */
export function getFrakWarnById(warnId) {
    const warns = readJsonFile(FRAK_WARNS_FILE) || [];
    return warns.find(w => w.id === warnId);
}
