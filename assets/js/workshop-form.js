// Aanmeldformulier workshops: validatie, verzenden naar Formspree (of terugval op mailto) en succes-/foutstates.
// Zelfde opzet als form.js, met een keuze voor de workshop en een plaats in plaats van een bericht.

const EMAIL = /.+@.+\..+/;

export function initWorkshopForm(form) {
  const panel = form.parentElement;
  const done = panel.querySelector('[data-form-done]');
  const doneTitle = done.querySelector('[data-done-title]');
  const doneText = done.querySelector('[data-done-text]');
  const doneBody = done.querySelector('[data-done-body]');
  const again = done.querySelector('[data-form-reset]');
  const formError = form.querySelector('[data-form-error]');
  const submit = form.querySelector('[data-submit]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const idleLabel = submitLabel.textContent;
  const name = form.elements.name;
  const email = form.elements.email;
  const place = form.elements.place;
  const system = form.elements.system;
  const website = form.elements.website;
  const workshopSet = document.getElementById('w-workshop');
  const radios = [...form.querySelectorAll('input[name="workshop"]')];
  const endpoint = form.dataset.endpoint || '';

  form.noValidate = true;

  // Bij een fout wijst het veld (of de eerste radio) naar de melding.
  const setError = (field, errId, text, keepDescribed = '') => {
    const el = document.getElementById(errId);
    const targets = field === workshopSet ? radios : [field];
    if (text) {
      el.textContent = `✗ ${text}`;
      el.hidden = false;
      targets.forEach((t) => {
        t.setAttribute('aria-invalid', 'true');
        t.setAttribute('aria-describedby', [keepDescribed, errId].filter(Boolean).join(' '));
      });
    } else {
      el.textContent = '';
      el.hidden = true;
      targets.forEach((t) => {
        t.removeAttribute('aria-invalid');
        if (keepDescribed) t.setAttribute('aria-describedby', keepDescribed);
        else t.removeAttribute('aria-describedby');
      });
    }
  };

  const chosen = () => radios.find((r) => r.checked);

  const validate = () => {
    const invalid = [];
    const emailOk = EMAIL.test(email.value.trim());
    setError(email, 'w-email-error', emailOk ? '' : form.dataset.errEmail);
    if (!emailOk) invalid.push(email);
    const wsOk = Boolean(chosen());
    setError(workshopSet, 'w-workshop-error', wsOk ? '' : form.dataset.errWorkshop);
    if (!wsOk) invalid.push(radios[0]);
    const placeOk = place.value.trim().length > 0;
    setError(place, 'w-place-error', placeOk ? '' : form.dataset.errPlace);
    if (!placeOk) invalid.push(place);
    return invalid;
  };

  email.addEventListener('input', () => { if (email.hasAttribute('aria-invalid')) setError(email, 'w-email-error', ''); });
  place.addEventListener('input', () => { if (place.hasAttribute('aria-invalid')) setError(place, 'w-place-error', ''); });
  radios.forEach((r) => r.addEventListener('change', () => setError(workshopSet, 'w-workshop-error', '')));

  const showDone = (mode) => {
    doneText.textContent = doneText.dataset[mode];
    doneBody.textContent = doneBody.dataset[mode] + '.';
    form.hidden = true;
    done.hidden = false;
    doneTitle.focus();
  };

  const setBusy = (busy) => {
    submit.disabled = busy;
    submitLabel.textContent = busy ? form.dataset.sending : idleLabel;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.hidden = true;
    const invalid = validate();
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    if (form.elements._gotcha && form.elements._gotcha.value) { showDone('sent'); return; }

    if (!endpoint) {
      // Nog geen formulier-endpoint ingesteld: open het mailprogramma met alles ingevuld.
      const lines = [
        `Workshop: ${chosen().value}`,
        `Naam: ${name.value.trim()}`,
        `E-mail: ${email.value.trim()}`,
        `Woon- of werkplaats: ${place.value.trim()}`,
      ];
      if (website && website.value.trim()) lines.push(`Website: ${website.value.trim()}`);
      if (system.value.trim()) lines.push(`CRM of ander systeem: ${system.value.trim()}`);
      const subject = `${form.dataset.subject}: ${chosen().value}`;
      window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      showDone('mailto');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      showDone('sent');
    } catch (err) {
      formError.textContent = `✗ ${form.dataset.errSend}`;
      formError.hidden = false;
    } finally {
      setBusy(false);
    }
  });

  again.addEventListener('click', () => {
    form.reset();
    setError(email, 'w-email-error', '');
    setError(place, 'w-place-error', '');
    setError(workshopSet, 'w-workshop-error', '');
    formError.hidden = true;
    done.hidden = true;
    form.hidden = false;
    name.focus();
  });
}
