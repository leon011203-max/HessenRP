import { EmbedBuilder } from 'discord.js';

/**
 * Erstellt ein Erfolgs-Embed
 */
export function successEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Erstellt ein Fehler-Embed
 */
export function errorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Erstellt ein Info-Embed
 */
export function infoEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`ℹ️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Erstellt ein Warnungs-Embed
 */
export function warningEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0xffaa00)
        .setTitle(`⚠️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}
