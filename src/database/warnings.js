import { WARNINGS_FILE, TEAM_WARNINGS_FILE, readJsonFile, writeJsonFile } from './init.js';

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
 * Alle Warnungen eines Users abrufen
 */
export function getUserWarnings(guildId, userId) {
    const warnings = readJsonFile(WARNINGS_FILE) || [];
    return warnings
        .filter(w => w.guild_id === guildId && w.user_id === userId)
        .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Alle Warnungen eines Teams abrufen
 */
export function getTeamWarnings(guildId, teamRoleId) {
    const teamWarnings = readJsonFile(TEAM_WARNINGS_FILE) || [];
    return teamWarnings
        .filter(w => w.guild_id === guildId && w.team_role_id === teamRoleId)
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
