// Home-terminal: regels verschijnen één voor één (550 ms) en de reeks begint na ~6 extra ticks opnieuw.
// De terminal is aria-hidden; de pauzeknop (WCAG 2.2.2) staat erbuiten en zet alles stil met alle regels zichtbaar.
import { reducedMotion } from './motion.js';

const TICK = 550;
const HOLD = 6;

export function initTerminal(root) {
  const lines = Array.from(root.querySelectorAll('[data-line]'));
  const toggle = root.querySelector('[data-terminal-toggle]');
  let step = 0;
  let timer = null;
  let paused = false;

  const render = () => lines.forEach((line, i) => { line.hidden = i >= step; });
  const showAll = () => { step = lines.length; render(); };
  const tick = () => {
    step = step >= lines.length + HOLD ? 0 : step + 1;
    render();
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    if (timer || paused || reducedMotion.matches) return;
    timer = setInterval(tick, TICK);
  };

  const setPaused = (value) => {
    paused = value;
    root.classList.toggle('is-paused', paused);
    if (toggle) toggle.textContent = paused ? toggle.dataset.labelPlay : toggle.dataset.labelPause;
    if (paused) { stop(); showAll(); } else { step = 0; render(); start(); }
  };

  const applyMotionPreference = () => {
    if (reducedMotion.matches) {
      stop();
      showAll();
      if (toggle) toggle.hidden = true;
    } else {
      if (toggle) toggle.hidden = false;
      if (!paused) { step = 0; render(); start(); }
    }
  };

  if (toggle) toggle.addEventListener('click', () => setPaused(!paused));
  reducedMotion.addEventListener('change', applyMotionPreference);
  // Niet doortikken in een verborgen tabblad.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  applyMotionPreference();
}
