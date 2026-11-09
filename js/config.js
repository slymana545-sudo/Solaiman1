/*
 * KOMET – Konfiguration
 *
 * platform:
 *   'web'        – eigene Website, GitHub Pages, itch.io (keine Werbung)
 *   'crazygames' – Upload auf CrazyGames (lädt deren SDK, Werbung über CrazyGames)
 *   'poki'       – Upload auf Poki (lädt das Poki-SDK)
 *
 * Das Build-Skript (tools/build.sh) setzt diesen Wert automatisch für jede
 * Plattform. Zum Testen geht auch: index.html?platform=crazygames
 */
window.KOMET_CONFIG = {
  platform: 'web',
  version: '1.0.0',
  // Link, der beim Teilen verwendet wird (nur Plattform 'web').
  shareUrl: '',
  // Kosten in Sternen für ein "Weiterspielen" ohne Werbung.
  reviveCost: 30,
};
