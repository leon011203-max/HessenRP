import { readJsonFile, writeJsonFile } from './init.js';
import { existsSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TICKETS_FILE = join(__dirname, '../../data/tickets.json');
const TICKET_CONFIG_FILE = join(__dirname, '../../data/ticket_config.json');

/**
 * Initialisiert Ticket-Dateien
 */
export function initTicketFiles() {
    if (!existsSync(TICKETS_FILE)) {
        writeFileSync(TICKETS_FILE, JSON.stringify([], null, 2));
        console.log('✅ tickets.json erstellt');
    }

    if (!existsSync(TICKET_CONFIG_FILE)) {
        writeFileSync(TICKET_CONFIG_FILE, JSON.stringify({}, null, 2));
        console.log('✅ ticket_config.json erstellt');
    }
}

/**
 * Speichert Ticket-Konfiguration
 */
export function setTicketConfig(guildId, config) {
    const allConfigs = readJsonFile(TICKET_CONFIG_FILE) || {};
    allConfigs[guildId] = config;
    writeJsonFile(TICKET_CONFIG_FILE, allConfigs);
}

/**
 * Holt Ticket-Konfiguration
 */
export function getTicketConfig(guildId) {
    const allConfigs = readJsonFile(TICKET_CONFIG_FILE) || {};
    return allConfigs[guildId] || {
        panelChannelId: null,
        categoryChannels: {},
        categoryPermissions: {}
    };
}

/**
 * Setzt Discord-Kategorie für eine Ticket-Kategorie
 */
export function setCategoryChannel(guildId, ticketCategory, channelId) {
    const config = getTicketConfig(guildId);
    if (!config.categoryChannels) config.categoryChannels = {};
    config.categoryChannels[ticketCategory] = channelId;
    setTicketConfig(guildId, config);
}

/**
 * Fügt eine Rolle zu den Berechtigungen einer Kategorie hinzu
 */
export function addCategoryPermission(guildId, ticketCategory, roleId) {
    const config = getTicketConfig(guildId);
    if (!config.categoryPermissions) config.categoryPermissions = {};
    if (!config.categoryPermissions[ticketCategory]) {
        config.categoryPermissions[ticketCategory] = [];
    }
    if (!config.categoryPermissions[ticketCategory].includes(roleId)) {
        config.categoryPermissions[ticketCategory].push(roleId);
    }
    setTicketConfig(guildId, config);
}

/**
 * Erstellt ein neues Ticket
 */
export function createTicket(guildId, channelId, userId, category) {
    const tickets = readJsonFile(TICKETS_FILE) || [];

    const ticket = {
        id: tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1,
        guild_id: guildId,
        channel_id: channelId,
        user_id: userId,
        category: category,
        status: 'open',
        claimed_by: null,
        created_at: Date.now()
    };

    tickets.push(ticket);
    writeJsonFile(TICKETS_FILE, tickets);

    return ticket;
}

/**
 * Holt ein Ticket anhand der Channel-ID
 */
export function getTicketByChannel(channelId) {
    const tickets = readJsonFile(TICKETS_FILE) || [];
    return tickets.find(t => t.channel_id === channelId);
}

/**
 * Aktualisiert Ticket-Status
 */
export function updateTicketStatus(channelId, status, claimedBy = null) {
    const tickets = readJsonFile(TICKETS_FILE) || [];
    const ticket = tickets.find(t => t.channel_id === channelId);

    if (ticket) {
        ticket.status = status;
        if (claimedBy) ticket.claimed_by = claimedBy;
        writeJsonFile(TICKETS_FILE, tickets);
        return ticket;
    }

    return null;
}

/**
 * Löscht ein Ticket
 */
export function deleteTicket(channelId) {
    const tickets = readJsonFile(TICKETS_FILE) || [];
    const filtered = tickets.filter(t => t.channel_id !== channelId);
    writeJsonFile(TICKETS_FILE, filtered);
}

/**
 * Holt alle offenen Tickets
 */
export function getOpenTickets(guildId) {
    const tickets = readJsonFile(TICKETS_FILE) || [];
    return tickets.filter(t => t.guild_id === guildId && t.status !== 'closed');
}
