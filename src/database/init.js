import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../../data');
const CONFIG_FILE = join(DATA_DIR, 'config.json');
const WARNINGS_FILE = join(DATA_DIR, 'warnings.json');
const TEAM_WARNINGS_FILE = join(DATA_DIR, 'team_warnings.json');

/**
 * Initialisiert das Datei-basierte Speichersystem
 */
export function initDatabase() {
    // Data Verzeichnis erstellen falls nicht vorhanden
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }

    // Config-Datei initialisieren
    if (!existsSync(CONFIG_FILE)) {
        writeFileSync(CONFIG_FILE, JSON.stringify({}, null, 2));
        console.log('✅ config.json erstellt');
    }

    // Warnings-Datei initialisieren
    if (!existsSync(WARNINGS_FILE)) {
        writeFileSync(WARNINGS_FILE, JSON.stringify([], null, 2));
        console.log('✅ warnings.json erstellt');
    }

    // Team Warnings-Datei initialisieren
    if (!existsSync(TEAM_WARNINGS_FILE)) {
        writeFileSync(TEAM_WARNINGS_FILE, JSON.stringify([], null, 2));
        console.log('✅ team_warnings.json erstellt');
    }

    console.log('✅ Datei-basiertes Speichersystem initialisiert');
}

/**
 * Liest Daten aus einer JSON-Datei
 */
export function readJsonFile(filePath) {
    try {
        const data = readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Fehler beim Lesen von ${filePath}:`, error);
        return null;
    }
}

/**
 * Schreibt Daten in eine JSON-Datei
 */
export function writeJsonFile(filePath, data) {
    try {
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`Fehler beim Schreiben von ${filePath}:`, error);
        return false;
    }
}

export { CONFIG_FILE, WARNINGS_FILE, TEAM_WARNINGS_FILE };
