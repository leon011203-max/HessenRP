import { CONFIG_FILE, readJsonFile, writeJsonFile } from './init.js';

/**
 * Konfigurationswert setzen
 */
export function setConfig(guildId, key, value) {
    const config = readJsonFile(CONFIG_FILE) || {};

    if (!config[guildId]) {
        config[guildId] = {};
    }

    config[guildId][key] = value;
    writeJsonFile(CONFIG_FILE, config);
}

/**
 * Konfigurationswert abrufen
 */
export function getConfig(guildId, key, defaultValue = null) {
    const config = readJsonFile(CONFIG_FILE) || {};

    if (config[guildId] && config[guildId][key]) {
        return config[guildId][key];
    }

    return defaultValue;
}

/**
 * Alle Konfigurationswerte eines Servers abrufen
 */
export function getAllConfig(guildId) {
    const config = readJsonFile(CONFIG_FILE) || {};
    return config[guildId] || {};
}

/**
 * Konfigurationswert löschen
 */
export function deleteConfig(guildId, key) {
    const config = readJsonFile(CONFIG_FILE) || {};

    if (config[guildId] && config[guildId][key]) {
        delete config[guildId][key];
        writeJsonFile(CONFIG_FILE, config);
        return true;
    }

    return false;
}

/**
 * Fügt eine Rolle zu einem Command hinzu
 */
export function addCommandPermission(guildId, commandName, roleId) {
    const config = readJsonFile(CONFIG_FILE) || {};

    if (!config[guildId]) {
        config[guildId] = {};
    }

    if (!config[guildId].command_permissions) {
        config[guildId].command_permissions = {};
    }

    if (!config[guildId].command_permissions[commandName]) {
        config[guildId].command_permissions[commandName] = [];
    }

    if (!config[guildId].command_permissions[commandName].includes(roleId)) {
        config[guildId].command_permissions[commandName].push(roleId);
    }

    writeJsonFile(CONFIG_FILE, config);
}

/**
 * Entfernt eine Rolle von einem Command
 */
export function removeCommandPermission(guildId, commandName, roleId) {
    const config = readJsonFile(CONFIG_FILE) || {};

    if (config[guildId]?.command_permissions?.[commandName]) {
        config[guildId].command_permissions[commandName] =
            config[guildId].command_permissions[commandName].filter(id => id !== roleId);

        // Lösche leere Arrays
        if (config[guildId].command_permissions[commandName].length === 0) {
            delete config[guildId].command_permissions[commandName];
        }

        writeJsonFile(CONFIG_FILE, config);
        return true;
    }

    return false;
}

/**
 * Holt alle Rollen die einen Command nutzen dürfen
 */
export function getCommandPermissions(guildId, commandName) {
    const config = readJsonFile(CONFIG_FILE) || {};
    return config[guildId]?.command_permissions?.[commandName] || [];
}

/**
 * Holt alle Command-Permissions
 */
export function getAllCommandPermissions(guildId) {
    const config = readJsonFile(CONFIG_FILE) || {};
    return config[guildId]?.command_permissions || {};
}
