/* Sicherer Speicher: localStorage kann in privaten Fenstern oder iframes fehlen. */
(function (K) {
  'use strict';
  var PREFIX = 'komet.';
  var mem = {};

  function get(key, fallback) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) { /* ignorieren */ }
    return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : fallback;
  }

  function set(key, value) {
    mem[key] = value;
    try { window.localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* ignorieren */ }
  }

  K.storage = { get: get, set: set };
})(window.Komet = window.Komet || {});
