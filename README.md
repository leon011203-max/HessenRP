# HessenRP Team Management Bot

Ein modularer Discord Bot für Team-Management mit Slash Commands (Discord Components v2).

**Datenspeicherung:** Alle Daten werden in JSON-Dateien gespeichert (keine Datenbank erforderlich).

## Features

### Team Management
- `/teamnew` - Fügt ein neues Team-Mitglied hinzu (User + Rolle wählen, sendet Willkommensnachricht)
- `/teamuprank` - Stuft ein Team-Mitglied hoch (User + neue Rolle wählen)
- `/teamdownrank` - Entfernt eine Rolle von einem Team-Mitglied
- `/teamkick` - Kickt ein Team-Mitglied vom Server
- `/teamwarn` - Warnt einen Team-Member

### Warn Management
- `/deletewarn` - Löscht eine Warnung
- `/showwarns` - Zeigt alle Warnungen eines Users oder Teams an
- **Automatisches Ablaufen:** Warnungen werden nach 2 Wochen automatisch gelöscht

### Welcome & Leave System
- **Welcome:** Automatische Willkommensnachricht wenn ein User dem Server beitritt
- **Leave:** Automatische Verabschiedungs-Nachricht wenn ein User den Server verlässt
- Beide Systeme sind über separate Channels konfigurierbar

### Ticket-System (RP-optimiert)
- **Dropdown-Menu** mit 6 Kategorien: Support, Analyse, Donator, Fraktions-Antrag, High Team, Sonstiges
- **Schöne Embeds:** Alle Ticket-Nachrichten sind farbcodierte Embeds
- **Individuelle Kategorien:** Jede Ticket-Kategorie kann eine eigene Discord-Kategorie haben
- **Berechtigungssystem:** Unbegrenzt viele Rollen pro Kategorie konfigurierbar
- **Claim-System:** Teamler können Tickets claimen
- **Status-Anzeige:** Automatische Umbenennung mit Emojis:
  - 🟠 Bei Bearbeitung (geclaimed)
  - ✅ Bei Annahme
  - ❌ Bei Ablehnung
- **Buttons:** Claim, Annehmen, Ablehnen, Schließen

### Configuration
- `/setconfig` - Setzt Bot-Konfigurationen (nur für Admins)
- `/showconfig` - Zeigt alle Bot-Konfigurationen an

### Besonderheiten
- **Ephemeral Commands:** Alle Command-Antworten sind nur für dich sichtbar (temporäre Nachrichten)
- **Öffentliche Logs:** Team-Events werden im TeamUpdates Channel für alle sichtbar gepostet

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

#### Leave Channel konfigurieren
Hier werden Verabschiedungs-Nachrichten gepostet wenn Mitglieder den Server verlassen:
```
/setconfig key:leave_channel value:<ChannelID>
```

#### Konfiguration anzeigen
```
/showconfig
```

#### Ticket-System einrichten
```
# 1. Panel-Channel setzen (wo das Ticket-Dropdown angezeigt wird)
/ticketsetup panel channel:#tickets

# 2. Discord-Kategorie für jede Ticket-Kategorie setzen
#    (Jede Ticket-Kategorie kann eine eigene Discord-Kategorie haben)
/ticketsetup category ticketcategory:support discordcategory:Support-Tickets
/ticketsetup category ticketcategory:analyse discordcategory:Analyse-Tickets
/ticketsetup category ticketcategory:donator discordcategory:Donator-Tickets
/ticketsetup category ticketcategory:fraktion discordcategory:Fraktions-Anträge
/ticketsetup category ticketcategory:highteam discordcategory:High-Team-Tickets
/ticketsetup category ticketcategory:sonstiges discordcategory:Sonstige-Tickets

# 3. Berechtigungen pro Kategorie setzen (unbegrenzt viele Rollen möglich)
#    Führe den Befehl mehrfach aus, um mehrere Rollen hinzuzufügen:
/ticketsetup permissions ticketcategory:support rolle:@Support
/ticketsetup permissions ticketcategory:support rolle:@Team-Leitung
/ticketsetup permissions ticketcategory:analyse rolle:@Analyse-Team
/ticketsetup permissions ticketcategory:donator rolle:@Donator-Support
/ticketsetup permissions ticketcategory:fraktion rolle:@Fraktions-Leitung
/ticketsetup permissions ticketcategory:highteam rolle:@High-Team
/ticketsetup permissions ticketcategory:sonstiges rolle:@Team

# 4. Ticket-Panel erstellen
/ticketpanel
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

### Team-Mitglied downranken
```
/teamdownrank user:@Username rolle:@Rolle
```
Entfernt eine Rolle von einem Team-Mitglied.

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

### Ticket-System nutzen

**Als User:**
1. Gehe zum Ticket-Channel mit dem Panel
2. Wähle eine Kategorie aus dem Dropdown-Menu
3. Ein privater Ticket-Channel wird erstellt
4. Beschreibe dein Anliegen

**Als Teamler:**
1. **Claimen:** Klicke auf "Claim" um das Ticket zu übernehmen
   - Channel wird umbenannt: `🟠-ticket-kategorie-username`
2. **Annehmen:** Klicke auf "Annehmen" wenn das Anliegen bearbeitet wird
   - Channel wird umbenannt: `✅-ticket-kategorie-username`
3. **Ablehnen:** Klicke auf "Ablehnen" wenn das Anliegen abgelehnt wird
   - Channel wird umbenannt: `❌-ticket-kategorie-username`
4. **Schließen:** Klicke auf "Schließen" um das Ticket zu schließen
   - Channel wird nach 5 Sekunden gelöscht

## Projektstruktur

```
HessenRP/
├── src/
│   ├── commands/
│   │   ├── config/          # Konfigurationsbefehle
│   │   ├── team/            # Team-Management Befehle
│   │   ├── warnings/        # Warn-Management Befehle
│   │   └── tickets/         # Ticket-System Befehle
│   ├── database/
│   │   ├── init.js          # JSON-Dateien Initialisierung
│   │   ├── config.js        # Config Management (JSON)
│   │   ├── warnings.js      # Warn Management (JSON)
│   │   └── tickets.js       # Ticket Management (JSON)
│   ├── events/
│   │   ├── welcome.js       # Welcome System Event Handler
│   │   └── ticketHandler.js # Ticket Interaction Handler
│   ├── utils/
│   │   ├── permissions.js   # Berechtigungsprüfungen
│   │   └── embeds.js        # Embed-Helpers
│   ├── index.js             # Hauptdatei
│   └── deploy-commands.js   # Command Deployment
├── data/                    # JSON-Dateien für Daten (config, warnings, tickets)
├── .env                     # Umgebungsvariablen
└── package.json
```

## Berechtigungen

Der Bot benötigt folgende Discord-Berechtigungen:
- Manage Roles
- Kick Members
- Manage Channels (für Ticket-System)
- Send Messages
- Use Slash Commands
- Read Message History
- View Channels

## Lizenz

ISC
