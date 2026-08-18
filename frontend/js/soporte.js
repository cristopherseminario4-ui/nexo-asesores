// ---------- ticket generator: posts to the backend, shows the generated ticket ----------
(function () {
  const form = document.getElementById('ticketForm');
  if (!form) return;

  const resultEl = document.getElementById('ticketResult');
  const errorEl = document.getElementById('ticketError');
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultEl.classList.remove('show');
    errorEl.classList.remove('show');

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Generando ticket...';

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('request failed');
      const json = await res.json();

      document.getElementById('trId').textContent = json.ticketId;
      document.getElementById('trMeta').textContent =
        'Prioridad ' + (data.prioridad || 'media') + ' — tiempo estimado de respuesta: ' + json.eta;
      resultEl.classList.add('show');
      form.reset();
    } catch (err) {
      errorEl.textContent = 'No pudimos generar tu ticket. Verifica que el backend esté corriendo (node backend/main.js) o escríbenos por WhatsApp.';
      errorEl.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  document.getElementById('copyTicket')?.addEventListener('click', () => {
    const id = document.getElementById('trId').textContent;
    navigator.clipboard?.writeText(id);
    const copyBtn = document.getElementById('copyTicket');
    const original = copyBtn.textContent;
    copyBtn.textContent = '¡Copiado!';
    setTimeout(() => { copyBtn.textContent = original; }, 1600);
  });
})();
