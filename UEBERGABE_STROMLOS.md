# ÜBERGABE: Spielprojekt „STROMLOS“

> Diese Datei ist für eine KI (oder einen Entwickler), die das Projekt weiterführt.
> Sie enthält: Ziel, Entscheidungen, Wünsche des Besitzers, aktuellen Stand, offene Punkte und den **kompletten Code** des aktuellen Spiels (ganz unten).
> Stand: 17.11.2026

---

## 1. Wer und was

- **Besitzer:** ein angehender Student aus Deutschland, **kann nicht programmieren**. Er beschreibt, was er will; die KI schreibt den ganzen Code.
- **Ziel:** Ein eigenes Spiel bauen, auf **Steam für den PC** veröffentlichen, Preis ca. **5 €**, um neben dem Studium Geld zu verdienen.
- **Sprache mit dem Besitzer:** Deutsch, einfach und kurz erklären, keine Fachbegriffe ohne Erklärung.

## 2. Wie der Besitzer arbeiten will (wichtig!)

- **Erst fragen, dann bauen**, wenn es um neue Richtungen geht. Er war verärgert, als ungefragt ein ganzes Spiel gebaut wurde.
- Aber: Wenn die Richtung klar ist, **zügig umsetzen** und nicht zu viele Rückfragen. Er mag es nicht, lange zu warten („Was machst du so lange?“).
- Immer **kleine, spielbare Schritte** liefern, die er sofort testen kann.
- Er will etwas **Neues, nicht 08/15**. Generische Mobile-„Idle-Arcade“-Mechaniken hat er abgelehnt.
- Er testet am **PC** (Tastatur + Maus).

## 3. Das Spielkonzept „STROMLOS“ (Arbeitstitel)

- **Genre:** 3D-Überlebensspiel mit Energie und Fortschritt („von einfachen Sachen zu großen“). Inspiration: *The Last Kilowatt* (Steam, Strom-Imperium-Simulation) – nur die Idee „Energie ist alles“, **nichts kopieren** (keine Namen, Inhalte, Grafiken).
- **Story:** Nach einem großen Stromausfall ist die Stadt dunkel und kalt. Nur der Konzern **BlackGrid** hat Strom – zu Wucherpreisen. **Sami**, seit zwei Jahren obdachlos, baut aus Schrott sein eigenes Stromnetz auf und versorgt am Ende die Stadt. (Der Besitzer liebt die Aufsteiger-Geschichte „vom Obdachlosen nach oben“.)
- **Überleben:** Wärme, Hunger, Strom. Tag/Nacht (ein Tag = 6 Minuten). Nachts bis −9 °C.
- **Geplante Stufen:**

| Stufe | Inhalt | Status |
| --- | --- | --- |
| 1. Straße | Schrott sammeln, Fahrrad-Dynamo (mehrere Dynamos im Netz = mehrfache Leistung), Heizlüfter, Lampe, Handy-Ladestation, Batterie (+60 Speicher), Akku-Speicher aus Autowrack (+150), 3 Nächte überleben | **fertig (Prototyp)** |
| 2. Hinterhof | Autobatterien, Solarpanel auf Einkaufswagen, erste Nachbarn versorgen | offen |
| 3. Dach | Windrad aus Schrott, mehr Strom | offen |
| 4. Viertel | Kabel zu Häusern (Häuser gehen sichtbar an), Nachbarn zahlen, evtl. kleiner Imbiss | offen |
| 5. Stadt | Eigenes Kraftwerk, Kampf gegen BlackGrid um Viertel, Sabotage | offen |

## 4. Technik

