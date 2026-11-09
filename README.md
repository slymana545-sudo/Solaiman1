# KOMET

Ein Arcade-Spiel für Browser und Handy: Du bist ein Komet, kreist um einen Planeten und tippst im richtigen Moment, um zum nächsten zu springen. Wer den Orbit-Ring des Zielplaneten nur streift, bekommt einen **PERFEKT**-Bonus mit Kombo. Gesammelte Sterne schalten neue Kometenschweife frei.

- Eine Taste / ein Tipp – sofort verständlich, läuft auf Handy, Tablet und PC
- Steigende Schwierigkeit: bewegliche Planeten (ab 6), instabile Planeten mit Countdown (ab 12), Asteroiden (ab 16)
- Alle 20 Planeten ein neuer Sektor mit eigener Farbwelt
- 8 freischaltbare Schweife, Rekord und Sterne werden gespeichert
- Deutsch und Englisch, Sound und Musik werden live erzeugt (keine Audiodateien)
- Werbung über CrazyGames oder Poki schon vorbereitet (Zwischenwerbung + „Weiterfliegen“ per Belohnungswerbung)
- Kein Framework und keine Installation nötig: reines HTML, CSS und JavaScript

**Wie du das Spiel veröffentlichst und damit Geld verdienst: [docs/VEROEFFENTLICHEN.md](docs/VEROEFFENTLICHEN.md)**

## Ausprobieren

**Einfachster Weg:** `index.html` doppelklicken. Das Spiel läuft direkt im Browser (nur die Schriftarten fallen dann evtl. auf Standardschriften zurück).

**Richtig testen (empfohlen):** einen kleinen lokalen Server starten, z. B.

```bash
python3 -m http.server 8000
# dann im Browser: http://localhost:8000
```

oder in VS Code die Erweiterung „Live Server“ nutzen.

**Auf dem Handy testen:** GitHub Pages einschalten (siehe Anleitung) und den Link auf dem Handy öffnen.

Nützliche Test-Parameter:

| URL | Wirkung |
| --- | --- |
| `index.html?autoplay=1` | Ein Bot spielt automatisch (gut für Screenshots/Videos) |
| `index.html?platform=crazygames` | Testet die CrazyGames-Anbindung |

## Steuerung

| Aktion | Handy | PC |
| --- | --- | --- |
| Aus dem Orbit starten | Tippen | Leertaste, Enter, ↑ oder Klick |
| Pause | Pause-Knopf | Esc oder P |

## Projektaufbau

```
index.html            Seite mit allen Menüs
css/style.css         Aussehen der Menüs
js/config.js          Plattform (web/crazygames/poki), Version, Preis fürs Weiterfliegen
js/game.js            Spiellogik und Grafik  ← hier steckt das Gameplay
js/main.js            Menüs, Eingabe, Speichern, Shop
js/skins.js           Kometenschweife und Preise
js/i18n.js            Alle Texte (Deutsch/Englisch)
js/audio.js           Soundeffekte und Musik
js/platform.js        Anbindung an Spieleportale und Werbung
assets/               Icons
fonts/                Schriftarten (Unbounded, Figtree – OFL-Lizenz, selbst gehostet)
marketing/            Coverbilder für itch.io / CrazyGames / Poki
tools/build.sh        Baut die Upload-ZIPs nach dist/
.github/workflows/    Automatischer Build und GitHub-Pages-Veröffentlichung
```

## Einfache Änderungen

- **Schwierigkeit:** in `js/game.js` die Werte in `makePlanet` (Abstände, Größen, Geschwindigkeit) und oben `CAPTURE_TOL` / `PERFECT_BAND`.
- **Neue Schweife:** eine Zeile in `js/skins.js` ergänzen.
- **Texte / neue Sprache:** `js/i18n.js`.
- **Farben der Sektoren:** `SECTORS` oben in `js/game.js`.

## Upload-Pakete bauen

```bash
bash tools/build.sh
```

Ergebnis in `dist/`: `komet-web.zip` (itch.io), `komet-crazygames.zip`, `komet-poki.zip`.
Ohne eigenes Terminal: Bei jedem Push baut GitHub die ZIPs automatisch (Reiter **Actions** → letzter Lauf → **Artifacts**).

## Rechtliches

Code und Grafik sind eigens für dieses Projekt entstanden. Die Schriftarten stehen unter der SIL Open Font License (siehe `fonts/`). Das Spiel setzt keine Cookies und sammelt keine Daten; Rekord, Sterne und Einstellungen liegen nur im Browser des Spielers (localStorage).
