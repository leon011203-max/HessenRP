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

### Fraktions-Management
- `/frak offiziell` - Macht eine Fraktion offiziell (Grünes Embed)
- `/frak warn` - Warnt eine Fraktion (Gelbes Embed)
- `/frak warndelete` - Löscht eine Fraktions-Warnung
- `/frak aufgelöst` - Löst eine Fraktion auf (Rotes Embed)
- **Automatisches Ablaufen:** Fraktions-Warnungen werden nach 2 Wochen automatisch gelöscht
- Alle Events werden in einem konfigurierbaren Fraktionen-Channel gepostet

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
- `/setpermission` - Verwaltet Command-Berechtigungen für Discord-Rollen (nur Admins)

### Permission-System
- **Flexibles Rollen-System:** Weise Discord-Rollen Zugriff auf einzelne Commands zu
- **Admin-Rechte:** Admins (in `.env` definiert) haben immer Zugriff auf alle Commands
- **Per Command konfigurierbar:** Jeder Command kann individuell für verschiedene Rollen freigegeben werden
- **Mehrere Rollen pro Command:** Unbegrenzt viele Rollen können Zugriff auf denselben Command haben

### Utility
- `/embed` - Erstellt ein benutzerdefiniertes Embed mit Titel, Nachricht, Farbe und optionalen Bildern
- **Berechtigung:** Nur für User mit der spezifischen Embed-Rolle
- `/verifypanel` - Erstellt ein Verify-Panel mit Button zur Verifizierung
- `/clear` - Löscht eine bestimmte Anzahl von Nachrichten (1-100) im aktuellen Channel (nur Admins)

### Verify-System
- **Automatische Rollen-Vergabe:** User klicken auf den Verify-Button und erhalten automatisch die konfigurierte Rolle
- **Konfigurierbar:** Verify-Rolle wird in der `.env` Datei eingestellt (`VERIFY_ROLE_ID`)
- **Schutz:** User können sich nur einmal verifizieren

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
- `VERIFY_ROLE_ID` - Die Rollen-ID die User nach der Verifizierung erhalten (optional, nur für Verify-System)

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
**Admins haben automatisch Zugriff auf ALLE Commands.**

### Command-Berechtigungen verwalten

Mit `/setpermission` kannst du Discord-Rollen Zugriff auf einzelne Commands geben:

#### Rolle Zugriff geben
```
/setpermission add command:clear rolle:@Moderator
```
Die Rolle `@Moderator` kann nun `/clear` nutzen.

#### Mehrere Rollen für einen Command
```
/setpermission add command:teamwarn rolle:@Team-Leitung
/setpermission add command:teamwarn rolle:@High-Team
```
Beide Rollen können nun `/teamwarn` nutzen.

#### Rolle entfernen
```
/setpermission remove command:clear rolle:@Moderator
```

#### Alle Berechtigungen anzeigen
```
/setpermission list
```
Zeigt alle konfigurierten Command-Berechtigungen an.

**Wichtig:**
- Nur Admins können Berechtigungen verwalten
- Admins haben immer Zugriff, auch ohne explizite Berechtigung
- Commands ohne konfigurierte Rollen sind nur für Admins verfügbar

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