- **Eine einzige Datei:** `stromlos/index.html` (HTML + CSS + JavaScript), 3D mit **three.js r128** von cdnjs (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`).
- Keine Build-Tools nötig. Lokal testen: `python3 -m http.server 8000` → `http://localhost:8000/stromlos/`.
- Spielstand in `localStorage` (Präfix `stromlos.`).
- **Plan für Steam:** Am Ende mit **Electron** als Windows-.exe verpacken; Steam-Anbindung über `steamworks.js`. (Noch nicht umgesetzt.)
- Grafik bisher aus einfachen Formen (Boxen/Zylinder). Später schönere Modelle: nur **CC0-Lizenz** (z. B. KayKit, Quaternius über GitHub), damit kommerzieller Verkauf erlaubt ist.
- Repository: `slymana545-sudo/Solaiman1`, Branch `claude/relaxed-knuth-rm9iad`.

### Steuerung (vom Besitzer so gewünscht)
- **WASD** laufen, **W zweimal tippen** = sprinten (solange W gehalten), Shift geht auch
- **Leertaste** = springen (bzw. Dialog weiter)
- **Maus**: einmal ins Bild klicken → Pointer-Lock, Kamera folgt der Maus **ohne Taste gedrückt zu halten**; Esc gibt die Maus frei; Mausrad = Zoom
- **B** = Bau-Menü – **gibt die Maus frei**, damit man mit der Maus auswählt; nach dem Bauen wird die Maus wieder eingefangen. Tasten 1–5 gehen auch.
- **E** = aufheben/benutzen, **E halten** am Dynamo = strampeln
- **F** = Dose essen

### Spielregeln, die der Besitzer festgelegt hat
- 2 Dynamos im selben Netz = doppelte Energie beim Strampeln (`dynamoCount`).
- Strom wird nur gespeichert, wenn Batterien in Reichweite eines Dynamos stehen (Grundspeicher 20, Batterie +60, Akku +150, `recalcCap`).
- Gebaute Objekte blockieren nur ihre echte Grundfläche (Kreis-Kollision `FOOTPRINT`), z. B. eine Lampe nur den dünnen Mast.

### Code-Aufbau (Abschnitte in index.html)
`Renderer` → `Figuren` (makePerson, walkAnim) → `Welt` (Straße, Häuser, Gasse, Kiosk, Werbetafel, Autowrack, Schnee) → `Sami` → `Spielzustand` (BLUEPRINTS, freshState) → `Interaktionsobjekte` (Schrott, Mülltonnen, gebaute Objekte, Kabelnetz mit Reichweite NET_RANGE=9) → `Passanten` (zahlen fürs Handyladen) → `Ziele/Geschichte` (QUESTS) → `Dialog` → `Eingabe` → `Bauen` → `Interaktion` → `Bewegung` → `Überleben` (Zeit, Strom, Wärme, Hunger, Tod, Morgen/Nacht) → `Licht/Himmel` → `HUD` → `Kamera` → `Schleife` → Start/Retry. Test-Hook: `window.__s`.

## 5. Was als Nächstes sinnvoll ist

1. Feedback des Besitzers zu Stufe 1 einholen (Schwierigkeit, Spaß, Kamera-Empfindlichkeit).
2. Stufe 2 bauen (Hinterhof, Solar, erste Nachbarn als Stromkunden).
3. Grafik verbessern (CC0-Modelle, bessere Beleuchtung, Sound).
4. Hauptmenü, Optionen (Maus-Empfindlichkeit, Lautstärke), Speicherstände.
5. Electron-Verpackung (.exe) + Steam-Vorbereitung: Steam-Seite früh online stellen (Wunschliste!), Steam Direct kostet 100 $ pro Spiel (zurück ab 1.000 $ Umsatz). Bei 5 € bleiben ca. 2,90 € pro Verkauf (nach MwSt. und 30 % Steam-Anteil).

## 6. Frühere Prototypen im selben Repository (vom Besitzer verworfen, nur zur Info)

- `index.html`, `js/`, `css/` – **KOMET**, ein Ein-Tipp-Arcade-Browserspiel (abgelehnt: ungefragt gebaut).
- `imbiss/index.html` – **Imbiss Imperium**, 3D-Mobile-Spiel (Imbiss-Krieg, Chaos-Kunden, verrückte Rezepte, Vorgeschichte mit Sami). Abgelehnt als „08/15“. Die **Figur Sami und die Aufsteiger-Story** stammen von dort und wurden übernommen.
- `docs/VEROEFFENTLICHEN.md` – Leitfaden zu Veröffentlichung, Steuern, Krankenversicherung (für Browser-Portale geschrieben; Steuer-/KV-Teil gilt weiter).

## 7. Rechtliches (Deutschland, Kurzfassung)

Gewerbe anmelden, wenn regelmäßig verkauft wird; Kleinunternehmerregelung (bis 25.000 € Vorjahresumsatz); Einkommensteuer erst über dem Grundfreibetrag (2026: 12.348 €); Familienversicherung: max. 565 €/Monat Gesamteinkommen (2026). Keine Rechtsberatung – auf Beratung verweisen.

---

## 8. KOMPLETTER CODE: `stromlos/index.html`

```html
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Stromlos</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>
  :root {
    --ink: #0d1017; --panel: rgba(13,16,23,.82); --line: rgba(255,214,140,.22);
    --text: #f1ead9; --muted: #a59f90; --amber: #ffb84d; --cold: #7cc8ff; --food: #9be07a; --volt: #ffe14d; --red: #ff5a4a;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; background: #000; color: var(--text);
    font-family: "Trebuchet MS", system-ui, -apple-system, "Segoe UI", sans-serif; user-select: none; -webkit-user-select: none; }
  canvas { display: block; }
  [hidden] { display: none !important; }
  button { font: inherit; color: inherit; cursor: pointer; border: 0; }
  button:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }

  .hud { position: fixed; pointer-events: none; }
  #stats { top: 14px; left: 14px; width: 250px; display: grid; gap: 8px; padding: 12px 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; }
  .stat { display: grid; grid-template-columns: 22px 1fr 38px; align-items: center; gap: 8px; font-size: 13px; }
  .stat .bar { height: 10px; background: rgba(255,255,255,.08); border-radius: 6px; overflow: hidden; }
  .stat .bar i { display: block; height: 100%; border-radius: 6px; transition: width .2s; }
  .stat b { text-align: right; font-variant-numeric: tabular-nums; font-size: 12px; color: var(--muted); }
  .stat.low b { color: var(--red); }
  .stat.low .bar { animation: warn .6s infinite; }
  @keyframes warn { 50% { background: rgba(255,90,74,.35); } }

  #clock { top: 14px; left: 50%; transform: translateX(-50%); text-align: center; padding: 8px 18px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; }
  #clock .t { font-size: 26px; font-weight: 700; letter-spacing: .04em; font-variant-numeric: tabular-nums; }
  #clock .d { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
  #clock .temp { font-size: 12px; color: var(--cold); }

  #inv { top: 14px; right: 14px; display: grid; grid-template-columns: repeat(2, auto); gap: 4px 14px; padding: 12px 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; font-size: 13px; }
  #inv span b { font-variant-numeric: tabular-nums; color: var(--amber); }

  #quest { top: 160px; right: 14px; width: 250px; padding: 12px 14px; background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--amber); border-radius: 10px; font-size: 13px; line-height: 1.4; }
  #quest small { display: block; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--amber); margin-bottom: 4px; }

  #prompt { bottom: 90px; left: 50%; transform: translateX(-50%); padding: 10px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; font-size: 15px; white-space: nowrap; }
  kbd { display: inline-block; min-width: 24px; padding: 2px 7px; border-radius: 6px; background: var(--amber); color: var(--ink); font-weight: 800; font-family: inherit; text-align: center; margin-right: 6px; }
  #hint { bottom: 14px; left: 14px; font-size: 12px; color: var(--muted); }
  #toast { bottom: 140px; left: 50%; transform: translateX(-50%); font-size: 22px; font-weight: 800; text-shadow: 0 2px 10px #000; white-space: nowrap; }
  #lockhint { top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 10px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; font-size: 14px; }
  #vignette { inset: 0; background: radial-gradient(ellipse at center, transparent 50%, rgba(80,160,255,.45) 100%); opacity: 0; transition: opacity .5s; }

  /* Bau-Menü */
  #build { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); display: flex; gap: 8px; padding: 10px; background: var(--panel); border: 1px solid var(--line); border-radius: 16px; max-width: calc(100vw - 24px); overflow-x: auto; }
  .bp { width: 150px; flex: none; padding: 10px; border-radius: 12px; background: rgba(255,255,255,.04); border: 1px solid var(--line); text-align: left; }
  .bp:hover:not([disabled]) { background: rgba(255,184,77,.12); }
  .bp[disabled] { opacity: .45; cursor: default; }
  .bp .n { font-weight: 800; font-size: 14px; } .bp .k { float: right; font-size: 11px; color: var(--amber); }
  .bp .c { font-size: 11px; color: var(--muted); margin-top: 4px; } .bp .e { font-size: 11px; margin-top: 4px; color: var(--volt); }

  /* Overlays */
  .overlay { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.6); padding: 16px; }
  .card { width: min(520px, 100%); background: #151922; border: 1px solid var(--line); border-radius: 18px; padding: 28px; text-align: center; }
  .card h1 { margin: 0; font-size: 56px; letter-spacing: .12em; color: var(--amber); text-shadow: 0 0 30px rgba(255,184,77,.5); }
  .card h2 { margin: 0 0 8px; font-size: 26px; }
  .card p { color: #cfc7b5; line-height: 1.5; }
  .card .keys { display: grid; grid-template-columns: auto 1fr; gap: 6px 10px; text-align: left; margin: 14px auto; width: fit-content; font-size: 14px; }
  .big { background: var(--amber); color: var(--ink); font-weight: 800; padding: 14px 32px; border-radius: 12px; font-size: 18px; margin-top: 10px; }
  .big:hover { filter: brightness(1.1); }

  #dialog { position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%); width: min(640px, calc(100vw - 24px)); background: #151922; border: 1px solid var(--line); border-radius: 14px; padding: 16px 20px; cursor: pointer; }
  #dialog .who { color: var(--amber); font-weight: 800; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 6px; }
  #dialog .txt { font-size: 17px; line-height: 1.45; min-height: 2.9em; }
  #dialog .nx { text-align: right; font-size: 11px; color: var(--muted); }
</style>
</head>
<body>
<div id="stats" class="hud" hidden>
  <div class="stat" id="st-warm"><span>🔥</span><div class="bar"><i style="background:linear-gradient(90deg,#ff7a3d,#ffb84d)"></i></div><b></b></div>
  <div class="stat" id="st-food"><span>🍞</span><div class="bar"><i style="background:var(--food)"></i></div><b></b></div>
  <div class="stat" id="st-volt"><span>⚡</span><div class="bar"><i style="background:var(--volt)"></i></div><b></b></div>
</div>
<div id="clock" class="hud" hidden><div class="d" id="day"></div><div class="t" id="time"></div><div class="temp" id="temp"></div></div>
<div id="inv" class="hud" hidden></div>
<div id="quest" class="hud" hidden><small>Ziel</small><span id="questtext"></span></div>
<div id="prompt" class="hud" hidden></div>
<div id="toast" class="hud" hidden></div>
<div id="vignette" class="hud"></div>
<div id="hint" class="hud" hidden><kbd>WASD</kbd>laufen &nbsp; <kbd>2× W</kbd>sprinten &nbsp; <kbd>Leertaste</kbd>springen &nbsp; <kbd>Maus</kbd>Kamera &nbsp; <kbd>E</kbd>benutzen &nbsp; <kbd>B</kbd>bauen (Maus wird frei)</div>
<div id="build" hidden></div>
<div id="lockhint" class="hud" hidden>Ins Bild klicken = Kamera mit der Maus steuern</div>

<div class="overlay" id="title">
  <div class="card">
    <h1>STROMLOS</h1>
    <p>Seit dem großen Stromausfall ist die Stadt dunkel. Nur der Konzern <b>BlackGrid</b> hat noch Strom, für alle, die zahlen können.<br>Sami kann nicht zahlen. Sami hat nur Schrott.</p>
    <div class="keys">
      <kbd>WASD</kbd><span>laufen, <b>W zweimal tippen</b> = sprinten</span>
      <kbd>Leertaste</kbd><span>springen</span>
      <kbd>Maus</kbd><span>Kamera drehen (einmal ins Bild klicken), Mausrad = Zoom, Esc = Mauszeiger zurück</span>
      <kbd>E</kbd><span>aufheben, benutzen, gedrückt halten = strampeln</span>
      <kbd>B</kbd><span>Bau-Menü</span>
    </div>
    <button class="big" id="startbtn" type="button">Überleben</button>
  </div>
</div>
<div class="overlay" id="dead" hidden>
  <div class="card"><h2 id="deadtitle">Sami ist erfroren.</h2><p id="deadtext">Die Nacht war zu kalt.</p><button class="big" id="retrybtn" type="button">Den Tag nochmal versuchen</button></div>
</div>
<div class="overlay" id="win" hidden>
  <div class="card"><h2>Stufe 1 geschafft</h2><p id="wintext"></p><button class="big" id="winbtn" type="button">Weiterspielen</button></div>
</div>
<div id="dialog" hidden><div class="who" id="dwho"></div><div class="txt" id="dtxt"></div><div class="nx">Klicken oder Leertaste</div></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
'use strict';
// =====================================================================
// STROMLOS – Stufe 1: Die Straße
// Überleben durch Energie: Schrott sammeln, Fahrrad-Dynamo bauen,
// Strom erzeugen, Nächte überstehen, erste Kunden versorgen.
// =====================================================================
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const store = {
  get(k, d) { try { const v = localStorage.getItem('stromlos.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('stromlos.' + k, JSON.stringify(v)); } catch (e) {} },
};

// ---------------------------------------------------------------- Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
resize(); addEventListener('resize', resize);

const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x2a241c, 0.6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2b0, 0.8);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
scene.add(sun, sun.target);
scene.fog = new THREE.Fog(0x000000, 20, 70);

const matCache = {};
function mat(c, opts) {
  const key = c + JSON.stringify(opts || {});
  return matCache[key] || (matCache[key] = new THREE.MeshLambertMaterial(Object.assign({ color: c }, opts || {})));
}
function box(w, h, d, c, x, y, z, parent = scene, o) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function cyl(rt, rb, h, c, x, y, z, parent = scene, seg = 14, o) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(c, o));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function ball(r, c, x, y, z, parent = scene, o) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat(c, o));
  m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
}

// ---------------------------------------------------------------- Figuren
function makePerson(shirt, pants, skin, hair, parent = scene) {
  const g = new THREE.Group();
  const hipL = new THREE.Group(); hipL.position.set(-0.15, 0.78, 0); g.add(hipL);
  const hipR = new THREE.Group(); hipR.position.set(0.15, 0.78, 0); g.add(hipR);
  box(0.22, 0.75, 0.24, pants, 0, -0.38, 0, hipL); box(0.22, 0.75, 0.24, pants, 0, -0.38, 0, hipR);
  box(0.25, 0.12, 0.34, 0x2a2420, 0, -0.74, 0.05, hipL); box(0.25, 0.12, 0.34, 0x2a2420, 0, -0.74, 0.05, hipR);
  box(0.64, 0.76, 0.38, shirt, 0, 1.17, 0, g);
  const shL = new THREE.Group(); shL.position.set(-0.43, 1.48, 0); g.add(shL);
  const shR = new THREE.Group(); shR.position.set(0.43, 1.48, 0); g.add(shR);
  box(0.18, 0.64, 0.2, shirt, 0, -0.31, 0, shL); box(0.18, 0.64, 0.2, shirt, 0, -0.31, 0, shR);
  ball(0.08, skin, 0, -0.66, 0, shL); ball(0.08, skin, 0, -0.66, 0, shR);
  ball(0.27, skin, 0, 1.84, 0, g);
  if (hair) box(0.52, 0.16, 0.52, hair, 0, 2.06, -0.02, g);
  parent.add(g);
  return { g, hipL, hipR, shL, shR, phase: 0 };
}
function walkAnim(p, moving, dt, speed = 10) {
  if (moving) p.phase += dt * speed; else p.phase *= 0.8;
  const s = Math.sin(p.phase) * (moving ? 0.6 : 0);
  p.hipL.rotation.x = s; p.hipR.rotation.x = -s; p.shL.rotation.x = -s * 0.8; p.shR.rotation.x = s * 0.8;
}
function lerpAngle(a, b, t) { let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; }

// Sprites für Beschriftungen über Objekten
function makeLabel(text, color = '#ffb84d') {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const c = cv.getContext('2d');
  c.font = 'bold 30px Trebuchet MS, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(text, 128, 32);
  c.fillStyle = color; c.fillText(text, 128, 32);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthWrite: false, transparent: true }));
  sp.scale.set(2.4, 0.6, 1); return sp;
}

// ---------------------------------------------------------------- Welt
const W = { colliders: [], circles: [], interact: [] };
function collider(x, z, w, d) { W.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 }); }

const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat(0x3a3a3e)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
box(120, 0.06, 9, 0x26262b, 0, 0.03, 4.5);                      // Straße
for (let x = -58; x < 60; x += 6) box(3, 0.02, 0.2, 0xb8b8a0, x, 0.07, 4.5);
box(120, 0.16, 3.2, 0x55555a, 0, 0.08, -1.6);                  // Gehweg
box(120, 0.16, 3, 0x55555a, 0, 0.08, 10.5);
// Häuserreihe nördlich, mit Lücke für Samis Gasse
const litWindows = [];
const HOUSE = [0x5b4b44, 0x4b4f5b, 0x5d554a, 0x46515a, 0x5a4a52];
for (let x = -44; x <= 44; x += 9) {
  if (Math.abs(x) < 5) continue;
  const h = rand(8, 16), c = pick(HOUSE);
  box(8.6, h, 8, c, x, h / 2, -7.4); collider(x, -7.4, 8.6, 8);
  for (let fy = 2.2; fy < h - 1; fy += 2.6) for (let fx = -3; fx <= 3; fx += 2) {
    const lit = Math.random() < 0.12; // nur BlackGrid-Kunden haben Licht
    const win = box(1.1, 1.4, 0.08, lit ? 0xffd27a : 0x1a1f28, x + fx, fy, -3.36, scene, lit ? { emissive: 0xffb84d, emissiveIntensity: 0.9 } : undefined);
    if (lit) litWindows.push(win);
  }
}
// Gegenüberliegende Seite
for (let x = -40; x <= 44; x += 10) { const h = rand(7, 13); box(9, h, 7, pick(HOUSE), x, h / 2, 16); collider(x, 16, 9, 7); }
// Gasse: Wände links/rechts, Rückwand
box(0.6, 7, 10, 0x4a3f3a, -4.5, 3.5, -8); collider(-4.5, -8, 0.6, 10);
box(0.6, 7, 10, 0x4a3f3a, 4.5, 3.5, -8); collider(4.5, -8, 0.6, 10);
box(9.6, 7, 0.6, 0x4a3f3a, 0, 3.5, -13); collider(0, -13, 9.6, 0.6);
// Samis Schlafplatz
box(1.4, 0.1, 2, 0x8b6d47, -2.6, 0.12, -10.6);
box(1.6, 0.25, 0.6, 0x6b5b7b, -2.6, 0.25, -11.5);
// BlackGrid-Werbetafel
const bb = new THREE.Group(); bb.position.set(14, 0, -3.8); scene.add(bb);
cyl(0.2, 0.25, 8, 0x333338, 0, 4, 0, bb);
{
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d');
  c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, 512, 256);
  c.fillStyle = '#39ff8f'; c.font = 'bold 76px Trebuchet MS'; c.fillText('BLACKGRID', 34, 110);
  c.fillStyle = '#d8d8d8'; c.font = '30px Trebuchet MS'; c.fillText('Strom für alle, die', 36, 168); c.fillText('es sich leisten können.', 36, 206);
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) }));
  bm.position.set(0, 9.6, 0.2); bb.add(bm);
  const glow = new THREE.PointLight(0x39ff8f, 0.9, 16); glow.position.set(0, 9, 2); bb.add(glow);
}
// Kiosk (BlackGrid-Strom, verkauft Essen)
const kiosk = new THREE.Group(); kiosk.position.set(-22, 0, -1.6); scene.add(kiosk);
box(4, 3, 2.6, 0x2c3a4a, 0, 1.5, -1.2, kiosk); box(4.2, 0.2, 3.2, 0x39ff8f, 0, 3.1, -0.9, kiosk, { emissive: 0x39ff8f, emissiveIntensity: 0.6 });
box(3.2, 1.2, 0.1, 0xfff1c4, 0, 1.9, 0.12, kiosk, { emissive: 0xffe2a0, emissiveIntensity: 0.8 });
const kioskLight = new THREE.PointLight(0xffe2a0, 1.1, 10); kioskLight.position.set(0, 2.6, 1.6); kiosk.add(kioskLight);
collider(-22, -2.8, 4, 2.6);
const kioskOwner = makePerson(0x39ff8f, 0x222222, 0xc68b59, 0x111111, kiosk); kioskOwner.g.position.set(0, 0.1, -0.9); kioskOwner.g.scale.setScalar(0.95);
const kLbl = makeLabel('Kiosk', '#39ff8f'); kLbl.position.set(0, 4, -0.9); kiosk.add(kLbl);
// Kaputte Straßenlaternen
for (let x = -36; x <= 36; x += 12) { cyl(0.08, 0.1, 5, 0x2b2b30, x, 2.5, -0.4); box(0.9, 0.18, 0.4, 0x2b2b30, x + 0.3, 5, -0.2); }
// Autowrack
const car = new THREE.Group(); car.position.set(12, 0, 2.2); car.rotation.y = 0.15; scene.add(car);
box(4.2, 0.9, 1.9, 0x6b3a2e, 0, 0.75, 0, car); box(2.3, 0.75, 1.75, 0x5b3226, -0.3, 1.5, 0, car);
box(2.1, 0.6, 1.8, 0x111418, -0.3, 1.5, 0, car);
[[-1.4, 0.95], [1.4, 0.95], [-1.4, -0.95]].forEach(([x, z]) => { const w = cyl(0.38, 0.38, 0.28, 0x1b1b1b, x, 0.38, z, car); w.rotation.x = Math.PI / 2; });
box(0.6, 0.3, 0.6, 0x1b1b1b, 1.4, 0.15, -0.95, car); // fehlendes Rad
collider(12, 2.2, 4.4, 2.1);

// Mülltonnen (durchsuchbar)
const BIN_SPOTS = [[-6.5, -3.0], [7, -3.1], [-15, -3.0], [26, -3.1], [-30, -3.0]];
// Schrotthaufen
const SCRAP_SPOTS = [[-2, -8], [2.8, -9.5], [8, -1.2], [-9, -1.4], [18, -1.0], [-17, 1.5], [22, 7.8], [-26, 7.5], [3, 8.5], [30, -1.3], [-34, -1.2], [-12, 8]];

// Schnee
const snowGeo = new THREE.BufferGeometry();
const SNOW = 1400, snowPos = new Float32Array(SNOW * 3);
for (let i = 0; i < SNOW; i++) { snowPos[i * 3] = rand(-35, 35); snowPos[i * 3 + 1] = rand(0, 25); snowPos[i * 3 + 2] = rand(-25, 25); }
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.8 }));
scene.add(snow);

// ---------------------------------------------------------------- Sami
const sami = makePerson(0x5e6155, 0x3e3a33, 0xd9a27a, null);
box(0.56, 0.24, 0.56, 0x8a3b2e, 0, 2.04, 0, sami.g);         // Mütze
box(0.7, 0.18, 0.44, 0x7a3b2e, 0, 1.5, 0, sami.g);           // Schal
sami.g.position.set(-1.5, 0, -9);
const samiLight = new THREE.PointLight(0xffd9a0, 0, 6); samiLight.position.set(0, 2.2, 0); sami.g.add(samiLight); // Taschenlampe später

// ---------------------------------------------------------------- Spielzustand
const BLUEPRINTS = [
  { id: 'dynamo',  key: '1', name: 'Fahrrad-Dynamo', cost: { schrott: 3, kabel: 2 },          info: 'Halte E zum Strampeln. Erzeugt Strom.', makes: '+⚡' },
  { id: 'heater',  key: '2', name: 'Heizlüfter',     cost: { schrott: 3, metall: 2, kabel: 1 }, info: 'Wärmt dich in der Nähe. Braucht Strom.', makes: '-1,2 ⚡/s' },
  { id: 'lamp',    key: '3', name: 'Lampe',          cost: { schrott: 1, kabel: 1 },          info: 'Licht. Hält Ratten fern, wirkt einladend.', makes: '-0,2 ⚡/s' },
  { id: 'charger', key: '4', name: 'Handy-Ladestation', cost: { metall: 2, kabel: 3 },        info: 'Passanten laden ihr Handy und zahlen dafür.', makes: '+💰' },
  { id: 'cell',    key: '5', name: 'Batterie',       cost: { schrott: 2, metall: 1, kabel: 1 }, info: 'Speichert Strom vom Dynamo. Muss in Kabel-Reichweite eines Dynamos stehen.', makes: '+60 ⚡ Speicher' },
  { id: 'battery', key: '6', name: 'Akku-Speicher',  cost: { autobatterie: 1, kabel: 2 },     info: 'Speichert viel mehr Strom.', makes: '+150 ⚡ Speicher' },
];
const ITEM_NAMES = { schrott: '🔩 Schrott', kabel: '🧵 Kabel', metall: '⚙️ Metall', autobatterie: '🔋 Autobatterie', muenzen: '💰 Münzen', essen: '🥫 Dosen' };
const NET_RANGE = 9; // so weit reichen die Kabel vom Netz

let S;  // Spielstand
function freshState() {
  return {
    day: 1, time: 9.5, // Uhrzeit in Stunden
    warmth: 100, food: 80, volt: 0, cap: 20,
    inv: { schrott: 0, kabel: 0, metall: 0, autobatterie: 0, muenzen: 0, essen: 0 },
    built: [], // {id, x, z, on}
    scrapTaken: [], binsTaken: [], carSearched: false,
    quest: 0, nightsSurvived: 0, story: {},
  };
}
let checkpoint = null;

// ---------------------------------------------------------------- Interaktionsobjekte
let scrapMeshes = [], binMeshes = [], builtObjs = [], cables = [];
function spawnScrap() {
  scrapMeshes.forEach(m => scene.remove(m.g)); scrapMeshes = [];
  SCRAP_SPOTS.forEach(([x, z], i) => {
    if (S.scrapTaken.includes(i)) return;
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    for (let k = 0; k < 5; k++) { const b = box(rand(0.2, 0.6), rand(0.1, 0.35), rand(0.2, 0.6), pick([0x777b80, 0x8a5a3a, 0x5a6a5a, 0x9a9aa0]), rand(-0.4, 0.4), 0.15, rand(-0.4, 0.4), g); b.rotation.y = rand(0, 3); }
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffe9a0 })); glint.position.y = 0.5; g.add(glint);
    scrapMeshes.push({ g, i, glint, x, z });
  });
}
function spawnBins() {
  binMeshes.forEach(m => scene.remove(m.g)); binMeshes = [];
  BIN_SPOTS.forEach(([x, z], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    cyl(0.45, 0.4, 1.1, 0x3b4a3b, 0, 0.55, 0, g); cyl(0.5, 0.5, 0.08, 0x2e3a2e, 0, 1.12, 0, g);
    binMeshes.push({ g, i, x, z });
  });
}

// Gebaute Objekte
function buildMesh(b) {
  const g = new THREE.Group(); g.position.set(b.x, 0, b.z); g.rotation.y = b.rot || 0; scene.add(g);
  const o = { b, g };
  if (b.id === 'dynamo') {
    box(1.6, 0.08, 0.6, 0x555a60, 0, 0.05, 0, g);
    const wheel = new THREE.Group(); wheel.position.set(0.55, 0.45, 0); g.add(wheel);
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 8, 20), mat(0x1c1c1c)); t.rotation.y = Math.PI / 2; wheel.add(t);
    for (let k = 0; k < 4; k++) { const s = box(0.02, 0.72, 0.02, 0x999999, 0, 0, 0, wheel); s.rotation.x = k * Math.PI / 4; }
    box(1.1, 0.06, 0.06, 0xb83a2e, 0.05, 0.75, 0, g); cyl(0.04, 0.04, 0.6, 0xb83a2e, -0.35, 0.5, 0, g, 6);
    box(0.35, 0.08, 0.2, 0x1c1c1c, -0.35, 0.82, 0, g); cyl(0.04, 0.04, 0.7, 0xb83a2e, 0.45, 0.8, 0, g, 6);
    box(0.06, 0.06, 0.6, 0x1c1c1c, 0.48, 1.15, 0, g);
    box(0.3, 0.3, 0.3, 0x444d55, 0.55, 0.2, 0.32, g); // Dynamo
    o.wheel = wheel; o.lbl = makeLabel('Dynamo'); o.lbl.position.y = 2.1; g.add(o.lbl);
  } else if (b.id === 'heater') {
    box(0.8, 0.9, 0.45, 0x8a8f96, 0, 0.5, 0, g);
    o.grill = box(0.62, 0.55, 0.05, 0x331a10, 0, 0.55, 0.24, g, { emissive: 0xff5a1a, emissiveIntensity: 0 });
    o.light = new THREE.PointLight(0xff7a30, 0, 7); o.light.position.set(0, 1, 0.6); g.add(o.light);
    o.lbl = makeLabel('Heizlüfter'); o.lbl.position.y = 1.7; g.add(o.lbl);
  } else if (b.id === 'lamp') {
    cyl(0.04, 0.06, 1.8, 0x333333, 0, 0.9, 0, g, 6);
    o.bulb = ball(0.16, 0xffffff, 0, 1.9, 0, g, { emissive: 0xffe2a0, emissiveIntensity: 0 });
    o.light = new THREE.PointLight(0xffe2a0, 0, 12); o.light.position.set(0, 1.9, 0); g.add(o.light);
  } else if (b.id === 'charger') {
    box(0.7, 1.3, 0.4, 0x2b4a6b, 0, 0.65, 0, g);
    o.screen = box(0.5, 0.35, 0.05, 0x111111, 0, 1.0, 0.22, g, { emissive: 0x4ad3ff, emissiveIntensity: 0 });
    const sign = makeLabel('📱 Laden: 2 💰', '#7cc8ff'); sign.position.y = 1.9; g.add(sign);
  } else if (b.id === 'cell') {
    box(0.55, 0.42, 0.35, 0x1f2326, 0, 0.21, 0, g);
    cyl(0.04, 0.04, 0.08, 0xc0392b, -0.15, 0.46, 0, g, 8); cyl(0.04, 0.04, 0.08, 0x2c3e50, 0.15, 0.46, 0, g, 8);
    o.ind = box(0.45, 0.06, 0.03, 0x39ff8f, 0, 0.3, 0.19, g, { emissive: 0x39ff8f, emissiveIntensity: 0.6 });
    o.lbl = makeLabel('Batterie'); o.lbl.position.y = 1.1; g.add(o.lbl);
  } else if (b.id === 'battery') {
    for (let k = 0; k < 3; k++) box(0.5, 0.4, 0.35, 0x222222, -0.55 + k * 0.55, 0.2, 0, g);
    o.ind = box(1.6, 0.05, 0.05, 0x39ff8f, 0, 0.45, 0.18, g, { emissive: 0x39ff8f, emissiveIntensity: 0.5 });
    o.lbl = makeLabel('Akku'); o.lbl.position.y = 1.2; g.add(o.lbl);
  }
  builtObjs.push(o);
  return o;
}
function rebuildAll() {
  builtObjs.forEach(o => scene.remove(o.g)); builtObjs = [];
  S.built.forEach(buildMesh);
  updateCables();
}
// Netz: alles in Reichweite eines Dynamos oder Akkus ist angeschlossen
function sources() { return builtObjs.filter(o => o.b.id === 'dynamo' || o.b.id === 'battery' || o.b.id === 'cell'); }
const STORE = { cell: 60, battery: 150 };
// Speicher zählt nur, wenn die Batterie in Reichweite eines Dynamos steht
function nearDynamo(o) { return builtObjs.some(d => d.b.id === 'dynamo' && Math.hypot(d.b.x - o.b.x, d.b.z - o.b.z) <= NET_RANGE); }
function recalcCap() {
  S.cap = 20 + builtObjs.reduce((sum, o) => sum + (STORE[o.b.id] && nearDynamo(o) ? STORE[o.b.id] : 0), 0);
  S.volt = Math.min(S.volt, S.cap);
}
// Mehrere Dynamos im selben Netz: jeder zusätzliche Dynamo bringt seine volle Leistung dazu
function dynamoCount(o) { return builtObjs.filter(d => d.b.id === 'dynamo' && Math.hypot(d.b.x - o.b.x, d.b.z - o.b.z) <= NET_RANGE).length; }
function connected(o) { return sources().some(s => s !== o && Math.hypot(s.b.x - o.b.x, s.b.z - o.b.z) <= NET_RANGE); }
function updateCables() {
  cables.forEach(c => scene.remove(c)); cables = [];
  builtObjs.forEach(o => {
    if (o.b.id === 'dynamo') return;
    const src = sources().filter(s => s !== o).sort((a, b) => Math.hypot(a.b.x - o.b.x, a.b.z - o.b.z) - Math.hypot(b.b.x - o.b.x, b.b.z - o.b.z))[0];
    if (!src || Math.hypot(src.b.x - o.b.x, src.b.z - o.b.z) > NET_RANGE) return;
    const pts = [];
    for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push(new THREE.Vector3(src.b.x + (o.b.x - src.b.x) * t, 0.06 + Math.sin(t * Math.PI) * 0.03, src.b.z + (o.b.z - src.b.z) * t + Math.sin(t * 9) * 0.1)); }
    const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.03, 5), mat(0x111111));
    scene.add(line); cables.push(line);
  });
}

// ---------------------------------------------------------------- Passanten
const walkers = [];
const SHIRTS = [0x3d5a80, 0x7a5c61, 0x4f6d7a, 0x6a4c93, 0x8a6a4a, 0x2f4858];
function spawnWalker() {
  const fromLeft = Math.random() < 0.5;
  const p = makePerson(pick(SHIRTS), 0x2a2a30, pick([0xf1c7a0, 0xd9a27a, 0xb07a52, 0x8d5a3b]), pick([0x1a1a1a, 0x3b2a20, 0x7a5a3a]));
  p.g.position.set(fromLeft ? -50 : 50, 0, rand(-2.4, -0.8));
  const needs = Math.random() < 0.5;
  let bubble = null;
  if (needs) { bubble = makeLabel('🔋 Akku leer!', '#7cc8ff'); bubble.position.y = 2.6; p.g.add(bubble); }
  walkers.push({ p, dir: fromLeft ? 1 : -1, needs, bubble, state: 'walk', wait: 0 });
}
function updateWalkers(dt) {
  const isDay = S.time > 7 && S.time < 18.5;
  if (isDay && walkers.length < 6 && Math.random() < dt * 0.25) spawnWalker();
  const charger = builtObjs.find(o => o.b.id === 'charger' && connected(o));
  for (let i = walkers.length - 1; i >= 0; i--) {
    const w = walkers[i], pos = w.p.g.position;
    let tx = pos.x + w.dir * 10, tz = pos.z, moving = true;
    if (w.state === 'walk' && w.needs && charger && Math.abs(pos.x - charger.b.x) < 14 && S.volt >= 5) w.state = 'goto';
    if (w.state === 'goto' && charger) { tx = charger.b.x + 0.9; tz = charger.b.z + 0.9; if (Math.hypot(tx - pos.x, tz - pos.z) < 0.25) { w.state = 'charge'; w.wait = 4; } }
    if (w.state === 'charge') {
      moving = false; w.wait -= dt;
      if (charger) charger.screen.material.emissiveIntensity = 0.9;
      if (w.wait <= 0) {
        if (S.volt >= 5) { S.volt -= 5; S.inv.muenzen += 2; toast('+2 💰  Handy geladen'); if (w.bubble) w.p.g.remove(w.bubble); }
        w.state = 'leave'; w.needs = false; if (charger) charger.screen.material.emissiveIntensity = 0;
        if (S.quest === 6) advanceQuest();
      }
    }
    if (w.state === 'leave') { tx = pos.x + w.dir * 10; tz = -1.6; }
    if (moving) {
      const dx = tx - pos.x, dz = tz - pos.z, len = Math.hypot(dx, dz) || 1;
      pos.x += dx / len * 2.4 * dt; pos.z += dz / len * 2.4 * dt;
      w.p.g.rotation.y = lerpAngle(w.p.g.rotation.y, Math.atan2(dx, dz), 0.15);
    }
    walkAnim(w.p, moving, dt, 8);
    if (Math.abs(pos.x) > 55) { scene.remove(w.p.g); walkers.splice(i, 1); }
  }
}

// ---------------------------------------------------------------- Ziele / Geschichte
const QUESTS = [
  { t: () => `Sammle Schrott aus den Haufen (glitzern). Schrott ${S.inv.schrott}/3, Kabel ${S.inv.kabel}/2`, done: () => S.inv.schrott >= 3 && S.inv.kabel >= 2 },
  { t: () => 'Drücke B und baue einen Fahrrad-Dynamo in deiner Gasse.', done: () => S.built.some(b => b.id === 'dynamo') },
  { t: () => `Halte E am Dynamo und strample Strom. ⚡ ${Math.floor(S.volt)}/30`, done: () => S.volt >= 30 },
  { t: () => 'Es wird bald dunkel. Sammle Metall und baue einen Heizlüfter neben dem Dynamo (B).', done: () => S.built.some(b => b.id === 'heater') },
  { t: () => 'Überlebe die Nacht. Schalte den Heizlüfter mit E ein und bleib in seiner Nähe. Strample nach, wenn der Strom ausgeht.', done: () => S.nightsSurvived >= 1 },
  { t: () => 'Baue eine Handy-Ladestation an der Straße, in Reichweite deines Netzes.', done: () => S.built.some(b => b.id === 'charger') },
  { t: () => 'Warte auf Passanten mit leerem Akku. Sie zahlen dir Münzen.', done: () => false },
  { t: () => `Kaufe dir am Kiosk etwas zu essen (3 💰). Danach: Überlebe bis Tag 4. Tipp: Im Autowrack ist eine Batterie.`, done: () => S.nightsSurvived >= 3 },
];
function advanceQuest() { S.quest++; questFlash(); }
function questFlash() { const q = $('quest'); q.style.borderLeftColor = '#fff'; setTimeout(() => q.style.borderLeftColor = '', 400); }

// ---------------------------------------------------------------- Dialog
let dlg = null;
function say(lines, done) { dlg = { lines, i: -1, done }; $('dialog').hidden = false; nextLine(); }
function nextLine() {
  if (!dlg) return;
  dlg.i++;
  const l = dlg.lines[dlg.i];
  if (!l) { const d = dlg.done; dlg = null; $('dialog').hidden = true; if (d) d(); return; }
  $('dwho').textContent = l[0]; $('dtxt').textContent = l[1];
}
$('dialog').addEventListener('click', nextLine);

// ---------------------------------------------------------------- Eingabe
const keys = {};
let eHeld = false, ePressed = false;
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (dlg && (k === ' ' || k === 'enter' || k === 'e')) { nextLine(); e.preventDefault(); return; }
  // Doppelt W tippen = sprinten (solange W gehalten wird)
  if ((k === 'w' || k === 'arrowup') && !keys[k]) {
    const now = performance.now();
    if (now - lastWTap < 300) sprinting = true;
    lastWTap = now;
  }
  if (k === ' ' && !keys[' ']) jumpPressed = true;
  keys[k] = true;
  if (k === 'e') { if (!eHeld) ePressed = true; eHeld = true; }
  if (k === 'b' && running) toggleBuild();
  if (k === 'escape') closeBuild(false);
  if (!$('build').hidden) { const bp = BLUEPRINTS.find(b => b.key === k); if (bp) tryBuild(bp); }
  if ([' ', 'arrowup', 'arrowdown'].includes(k)) e.preventDefault();
});
addEventListener('keyup', e => { const k = e.key.toLowerCase(); keys[k] = false; if (k === 'e') eHeld = false; if (k === 'w' || k === 'arrowup') sprinting = false; });
let lastWTap = 0, sprinting = false, jumpPressed = false, vy = 0;
addEventListener('blur', () => { for (const k in keys) keys[k] = false; eHeld = false; });
let camYaw = 0.6, camPitch = 0.55, camDist = 9;
// Maus-Kamera: einmal klicken = Maus wird eingefangen, dann dreht die Kamera mit jeder Bewegung.
const locked = () => document.pointerLockElement === renderer.domElement;
renderer.domElement.addEventListener('click', () => {
  if (dlg) { nextLine(); return; }
  if (!$('build').hidden) return; // erst im Menü auswählen
  if (running && !locked()) { try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
});
addEventListener('pointermove', e => {
  if (!running || dlg || !$('build').hidden) return; // Bau-Menü offen: Maus ist frei
  // Ohne eingefangene Maus (z. B. wenn der Browser es blockiert) dreht die Kamera trotzdem mit.
  const dx = e.movementX || 0, dy = e.movementY || 0;
  if (Math.abs(dx) > 200 || Math.abs(dy) > 200) return; // Sprünge ignorieren
  camYaw -= dx * (locked() ? 0.0035 : 0.005);
  camPitch = clamp(camPitch + dy * 0.003, 0.15, 1.2);
});
document.addEventListener('pointerlockchange', () => { $('lockhint').hidden = locked() || !running || !$('build').hidden; });
addEventListener('wheel', e => { camDist = clamp(camDist + e.deltaY * 0.01, 4, 18); }, { passive: true });

// ---------------------------------------------------------------- Bauen
function canAfford(bp) { return Object.entries(bp.cost).every(([k, v]) => S.inv[k] >= v); }
function renderBuild() {
  const el = $('build'); el.innerHTML = '';
  BLUEPRINTS.forEach(bp => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'bp'; b.disabled = !canAfford(bp);
    b.innerHTML = `<span class="k">[${bp.key}]</span><div class="n">${bp.name}</div><div class="c"></div><div class="e">${bp.makes}</div>`;
    b.dataset.id = bp.id;
    b.title = bp.info;
    b.addEventListener('click', () => tryBuild(bp));
    el.appendChild(b);
  });
  refreshBuild();
}
// Nur Zahlen aktualisieren, Knöpfe bleiben bestehen (sonst gehen Klicks verloren)
function refreshBuild() {
  $('build').querySelectorAll('.bp').forEach(btn => {
    const bp = BLUEPRINTS.find(x => x.id === btn.dataset.id);
    btn.disabled = !canAfford(bp);
    const html = Object.entries(bp.cost).map(([k, v]) => `${ITEM_NAMES[k]} ${S.inv[k]}/${v}`).join('<br>');
    const c = btn.querySelector('.c'); if (c.innerHTML !== html) c.innerHTML = html;
  });
}
function relock() {
  if (!running || locked()) return;
  try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
}
function openBuild() {
  $('build').hidden = false; renderBuild();
  if (document.exitPointerLock && locked()) document.exitPointerLock(); // Maus frei zum Auswählen
  $('lockhint').hidden = true;
}
function closeBuild(relockMouse) { $('build').hidden = true; if (relockMouse) relock(); }
function toggleBuild() { if ($('build').hidden) openBuild(); else closeBuild(true); }
function tryBuild(bp) {
  if (!canAfford(bp)) { toast('Dir fehlen Teile'); return; }
  const p = sami.g.position, a = sami.g.rotation.y;
  const x = p.x + Math.sin(a) * 1.6, z = p.z + Math.cos(a) * 1.6;
  if (blocked(x, z, 0.6)) { toast('Hier ist kein Platz'); return; }
  Object.entries(bp.cost).forEach(([k, v]) => S.inv[k] -= v);
  const b = { id: bp.id, x, z, rot: a + Math.PI / 2, on: bp.id === 'lamp' };
  S.built.push(b);
  buildMesh(b); updateCables();
  addBuiltCollider(b); recalcCap();
  toast(bp.name + ' gebaut');
  closeBuild(true);
  const o = builtObjs[builtObjs.length - 1];
  if (bp.id !== 'dynamo' && bp.id !== 'battery' && !connected(o)) toast('⚠ Nicht angeschlossen: zu weit vom Dynamo');
  if (bp.id === 'dynamo' && !S.story.dynamo) { S.story.dynamo = true; say([['Sami', 'Ein altes Fahrrad, ein Dynamo aus einem Roller... Wenn das klappt, hab ich heute Nacht Wärme.']]); }
}

// ---------------------------------------------------------------- Interaktion
let pedaling = null;
function nearest() {
  const p = sami.g.position;
  const cands = [];
  scrapMeshes.forEach(s => cands.push({ d: Math.hypot(s.x - p.x, s.z - p.z), kind: 'scrap', s }));
  binMeshes.forEach(s => { if (!S.binsTaken.includes(s.i)) cands.push({ d: Math.hypot(s.x - p.x, s.z - p.z), kind: 'bin', s }); });
  builtObjs.forEach(o => cands.push({ d: Math.hypot(o.b.x - p.x, o.b.z - p.z), kind: o.b.id, o }));
  if (!S.carSearched) cands.push({ d: Math.hypot(12 - p.x, 2.2 - p.z) - 1.6, kind: 'car' });
  cands.push({ d: Math.hypot(-22 - p.x, 0 - p.z) - 0.5, kind: 'kiosk' });
  cands.sort((a, b) => a.d - b.d);
  return cands[0] && cands[0].d < 1.6 ? cands[0] : null;
}
function promptFor(n) {
  if (!n) return '';
  switch (n.kind) {
    case 'scrap': return '<kbd>E</kbd>Schrott aufheben';
    case 'bin': return '<kbd>E</kbd>Mülltonne durchsuchen';
    case 'car': return '<kbd>E</kbd>Autowrack ausschlachten';
    case 'kiosk': return S.inv.muenzen >= 3 ? '<kbd>E</kbd>Essen kaufen (3 💰)' : 'Essen kostet 3 💰';
    case 'dynamo': return '<kbd>E</kbd>gedrückt halten = strampeln';
    case 'heater': return `<kbd>E</kbd>Heizlüfter ${n.o.b.on ? 'aus' : 'ein'}schalten` + (connected(n.o) ? '' : ' (nicht angeschlossen)');
    case 'lamp': return `<kbd>E</kbd>Lampe ${n.o.b.on ? 'aus' : 'ein'}schalten`;
    case 'charger': return connected(n.o) ? 'Ladestation: Passanten kommen von selbst' : 'Ladestation: nicht angeschlossen';
    case 'battery': case 'cell': return nearDynamo(n.o) ? `Speicher: ${Math.floor(S.volt)}/${S.cap} ⚡` : 'Batterie: nicht mit einem Dynamo verbunden';
    case 'dynamo_x': return '';
  }
  return '';
}
function loot(table) {
  const got = [];
  table.forEach(([item, chance, n]) => { if (Math.random() < chance) { S.inv[item] += n; got.push(`+${n} ${ITEM_NAMES[item]}`); } });
  return got;
}
function interact(n) {
  if (!n) return;
  switch (n.kind) {
    case 'scrap': {
      S.scrapTaken.push(n.s.i); scene.remove(n.s.g); scrapMeshes = scrapMeshes.filter(s => s !== n.s);
      const got = loot([['schrott', 1, 1], ['schrott', 0.5, 1], ['kabel', 0.6, 1], ['metall', 0.4, 1]]);
      toast(got.join('  ') || '+1 Schrott'); break;
    }
    case 'bin': {
      S.binsTaken.push(n.s.i);
      const got = loot([['essen', 0.55, 1], ['kabel', 0.5, 1], ['metall', 0.35, 1], ['muenzen', 0.25, 1]]);
      toast(got.length ? got.join('  ') : 'Nichts drin...'); n.s.g.children[1].rotation.z = 0.6; n.s.g.children[1].position.x = 0.3; break;
    }
    case 'car':
      S.carSearched = true; S.inv.autobatterie += 1; S.inv.kabel += 2; S.inv.metall += 1;
      toast('+1 🔋 Autobatterie  +2 Kabel  +1 Metall');
      say([['Sami', 'Eine Autobatterie! Damit könnte ich Strom speichern, statt die ganze Nacht zu strampeln.']]); break;
    case 'kiosk':
      if (S.inv.muenzen >= 3) { S.inv.muenzen -= 3; S.food = clamp(S.food + 40, 0, 100); toast('+40 🍞  Warme Suppe'); if (!S.story.kiosk) { S.story.kiosk = true; say([['Kioskbesitzer', 'Strom von BlackGrid ist teuer, Kumpel. Die Suppe auch.'], ['Sami', 'Irgendwann hab ich meinen eigenen Strom. Dann reden wir nochmal.']]); } }
      else toast('Du hast nicht genug Münzen'); break;
    case 'heater': case 'lamp':
      n.o.b.on = !n.o.b.on; break;
  }
}
function eatIfNeeded() {
  if (keys.f && S.inv.essen > 0 && S.food < 95) { keys.f = false; S.inv.essen--; S.food = clamp(S.food + 30, 0, 100); toast('+30 🍞  Dose gegessen'); }
}

// ---------------------------------------------------------------- Bewegung
function blocked(x, z, r) {
  return W.colliders.some(c => x > c.minX - r && x < c.maxX + r && z > c.minZ - r && z < c.maxZ + r)
      || W.circles.some(c => Math.hypot(x - c.x, z - c.z) < c.r + r);
}
// Gebaute Objekte blockieren nur ihre echte Grundfläche (z. B. ein dünner Lampenmast)
const FOOTPRINT = { lamp: [[0, 0.1]], heater: [[0, 0.42]], charger: [[0, 0.4]], cell: [[0, 0.3]],
  dynamo: [[-0.5, 0.28], [0, 0.28], [0.5, 0.28]], battery: [[-0.55, 0.3], [0, 0.3], [0.55, 0.3]] };
function addBuiltCollider(b) {
  (FOOTPRINT[b.id] || [[0, 0.4]]).forEach(([off, r]) => {
    const rot = b.rot || 0; // lokale x-Achse der Gruppe
    W.circles.push({ x: b.x + Math.cos(rot) * off, z: b.z - Math.sin(rot) * off, r });
  });
}
function updateSami(dt) {
  const n = nearest();
  // Strampeln
  if (n && n.kind === 'dynamo' && eHeld) {
    if (!pedaling) { pedaling = n.o; }
  } else if (!eHeld && pedaling) {
    const o = pedaling; pedaling = null;
    sami.g.position.set(o.b.x + Math.sin(o.b.rot + Math.PI / 2) * 1.3, 0, o.b.z + Math.cos(o.b.rot + Math.PI / 2) * 1.3);
  }
  if (pedaling) {
    const o = pedaling;
    sami.g.position.set(o.b.x - Math.sin(o.b.rot) * 0.35, 0.35, o.b.z - Math.cos(o.b.rot) * 0.35);
    sami.g.rotation.y = o.b.rot + Math.PI / 2;
    sami.phase += dt * 14;
    sami.hipL.rotation.x = -1.2 + Math.sin(sami.phase) * 0.5; sami.hipR.rotation.x = -1.2 - Math.sin(sami.phase) * 0.5;
    sami.shL.rotation.x = sami.shR.rotation.x = -1.1;
    o.wheel.rotation.x += dt * 14;
    const mult = dynamoCount(o);
    S.volt = Math.min(S.cap, S.volt + dt * 7 * mult);
    o.mult = mult;
    S.food = Math.max(0, S.food - dt * 0.6);
    S.warmth = Math.min(100, S.warmth + dt * 0.35); // Bewegung hält warm
    return;
  }
  // Springen und Schwerkraft
  const onGround = sami.g.position.y <= 0.001;
  if (jumpPressed && onGround) { vy = 6.2; S.food = Math.max(0, S.food - 0.3); }
  jumpPressed = false;
  vy -= 18 * dt;
  sami.g.position.y = Math.max(0, sami.g.position.y + vy * dt);
  if (sami.g.position.y === 0) vy = 0;
  let ix = 0, iz = 0;
  if (keys.w || keys.arrowup) iz -= 1; if (keys.s || keys.arrowdown) iz += 1;
  if (keys.a || keys.arrowleft) ix -= 1; if (keys.d || keys.arrowright) ix += 1;
  const len = Math.hypot(ix, iz);
  const moving = len > 0;
  if (moving) {
    ix /= len; iz /= len;
    // relativ zur Kamera
    const cs = Math.cos(camYaw), sn = Math.sin(camYaw);
    const wx = ix * cs + iz * sn, wz = -ix * sn + iz * cs;
    const fast = sprinting || keys.shift;
    const speed = fast ? 7 : 4.2;
    const p = sami.g.position;
    const nx = p.x + wx * speed * dt, nz = p.z + wz * speed * dt;
    if (!blocked(nx, p.z, 0.35)) p.x = clamp(nx, -48, 48);
    if (!blocked(p.x, nz, 0.35)) p.z = clamp(nz, -12.5, 12.5);
    sami.g.rotation.y = lerpAngle(sami.g.rotation.y, Math.atan2(wx, wz), 1 - Math.exp(-dt * 14));
    if (fast) S.food = Math.max(0, S.food - dt * 0.15);
  }
  if (sami.g.position.y > 0) { sami.hipL.rotation.x = -0.5; sami.hipR.rotation.x = 0.3; sami.shL.rotation.x = sami.shR.rotation.x = -2.6; }
  else walkAnim(sami, moving, dt, (sprinting || keys.shift) ? 15 : 10);
  if (ePressed) interact(n);
}

// ---------------------------------------------------------------- Überleben
function isNight() { return S.time >= 19 || S.time < 6.5; }
function ambientTemp() {
  // -9°C nachts, +3°C mittags
  const t = S.time;
  const day = Math.cos((t - 14) / 24 * Math.PI * 2);
  return Math.round(-3 + day * 6 - (isNight() ? 3 : 0));
}
function updateSurvival(dt) {
  // Zeit: ein Spieltag dauert 6 Minuten
  const prevNight = isNight();
  S.time += dt * (24 / 360);
  if (S.time >= 24) { S.time -= 24; }
  if (prevNight && !isNight()) morning();
  if (!prevNight && isNight()) nightfall();

  // Strom verbrauchen
  let draw = 0;
  builtObjs.forEach(o => {
    const powered = (o.b.id === 'heater' || o.b.id === 'lamp') && o.b.on && connected(o) && S.volt > 0;
    if (o.b.id === 'heater') { draw += powered ? 1.2 : 0; o.grill.material.emissiveIntensity = powered ? 0.9 + Math.sin(performance.now() / 120) * 0.1 : 0; o.light.intensity = powered ? 1.4 : 0; o.powered = powered; }
    if (o.b.id === 'lamp') { draw += powered ? 0.2 : 0; o.bulb.material.emissiveIntensity = powered ? 1 : 0; o.light.intensity = powered ? 1.2 : 0; }
    if (o.b.id === 'battery' || o.b.id === 'cell') o.ind.scale.x = Math.max(0.02, S.volt / S.cap);
  });
  S.volt = Math.max(0, S.volt - draw * dt);

  // Wärme
  const temp = ambientTemp();
  let warmDelta = temp < 0 ? temp * 0.11 : -0.15;      // Kälte zieht Wärme ab
  const p = sami.g.position;
  const heat = builtObjs.some(o => o.b.id === 'heater' && o.powered && Math.hypot(o.b.x - p.x, o.b.z - p.z) < 3.5);
  if (heat) warmDelta = 2.2;
  if (p.z < -4 && Math.abs(p.x) < 4.5) warmDelta *= 0.7;  // Gasse schützt vor Wind
  if (S.food <= 0) warmDelta -= 0.5;
  S.warmth = clamp(S.warmth + warmDelta * dt, 0, 100);
  S.food = clamp(S.food - dt * 0.18, 0, 100);
  eatIfNeeded();

  $('vignette').style.opacity = S.warmth < 35 ? (1 - S.warmth / 35) : 0;
  if (S.warmth <= 0) die();
}
function morning() {
  S.nightsSurvived++; S.day++;
  S.scrapTaken = []; S.binsTaken = []; spawnScrap(); spawnBins();
  toast('☀ Tag ' + S.day + ' – du hast die Nacht überlebt');
  if (S.quest === 4) advanceQuest();
  if (S.nightsSurvived === 1) say([['Sami', 'Ich lebe noch. Zum ersten Mal seit Wochen war mir nachts nicht kalt.'], ['Sami', 'Leute laufen hier mit leeren Handys rum, weil keiner Strom hat... Strom ist hier mehr wert als Geld.']]);
  if (S.nightsSurvived >= 3 && !S.story.win) {
    S.story.win = true; running = false; if (document.exitPointerLock) document.exitPointerLock();
    $('wintext').textContent = `Drei Nächte überlebt. Sami hat ${S.built.length} Dinge gebaut und ${S.inv.muenzen} Münzen. Als Nächstes: der Hinterhof, das Dach und das erste eigene Stromnetz für die Nachbarn. Das kommt in Stufe 2.`;
    $('win').hidden = false;
  }
  checkpoint = JSON.stringify(S);
  persist();
}
function nightfall() {
  toast('🌙 Die Nacht beginnt. Es wird eiskalt.');
  if (S.day === 1) say([['Sami', 'Die Sonne ist weg. Jetzt wird es richtig kalt... ich muss in der Nähe vom Heizlüfter bleiben.']]);
}
function die() {
  running = false; if (document.exitPointerLock) document.exitPointerLock();
  $('deadtitle').textContent = S.food <= 0 ? 'Sami ist vor Hunger und Kälte zusammengebrochen.' : 'Sami ist erfroren.';
  $('deadtext').textContent = 'Ohne Strom keine Wärme. Tipp: Strample tagsüber Strom auf Vorrat und halte den Heizlüfter nachts an.';
  $('dead').hidden = false;
}

// ---------------------------------------------------------------- Licht, Himmel
const SKY_DAY = new THREE.Color(0x8fa3b8), SKY_DUSK = new THREE.Color(0x6a4a5a), SKY_NIGHT = new THREE.Color(0x05070d);
function updateSky() {
  const t = S.time;
  let k; // 1 = Tag, 0 = Nacht
  if (t >= 7.5 && t <= 17.5) k = 1;
  else if (t > 17.5 && t < 19.5) k = 1 - (t - 17.5) / 2;
  else if (t > 5.5 && t < 7.5) k = (t - 5.5) / 2;
  else k = 0;
  const sky = k > 0.5 ? SKY_DUSK.clone().lerp(SKY_DAY, (k - 0.5) * 2) : SKY_NIGHT.clone().lerp(SKY_DUSK, k * 2);
  scene.background = sky; scene.fog.color.copy(sky);
  scene.fog.near = 10 + k * 20; scene.fog.far = 40 + k * 40;
  hemi.intensity = 0.07 + k * 0.5;
  sun.intensity = 0.04 + k * 0.7;
  sun.color.setHex(k > 0.3 ? 0xffe2b0 : 0x6f86c8);
  const p = sami.g.position;
  const ang = (t / 24) * Math.PI * 2;
  sun.position.set(p.x + Math.cos(ang) * 20, 25, p.z + 10); sun.target.position.set(p.x, 0, p.z);
  litWindows.forEach(w => w.material.emissiveIntensity = 0.25 + (1 - k) * 0.9);
}

// ---------------------------------------------------------------- HUD
function bar(id, v, max = 100, label) {
  const el = $(id); el.querySelector('i').style.width = (v / max * 100) + '%'; el.querySelector('b').textContent = label || Math.round(v);
  el.classList.toggle('low', v / max < 0.25 && id !== 'st-volt');
}
let toastT = null;
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 2200); }
function updateHUD() {
  bar('st-warm', S.warmth); bar('st-food', S.food); bar('st-volt', S.volt, S.cap, Math.floor(S.volt) + '/' + S.cap);
  const h = Math.floor(S.time), m = Math.floor((S.time - h) * 60);
  $('time').textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  $('day').textContent = 'Tag ' + S.day + (isNight() ? ' · Nacht' : '');
  $('temp').textContent = ambientTemp() + ' °C';
  $('inv').innerHTML = Object.entries(S.inv).map(([k, v]) => `<span>${ITEM_NAMES[k]} <b>${v}</b></span>`).join('') + (S.inv.essen ? '<span style="grid-column:span 2;color:#a59f90;font-size:11px"><kbd>F</kbd>essen</span>' : '');
  const q = QUESTS[Math.min(S.quest, QUESTS.length - 1)];
  $('questtext').textContent = q.t();
  if (q.done() && S.quest < QUESTS.length - 1) advanceQuest();
  const n = pedaling ? null : nearest();
  const pr = pedaling ? `⚡ Strampeln${pedaling.mult > 1 ? ' – ' + pedaling.mult + ' Dynamos = ' + pedaling.mult + '× Strom' : ''}... E loslassen zum Absteigen` + (S.volt >= S.cap - 0.5 ? ' (Speicher voll! Baue eine Batterie)' : '') : promptFor(n);
  $('prompt').innerHTML = pr; $('prompt').hidden = !pr;
  if (!$('build').hidden) refreshBuild();
}

// ---------------------------------------------------------------- Kamera
function updateCamera(dt) {
  const p = sami.g.position;
  const target = new THREE.Vector3(p.x, 1.4, p.z);
  const off = new THREE.Vector3(Math.sin(camYaw) * Math.cos(camPitch), Math.sin(camPitch), Math.cos(camYaw) * Math.cos(camPitch)).multiplyScalar(camDist);
  camera.position.lerp(target.clone().add(off), 1 - Math.exp(-dt * 8));
  camera.lookAt(target);
}

// ---------------------------------------------------------------- Schleife
let running = false, last = performance.now(), saveT = 0, hudT = 0;
function persist() { store.set('save', S); }
function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 20); last = now;
  if (S) {
    if (running && !dlg) {
      updateSami(dt); updateSurvival(dt); updateWalkers(dt);
      saveT += dt; if (saveT > 5) { saveT = 0; persist(); }
    }
    ePressed = false;
    updateSky();
    hudT += dt; if (hudT > 0.1) { hudT = 0; updateHUD(); }
    // Schnee
    const pa = snowGeo.attributes.position.array, p = sami.g.position;
    for (let i = 0; i < SNOW; i++) {
      pa[i * 3 + 1] -= dt * 1.6; pa[i * 3] += Math.sin(now / 900 + i) * dt * 0.3;
      if (pa[i * 3 + 1] < 0) { pa[i * 3 + 1] = 22; pa[i * 3] = p.x + rand(-35, 35); pa[i * 3 + 2] = p.z + rand(-25, 25); }
    }
    snowGeo.attributes.position.needsUpdate = true;
    scrapMeshes.forEach(s => { s.glint.material.color.setHSL(0.13, 1, 0.6 + Math.sin(now / 200 + s.i) * 0.3); });
    updateCamera(dt);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function startGame(fresh) {
  S = fresh ? freshState() : (store.get('save', null) || freshState());
  spawnScrap(); spawnBins(); rebuildAll();
  W.circles = []; S.built.forEach(addBuiltCollider); recalcCap();
  if (S.carSearched) {}
  checkpoint = JSON.stringify(S);
  ['stats', 'clock', 'inv', 'quest', 'hint'].forEach(id => $(id).hidden = false);
  $('title').hidden = true;
  running = true;
  $('lockhint').hidden = false;
  if (fresh || !S.story.intro) {
    S.story.intro = true;
    say([
      ['', 'Seit dem großen Stromausfall ist die Stadt dunkel. Nur wer BlackGrid bezahlt, hat noch Licht und Heizung.'],
      ['Sami', 'Zwei Jahre auf der Straße. Aber so kalt war es noch nie.'],
      ['Sami', 'Wenn ich diesen Winter überleben will, brauche ich Strom. Und Strom kann man bauen... aus Schrott.'],
    ]);
  }
}
$('startbtn').addEventListener('click', () => startGame(!store.get('save', null)));
$('retrybtn').addEventListener('click', () => {
  $('dead').hidden = true;
  S = JSON.parse(checkpoint);
  S.warmth = Math.max(S.warmth, 60); S.food = Math.max(S.food, 50);
  // Welt passend zum Checkpoint neu aufbauen
  W.colliders = W.colliders.slice(0, baseColliders);
  spawnScrap(); spawnBins(); rebuildAll(); W.circles = []; S.built.forEach(addBuiltCollider); recalcCap();
  sami.g.position.set(-1.5, 0, -9);
  running = true;
});
$('winbtn').addEventListener('click', () => { $('win').hidden = true; running = true; });
const baseColliders = W.colliders.length;

S = freshState();
camera.position.set(6, 6, -2);
requestAnimationFrame(frame);
window.__s = { blocked, get S() { return S; }, get yaw() { return camYaw; }, sami, startGame, keys, interact, nearest, tryBuild: id => tryBuild(BLUEPRINTS.find(b => b.id === id)), setE: v => { eHeld = v; }, get running() { return running; } };
</script>
</body>
</html>
```
