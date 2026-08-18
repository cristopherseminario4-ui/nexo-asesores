// ---------- load header/footer partials ----------
fetch('/partials/cabecera.html').then(r => r.text()).then(d => {
  document.getElementById('contenedor-cabecera').innerHTML = d;
  initHeader();
}).catch(() => {
  document.getElementById('contenedor-cabecera').innerHTML =
    '<p style="padding:16px;background:#5c1a1a;color:#fff;text-align:center;">No se pudo cargar la cabecera — sirve el sitio con el backend (node backend/main.js) en vez de abrir el HTML directamente.</p>';
});
fetch('/partials/pie.html').then(r => r.text()).then(d => {
  document.getElementById('contenedor-pie').innerHTML = d;
}).catch(() => {});

function initHeader() {
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  // mark the active nav link based on the page's data-page attribute
  const page = document.body.dataset.page;
  const links = Array.from(document.querySelectorAll('nav.main-nav a[data-nav]'));
  links.forEach(a => a.classList.toggle('active', a.dataset.nav === page));

  // animated pill/dot indicator that glides to hovered/active link
  const nav = document.querySelector('nav.main-nav');
  if (nav && links.length) {
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    nav.appendChild(indicator);

    function moveIndicatorTo(el) {
      if (!el) { indicator.style.opacity = '0'; return; }
      indicator.style.left = el.offsetLeft + 'px';
      indicator.style.width = el.offsetWidth + 'px';
      indicator.style.opacity = '1';
    }
    const active = links.find(a => a.classList.contains('active'));
    moveIndicatorTo(active);
    links.forEach(a => {
      a.addEventListener('mouseenter', () => moveIndicatorTo(a));
    });
    nav.addEventListener('mouseleave', () => moveIndicatorTo(active));
  }

  const burger = document.getElementById('burgerBtn');
  if (burger) {
    burger.addEventListener('click', () => {
      const navEl = document.querySelector('.main-nav');
      const isOpen = navEl.style.display === 'flex';
      navEl.style.display = isOpen ? 'none' : 'flex';
      navEl.style.position = 'fixed';
      navEl.style.top = '78px';
      navEl.style.left = '0';
      navEl.style.right = '0';
      navEl.style.background = 'rgba(10,22,18,0.98)';
      navEl.style.flexDirection = 'column';
      navEl.style.alignItems = 'flex-start';
      navEl.style.padding = '24px 32px';
      navEl.style.gap = '18px';
    });
  }
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- scroll reveal ----------
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ---------- count-up numbers ----------
function animateCount(el) {
  const raw = el.textContent.trim();
  const m = raw.match(/^(\D*)(\d+)(\D*)$/);
  if (!m) return;
  const [, prefix, digits, suffix] = m;
  const target = parseInt(digits, 10);
  if (reduceMotion) { el.textContent = raw; return; }
  const duration = 1100;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countIo = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); countIo.unobserve(e.target); }
  });
}, { threshold: 0.6 });
document.querySelectorAll('.count').forEach(el => countIo.observe(el));

// ---------- 3D mouse-tilt on cards ----------
function initTilt(selector, opts) {
  if (reduceMotion) return;
  const maxTilt = (opts && opts.maxTilt) || 6;
  const lift = (opts && opts.lift) || -6;
  const scale = (opts && opts.scale) || 1.02;
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transition = 'none';
      el.style.transform = 'perspective(900px) rotateX(' + (-py * maxTilt).toFixed(2) + 'deg) rotateY(' + (px * maxTilt).toFixed(2) + 'deg) scale(' + scale + ') translateY(' + lift + 'px)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.16,.84,.44,1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 520);
    });
  });
}
initTilt('.hub-card', { maxTilt: 6, lift: -8, scale: 1.02 });
initTilt('.program-card', { maxTilt: 5, lift: -6, scale: 1.015 });
initTilt('.course-card', { maxTilt: 5, lift: -6, scale: 1.015 });
initTilt('.value-item', { maxTilt: 5, lift: -6, scale: 1.015 });
initTilt('.channel-card', { maxTilt: 4, lift: -4, scale: 1.01 });

// ---------- blob parallax (subtle mouse-follow on hero blobs) ----------
(function () {
  if (reduceMotion) return;
  document.querySelectorAll('.blob-field').forEach(field => {
    const blobs = Array.from(field.querySelectorAll('.blob'));
    const host = field.closest('section');
    if (!host || !blobs.length) return;
    host.addEventListener('mousemove', (e) => {
      const rect = host.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      blobs.forEach((b, i) => {
        const strength = 14 + i * 6;
        b.style.marginLeft = (px * strength).toFixed(1) + 'px';
        b.style.marginTop = (py * strength).toFixed(1) + 'px';
      });
    });
  });
})();

// ---------- forms wired to the backend (mirrors nexo-business's own pattern) ----------
document.querySelectorAll('form[data-endpoint]').forEach(form => {
  const successEl = form.querySelector('.form-success');
  const errorEl = form.querySelector('.form-error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (successEl) successEl.classList.remove('show');
    if (errorEl) errorEl.classList.remove('show');

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(form.getAttribute('data-endpoint'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('request failed');
      const json = await res.json();
      if (successEl) {
        successEl.textContent = json.mensaje || '¡Listo! Un asesor te contactará pronto.';
        successEl.classList.add('show');
      }
      form.reset();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'No pudimos enviar tu información. Verifica que el backend esté corriendo o escríbenos por WhatsApp.';
        errorEl.classList.add('show');
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  });
});
