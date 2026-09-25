// Ingang voor alle kleine modules; Hugo bundelt dit met js.Build tot één bestand.
import { initTerminal } from './terminal.js';
import { initGitlog } from './gitlog.js';
import { initPalette } from './palette.js';
import { initCopyButtons } from './copy.js';
import { initContactForm } from './form.js';

// Hoogte van de sticky header bijhouden, zodat focus en ankers er niet onder verdwijnen (WCAG 2.4.11).
function trackHeaderHeight() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const set = () => document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  set();
  if ('ResizeObserver' in window) new ResizeObserver(set).observe(header);
}

// ⌘ op Apple-apparaten, anders Ctrl.
function platformKeys() {
  const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  if (mac) return;
  document.querySelectorAll('[data-kbd]').forEach((el) => { el.textContent = 'Ctrl K'; });
  document.querySelectorAll('[data-kbd-copy]').forEach((el) => { el.textContent = 'Ctrl C'; });
}

trackHeaderHeight();
platformKeys();
document.querySelectorAll('[data-terminal]').forEach(initTerminal);
document.querySelectorAll('[data-gitlog]').forEach(initGitlog);
document.querySelectorAll('[data-contact-form]').forEach(initContactForm);
initCopyButtons();
initPalette();
