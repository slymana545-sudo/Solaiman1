/* Übersetzungen. Neue Sprache: Objekt kopieren, Kürzel ändern, Texte übersetzen. */
(function (K) {
  'use strict';
  var STRINGS = {
    de: {
      tagline: 'Spring von Planet zu Planet.',
      play: 'Spielen',
      best: 'Rekord',
      shop: 'Schweife',
      howto: 'Tippe, um aus dem Orbit zu starten. Streif den Ring des nächsten Planeten für PERFEKT.',
      tapToLaunch: 'Tippen zum Starten',
      paused: 'Pause',
      resume: 'Weiter',
      menu: 'Menü',
      gameOver: 'Verglüht',
      score: 'Planeten',
      newBest: 'Neuer Rekord!',
      starsRun: 'Sterne gesammelt',
      retry: 'Nochmal',
      reviveAd: 'Weiterfliegen (Werbung)',
      reviveStars: 'Weiterfliegen für {n} ★',
      share: 'Teilen',
      shareText: 'Ich habe {n} Planeten in KOMET geschafft. Schaffst du mehr?',
      perfect: 'PERFEKT',
      sector: 'Sektor {n}',
      equip: 'Auswählen',
      equipped: 'Ausgewählt',
      buy: '{n} ★',
      notEnough: 'Zu wenig Sterne',
      back: 'Zurück',
      sound: 'Effekte',
      music: 'Musik',
      language: 'Sprache',
      unstable: 'Instabil! Schnell weg!',
      copied: 'Link kopiert',
    },
    en: {
      tagline: 'Hop from planet to planet.',
      play: 'Play',
      best: 'Best',
      shop: 'Tails',
      howto: 'Tap to leave orbit. Skim the ring of the next planet for a PERFECT.',
      tapToLaunch: 'Tap to launch',
      paused: 'Paused',
      resume: 'Resume',
      menu: 'Menu',
      gameOver: 'Burned out',
      score: 'Planets',
      newBest: 'New best!',
      starsRun: 'Stars collected',
      retry: 'Retry',
      reviveAd: 'Keep flying (ad)',
      reviveStars: 'Keep flying for {n} ★',
      share: 'Share',
      shareText: 'I reached {n} planets in KOMET. Can you beat that?',
      perfect: 'PERFECT',
      sector: 'Sector {n}',
      equip: 'Select',
      equipped: 'Selected',
      buy: '{n} ★',
      notEnough: 'Not enough stars',
      back: 'Back',
      sound: 'Sound',
      music: 'Music',
      language: 'Language',
      unstable: 'Unstable! Get out!',
      copied: 'Link copied',
    },
  };

  var lang = K.storage.get('lang', null);
  if (!lang || !STRINGS[lang]) {
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    lang = STRINGS[nav] ? nav : 'en';
  }

  function t(key, vars) {
    var s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  function apply(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    (root || document).querySelectorAll('[data-i18n-label]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-label')));
    });
    document.documentElement.lang = lang;
  }

  K.i18n = {
    t: t,
    apply: apply,
    get lang() { return lang; },
    languages: Object.keys(STRINGS),
    setLang: function (l) { if (STRINGS[l]) { lang = l; K.storage.set('lang', l); apply(); } },
  };
})(window.Komet = window.Komet || {});
