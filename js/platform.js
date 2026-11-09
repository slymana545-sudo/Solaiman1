/*
 * Plattform-Schicht: verbindet das Spiel mit Spieleportalen und deren Werbung.
 *
 * Das Spiel ruft nur diese Funktionen auf:
 *   platform.init()            – beim Start
 *   platform.gameplayStart()   – Spieler spielt aktiv
 *   platform.gameplayStop()    – Pause, Menü, Game Over
 *   platform.interstitial()    – Werbepause zwischen zwei Runden (Promise)
 *   platform.rewarded()        – Belohnungswerbung, liefert Promise<true|false>
 *   platform.happyTime()       – besonderer Moment (z. B. neuer Rekord)
 *
 * Neue Plattform hinzufügen: ein weiteres Objekt in ADAPTERS anlegen.
 * Prüfe die SDK-Aufrufe immer gegen die aktuelle Doku des Portals.
 */
(function (K) {
  'use strict';
  var cfg = window.KOMET_CONFIG || {};
  var query = new URLSearchParams(window.location.search);
  var name = query.get('platform') || cfg.platform || 'web';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function withAudioPaused(promise) {
    K.audio.suspend();
    return promise.then(function (v) { K.audio.resume(); return v; },
                        function () { K.audio.resume(); return false; });
  }

  var ADAPTERS = {
    // Eigene Website / itch.io: keine Werbung. "Weiterfliegen" kostet Sterne.
    web: {
      hasRewarded: false,
      init: function () { return Promise.resolve(); },
      loadingFinished: function () {},
      gameplayStart: function () {},
      gameplayStop: function () {},
      interstitial: function () { return Promise.resolve(); },
      rewarded: function () { return Promise.resolve(false); },
      happyTime: function () {},
    },

    // CrazyGames HTML5 SDK v3 – https://docs.crazygames.com/
    crazygames: {
      hasRewarded: true,
      sdk: null,
      init: function () {
        var self = this;
        return loadScript('https://sdk.crazygames.com/crazygames-sdk-v3.js')
          .then(function () { self.sdk = window.CrazyGames.SDK; return self.sdk.init(); })
          .then(function () { try { self.sdk.game.loadingStart(); } catch (e) {} });
      },
      loadingFinished: function () { try { this.sdk.game.loadingStop(); } catch (e) {} },
      gameplayStart: function () { try { this.sdk.game.gameplayStart(); } catch (e) {} },
      gameplayStop: function () { try { this.sdk.game.gameplayStop(); } catch (e) {} },
      requestAd: function (type) {
        var sdk = this.sdk;
        return withAudioPaused(new Promise(function (resolve) {
          try {
            sdk.ad.requestAd(type, {
              adStarted: function () {},
              adFinished: function () { resolve(true); },
              adError: function () { resolve(false); },
            });
          } catch (e) { resolve(false); }
        }));
      },
      interstitial: function () { return this.requestAd('midgame'); },
      rewarded: function () { return this.requestAd('rewarded'); },
      happyTime: function () { try { this.sdk.game.happytime(); } catch (e) {} },
    },

    // Poki SDK v2 – https://sdk.poki.com/
    poki: {
      hasRewarded: true,
      init: function () {
        return loadScript('https://game-cdn.poki.com/scripts/v2/poki-sdk.js')
          .then(function () { return window.PokiSDK.init(); });
      },
      loadingFinished: function () { try { window.PokiSDK.gameLoadingFinished(); } catch (e) {} },
      gameplayStart: function () { try { window.PokiSDK.gameplayStart(); } catch (e) {} },
      gameplayStop: function () { try { window.PokiSDK.gameplayStop(); } catch (e) {} },
      interstitial: function () {
        return withAudioPaused(Promise.resolve(window.PokiSDK.commercialBreak(function () { K.audio.suspend(); })));
      },
      rewarded: function () {
        return withAudioPaused(Promise.resolve(window.PokiSDK.rewardedBreak(function () { K.audio.suspend(); })))
          .then(function (ok) { return !!ok; });
      },
      happyTime: function () {},
    },
  };

  var adapter = ADAPTERS[name] || ADAPTERS.web;
  var ready = false;
  var playing = false;

  K.platform = {
    name: name,
    get hasRewarded() { return ready && adapter.hasRewarded; },
    init: function () {
      return adapter.init().then(function () { ready = true; }, function (err) {
        // SDK blockiert (z. B. Adblocker) -> Spiel läuft ohne Werbung weiter.
        console.warn('[KOMET] Plattform-SDK nicht verfügbar, spiele ohne Werbung.', err);
        adapter = ADAPTERS.web; ready = true;
      });
    },
    loadingFinished: function () { adapter.loadingFinished(); },
    gameplayStart: function () { if (!playing) { playing = true; adapter.gameplayStart(); } },
    gameplayStop: function () { if (playing) { playing = false; adapter.gameplayStop(); } },
    interstitial: function () { return ready ? adapter.interstitial() : Promise.resolve(); },
    rewarded: function () { return ready ? adapter.rewarded() : Promise.resolve(false); },
    happyTime: function () { adapter.happyTime(); },
  };
})(window.Komet = window.Komet || {});
