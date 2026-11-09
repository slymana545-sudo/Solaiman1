# KOMET veröffentlichen und damit Geld verdienen

Ein Leitfaden für Studierende in Deutschland. Stand: November 2026. Zahlen und Regeln ändern sich – prüfe die Links vor wichtigen Entscheidungen.

## Ehrliche Erwartung zuerst

Die meisten ersten Spiele verdienen wenig – oft ein paar Euro bis einige hundert Euro insgesamt. Geld kommt bei Browser-Spielen fast immer aus **Werbeeinnahmen auf großen Spieleportalen**, weil dort schon Millionen Spieler sind. Eine eigene Website ohne Besucher bringt nichts.

Was realistisch funktioniert:

1. **Mehrere kleine Spiele** veröffentlichen statt eines großen. Jedes Spiel ist ein neues Los.
2. **Messen und verbessern:** Portale zeigen dir, wie lange Leute spielen. Ein Spiel, das Leute 10+ Minuten hält, wird vom Portal stärker beworben.
3. KOMET ist dein erstes Los und gleichzeitig Portfolio (praktisch für Werkstudentenjobs, besonders in Informatik/Medien).

Plane grob 2–5 Stunden pro Woche neben dem Studium ein.

## Der Fahrplan

| Woche | Schritt | Ziel |
| --- | --- | --- |
| 1 | GitHub Pages einschalten, Freunde testen lassen | Feedback: Ist es zu schwer? Macht es Spaß? |
| 2 | Auf **itch.io** hochladen | Erste echte Spieler, Spenden möglich |
| 2–3 | Bei **CrazyGames** einreichen | Werbeeinnahmen |
| parallel | Kurze Gameplay-Videos (TikTok, YouTube Shorts, Instagram Reels) | Aufmerksamkeit, kostet nur Zeit |
| später | Bei **Poki** bewerben, Android-App | Mehr Reichweite |

---

## 1. GitHub Pages (kostenlos, zum Testen und Teilen)

1. Den Branch mit dem Spiel nach `main` mergen (Pull Request auf GitHub).
2. Auf GitHub: **Settings → Pages → Source: „GitHub Actions“**.
3. Unter **Actions** den Workflow „Auf GitHub Pages veröffentlichen“ starten (oder einfach auf `main` pushen).
4. Nach ca. 1 Minute läuft das Spiel unter `https://<dein-name>.github.io/<repo-name>/`.

Hinweis: GitHub Pages ist im kostenlosen Konto nur für **öffentliche** Repositories verfügbar. Dann kann jeder deinen Code sehen. Bei Browser-Spielen ist das ohnehin so (der Code wird im Browser ausgeliefert), aber wenn dich das stört, nutze nur itch.io.

## 2. itch.io (einfachster Start)

