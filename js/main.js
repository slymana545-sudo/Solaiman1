/* KOMET – Menüs, Eingabe, Spielschleife. */
(function (K) {
  'use strict';
  var cfg = window.KOMET_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  var t = K.i18n.t;
  var query = new URLSearchParams(window.location.search);

  var save = {
    best: K.storage.get('best', 0),
    stars: K.storage.get('stars', 0),
    owned: K.storage.get('owned', ['classic']),
    skin: K.storage.get('skin', 'classic'),
    runs: K.storage.get('runs', 0),
  };
  function persist() {
    K.storage.set('best', save.best); K.storage.set('stars', save.stars);
    K.storage.set('owned', save.owned); K.storage.set('skin', save.skin); K.storage.set('runs', save.runs);
  }

  var screen = 'menu';
  var runsSinceAd = 0;
  var bestAtStart = 0;
  var bestAnnounced = false;

  var canvas = $('game');
  var game = new K.Game(canvas, {
    onScore: function (score, info) {
      $('hud-score').textContent = score;
      var el = $('hud-score').parentElement;
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      $('hud-combo').textContent = info.combo > 1 ? t('perfect') + ' x' + info.combo : '';
      if (score >= 1) { $('hint').hidden = true; if (score >= 3) game.tutorial = false; }
      if (!bestAnnounced && bestAtStart > 0 && score > bestAtStart) {
        bestAnnounced = true;
        toast(t('newBest'));
        K.platform.happyTime();
      }
    },
    onStar: function (n) { $('hud-stars').textContent = n; },
    onDeath: function () {
      K.platform.gameplayStop();
      try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) {}
    },
    onGameOver: function (stats) { showGameOver(stats); },
  });
  game.skin = K.skinById(save.skin);

  // ---------------------------------------------------------------- Screens
  function show(name) {
    screen = name;
    $('screen-menu').hidden = name !== 'menu';
    $('screen-pause').hidden = name !== 'pause';
    $('screen-over').hidden = name !== 'over';
    $('screen-shop').hidden = name !== 'shop';
    $('hud').hidden = !(name === 'play' || name === 'pause');
    if (name !== 'play') $('hint').hidden = true;
  }

  function refreshMenu() {
    $('menu-best').textContent = save.best;
    $('menu-stars').textContent = save.stars;
    $('lang-code').textContent = K.i18n.lang.toUpperCase();
    $('btn-sound').setAttribute('aria-pressed', String(K.audio.sound));
    $('btn-music').setAttribute('aria-pressed', String(K.audio.music));
  }

  function startRun() {
    K.audio.unlock();
    game.start();
    game.tutorial = save.runs < 2;
    if (query.has('autoplay')) game.autopilot = true;
    bestAtStart = save.best; bestAnnounced = false;
    $('hud-score').textContent = '0';
    $('hud-combo').textContent = '';
    $('hud-stars').textContent = '0';
    $('hint').hidden = !game.tutorial;
    show('play');
    K.platform.gameplayStart();
  }

  function showGameOver(stats) {
    save.runs++;
    save.stars += stats.stars;
    var isBest = stats.score > save.best;
    if (isBest) save.best = stats.score;
    persist();

    $('over-score').textContent = stats.score;
    $('over-best').hidden = !(isBest && stats.score > 0);
    $('over-best-val').textContent = save.best;
    $('over-stars').textContent = stats.stars;

    var canRevive = !stats.revived && stats.score > 0;
    $('btn-revive-ad').hidden = !(canRevive && K.platform.hasRewarded);
    var cost = cfg.reviveCost || 30;
    $('revive-stars-label').textContent = t('reviveStars', { n: cost });
    $('btn-revive-stars').hidden = !canRevive;
    $('btn-revive-stars').disabled = save.stars < cost;
    $('btn-share').hidden = !(K.platform.name === 'web' && (navigator.share || navigator.clipboard));
    show('over');
    $('btn-retry').focus({ preventScroll: true });
  }

  function doRevive() {
    K.audio.unlock();
    game.revive();
    show('play');
    K.platform.gameplayStart();
  }

  function goMenu() {
    K.platform.gameplayStop();
    game.reset();
    refreshMenu();
    show('menu');
  }

  function pause() {
    if (screen !== 'play' || game.state !== 'playing') return;
    game.state = 'paused';
    K.platform.gameplayStop();
    show('pause');
  }
  function resume() {
    if (screen !== 'pause') return;
    game.state = 'playing';
    show('play');
    K.platform.gameplayStart();
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 1800);
  }

  // ---------------------------------------------------------------- Shop
  function buildShop() {
    var grid = $('shop-grid');
    grid.innerHTML = '';
    $('shop-stars').textContent = save.stars;
    K.skins.forEach(function (skin) {
      var owned = save.owned.indexOf(skin.id) !== -1;
      var selected = save.skin === skin.id;
      var card = document.createElement('div');
      card.className = 'skin-card' + (selected ? ' selected' : '');
      var cv = document.createElement('canvas');
      cv.width = 300; cv.height = 200;
      drawSkinPreview(cv, skin);
      var name = document.createElement('div');
      name.className = 'name';
      name.textContent = skin.name[K.i18n.lang] || skin.name.en;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'skin-' + skin.id;
      if (selected) { btn.className = 'btn btn-ghost'; btn.textContent = t('equipped'); btn.disabled = true; }
      else if (owned) { btn.className = 'btn btn-ghost'; btn.textContent = t('equip'); }
      else { btn.className = 'btn btn-primary'; btn.textContent = '★ ' + skin.price; btn.disabled = save.stars < skin.price; if (btn.disabled) btn.title = t('notEnough'); }
      btn.addEventListener('click', function () {
        if (!owned) {
          if (save.stars < skin.price) return;
          save.stars -= skin.price;
          save.owned.push(skin.id);
          K.audio.buy();
        } else K.audio.click();
        save.skin = skin.id;
        game.skin = skin;
        persist();
        buildShop();
      });
      card.appendChild(cv); card.appendChild(name); card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function drawSkinPreview(cv, skin) {
    var c = cv.getContext('2d');
    c.fillStyle = '#0d1236'; c.fillRect(0, 0, cv.width, cv.height);
    for (var i = 0; i < 40; i++) {
      c.fillStyle = 'rgba(230,236,255,' + (Math.random() * 0.6 + 0.1).toFixed(2) + ')';
      c.fillRect(Math.random() * cv.width, Math.random() * cv.height, 1.6, 1.6);
    }
    var hx = 215, hy = 75;
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    var n = 26;
    for (var k = 0; k < n; k++) {
      var tt = k / n;
      var x0 = hx - tt * 170, y0 = hy + Math.sin(tt * 2.4) * 40 * tt + tt * 40;
      var tt2 = (k + 1) / n;
      var x1 = hx - tt2 * 170, y1 = hy + Math.sin(tt2 * 2.4) * 40 * tt2 + tt2 * 40;
      var col = skin.hueCycle ? 'hsl(' + (tt * 300) + ',95%,70%)' : (tt < 0.5 ? skin.tail[0] : tt < 0.8 ? skin.tail[1] : skin.tail[2]);
      c.strokeStyle = col; c.globalAlpha = (1 - tt) * 0.9; c.lineWidth = (1 - tt) * 22 + 2;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
    c.globalAlpha = 0.7;
    var g = c.createRadialGradient(hx, hy, 0, hx, hy, 40);
    g.addColorStop(0, skin.hueCycle ? '#ffd36b' : skin.tail[0]); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(hx, hy, 40, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.fillStyle = skin.head; c.beginPath(); c.arc(hx, hy, 12, 0, Math.PI * 2); c.fill();
    if (skin.outline) { c.strokeStyle = skin.outline; c.lineWidth = 3; c.stroke(); }
  }

  // ---------------------------------------------------------------- Eingabe
  function onTap(e) {
    if (screen !== 'play') return;
    if (e && e.target && e.target.closest && e.target.closest('button')) return;
    if (e && e.cancelable) e.preventDefault();
    K.audio.unlock();
    game.launch();
  }
  $('app').addEventListener('pointerdown', onTap);

  window.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === ' ' || k === 'Enter' || k === 'ArrowUp' || k === 'w') {
      if (screen === 'play') { e.preventDefault(); onTap(null); }
      else if (screen === 'menu' && k === ' ') { e.preventDefault(); startRun(); }
    } else if (k === 'Escape' || k === 'p') {
      if (screen === 'play') pause(); else if (screen === 'pause') resume();
    }
  });
  // Seitenrollen bei Leertaste/Pfeilen in iframes verhindern (wichtig für Portale).
  window.addEventListener('keydown', function (e) {
    if ([' ', 'ArrowUp', 'ArrowDown'].indexOf(e.key) !== -1 && e.target === document.body) e.preventDefault();
  }, { passive: false });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { pause(); K.audio.suspend(); } else K.audio.resume();
  });
  window.addEventListener('blur', pause);
  window.addEventListener('resize', function () { game.resize(); });

  // ---------------------------------------------------------------- Buttons
  function on(id, fn) { $(id).addEventListener('click', function (e) { e.stopPropagation(); K.audio.unlock(); fn(e); }); }

  on('btn-play', function () { K.audio.click(); startRun(); });
  on('btn-pause', pause);
  on('btn-resume', function () { K.audio.click(); resume(); });
  on('btn-pause-menu', function () { K.audio.click(); goMenu(); });
  on('btn-over-menu', function () { K.audio.click(); goMenu(); });
  on('btn-retry', function () {
    K.audio.click();
    runsSinceAd++;
    // Zwischenwerbung höchstens jede zweite Runde – die Portale begrenzen zusätzlich selbst.
    if (runsSinceAd >= 2) {
      runsSinceAd = 0;
      $('btn-retry').disabled = true;
      K.platform.interstitial().then(function () { $('btn-retry').disabled = false; startRun(); });
    } else startRun();
  });
  on('btn-revive-ad', function () {
    $('btn-revive-ad').disabled = true;
    K.platform.rewarded().then(function (ok) {
      $('btn-revive-ad').disabled = false;
      if (ok) doRevive();
    });
  });
  on('btn-revive-stars', function () {
    var cost = cfg.reviveCost || 30;
    if (save.stars < cost) return;
    save.stars -= cost; persist();
    K.audio.buy();
    doRevive();
  });
  on('btn-shop', function () { K.audio.click(); buildShop(); show('shop'); });
  on('btn-shop-back', function () { K.audio.click(); refreshMenu(); show('menu'); });
  on('btn-sound', function () { K.audio.setSound(!K.audio.sound); refreshMenu(); K.audio.click(); });
  on('btn-music', function () { K.audio.setMusic(!K.audio.music); refreshMenu(); });
  on('btn-lang', function () {
    var langs = K.i18n.languages;
    K.i18n.setLang(langs[(langs.indexOf(K.i18n.lang) + 1) % langs.length]);
    refreshMenu();
  });
  on('btn-share', function () {
    var url = cfg.shareUrl || window.location.href.split('?')[0];
    var text = t('shareText', { n: save.best });
    if (navigator.share) {
      navigator.share({ title: 'KOMET', text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + ' ' + url).then(function () { toast(t('copied')); }, function () {});
    }
  });

  // ---------------------------------------------------------------- Schleife
  var last = performance.now();
  function frame(now) {
    var dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    game.update(dt);
    game.render();
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- Start
  K.i18n.apply();
  refreshMenu();
  show('menu');
  requestAnimationFrame(frame);
  K.platform.init().then(function () { K.platform.loadingFinished(); });

  // Offline-Unterstützung nur auf der eigenen Website (nicht in Portal-iframes).
  if (K.platform.name === 'web' && 'serviceWorker' in navigator && location.protocol === 'https:' && window.top === window.self) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  // Für automatische Tests
  window.__komet = { game: game, save: save, startRun: startRun, show: show };
})(window.Komet = window.Komet || {});
