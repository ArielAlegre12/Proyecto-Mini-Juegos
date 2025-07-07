import { setupAccordion } from './accordion.js';
import { setupTrivia } from './trivia.js';
import { setupMenu } from './menu.js';
import { setupDarkMode } from './darkmode.js';
import { setupAcertijos } from './acertijos.js';

document.addEventListener('DOMContentLoaded', () => {
  setupAccordion();
  setupTrivia();
  setupMenu();
  setupDarkMode();
  setupAcertijos();
  
});
