/*
 * Kometenschweife (Skins). Spieler kaufen sie mit gesammelten Sternen.
 * head: Farbe des Kopfes, tail: Farbverlauf des Schweifs (vorne -> hinten).
 * hueCycle: Schweif wechselt laufend die Farbe.
 */
(function (K) {
  'use strict';
  K.skins = [
    { id: 'classic', name: { de: 'Goldkomet', en: 'Gold Comet' }, price: 0,   head: '#fff4d6', tail: ['#ffcf6b', '#ff8a3d', '#c2410c'] },
    { id: 'ice',     name: { de: 'Eisschweif', en: 'Ice Tail' },   price: 40,  head: '#f0fbff', tail: ['#9ae6ff', '#4cb8ff', '#2b59c3'] },
    { id: 'ember',   name: { de: 'Glut', en: 'Ember' },            price: 90,  head: '#fff0e8', tail: ['#ff6b5b', '#e0245e', '#7a0f3b'] },
    { id: 'aurora',  name: { de: 'Polarlicht', en: 'Aurora' },     price: 160, head: '#f2fff8', tail: ['#7dffc4', '#3fd1c9', '#8b5cf6'] },
    { id: 'plasma',  name: { de: 'Plasma', en: 'Plasma' },         price: 260, head: '#fff0fb', tail: ['#ff9bf0', '#d946ef', '#5b21b6'] },
    { id: 'void',    name: { de: 'Schattenkomet', en: 'Void' },    price: 400, head: '#2a1b4d', tail: ['#b69cff', '#5b3fa8', '#1a1033'], outline: '#d9c9ff' },
    { id: 'prism',   name: { de: 'Prisma', en: 'Prism' },          price: 650, head: '#ffffff', tail: ['#ff7a7a', '#ffd36b', '#6bffb5'], hueCycle: true },
    { id: 'nova',    name: { de: 'Supernova', en: 'Supernova' },   price: 1000, head: '#ffffff', tail: ['#fff7c2', '#ffd36b', '#ff5ab4'] },
  ];

  K.skinById = function (id) {
    for (var i = 0; i < K.skins.length; i++) if (K.skins[i].id === id) return K.skins[i];
    return K.skins[0];
  };
})(window.Komet = window.Komet || {});