#### Fraktionen Channel konfigurieren
Hier werden alle Fraktions-Events gepostet (offiziell, warnungen, auflösungen):
```
/setconfig key:fraktionen_channel value:<ChannelID>
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

### Fraktions-System nutzen

#### Fraktion offiziell machen
```
/frak offiziell name:"Los Santos Police Department" beschreibung:"Offizielle Polizei-Fraktion"
```
Macht eine Fraktion offiziell. Ein grünes Embed wird im Fraktionen-Channel gepostet.

#### Fraktion warnen
```
/frak warn name:"Grove Street" grund:"Regelverstoß bei RP-Situation"
```
Warnt eine Fraktion. Ein gelbes Embed wird gepostet und die Warnung läuft nach 2 Wochen automatisch ab.

#### Fraktions-Warnung löschen
```
/frak warndelete warn_id:1
```
Löscht eine spezifische Warnung anhand ihrer ID.

#### Fraktion auflösen
```
/frak aufgelöst name:"Ballas Gang" grund:"Inaktivität"
```
Löst eine Fraktion auf. Ein rotes Embed wird im Fraktionen-Channel gepostet.

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

### Benutzerdefinierte Embeds erstellen

Mit dem `/embed` Command kannst du schöne Embeds erstellen:

**Einfaches Embed:**
```
/embed titel:"Serverankündigung" nachricht:"Wichtige Information für alle Spieler!"
```

**Embed mit Farbe und Channel:**
```
/embed titel:"Event Ankündigung" nachricht:"Heute um 20 Uhr findet ein großes Event statt!" farbe:Grün channel:#ankündigungen
```

**Embed mit Bildern:**
```
/embed titel:"News" nachricht:"Neue Features wurden hinzugefügt" farbe:Blau bild_url:https://example.com/image.png thumbnail_url:https://example.com/thumb.png
```

**Optionen:**
- `titel` - Titel des Embeds (erforderlich)
- `nachricht` - Beschreibung/Text des Embeds (erforderlich)
- `channel` - Wo das Embed gepostet werden soll (optional, Standard: aktueller Channel)
- `farbe` - Farbe des Embeds: Rot, Grün, Blau, Gelb, Orange, Lila, Rosa, Schwarz (optional, Standard: Blau)
- `bild_url` - URL für ein großes Bild im Embed (optional)
- `thumbnail_url` - URL für ein kleines Thumbnail (optional)

**Hinweis:** Nur User mit der Embed-Rolle (ID: `1430289484993269770`) können diesen Command nutzen.

### Verify-System nutzen

**Setup:**
1. Setze die `VERIFY_ROLE_ID` in deiner `.env` Datei:
```env
VERIFY_ROLE_ID=1234567890123456789
```

2. Erstelle das Verify-Panel:
```
/verifypanel channel:#verify
```
Oder ohne Channel-Angabe im aktuellen Channel:
```
/verifypanel
```

**Für User:**
1. Gehe zum Verify-Channel
2. Klicke auf den grünen "✅ Verifizieren" Button
3. Du erhältst automatisch die konfigurierte Rolle
4. Du hast nun Zugriff auf alle Channels

**Features:**
- User können sich nur einmal verifizieren (Doppel-Verifizierung wird verhindert)
- Schönes grünes Embed mit Bestätigung
- Zeigt welche Rolle vergeben wird

### Nachrichten löschen

**Verwendung:**
```
/clear anzahl:50
```
Löscht die letzten 50 Nachrichten im aktuellen Channel.

**Hinweise:**
- Nur Admins können diesen Command nutzen
- Maximum: 100 Nachrichten auf einmal
- Nur Nachrichten die jünger als 14 Tage sind können gelöscht werden (Discord Limitierung)
- Der Bot benötigt die "Nachrichten verwalten" Berechtigung

## Projektstruktur

```
HessenRP/
├── src/
│   ├── commands/
│   │   ├── config/          # Konfigurationsbefehle
│   │   ├── team/            # Team-Management Befehle
│   │   ├── warnings/        # Warn-Management Befehle
│   │   ├── tickets/         # Ticket-System Befehle
│   │   ├── fraktionen/      # Fraktions-Management Befehle
│   │   └── utility/         # Utility Befehle (Embed, etc.)
│   ├── database/
│   │   ├── init.js          # JSON-Dateien Initialisierung
│   │   ├── config.js        # Config Management (JSON)
│   │   ├── warnings.js      # Warn Management (JSON)
│   │   ├── tickets.js       # Ticket Management (JSON)
│   │   └── fraktionen.js    # Fraktions-Warn Management (JSON)
│   ├── events/
│   │   ├── ticketHandler.js # Ticket Interaction Handler
│   │   └── verifyHandler.js # Verify Button Handler
│   ├── utils/
│   │   ├── permissions.js   # Berechtigungsprüfungen
│   │   └── embeds.js        # Embed-Helpers
│   ├── index.js             # Hauptdatei
│   └── deploy-commands.js   # Command Deployment
├── data/                    # JSON-Dateien für Daten (config, warnings, tickets, frak_warns)
├── .env                     # Umgebungsvariablen
└── package.json
```

## Berechtigungen

Der Bot benötigt folgende Discord-Berechtigungen:
- Manage Roles
- Kick Members
- Manage Channels (für Ticket-System)
- Manage Messages (für /clear Command)
- Send Messages
- Use Slash Commands
- Read Message History
- View Channels

## Lizenz

ISC
