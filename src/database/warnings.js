import { WARNINGS_FILE, TEAM_WARNINGS_FILE, readJsonFile, writeJsonFile } from './init.js';

// 2 Wochen in Millisekunden
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Löscht alle Warnungen, die älter als 2 Wochen sind
 */
export function cleanupOldWarnings() {
    const now = Date.now();
    let deletedCount = 0;

    // User Warnungen bereinigen
    const warnings = readJsonFile(WARNINGS_FILE) || [];
    const validWarnings = warnings.filter(w => {
        const age = now - w.timestamp;
        return age < TWO_WEEKS_MS;
    });

    if (validWarnings.length < warnings.length) {
        deletedCount += warnings.length - validWarnings.length;
        writeJsonFile(WARNINGS_FILE, validWarnings);
    }

    // Team Warnungen bereinigen
    const teamWarnings = readJsonFile(TEAM_WARNINGS_FILE) || [];
    const validTeamWarnings = teamWarnings.filter(w => {
        const age = now - w.timestamp;
        return age < TWO_WEEKS_MS;
    });

    if (validTeamWarnings.length < teamWarnings.length) {
        deletedCount += teamWarnings.length - validTeamWarnings.length;
        writeJsonFile(TEAM_WARNINGS_FILE, validTeamWarnings);
    }

    if (deletedCount > 0) {
        console.log(`🧹 ${deletedCount} alte Warnungen (älter als 2 Wochen) gelöscht`);
    }

    return deletedCount;
}

/**
 * Warnung für einen User hinzufügen
 */
export function addWarning(guildId, userId, warnedBy, reason) {
    const warnings = readJsonFile(WARNINGS_FILE) || [];

    const newWarning = {
        id: warnings.length > 0 ? Math.max(...warnings.map(w => w.id)) + 1 : 1,
        guild_id: guildId,
        user_id: userId,
        warned_by: warnedBy,
        reason: reason,
        timestamp: Date.now()
    };

    warnings.push(newWarning);
    writeJsonFile(WARNINGS_FILE, warnings);

    return newWarning.id;
}

/**
 * Team-Warnung hinzufügen
 */
export function addTeamWarning(guildId, teamRoleId, warnedBy, reason) {
    const teamWarnings = readJsonFile(TEAM_WARNINGS_FILE) || [];

    const newWarning = {
        id: teamWarnings.length > 0 ? Math.max(...teamWarnings.map(w => w.id)) + 1 : 1,
        guild_id: guildId,
        team_role_id: teamRoleId,
        warned_by: warnedBy,
        reason: reason,
        timestamp: Date.now()
    };

    teamWarnings.push(newWarning);
    writeJsonFile(TEAM_WARNINGS_FILE, teamWarnings);

    return newWarning.id;
}

/**
 * Warnung löschen
 */
export function deleteWarning(warnId) {
    const warnings = readJsonFile(WARNINGS_FILE) || [];
    const filteredWarnings = warnings.filter(w => w.id !== warnId);

    if (filteredWarnings.length < warnings.length) {
        writeJsonFile(WARNINGS_FILE, filteredWarnings);
        return true;
    }

    return false;
}

/**
 * Team-Warnung löschen
 */
export function deleteTeamWarning(warnId) {
    const teamWarnings = readJsonFile(TEAM_WARNINGS_FILE) || [];
    const filteredWarnings = teamWarnings.filter(w => w.id !== warnId);

    if (filteredWarnings.length < teamWarnings.length) {
        writeJsonFile(TEAM_WARNINGS_FILE, filteredWarnings);
        return true;
    }

    return false;
}

/**
 * Alle Warnungen eines Users abrufen (nur aktive, nicht älter als 2 Wochen)
 */
export function getUserWarnings(guildId, userId) {
    cleanupOldWarnings(); // Automatisch alte Warnungen bereinigen

    const warnings = readJsonFile(WARNINGS_FILE) || [];
    const now = Date.now();

    return warnings
        .filter(w => {
            const age = now - w.timestamp;
            return w.guild_id === guildId && w.user_id === userId && age < TWO_WEEKS_MS;
        })
        .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Alle Warnungen eines Teams abrufen (nur aktive, nicht älter als 2 Wochen)
 */
export function getTeamWarnings(guildId, teamRoleId) {
    cleanupOldWarnings(); // Automatisch alte Warnungen bereinigen

    const teamWarnings = readJsonFile(TEAM_WARNINGS_FILE) || [];
    const now = Date.now();

    return teamWarnings
        .filter(w => {
            const age = now - w.timestamp;
            return w.guild_id === guildId && w.team_role_id === teamRoleId && age < TWO_WEEKS_MS;
        })
        .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Warnung nach ID abrufen
 */
export function getWarning(warnId) {
    const warnings = readJsonFile(WARNINGS_FILE) || [];
    return warnings.find(w => w.id === warnId) || null;
}

/**
 * Team-Warnung nach ID abrufen
 */
export function getTeamWarning(warnId) {
    const teamWarnings = readJsonFile(TEAM_WARNINGS_FILE) || [];
    return teamWarnings.find(w => w.id === warnId) || null;
}
