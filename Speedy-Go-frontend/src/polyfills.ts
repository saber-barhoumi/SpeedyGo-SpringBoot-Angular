/***************************************************************************************************
 * Load `$localize` — used if you're using Angular's internationalization (i18n).
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

// Polyfill pour les erreurs de type `global is not defined`
(window as any).global = window;

/***************************************************************************************************
 * Zone JS est requis par Angular.
 */
import 'zone.js';  // Included with Angular CLI.
