// Contactformulier: validatie, verzenden naar Formspree (of terugval op mailto) en succes-/foutstates.

const EMAIL = /.+@.+\..+/;

export function initContactForm(form) {
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
  const message = form.elements.message;
  const endpoint = form.dataset.endpoint || '';

  // JS neemt de validatie over (eigen meldingen in de huisstijl).
  form.noValidate = true;

  const setError = (field, text) => {
    const el = document.getElementById(`${field.id}-error`);
    if (text) {
      el.textContent = `✗ ${text}`;
      el.hidden = false;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', el.id);
    } else {
      el.textContent = '';
      el.hidden = true;
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  };

  const validate = () => {
    const invalid = [];
    const emailOk = EMAIL.test(email.value.trim());
    setError(email, emailOk ? '' : form.dataset.errEmail);
    if (!emailOk) invalid.push(email);
    const msgOk = message.value.trim().length > 0;
    setError(message, msgOk ? '' : form.dataset.errMessage);
    if (!msgOk) invalid.push(message);
    return invalid;
  };

  // Melding verdwijnt zodra het veld wordt aangepast.
  email.addEventListener('input', () => { if (email.hasAttribute('aria-invalid')) setError(email, ''); });
  message.addEventListener('input', () => { if (message.hasAttribute('aria-invalid')) setError(message, ''); });

  const showDone = (mode) => {
    doneText.textContent = doneText.dataset[mode];
    const who = name.value.trim();
    doneBody.textContent = doneBody.dataset[mode] + (mode === 'sent' && who ? `, ${who}.` : '.');
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

    // Honeypot gevuld: doe alsof het gelukt is.
    if (form.elements._gotcha && form.elements._gotcha.value) { showDone('sent'); return; }

    if (!endpoint) {
      // Nog geen formulier-endpoint ingesteld: open het mailprogramma met alles ingevuld.
      const subject = `${form.dataset.subject}${name.value.trim() ? `: ${name.value.trim()}` : ''}`;
      const body = `${message.value.trim()}\n\n${name.value.trim()} (${email.value.trim()})`;
      window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    [email, message].forEach((f) => setError(f, ''));
    formError.hidden = true;
    done.hidden = true;
    form.hidden = false;
    name.focus();
  });
}
