# HessenRP Team Management Bot

Ein modularer Discord Bot für Team-Management mit Slash Commands (Discord Components v2).

**Datenspeicherung:** Alle Daten werden in JSON-Dateien gespeichert (keine Datenbank erforderlich).

## Features

### Team Management
- `/teamnew` - Fügt ein neues Team-Mitglied hinzu (User + Rolle wählen, sendet Willkommensnachricht)
- `/teamuprank` - Stuft ein Team-Mitglied hoch (User + neue Rolle wählen)
- `/teamkick` - Kickt ein Team-Mitglied vom Server
- `/teamwarn` - Warnt einen Team-Member

### Warn Management
- `/deletewarn` - Löscht eine Warnung
- `/showwarns` - Zeigt alle Warnungen eines Users oder Teams an

### Welcome System
- Automatische Willkommensnachricht wenn ein User dem Server beitritt
- Konfigurierbar über Welcome Channel

### Configuration
- `/setconfig` - Setzt Bot-Konfigurationen (nur für Admins)
- `/showconfig` - Zeigt alle Bot-Konfigurationen an

## Installation

### 1. Dependencies installieren
```bash
npm install
```

### 2. Umgebungsvariablen einrichten
Kopiere `.env.example` zu `.env` und fülle die Werte aus:

```bash
cp .env.example .env
```

Erforderliche Werte:
- `DISCORD_TOKEN` - Dein Bot Token von der Discord Developer Portal
- `CLIENT_ID` - Die Client ID deines Bots
- `GUILD_ID` - Die ID deines Discord Servers
- `ADMIN_IDS` - Kommagetrennte Liste von User IDs, die Admin-Rechte haben

### 3. Bot Token erstellen
1. Gehe zu https://discord.com/developers/applications
2. Erstelle eine neue Application
3. Gehe zu "Bot" und erstelle einen Bot
4. Kopiere den Token in deine `.env` Datei
5. Aktiviere "MESSAGE CONTENT INTENT" und "SERVER MEMBERS INTENT"

### 4. Bot zum Server einladen
Verwende diese URL (ersetze CLIENT_ID mit deiner Client ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### 5. Bot starten
```bash
npm start
```

**Hinweis:** Die Commands werden automatisch beim Start deployed!

Für Entwicklung mit Auto-Reload:
```bash
npm run dev
```

## Konfiguration

### Admin-Rechte
Admins werden in der `.env` Datei definiert:
```env
ADMIN_IDS=123456789012345678,987654321098765432
```

### Bot-Einstellungen
Channels werden im Discord per Command konfiguriert:

#### TeamUpdates Channel konfigurieren
Hier werden alle Team-Events gepostet (neue Mitglieder, Upranks, Kicks, Warnungen):
```
/setconfig key:teamupdates_channel value:<ChannelID>
```

#### Welcome Channel konfigurieren
Hier werden Willkommensnachrichten für neue Server-Mitglieder gepostet:
```
/setconfig key:welcome_channel value:<ChannelID>
```

#### Konfiguration anzeigen
```
/showconfig
```

## Verwendung

### Team-Mitglied hinzufügen
```
/teamnew user:@Username rolle:@Rolle
```
Fügt ein neues Mitglied zum Team hinzu. Der User erhält die ausgewählte Rolle und bekommt eine Willkommensnachricht per DM.

### Team-Mitglied hochstufen
```
/teamuprank user:@Username rolle:@NeueRolle
```
Stuft ein Team-Mitglied hoch und gibt ihm eine neue Rolle.

### Team-Mitglied kicken
```
/teamkick user:@Username reason:"Grund"
```
Kickt den User vom Server.

### Team-Member warnen
```
/teamwarn user:@Username reason:"Grund"
```
Warnt einen Team-Member. Die Warnung wird gespeichert und im TeamUpdates Channel gepostet.

### Warnungen verwalten
```
/showwarns type:user target:<UserID>
/showwarns type:team target:<RollenID>
/deletewarn type:user warn_id:1
```

## Projektstruktur

```
HessenRP/
├── src/
│   ├── commands/
│   │   ├── config/          # Konfigurationsbefehle
│   │   ├── team/            # Team-Management Befehle
│   │   └── warnings/        # Warn-Management Befehle
│   ├── database/
│   │   ├── init.js          # JSON-Dateien Initialisierung
│   │   ├── config.js        # Config Management (JSON)
│   │   └── warnings.js      # Warn Management (JSON)
│   ├── utils/
│   │   ├── permissions.js   # Berechtigungsprüfungen
│   │   └── embeds.js        # Embed-Helpers
│   ├── index.js             # Hauptdatei
│   └── deploy-commands.js   # Command Deployment
├── data/                    # JSON-Dateien für Daten (config.json, warnings.json, team_warnings.json)
├── .env                     # Umgebungsvariablen
└── package.json
```

## Berechtigungen

Der Bot benötigt folgende Discord-Berechtigungen:
- Manage Roles
- Kick Members
- Send Messages
- Use Slash Commands
- Read Message History
- View Channels

## Zukünftige Features

- Ticket System (geplant)
- Weitere modulare Erweiterungen

## Lizenz

ISC
