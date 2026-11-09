/*
 * KOMET – Spiellogik und Darstellung (Canvas 2D).
 *
 * Koordinaten: Die sichtbare Höhe ist immer VIEW_H Einheiten, die Breite hängt
 * vom Bildschirm ab. y wächst nach unten, "nach oben fliegen" heißt also y wird kleiner.
 */
(function (K) {
  'use strict';

  var TAU = Math.PI * 2;
  var VIEW_H = 1000;
  var CAPTURE_TOL = 9;      // wie großzügig ein Planet einfängt
  var PERFECT_BAND = 20;    // wie nah am Ring man vorbeistreifen muss
  var COMET_R = 9;
  var MAX_FLIGHT = 3.2;     // Sekunden ohne Planet -> verloren

  // Farbwelten: alle 20 Planeten wechselt der Sektor.
  var SECTORS = [
    { top: '#0b1030', bottom: '#1b1747', neb: ['#3b2a8f', '#1f5f8b'], planets: ['#5eead4', '#a78bfa', '#f9a8d4', '#93c5fd'] },
    { top: '#170b2e', bottom: '#3a1240', neb: ['#8a2a6b', '#4c1d95'], planets: ['#fda4af', '#fcd34d', '#c4b5fd', '#f0abfc'] },
    { top: '#04161f', bottom: '#0b3a44', neb: ['#0e7490', '#155e75'], planets: ['#a7f3d0', '#fde68a', '#7dd3fc', '#fca5a5'] },
    { top: '#1a0d08', bottom: '#3d1a12', neb: ['#9a3412', '#7c2d12'], planets: ['#fed7aa', '#99f6e4', '#fbcfe8', '#ddd6fe'] },
    { top: '#07071a', bottom: '#20123d', neb: ['#5b21b6', '#be185d'], planets: ['#e9d5ff', '#67e8f9', '#fef08a', '#fda4af'] },
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { var c = hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function mixHex(a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b);
    var r = Math.round(lerp(x[0], y[0], t)), g = Math.round(lerp(x[1], y[1], t)), bl = Math.round(lerp(x[2], y[2], t));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  }
  function shade(hex, f) { return f < 0 ? mixHex(hex, '#000000', -f) : mixHex(hex, '#ffffff', f); }

  function Game(canvas, hooks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hooks = hooks || {};
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.skin = K.skins[0];
    this.autopilot = false;
    this.time = 0;
    this.resize();
    this.makeStarfield();
    this.reset();
  }

  var G = Game.prototype;

  // ---------------------------------------------------------------- Setup
  G.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = this.canvas.clientWidth || window.innerWidth;
    var h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.dpr = dpr;
    this.scale = (h * dpr) / VIEW_H;
    this.viewW = (w * dpr) / this.scale;
    this.colW = Math.min(this.viewW * 0.92, 780);
    this.sizeScale = this.viewW < 520 ? 0.88 : 1;
  };

  G.makeStarfield = function () {
    this.starLayers = [0.04, 0.1, 0.22].map(function (par, li) {
      var stars = [];
      var n = 70 - li * 15;
      for (var i = 0; i < n; i++) {
        stars.push({ x: Math.random(), y: Math.random(), r: rand(0.6, 1.4) + li * 0.5, tw: rand(0, TAU), sp: rand(0.8, 2.2) });
      }
      return { par: par, stars: stars };
    });
    this.nebulae = [];
    for (var i = 0; i < 4; i++) this.nebulae.push({ x: rand(-0.5, 0.5), y: rand(0, 1), r: rand(380, 620), c: i % 2 });
  };

  G.reset = function () {
    this.planets = [];
    this.stars = [];
    this.asteroids = [];
    this.particles = [];
    this.texts = [];
    this.trail = [];
    this.score = 0;
    this.maxIndex = 0;
    this.combo = 0;
    this.runStars = 0;
    this.perfects = 0;
    this.shake = 0;
    this.flash = 0;
    this.state = 'idle';
    this.autopilot = true;
    this.sectorIndex = 0;
    this.sectorBlend = 1;
    this.prevSector = 0;
    this.revived = false;
    this.deathTimer = 0;
    this.warnTick = 0;

    var p0 = this.makePlanet(0, { x: 0, y: 0 });
    p0.x = 0; p0.baseX = 0; p0.y = 0; p0.moving = false; p0.unstable = false;
    this.planets.push(p0);
    while (this.planets.length < 9) this.addNextPlanet();

    this.comet = { x: 0, y: 0, vx: 0, vy: 0, planet: p0, angle: Math.PI * 0.5, dir: 1, radius: p0.orbitR, flight: 0, from: null, alive: true, invuln: 0 };
    this.camY = p0.y - VIEW_H * 0.66;
    this.updateOrbitPosition(0);
  };

  G.difficulty = function (i) { return clamp(i / 70, 0, 1); };

  G.makePlanet = function (i, prev) {
    var d = this.difficulty(i);
    var r = lerp(rand(32, 46), rand(22, 32), d) * this.sizeScale;
    var orbitR = r + rand(34, 44) * this.sizeScale;
    var dy = lerp(250, 330, d) + rand(-25, 25);
    var half = Math.max(20, this.colW / 2 - orbitR - 12);
    var x = 0, tries = 0;
    do { x = rand(-half, half); tries++; } while (Math.abs(x - prev.x) < 70 && tries < 12);
    var sector = SECTORS[Math.floor(i / 20) % SECTORS.length];
    var p = {
      index: i, x: x, baseX: x, y: prev.y - dy, r: r, orbitR: orbitR,
      speed: lerp(290, 470, d) * rand(0.92, 1.08),
      color: pick(sector.planets), spin: rand(-0.4, 0.4), rot: rand(0, TAU),
      ring: Math.random() < 0.25, ringTilt: rand(-0.5, 0.5),
      craters: [], moving: false, unstable: false, fuse: 0, fuseMax: 0, active: false, dead: false, collapse: 0,
      visited: false,
    };
    for (var c = 0; c < 4; c++) p.craters.push({ a: rand(0, TAU), d: rand(0.1, 0.7), s: rand(0.12, 0.24) });
    if (i >= 6 && Math.random() < lerp(0.25, 0.5, d)) {
      p.moving = true;
      p.amp = Math.min(rand(50, 120), half);
      p.mspd = rand(0.7, 1.4) * lerp(1, 1.5, d);
      p.phase = rand(0, TAU);
      p.baseX = clamp(x, -half + p.amp, half - p.amp);
    }
    if (i >= 12 && Math.random() < lerp(0.2, 0.36, d)) {
      p.unstable = true;
      p.fuseMax = lerp(2.8, 1.7, d);
    }
    return p;
  };

  G.addNextPlanet = function () {
    var prev = this.planets[this.planets.length - 1];
    var p = this.makePlanet(prev.index + 1, prev);
    // Keine zwei instabilen Planeten direkt hintereinander.
    if (prev.unstable && p.unstable) p.unstable = false;
    this.planets.push(p);
    this.populateGap(prev, p);
  };

  // Sterne und Asteroiden zwischen zwei Planeten verteilen.
  G.populateGap = function (a, b) {
    var i = b.index;
    if (i > 1 && Math.random() < 0.75) {
      var n = Math.random() < 0.35 ? 3 : 1;
      var t0 = rand(0.35, 0.55), off = Math.random() < 0.6 ? 0 : rand(-90, 90);
      for (var k = 0; k < n; k++) {
        var t = t0 + (k - (n - 1) / 2) * 0.11;
        this.stars.push({ x: lerp(a.baseX, b.baseX, t) + off, y: lerp(a.y, b.y, t), taken: false, rot: rand(0, TAU), bob: rand(0, TAU) });
      }
    }
    if (i >= 16 && Math.random() < lerp(0.25, 0.55, this.difficulty(i))) {
      var y = (a.y + b.y) / 2;
      if (Math.abs(y - a.y) > a.orbitR + 30 && Math.abs(y - b.y) > b.orbitR + 30) {
        var verts = [], nv = 9, rr = rand(14, 22);
        for (var v = 0; v < nv; v++) verts.push(rr * rand(0.72, 1.12));
        this.asteroids.push({ x: rand(-this.colW / 2, this.colW / 2), y: y, r: rr, vx: rand(70, 150) * (Math.random() < 0.5 ? -1 : 1), rot: 0, rs: rand(-2, 2), verts: verts });
      }
    }
  };

  // ---------------------------------------------------------------- Steuerung
  G.start = function () {
    this.reset();
    this.state = 'playing';
    this.autopilot = false;
  };

  G.launch = function () {
    var c = this.comet;
    if ((this.state !== 'playing' && this.state !== 'idle') || !c.planet || !c.alive) return false;
    var p = c.planet;
    var tx = -Math.sin(c.angle) * c.dir, ty = Math.cos(c.angle) * c.dir;
    var spd = this.launchSpeed();
    c.vx = tx * spd; c.vy = ty * spd;
    c.from = p; c.planet = null; c.flight = 0;
    p.active = false;
    if (p.unstable && !p.dead) p.fuse = 0;
    for (var i = 0; i < 10; i++) this.spawnParticle(c.x, c.y, -tx * rand(40, 160) + rand(-40, 40), -ty * rand(40, 160) + rand(-40, 40), this.skin.tail[1], rand(0.3, 0.6), rand(2, 4));
    this.sfx('launch');
    return true;
  };

  G.sfx = function (name, arg) {
    if (this.state === 'idle' || !K.audio[name]) return;
    K.audio[name](arg);
  };

  G.launchSpeed = function () { return lerp(720, 900, this.difficulty(this.score)); };

  G.revive = function () {
    var target = null;
    for (var i = this.planets.length - 1; i >= 0; i--) {
      var p = this.planets[i];
      if (!p.dead && p.index <= this.maxIndex) { target = p; break; }
    }
    if (!target) target = this.planets.find(function (p) { return !p.dead; });
    var c = this.comet;
    c.alive = true; c.planet = target; c.from = null; c.radius = target.orbitR;
    c.angle = Math.PI * 0.5; c.dir = 1; c.invuln = 1.5; c.flight = 0;
    target.active = true;
    if (target.unstable) target.fuse = target.fuseMax + 1;
    // Asteroiden in der Nähe entfernen, damit man fair weiterspielt.
    this.asteroids = this.asteroids.filter(function (a) { return Math.abs(a.y - target.y) > 450; });
    this.trail = [];
    this.revived = true;
    this.state = 'playing';
    this.updateOrbitPosition(0);
    this.burst(c.x, c.y, '#ffffff', 26, 260);
  };

  // ---------------------------------------------------------------- Update
  G.update = function (dt) {
    this.time += dt;
    if (this.state === 'paused') return;
    var c = this.comet;

    // Planeten bewegen
    for (var i = 0; i < this.planets.length; i++) {
      var p = this.planets[i];
      p.rot += p.spin * dt;
      if (p.moving) p.x = p.baseX + Math.sin(this.time * p.mspd + p.phase) * p.amp;
      if (p.dead) p.collapse = Math.min(1, p.collapse + dt * 2.5);
    }
    for (var a = 0; a < this.asteroids.length; a++) {
      var ast = this.asteroids[a];
      ast.x += ast.vx * dt; ast.rot += ast.rs * dt;
      var lim = this.viewW / 2 + 40;
      if (ast.x > lim) ast.x = -lim; else if (ast.x < -lim) ast.x = lim;
    }

    if (c.alive) {
      if (c.invuln > 0) c.invuln -= dt;
      if (c.planet) this.updateOrbit(dt);
      else this.updateFlight(dt);
    } else if (this.state === 'dying') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.state = 'over';
        if (this.hooks.onGameOver) this.hooks.onGameOver(this.stats());
      }
    }

    // Kamera folgt dem aktuellen Planeten
    var focus = c.planet || c.from;
    if (focus && this.state !== 'over') {
      var target = focus.y - VIEW_H * 0.66;
      this.camY = lerp(this.camY, target, 1 - Math.exp(-dt * 3.2));
    }

    // Trail
    if (c.alive) {
      this.trail.push({ x: c.x, y: c.y });
      if (this.trail.length > 26) this.trail.shift();
    } else if (this.trail.length) this.trail.shift();

    // Partikel und Texte
    for (var k = this.particles.length - 1; k >= 0; k--) {
      var q = this.particles[k];
      q.life -= dt;
      if (q.life <= 0) { this.particles.splice(k, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.96; q.vy *= 0.96;
    }
    for (var m = this.texts.length - 1; m >= 0; m--) {
      var tx = this.texts[m];
      tx.life -= dt; tx.y -= 40 * dt;
      if (tx.life <= 0) this.texts.splice(m, 1);
    }
    this.shake = Math.max(0, this.shake - dt * 30);
    this.flash = Math.max(0, this.flash - dt * 2);
    if (this.sectorBlend < 1) this.sectorBlend = Math.min(1, this.sectorBlend + dt * 0.5);

    // Aufräumen und nachgenerieren
    var bottom = this.camY + VIEW_H + 500;
    var keepFrom = this.maxIndex - 2;
    this.planets = this.planets.filter(function (p) { return p.y < bottom || p.index >= keepFrom; });
    this.stars = this.stars.filter(function (s) { return s.y < bottom && !(s.taken && s.fade <= 0); });
    this.asteroids = this.asteroids.filter(function (s) { return s.y < bottom; });
    while (this.planets[this.planets.length - 1].y > this.camY - VIEW_H * 1.2) this.addNextPlanet();

    for (var s = 0; s < this.stars.length; s++) {
      var st = this.stars[s];
      st.rot += dt * 1.5; st.bob += dt * 2.5;
      if (st.taken) st.fade -= dt * 3;
    }
  };

  G.updateOrbitPosition = function () {
    var c = this.comet, p = c.planet;
    c.x = p.x + Math.cos(c.angle) * c.radius;
    c.y = p.y + Math.sin(c.angle) * c.radius;
  };

  G.updateOrbit = function (dt) {
    var c = this.comet, p = c.planet;
    c.radius = lerp(c.radius, p.orbitR, 1 - Math.exp(-dt * 10));
    var omega = p.speed / Math.max(c.radius, 1);
    if (this.state === 'idle') omega *= 0.6;
    c.angle += c.dir * omega * dt;
    this.updateOrbitPosition();

    if (p.unstable && this.state === 'playing') {
      p.fuse -= dt;
      this.warnTick -= dt;
      if (p.fuse < p.fuseMax * 0.5 && this.warnTick <= 0) { this.sfx('warn'); this.warnTick = 0.25; }
      if (p.fuse <= 0) {
        p.dead = true;
        this.burst(p.x, p.y, '#ff6b5b', 30, 300);
        this.die();
        return;
      }
    }
    if (this.autopilot) this.autopilotThink();
  };

  G.updateFlight = function (dt) {
    var c = this.comet;
    c.flight += dt;
    var dist = Math.hypot(c.vx, c.vy) * dt;
    var steps = Math.max(1, Math.ceil(dist / 6));
    var h = dt / steps;
    for (var s = 0; s < steps; s++) {
      c.x += c.vx * h; c.y += c.vy * h;
      if (this.checkCapture()) return;
      if (this.checkStars()) { /* weiter */ }
      if (c.invuln <= 0 && this.checkAsteroids()) return;
    }
    if (Math.random() < 0.6) this.spawnParticle(c.x, c.y, rand(-30, 30) - c.vx * 0.08, rand(-30, 30) - c.vy * 0.08, pick(this.skin.tail), rand(0.25, 0.5), rand(1.5, 3));

    var sx = c.x + this.viewW / 2, sy = c.y - this.camY;
    var out = sx < -50 || sx > this.viewW + 50 || sy < -60 || sy > VIEW_H + 60;
    if (out || c.flight > MAX_FLIGHT) this.die();
  };

  G.checkCapture = function () {
    var c = this.comet;
    for (var i = 0; i < this.planets.length; i++) {
      var p = this.planets[i];
      if (p === c.from || p.dead) continue;
      var dx = c.x - p.x, dy = c.y - p.y;
      var d = Math.hypot(dx, dy);
      if (d <= p.orbitR + CAPTURE_TOL) { this.capture(p, dx, dy, d); return true; }
    }
    return false;
  };

  G.capture = function (p, dx, dy, d) {
    var c = this.comet;
    var cross = dx * c.vy - dy * c.vx;
    var speed = Math.hypot(c.vx, c.vy) || 1;
    var b = Math.abs(cross) / speed; // kürzester Abstand der Flugbahn zum Planetenzentrum
    c.dir = cross >= 0 ? 1 : -1;
    c.angle = Math.atan2(dy, dx);
    c.radius = d;
    c.planet = p; c.from = null;
    p.active = true;

    var isNew = p.index > this.maxIndex;
    var perfect = isNew && b >= p.orbitR - PERFECT_BAND;
    var points = 0;
    if (isNew) {
      points = p.index - this.maxIndex;
      this.maxIndex = p.index;
      if (perfect) { this.combo++; this.perfects++; points += this.combo; }
      else this.combo = 0;
      this.score += points;
      if (p.unstable) { p.fuse = p.fuseMax; this.warnTick = 0; }
    } else if (p.unstable) {
      p.fuse = Math.max(p.fuse, 0.9); // Rückkehr zu einem instabilen Planeten: kurze Gnadenfrist
    }

    this.burst(c.x, c.y, perfect ? '#ffffff' : p.color, perfect ? 22 : 12, perfect ? 240 : 150);
    if (perfect) {
      this.addText(c.x, c.y - 30, K.i18n.t('perfect') + (this.combo > 1 ? ' x' + this.combo : ''), '#fff4d6', 1.1, 30);
      this.flash = 0.25;
      this.sfx('perfect', this.combo);
    } else {
      this.sfx('capture', Math.min(p.index % 6, 5));
    }
    if (points > 0) this.addText(p.x, p.y - p.orbitR - 18, '+' + points, perfect ? '#ffcf6b' : '#e6e9ff', 0.9, 24);
    if (p.unstable && isNew) this.addText(p.x, p.y + p.orbitR + 34, K.i18n.t('unstable'), '#ff8a80', 1.3, 18);

    var sector = Math.floor(this.maxIndex / 20);
    if (sector !== this.sectorIndex) {
      this.prevSector = this.sectorIndex; this.sectorIndex = sector; this.sectorBlend = 0;
      this.addText(p.x, p.y - p.orbitR - 60, K.i18n.t('sector', { n: sector + 1 }), '#ffffff', 2.2, 34);
      this.sfx('milestone');
    }
    if (this.hooks.onScore && points > 0 && this.state === 'playing') this.hooks.onScore(this.score, { perfect: perfect, combo: this.combo });
  };

  G.checkStars = function () {
    var c = this.comet, got = false;
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      if (s.taken) continue;
      if (Math.hypot(c.x - s.x, c.y - s.y) < 28) {
        s.taken = true; s.fade = 1; got = true;
        this.runStars++;
        this.burst(s.x, s.y, '#ffd36b', 8, 120);
        this.sfx('star');
        if (this.hooks.onStar && this.state === 'playing') this.hooks.onStar(this.runStars);
      }
    }
    return got;
  };

  G.checkAsteroids = function () {
    var c = this.comet;
    for (var i = 0; i < this.asteroids.length; i++) {
      var a = this.asteroids[i];
      if (Math.hypot(c.x - a.x, c.y - a.y) < a.r * 0.85 + COMET_R) {
        this.burst(a.x, a.y, '#b8a99a', 16, 200);
        this.asteroids.splice(i, 1);
        this.die();
        return true;
      }
    }
    return false;
  };

  G.die = function () {
    var c = this.comet;
    if (!c.alive) return;
    if (this.state === 'idle') { this.reset(); return; }
    c.alive = false;
    if (c.planet) c.planet.active = false;
    c.planet = null;
    this.combo = 0;
    this.burst(c.x, c.y, this.skin.tail[0], 40, 380);
    this.burst(c.x, c.y, '#ffffff', 14, 200);
    this.shake = this.reducedMotion ? 4 : 18;
    this.state = 'dying';
    this.deathTimer = 0.9;
    this.sfx('death');
    if (this.hooks.onDeath) this.hooks.onDeath();
  };

  G.stats = function () {
    return { score: this.score, stars: this.runStars, perfects: this.perfects, revived: this.revived };
  };

  // Einfacher Bot für Menü-Hintergrund und automatische Tests.
  G.autopilotThink = function () {
    var c = this.comet, p = c.planet;
    var next = null;
    for (var i = 0; i < this.planets.length; i++) if (this.planets[i].index === p.index + 1) { next = this.planets[i]; break; }
    if (!next || next.dead) return;
    var tx = -Math.sin(c.angle) * c.dir, ty = Math.cos(c.angle) * c.dir;
    var spd = this.launchSpeed();
    var nx = next.x;
    for (var it = 0; it < 2; it++) {
      var along = (nx - c.x) * tx + (next.y - c.y) * ty;
      if (along <= 0) return;
      if (next.moving) nx = next.baseX + Math.sin((this.time + along / spd) * next.mspd + next.phase) * next.amp;
    }
    var rx = nx - c.x, ry = next.y - c.y;
    var along2 = rx * tx + ry * ty;
    var perp = Math.abs(rx * ty - ry * tx);
    if (along2 > 0 && perp < next.orbitR - 6) {
      var t = along2 / spd;
      var safe = this.asteroids.every(function (a) {
        var ax = c.x + tx * spd * t * 0.5, ay = c.y + ty * spd * t * 0.5;
        return Math.abs(ay - a.y) > 60 || Math.abs(ax - a.x) > 80;
      });
      if (safe || (p.unstable && p.fuse < 0.6)) {
        this.launch();
      }
    }
  };

  // ---------------------------------------------------------------- Effekte
  G.spawnParticle = function (x, y, vx, vy, color, life, size) {
    if (this.particles.length > 400) return;
    this.particles.push({ x: x, y: y, vx: vx, vy: vy, color: color, life: life, max: life, size: size });
  };
  G.burst = function (x, y, color, n, spd) {
    if (this.reducedMotion) n = Math.ceil(n / 2);
    for (var i = 0; i < n; i++) {
      var a = rand(0, TAU), v = rand(0.3, 1) * spd;
      this.spawnParticle(x, y, Math.cos(a) * v, Math.sin(a) * v, color, rand(0.4, 0.9), rand(1.5, 4));
    }
  };
  G.addText = function (x, y, text, color, life, size) {
    if (this.state === 'idle') return;
    this.texts.push({ x: x, y: y, text: text, color: color, life: life, max: life, size: size });
  };

  // ---------------------------------------------------------------- Rendern
  G.render = function () {
    var ctx = this.ctx, S = this.scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawBackground();

    var sx = 0, sy = 0;
    if (this.shake > 0) { sx = rand(-1, 1) * this.shake; sy = rand(-1, 1) * this.shake; }
    ctx.setTransform(S, 0, 0, S, (this.viewW / 2 + sx) * S, (-this.camY + sy) * S);

    this.drawPlanets();
    this.drawStars();
    this.drawAsteroids();
    this.drawAim();
    this.drawTrail();
    this.drawComet();
    this.drawParticles();
    this.drawTexts();

    if (this.flash > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = 'rgba(255,244,214,' + (this.flash * 0.18) + ')';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  G.sectorColors = function () {
    var a = SECTORS[this.prevSector % SECTORS.length], b = SECTORS[this.sectorIndex % SECTORS.length];
    var t = this.sectorBlend;
    return {
      top: mixHex(a.top, b.top, t), bottom: mixHex(a.bottom, b.bottom, t),
      neb0: mixHex(a.neb[0], b.neb[0], t), neb1: mixHex(a.neb[1], b.neb[1], t),
    };
  };

  G.drawBackground = function () {
    var ctx = this.ctx, W = this.canvas.width, H = this.canvas.height, S = this.scale;
    var col = this.sectorColors();
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, col.top); g.addColorStop(1, col.bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Nebel mit leichter Parallaxe
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < this.nebulae.length; i++) {
      var n = this.nebulae[i];
      var span = VIEW_H * 1.6;
      var y = ((n.y * span - this.camY * 0.08) % span + span) % span - VIEW_H * 0.3;
      var x = this.viewW / 2 + n.x * this.viewW;
      var rg = ctx.createRadialGradient(x * S, y * S, 0, x * S, y * S, n.r * S);
      var c = n.c ? col.neb1 : col.neb0;
      rg.addColorStop(0, rgba(c, 0.32)); rg.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }

    // Sternenfeld in drei Ebenen
    for (var l = 0; l < this.starLayers.length; l++) {
      var layer = this.starLayers[l];
      var off = -this.camY * layer.par;
      for (var k = 0; k < layer.stars.length; k++) {
        var s = layer.stars[k];
        var py = ((s.y * VIEW_H + off) % VIEW_H + VIEW_H) % VIEW_H;
        var px = s.x * this.viewW;
        var a = 0.35 + 0.35 * Math.sin(this.time * s.sp + s.tw);
        ctx.fillStyle = 'rgba(230,236,255,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(px * S, py * S, s.r * S, 0, TAU); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  G.drawPlanets = function () {
    var ctx = this.ctx, top = this.camY - 150, bottom = this.camY + VIEW_H + 150;
    for (var i = 0; i < this.planets.length; i++) {
      var p = this.planets[i];
      if (p.y < top || p.y > bottom) continue;
      var collapse = p.dead ? p.collapse : 0;
      if (collapse >= 1) continue;
      var r = p.r * (1 - collapse);
      var color = p.unstable ? mixHex(p.color, '#ff5a4f', 0.55 + 0.25 * Math.sin(this.time * 8)) : p.color;
      var isNext = p.index === this.maxIndex + 1;

      // Orbit-Ring
      ctx.save();
      ctx.lineWidth = p.active ? 2.5 : 2;
      ctx.strokeStyle = p.active ? rgba('#ffffff', 0.4) : rgba(color, isNext ? 0.55 : 0.28);
      ctx.setLineDash([6, 10]);
      ctx.lineDashOffset = -this.time * 20;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.orbitR * (1 - collapse), 0, TAU); ctx.stroke();
      ctx.restore();

      // Atmosphäre
      var glow = ctx.createRadialGradient(p.x, p.y, r * 0.8, p.x, p.y, r * 1.9);
      glow.addColorStop(0, rgba(color, 0.35)); glow.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.9, 0, TAU); ctx.fill();

      // Ring hinten
      if (p.ring) this.drawPlanetRing(p, r, color, true);

      // Körper
      var body = ctx.createRadialGradient(p.x - r * 0.4, p.y - r * 0.45, r * 0.1, p.x, p.y, r);
      body.addColorStop(0, shade(color, 0.45)); body.addColorStop(0.55, color); body.addColorStop(1, shade(color, -0.55));
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();

      // Krater (drehen sich mit)
      ctx.save();
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.clip();
      ctx.fillStyle = rgba(shade(color, -0.45), 0.35);
      for (var c = 0; c < p.craters.length; c++) {
        var cr = p.craters[c];
        var a = cr.a + p.rot;
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(a) * cr.d * r, p.y + Math.sin(a) * cr.d * r, cr.s * r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      if (p.ring) this.drawPlanetRing(p, r, color, false);

      // Zündschnur instabiler Planeten
      if (p.unstable && p.active && !p.dead && this.state === 'playing') {
        var f = clamp(p.fuse / p.fuseMax, 0, 1);
        ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.strokeStyle = f < 0.35 ? '#ff5a4f' : '#ffb547';
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 9, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.stroke();
        ctx.lineCap = 'butt';
      }
    }
  };

  G.drawPlanetRing = function (p, r, color, back) {
    var ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.ringTilt);
    ctx.beginPath();
    if (back) ctx.ellipse(0, 0, r * 1.75, r * 0.45, 0, Math.PI, TAU);
    else ctx.ellipse(0, 0, r * 1.75, r * 0.45, 0, 0, Math.PI);
    ctx.lineWidth = r * 0.16;
    ctx.strokeStyle = rgba(shade(color, 0.3), back ? 0.45 : 0.8);
    ctx.stroke();
    ctx.restore();
  };

  G.drawStars = function () {
    var ctx = this.ctx;
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      var alpha = s.taken ? Math.max(0, s.fade) : 1;
      if (alpha <= 0) continue;
      var size = (s.taken ? 14 + (1 - s.fade) * 16 : 13) + Math.sin(s.bob) * 1.2;
      ctx.save();
      ctx.translate(s.x, s.y + Math.sin(s.bob) * 3);
      ctx.rotate(s.rot * 0.3);
      ctx.globalAlpha = alpha;
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.8);
      g.addColorStop(0, 'rgba(255,211,107,0.5)'); g.addColorStop(1, 'rgba(255,211,107,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, size * 1.8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffe29a';
      ctx.beginPath();
      for (var k = 0; k < 8; k++) {
        var rr = k % 2 === 0 ? size : size * 0.38;
        var a = (k / 8) * TAU;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  };

  G.drawAsteroids = function () {
    var ctx = this.ctx;
    for (var i = 0; i < this.asteroids.length; i++) {
      var a = this.asteroids[i];
      ctx.save();
      ctx.translate(a.x, a.y); ctx.rotate(a.rot);
      ctx.fillStyle = '#6b5d55'; ctx.strokeStyle = '#a8968a'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var v = 0; v < a.verts.length; v++) {
        var ang = (v / a.verts.length) * TAU;
        ctx.lineTo(Math.cos(ang) * a.verts[v], Math.sin(ang) * a.verts[v]);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(40,30,28,0.5)';
      ctx.beginPath(); ctx.arc(a.r * 0.25, -a.r * 0.2, a.r * 0.25, 0, TAU); ctx.fill();
      ctx.restore();
    }
  };

  G.drawAim = function () {
    var c = this.comet;
    if (!c.alive || !c.planet || this.state !== 'playing') return;
    var ctx = this.ctx;
    var tx = -Math.sin(c.angle) * c.dir, ty = Math.cos(c.angle) * c.dir;
    var len = this.tutorial ? 340 : 70;
    var g = ctx.createLinearGradient(c.x, c.y, c.x + tx * len, c.y + ty * len);
    g.addColorStop(0, 'rgba(255,244,214,0.55)'); g.addColorStop(1, 'rgba(255,244,214,0)');
    ctx.save();
    ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.setLineDash([3, 9]);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + tx * len, c.y + ty * len); ctx.stroke();
    ctx.restore();
  };

  G.tailColor = function (t) {
    var tail = this.skin.tail;
    if (this.skin.hueCycle) {
      var h = (this.time * 120 + t * 220) % 360;
      return 'hsl(' + h.toFixed(0) + ',95%,70%)';
    }
    return t < 0.5 ? mixHex(tail[0], tail[1], t * 2) : mixHex(tail[1], tail[2], (t - 0.5) * 2);
  };

  G.drawTrail = function () {
    var ctx = this.ctx, tr = this.trail, n = tr.length;
    if (n < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (var i = 1; i < n; i++) {
      var t = 1 - i / n; // 0 = Kopf, 1 = Ende
      var a = tr[i - 1], b = tr[i];
      ctx.strokeStyle = this.tailColor(t);
      ctx.globalAlpha = (1 - t) * 0.85;
      ctx.lineWidth = (1 - t) * COMET_R * 1.9 + 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.restore();
  };

  G.drawComet = function () {
    var c = this.comet, ctx = this.ctx;
    if (!c.alive) return;
    if (c.invuln > 0 && Math.floor(this.time * 12) % 2 === 0) return;
    var skin = this.skin;
    var glowColor = skin.hueCycle ? 'hsl(' + ((this.time * 120) % 360).toFixed(0) + ',95%,70%)' : skin.tail[0];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, COMET_R * 3.4);
    g.addColorStop(0, glowColor); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, COMET_R * 3.4, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = skin.head;
    ctx.beginPath(); ctx.arc(c.x, c.y, COMET_R, 0, TAU); ctx.fill();
    if (skin.outline) { ctx.strokeStyle = skin.outline; ctx.lineWidth = 2.5; ctx.stroke(); }
  };

  G.drawParticles = function () {
    var ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };

  G.drawTexts = function () {
    var ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < this.texts.length; i++) {
      var t = this.texts[i];
      var k = t.life / t.max;
      var pop = k > 0.85 ? 1 + (k - 0.85) * 2 : 1;
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.font = '800 ' + Math.round(t.size * pop) + 'px Unbounded, "Trebuchet MS", system-ui, sans-serif';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(8,10,30,0.55)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  };

  K.Game = Game;
})(window.Komet = window.Komet || {});
