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
