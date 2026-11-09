/*
 * Sound komplett per WebAudio erzeugt – keine Audiodateien, keine Lizenzfragen.
 */
(function (K) {
  'use strict';
  var ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  var soundOn = K.storage.get('sound', true);
  var musicOn = K.storage.get('music', true);
  var suspendedByGame = false;
  var musicTimer = null, musicStep = 0, nextChordAt = 0;

  // Pentatonik in A-Moll – klingt immer harmonisch, egal welche Töne kombiniert werden.
  var SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];
  var CHORDS = [[110, 164.81, 220, 261.63], [87.31, 130.81, 174.61, 220], [98, 146.83, 196, 246.94], [82.41, 123.47, 164.81, 207.65]];

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = soundOn ? 1 : 0; sfxBus.connect(comp);
      musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.22 : 0; musicBus.connect(comp);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      startMusic();
    }
    if (ctx.state === 'suspended' && !suspendedByGame) ctx.resume();
    return true;
  }

  function tone(o) {
    if (!ctx || !soundOn) return;
    var t0 = ctx.currentTime + (o.delay || 0);
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t0 + o.dur);
    var vol = o.vol || 0.2;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + o.dur + 0.05);
  }

  function noise(o) {
    if (!ctx || !soundOn) return;
    var t0 = ctx.currentTime + (o.delay || 0);
    var src = ctx.createBufferSource(); src.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.from, t0);
    f.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + (o.attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t0); src.stop(t0 + o.dur + 0.05);
  }

  // ---- Musik: ruhige, generative Flächen + gelegentliche Glocken ----
  function startMusic() {
    if (musicTimer) return;
    nextChordAt = ctx.currentTime + 0.2;
    musicTimer = setInterval(scheduleMusic, 250);
  }

  function scheduleMusic() {
    if (!ctx || ctx.state !== 'running') return;
    while (nextChordAt < ctx.currentTime + 1.0) {
      var chord = CHORDS[musicStep % CHORDS.length];
      var dur = 6;
      chord.forEach(function (f, i) {
        var t0 = nextChordAt;
        var osc = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = f; osc.detune.value = (i % 2 ? 6 : -6);
        lp.type = 'lowpass'; lp.frequency.value = 900;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(i === 0 ? 0.35 : 0.16, t0 + 2.2);
        g.gain.linearRampToValueAtTime(0.0001, t0 + dur + 0.6);
        osc.connect(lp); lp.connect(g); g.connect(musicBus);
        osc.start(t0); osc.stop(t0 + dur + 0.8);
      });
      for (var k = 0; k < 3; k++) {
        if (Math.random() < 0.7) {
          tone({ freq: SCALE[(Math.random() * SCALE.length) | 0] * 2, type: 'sine', dur: 2.4, vol: 0.12,
                 attack: 0.01, delay: nextChordAt - ctx.currentTime + k * 1.9 + Math.random() * 0.4, bus: musicBus });
        }
      }
      nextChordAt += dur;
      musicStep++;
    }
  }

  K.audio = {
    unlock: ensure,
    get sound() { return soundOn; },
    get music() { return musicOn; },
    setSound: function (on) {
      soundOn = on; K.storage.set('sound', on);
      if (sfxBus) sfxBus.gain.value = on ? 1 : 0;
    },
    setMusic: function (on) {
      musicOn = on; K.storage.set('music', on);
      if (musicBus) musicBus.gain.setTargetAtTime(on ? 0.22 : 0, ctx.currentTime, 0.2);
    },
    // Für Werbepausen und Tab-Wechsel: alles stumm schalten.
    suspend: function () { suspendedByGame = true; if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume: function () { suspendedByGame = false; if (ctx && ctx.state === 'suspended') ctx.resume(); },

    launch: function () {
      noise({ from: 600, to: 2600, dur: 0.22, vol: 0.12, q: 0.8 });
      tone({ freq: 240, slideTo: 520, dur: 0.12, type: 'triangle', vol: 0.06 });
    },
    capture: function (combo) {
      var base = SCALE[Math.min(combo, SCALE.length - 3)];
      tone({ freq: base, dur: 0.22, type: 'triangle', vol: 0.2 });
      tone({ freq: base * 1.5, dur: 0.3, type: 'sine', vol: 0.1, delay: 0.05 });
    },
    perfect: function (combo) {
      var i = Math.min(combo + 2, SCALE.length - 3);
      tone({ freq: SCALE[i], dur: 0.25, type: 'triangle', vol: 0.18 });
      tone({ freq: SCALE[i + 1], dur: 0.3, type: 'triangle', vol: 0.15, delay: 0.06 });
      tone({ freq: SCALE[i + 2], dur: 0.6, type: 'sine', vol: 0.15, delay: 0.12 });
    },
    star: function () {
      tone({ freq: 1318, dur: 0.12, type: 'sine', vol: 0.12 });
      tone({ freq: 1975, dur: 0.18, type: 'sine', vol: 0.08, delay: 0.04 });
    },
    warn: function () { tone({ freq: 330, dur: 0.09, type: 'square', vol: 0.05 }); },
    death: function () {
      noise({ from: 1800, to: 80, dur: 0.9, vol: 0.35, q: 0.6, filter: 'lowpass', attack: 0.005 });
      tone({ freq: 180, slideTo: 40, dur: 0.7, type: 'sawtooth', vol: 0.08 });
    },
    milestone: function () {
      [0, 2, 4, 7].forEach(function (s, i) { tone({ freq: SCALE[s], dur: 0.5, type: 'triangle', vol: 0.12, delay: i * 0.08 }); });
    },
    click: function () { tone({ freq: 660, dur: 0.06, type: 'triangle', vol: 0.08 }); },
    buy: function () {
      [4, 6, 9].forEach(function (s, i) { tone({ freq: SCALE[s], dur: 0.25, type: 'sine', vol: 0.14, delay: i * 0.07 }); });
    },
  };
})(window.Komet = window.Komet || {});
