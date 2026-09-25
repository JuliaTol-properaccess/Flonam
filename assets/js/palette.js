// ⌘K-commandopalet: native <dialog> (modaal), combobox + listbox, focus-trap en focus-terugkeer.
// Commando's komen uit de Hugo-zoekindex (/search.json of /en/search.json).
import { copyText, announce } from './copy.js';

export function initPalette() {
  const dlg = document.getElementById('palette');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  const input = dlg.querySelector('.palette__input');
  const list = dlg.querySelector('.palette__list');
  const empty = dlg.querySelector('.palette__empty');
  const status = dlg.querySelector('[data-palette-status]');
  const closeBtn = dlg.querySelector('[data-palette-close]');
  const triggers = document.querySelectorAll('[data-palette-open]');

  let commands = null;
  let strings = {};
  let loading = null;
  let results = [];
  let sel = 0;
  let returnTo = null;

  // Terugval als de index niet laadt: de hoofdnavigatie uit de pagina.
  const fromDom = () => Array.from(document.querySelectorAll('.nav a')).map((a) => ({
    t: a.textContent.replace(/^~|\.\//, '').trim() || 'Home', s: '', k: '', d: '', action: 'nav', href: a.getAttribute('href'),
  }));

  const load = () => {
    if (!loading) {
      loading = fetch(dlg.dataset.src, { headers: { Accept: 'application/json' } })
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then((json) => { commands = json.commands || []; strings = json.strings || {}; })
        .catch(() => { commands = fromDom(); })
        .then(render);
    }
    return loading;
  };

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    const all = commands || [];
    if (!q) return all;
    // Substring-match op titel, subtitel en trefwoorden; treffers in de titel eerst.
    const rank = (c) => {
      const t = c.t.toLowerCase();
      return t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2;
    };
    return all
      .filter((c) => `${c.t} ${c.s} ${c.k}`.toLowerCase().includes(q))
      .map((c, i) => ({ c, i, r: rank(c) }))
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .map((x) => x.c);
  };

  const select = (i) => {
    sel = i;
    Array.from(list.children).forEach((li, idx) => {
      const on = idx === sel;
      li.setAttribute('aria-selected', on ? 'true' : 'false');
      const d = li.querySelector('.palette__d');
      if (d) d.textContent = results[idx].d + (on ? ' ↵' : '');
      if (on) li.scrollIntoView({ block: 'nearest' });
    });
    if (results[sel]) input.setAttribute('aria-activedescendant', `palette-opt-${sel}`);
    else input.removeAttribute('aria-activedescendant');
  };

  function render() {
    if (!commands) return;
    results = filter();
    sel = Math.min(sel, Math.max(0, results.length - 1));
    list.textContent = '';
    results.forEach((c, i) => {
      const li = document.createElement('li');
      li.className = 'palette__opt';
      li.id = `palette-opt-${i}`;
      li.setAttribute('role', 'option');
      const text = document.createElement('span');
      const t = document.createElement('span');
      t.className = 'palette__t';
      t.textContent = c.t;
      const s = document.createElement('span');
      s.className = 'palette__s';
      s.textContent = c.s;
      if (c.action === 'external' && strings.newTab) s.textContent += ` ${strings.newTab}`;
      text.append(t, s);
      const d = document.createElement('span');
      d.className = 'palette__d';
      d.setAttribute('aria-hidden', 'true');
      li.append(text, d);
      li.addEventListener('mousemove', () => { if (sel !== i) select(i); });
      li.addEventListener('click', () => run(c));
      list.appendChild(li);
    });
    const q = input.value.trim();
    empty.hidden = results.length > 0;
    if (!results.length) {
      empty.textContent = (strings.empty || 'Niets gevonden voor “{q}”.').replace('{q}', q);
    }
    list.hidden = !results.length;
    status.textContent = results.length === 1
      ? (strings.countOne || '1')
      : (strings.count || '{n}').replace('{n}', results.length);
    select(sel);
  }

  function open() {
    if (dlg.open) return;
    returnTo = document.activeElement;
    input.value = '';
    sel = 0;
    dlg.showModal();
    input.focus();
    if (commands) render(); else load();
  }

  function close() {
    if (dlg.open) dlg.close();
  }

  function run(cmd) {
    if (cmd.action === 'copy') {
      close();
      copyText(cmd.value).then((ok) => announce(ok ? `✓ ${strings.copied || cmd.value}` : cmd.value, { visible: true }));
    } else if (cmd.action === 'external') {
      close();
      window.open(cmd.href, '_blank', 'noopener');
    } else {
      returnTo = null;
      close();
      window.location.href = cmd.href;
    }
  }

  // Focus terug naar waar hij vandaan kwam.
  dlg.addEventListener('close', () => {
    const target = returnTo;
    returnTo = null;
    if (target && typeof target.focus === 'function' && document.contains(target)) target.focus();
  });

  // Klik op de achtergrond (buiten het kader) sluit.
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  closeBtn.addEventListener('click', close);

  input.addEventListener('input', () => { sel = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (results.length) select(Math.min(sel + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (results.length) select(Math.max(sel - 1, 0)); }
    else if (e.key === 'Home' && results.length && !input.value) { e.preventDefault(); select(0); }
    else if (e.key === 'End' && results.length && !input.value) { e.preventDefault(); select(results.length - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[sel]) run(results[sel]); }
  });

  // Focus-trap: Tab blijft binnen het palet.
  dlg.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = [input, closeBtn];
    const idx = focusables.indexOf(document.activeElement);
    e.preventDefault();
    const next = e.shiftKey ? (idx <= 0 ? focusables.length - 1 : idx - 1) : (idx + 1) % focusables.length;
    focusables[next].focus();
  });

  triggers.forEach((btn) => btn.addEventListener('click', open));

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dlg.open) close(); else open();
    }
  });
}
