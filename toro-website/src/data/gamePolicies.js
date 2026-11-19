/**
 * Unlisted Per-Game Privacy Policy Registry
 * -----------------------------------------
 * Routes are accessible ONLY via direct URL:
 *   /p/<slug>  (e.g. /p/toro-game-1)
 *
 * These routes are intentionally omitted from the website navigation, footer,
 * and public studio pages, and include a noindex/nofollow robots meta tag.
 * Copy the direct URL into your game's Privacy Policy button and store console.
 */
export const gamePolicies = {
  'toro-game-1': {
    gameTitle: 'Toro Mobile Game',
    platforms: 'Google Play Store · Amazon Appstore',
    lastUpdated: 'November 2026',
    contactEmail: 'toro@gmail.com',
    studioLocation: 'Rangpur, Bangladesh',
    usesAdMob: true,
    usesUnityAds: false,
    usesAnalytics: true,
    directedAtChildrenUnder13: false,
    dataCollected: [
      'Device model, operating system version, and screen resolution',
      'Advertising ID (Google AAID / Amazon Advertising ID) for ad delivery and frequency capping',
      'Approximate region derived from IP address and anonymized crash or performance diagnostics',
      'Local game progress and settings saved on your device',
    ],
    summary:
      'This Privacy Policy applies exclusively to this game published by Toro. We collect only the technical and advertising identifiers required to run gameplay smoothly, prevent fraud, and support free access through third-party ad networks.',
  },
}
