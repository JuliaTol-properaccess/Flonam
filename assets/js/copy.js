// Kopiëren naar het klembord + een statusmelding (voor schermlezers en, vanuit het palet, als zichtbare toast).

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Terugval voor browsers/contexten zonder Clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }
}

let toastTimer;
export function announce(message, { visible = false } = {}) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = '';
  // Kort leeg zodat dezelfde melding opnieuw wordt voorgelezen.
  requestAnimationFrame(() => { toast.textContent = message; });
  toast.classList.toggle('is-visible', visible);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.textContent = '';
  }, 2200);
}

export function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('[data-copy-label]');
    const idle = label ? label.textContent : '';
    let timer;
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy);
      if (!ok) {
        announce(btn.dataset.failed, { visible: true });
        return;
      }
      if (label) label.textContent = btn.dataset.copied;
      announce(btn.dataset.announce);
      clearTimeout(timer);
      timer = setTimeout(() => { if (label) label.textContent = idle; }, 2000);
    });
  });
}
