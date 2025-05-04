/**
 * Add the following code at the top of your polyfills.ts file
 */

// This needs to be before any imports
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: require('next-tick')
};
(window as any).Buffer = require('buffer').Buffer;

// Then add the regular polyfills
import 'zone.js';  // Included with Angular CLI