1. Konto auf [itch.io](https://itch.io) anlegen → **Upload new project**.
2. **Kind of project:** HTML.
3. **Uploads:** `komet-web.zip` hochladen, Haken bei „This file will be played in the browser“.
4. **Embed options:** Größe z. B. 480 × 800 (Hochformat) oder „Auto-detect size“, „Mobile friendly“ und „Fullscreen button“ aktivieren.
5. **Pricing:** „No payment“ oder „Donate“ (Spenden). Bei Browser-Spielen zahlen nur wenige – itch.io ist vor allem zum Sammeln von Feedback und Spielern gut.
6. Cover: `marketing/cover-630x500.png`. Screenshots: weitere Bilder aus `marketing/` oder eigene.
7. Für Auszahlungen verlangt itch.io ein Steuerformular (für Deutsche: W-8BEN, damit keine US-Steuer abgezogen wird).

Die ZIP-Datei findest du nach jedem Push unter **Actions → letzter Lauf „Pakete bauen“ → Artifacts**.

## 3. CrazyGames (Werbeeinnahmen)

CrazyGames ist eines der größten Browser-Spieleportale und nimmt Spiele über das Entwicklerportal an. Du bekommst einen Anteil an den Werbeeinnahmen, die dein Spiel erzeugt.

1. Konto im [CrazyGames Developer Portal](https://developer.crazygames.com) anlegen.
2. `komet-crazygames.zip` hochladen. Diese Version lädt automatisch das CrazyGames-SDK (v3) und
   - meldet Spielstart/-ende (`gameplayStart` / `gameplayStop`),
   - zeigt höchstens jede zweite Runde eine Zwischenwerbung (`midgame`),
   - bietet nach dem Tod „Weiterfliegen (Werbung)“ an (`rewarded`) – einmal pro Runde,
   - schaltet den Ton während Werbung stumm.
3. Thumbnails aus `marketing/` verwenden (1920×1080, 800×1200, 800×800). Prüfe, welche Formate das Portal gerade verlangt.
4. CrazyGames testet neue Spiele zuerst mit einem Teil der Spieler. Wenn die Zahlen gut sind, wird das Spiel breiter ausgespielt.

**Vor dem Upload prüfen:** Die SDK-Aufrufe in `js/platform.js` gegen die aktuelle [CrazyGames-Doku](https://docs.crazygames.com/) abgleichen. Mit `index.html?platform=crazygames` kannst du lokal testen; CrazyGames bietet dafür auch einen eigenen Test-Modus (QA-Tool) im Portal.

## 4. Poki (sehr reichweitenstark, aber wählerisch)

Poki wählt Spiele selbst aus und verlangt meist Exklusivität im Web. Bewerbung über [developers.poki.com](https://developers.poki.com). Die Datei `komet-poki.zip` nutzt das Poki-SDK (`commercialBreak`, `rewardedBreak`). Lies vor der Bewerbung die aktuellen Bedingungen, gerade zur Exklusivität: Wenn du dich für Poki entscheidest, darfst du das Spiel eventuell nicht gleichzeitig auf CrazyGames anbieten.

Tipp: Erst auf CrazyGames Zahlen sammeln, dann mit dem nächsten (besseren) Spiel bei Poki bewerben.

## 5. Später: Android-App

Weil KOMET eine Web-App mit Manifest ist, kannst du es mit [PWABuilder](https://www.pwabuilder.com) oder Capacitor in eine Android-App verpacken.

- Google Play kostet einmalig 25 US-Dollar.
- Neue private Entwicklerkonten müssen vor der Veröffentlichung einen geschlossenen Test mit mindestens 12 Testern über 14 Tage durchführen. Frag früh Freunde und Kommilitonen.
- Für Werbung in Apps brauchst du ein eigenes Werbenetzwerk (z. B. Google AdMob). Das ist ein eigenes Projekt.
- Apple App Store: 99 US-Dollar pro Jahr und ein Mac nötig – erst angehen, wenn sich das Spiel lohnt.

---

## Rechtliches und Steuern (Deutschland)

Keine Rechts- oder Steuerberatung – nur eine Orientierung, damit du die richtigen Fragen stellst. Viele Hochschulen haben kostenlose Gründungsberatungen, die genau solche Fragen beantworten.

**Gewerbe anmelden:** Sobald du regelmäßig mit dem Spiel Geld verdienen willst (Werbeeinnahmen, Verkäufe), meldest du in der Regel ein Kleingewerbe beim Gewerbeamt deiner Stadt an (meist 15–60 €, oft online). Danach kommt automatisch Post vom Finanzamt bzw. du füllst den „Fragebogen zur steuerlichen Erfassung“ in [ELSTER](https://www.elster.de) aus.

**Kleinunternehmerregelung (§ 19 UStG):** Seit 2025 gilt sie, wenn dein Umsatz im Vorjahr höchstens 25.000 € war und im laufenden Jahr 100.000 € nicht übersteigt. Dann musst du keine Umsatzsteuer ausweisen – das spart viel Papierkram. Bei Einnahmen von ausländischen Plattformen (CrazyGames: Belgien, Poki: Niederlande, itch.io: USA) können trotzdem Meldepflichten entstehen; das klärst du am besten einmal mit einer Beratung.

**Einkommensteuer:** Erst wenn dein zu versteuerndes Einkommen über dem Grundfreibetrag liegt (2026: 12.348 € pro Jahr), fällt Einkommensteuer an. Zählt Gewinn, nicht Umsatz – Ausgaben für das Spiel (Laptop anteilig, Software, Gebühren) darfst du abziehen. Belege aufheben!

**Gewerbesteuer:** Erst ab 24.500 € Gewinn pro Jahr relevant.

**Krankenversicherung – wichtig!** Wenn du über deine Eltern familienversichert bist, darf dein regelmäßiges Gesamteinkommen (Gewinn aus Selbstständigkeit plus andere Einkünfte) 2026 höchstens **565 € im Monat** betragen. Liegst du darüber, musst du dich selbst versichern (studentische Krankenversicherung). Sag deiner Krankenkasse Bescheid, wenn du ein Gewerbe anmeldest.

**BAföG:** Einkommen aus Selbstständigkeit wird angerechnet. Melde es dem BAföG-Amt und prüfe die aktuellen Freibeträge.

**Kindergeld:** Während der ersten Ausbildung (dem ersten Studium) spielt dein eigenes Einkommen keine Rolle.

**Impressum:** Wenn du das Spiel geschäftlich anbietest (z. B. eigene Website mit Werbung, itch.io-Seite mit Verkauf), brauchst du in Deutschland ein Impressum (§ 5 DDG). Auf itch.io kannst du es ins Profil schreiben. Viele Studierende nutzen dafür einen Impressum-Service, um nicht die Privatadresse zu veröffentlichen.

**Datenschutz:** Das Spiel selbst sammelt keine Daten, setzt keine Cookies und lädt keine Google Fonts (die Schriften liegen im Projekt). Die Werbung auf CrazyGames/Poki verantworten die Portale. Auf einer eigenen Website mit Werbung bräuchtest du eine Datenschutzerklärung und ein Cookie-Banner.

---

## Was das Spiel noch besser machen würde

Ideen, sortiert nach Nutzen für Spielzeit und Einnahmen:

1. **Tägliche Herausforderung** (gleiche Planeten für alle an einem Tag) – bringt Spieler täglich zurück.
2. **Missionen** („Schaffe 3 PERFEKT hintereinander“) mit Sternen als Belohnung.
3. **Doppelte Sterne per Belohnungswerbung** am Rundenende – zusätzliche Werbeeinnahme, die Spieler freiwillig wählen.
4. **Neue Planetentypen:** Schwarzes Loch (zieht an), Doppelplanet, Planet der die Drehrichtung umkehrt.
5. **Cloud-Speicherstand** über das CrazyGames-SDK (Spielstand geräteübergreifend).
6. **Mehr Sprachen** (Englisch, Spanisch, Portugiesisch, Türkisch decken auf Portalen viele Spieler ab) – nur `js/i18n.js` erweitern.

## Checkliste vor jedem Upload

- [ ] Auf Handy (Hoch- und Querformat) und PC getestet
- [ ] Ton aus/an funktioniert, kein Ton während Werbung
- [ ] Version in `js/config.js` erhöht
- [ ] Richtige ZIP-Datei für die Plattform gewählt
- [ ] Cover und Thumbnails aktuell
- [ ] Beschreibung auf Deutsch und Englisch

## Beispieltext für die Spielseite

**Englisch:**
> Orbit, aim, launch! KOMET is a one-tap arcade game: circle a planet as a comet and tap at the right moment to hop to the next one. Skim the next orbit for a PERFECT combo, dodge asteroids, escape unstable planets before they collapse and collect stars to unlock new comet tails. How far can you fly?

**Deutsch:**
> Kreisen, zielen, starten! KOMET ist ein Ein-Tipp-Arcade-Spiel: Umkreise als Komet einen Planeten und tippe im richtigen Moment, um zum nächsten zu springen. Streife den nächsten Orbit für eine PERFEKT-Kombo, weiche Asteroiden aus, flieh von instabilen Planeten, bevor sie zerfallen, und sammle Sterne für neue Kometenschweife. Wie weit kommst du?

Tags: arcade, one-button, casual, space, hyper-casual, mobile, skill
