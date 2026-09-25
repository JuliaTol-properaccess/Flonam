// Over ons: de git-log-regels typen elke 420 ms in zodra het paneel in beeld komt; daarna knippert de cursor kort.
import { reducedMotion } from './motion.js';

const TICK = 420;

export function initGitlog(root) {
  const rows = Array.from(root.querySelectorAll('[data-line]'));
  const cursor = root.querySelector('.cursor--finite');
  if (!rows.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;

  rows.forEach((row) => row.classList.add('is-pending'));

  const play = () => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < rows.length) rows[i++].classList.remove('is-pending');
      if (i >= rows.length) {
        clearInterval(timer);
        if (cursor) cursor.classList.add('is-blinking');
      }
    }, TICK);
  };

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      play();
    }
  }, { threshold: 0.3 });
  io.observe(root);
}
