/* ==========================================================================
   VodaLed — main.js
   1) Динамічне підвантаження header.html та footer.html
   2) Завантаження config.json та рендеринг даних (ціни, контакти, графік...)
   3) Мобільне меню, модальне вікно замовлення, карусель партнерів,
      анімації появи (reveal on scroll)
   ========================================================================== */

const CONFIG_URL = 'config.json';
const COMPONENTS = {
  header: 'components/header.html',
  footer: 'components/footer.html'
};

/* --------------------------- Дрібні утиліти ------------------------------ */

function formatPrice(n) {
  return new Intl.NumberFormat('uk-UA').format(n);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------- Підвантаження компонентів --------------------- */

async function loadComponent(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status + ' ' + url);
    target.outerHTML = await res.text();
  } catch (err) {
    console.error('Не вдалося завантажити компонент:', err);
  }
  return null;
}

/* ------------------------------ Іконки ----------------------------------- */

const ICONS = {
  bottle: '<svg viewBox="0 0 24 24"><path d="M10 2h4a1 1 0 0 1 1 1v2.2c0 .5.2 1 .6 1.4l.8.8c.4.4.6.9.6 1.4V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8.8c0-.5.2-1 .6-1.4l.8-.8c.4-.4.6-.9.6-1.4V3a1 1 0 0 1 1-1zm0 4.5V8h4V6.5c0-.9.4-1.8 1-2.4V4h-1v1h-4V4H9v2.1c.6.6 1 1.5 1 2.4zM8.5 12h7v6h-7z"/></svg>',
  pump: '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v1h-4V7h-4v1H6V7a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-2 7h4v3.2l1.5 8A2 2 0 0 1 13.5 22h-3a2 2 0 0 1-2-1.8l1.5-8z"/></svg>',
  'pump-electric': '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
  cooler: '<svg viewBox="0 0 24 24"><path d="M9 2h6a1 1 0 0 1 1 1v4h1a3 3 0 0 1 3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zm0 5h6V4H9zm3 5-2.5 4h2V18l2.5-4h-2z"/></svg>',
  freezer: '<svg viewBox="0 0 24 24"><path d="M6 2h12a2 2 0 0 1 2 2v7H4V4a2 2 0 0 1 2-2zM4 13h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm3-9v2h2V4H7zm0 11v2h2v-2H7z"/></svg>',
  drop: '<svg viewBox="0 0 24 24"><path d="M12 2s6.5 7.2 6.5 12a6.5 6.5 0 0 1-13 0C5.5 9.2 12 2 12 2zm0 17.5a4.5 4.5 0 0 0 4.5-4.5h-1.6a2.9 2.9 0 0 1-2.9 2.9z"/></svg>',
  truck: '<svg viewBox="0 0 24 24"><path d="M3 5h11a1 1 0 0 1 1 1v2h3.2c.4 0 .7.2.9.5l2 3c.1.2.2.4.2.6V17a1 1 0 0 1-1 1h-1.1a3 3 0 0 1-5.8 0H9.8a3 3 0 0 1-5.8 0H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm12 5v3h5.1l-1.3-2H15zM6.9 16.1a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zm10 0a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z"/></svg>',
  tag: '<svg viewBox="0 0 24 24"><path d="M21.4 11.6 12.4 2.6A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7c0 .5.2 1 .6 1.4l9 9a2 2 0 0 0 2.8 0l7-7a2 2 0 0 0 0-2.8zM6.5 8A1.5 1.5 0 1 1 8 6.5 1.5 1.5 0 0 1 6.5 8z"/></svg>',
  snow: '<svg viewBox="0 0 24 24"><path d="M11 2h2v3.6l2.3-1.3 1 1.7L13 8l3.3 2-2.3 1.3 1 1.7L11 11v11h2v-7l2.3 1.3 1-1.7L13 12.7l3.3-2 1 1.7L22 10l-4.7-2.7 1-1.7-1-.6z"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5.5z"/></svg>'
};

/* --------------------------- Рендеринг з config -------------------------- */

function priceCardHTML(item) {
  const badge = item.popular ? '<span class="badge-popular">Хіт</span>' : '';
  const note = item.note ? `<p class="muted" style="margin-top:.4rem;font-size:.82rem">${esc(item.note)}</p>` : '';
  return `
    <article class="card reveal ${item.popular ? 'card-popular' : ''}">
      ${badge}
      <h3>${esc(item.name)}</h3>
      <p class="muted">${esc(item.description)}</p>
      ${note}
      <div class="price-row">
        <span class="price">${formatPrice(item.price)} грн</span>
        <span class="unit">/ ${esc(item.unit)}</span>
      </div>
      <button class="btn btn-primary btn-sm order-btn js-order" type="button">Замовити</button>
    </article>`;
}

function accessoryCardHTML(item) {
  const icon = ICONS[item.icon] || ICONS.bottle;
  return `
    <article class="card reveal">
      <div class="icon">${icon}</div>
      <h3>${esc(item.name)}</h3>
      <p class="muted">${esc(item.description)}</p>
      <div class="price-row">
        <span class="price">${formatPrice(item.price)} грн</span>
        <span class="unit">/ ${esc(item.unit)}</span>
      </div>
      <button class="btn btn-ghost btn-sm order-btn js-order" type="button">Замовити</button>
    </article>`;
}

function featureCardHTML(item, i) {
  const icon = ICONS[item.icon] || ICONS.drop;
  return `
    <article class="card reveal delay-${(i % 4) + 1}">
      <div class="icon">${icon}</div>
      <h3>${esc(item.title)}</h3>
      <p class="muted">${esc(item.text)}</p>
    </article>`;
}

function partnerChipHTML(p) {
  if (p.logo) {
    return `
      <div class="partner-chip">
        <img class="partner-logo" src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">
        <span>${esc(p.name)}</span>
      </div>`;
  }
  const initial = (p.name || '?').trim().charAt(0).toUpperCase();
  return `
    <div class="partner-chip">
      <span class="partner-dot">${esc(initial)}</span>
      <span>${esc(p.name)}</span>
    </div>`;
}

function renderConfig(cfg) {
  /* --- Текстові дані (data-config) --- */
  const map = {
    'phone-display': cfg.phone_display,
    'phone-link': 'tel:' + cfg.phone.replace(/[^+\d]/g, ''),
    'telegram-link': cfg.telegram,
    'viber-link': cfg.viber,
    'schedule': cfg.schedule,
    'hero-title': cfg.hero.title,
    'hero-subtitle': cfg.hero.subtitle,
    'hero-cta': cfg.hero.cta,
    'hero-note': cfg.hero.note,
    'bottle-price': formatPrice(cfg.bottle_price),
    'footer-about': cfg.footer.about,
    'copyright': cfg.footer.copyright,
    'delivery-area': cfg.delivery.area,
    'delivery-note': 'Оплата за доставку розраховується індивідуально (залежить від району та обсягу замовлення).'
  };
  document.querySelectorAll('[data-config]').forEach(el => {
    const key = el.getAttribute('data-config');
    const val = map[key];
    if (val === undefined) return;
    if (key.endsWith('-link')) el.setAttribute('href', val);
    else el.textContent = val;
  });

  /* --- Картки --- */
  document.getElementById('featuresGrid').innerHTML = cfg.features.map(featureCardHTML).join('');
  document.getElementById('waterPrices').innerHTML = cfg.prices.water.map(priceCardHTML).join('');
  document.getElementById('icePrices').innerHTML = cfg.prices.ice.map(priceCardHTML).join('');
  document.getElementById('accessoriesGrid').innerHTML = cfg.prices.accessories.map(accessoryCardHTML).join('');

  /* --- Партнери: подвійний набір для нескінченної анімації --- */
  const chips = cfg.partners.map(partnerChipHTML).join('');
  document.getElementById('partnersCarousel').innerHTML = chips + chips;

  observeReveals();
}

/* --------------------------- Reveal-анімації ----------------------------- */

let revealObserver = null;

function observeReveals() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

/* ------------------------------ Карусель -------------------------------- */

function initCarousel() {
  const track = document.getElementById('partnersCarousel');
  if (!track) return;

  let x = 0;
  let paused = false;
  let half = 0;

  const measure = () => { half = track.scrollWidth / 2; };
  measure();
  window.addEventListener('resize', measure);

  track.addEventListener('mouseenter', () => { paused = true; });
  track.addEventListener('mouseleave', () => { paused = false; });
  track.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  track.addEventListener('touchend', () => { paused = false; });

  (function step() {
    if (!paused && half > 0) {
      x -= 0.5; /* швидкість прокрутки, px за кадр */
      if (-x >= half) x += half;
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(step);
  })();
}

/* --------------------------- Мобільне меню ------------------------------- */

function initMobileMenu() {
  const burger = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* -------------------------- Модальне вікно ------------------------------- */

function initModal() {
  const overlay = document.getElementById('orderModal');
  if (!overlay) return;

  document.addEventListener('click', e => {
    const btn = e.target.closest('.js-order');
    if (btn) {
      e.preventDefault();
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  });

  const close = () => {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.getElementById('modalClose')?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ------------------------------ Кнопка вгору ----------------------------- */

function initToTop() {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* -------------------------------- Ініціалізація -------------------------- */

(async function init() {
  await loadComponent(COMPONENTS.header, 'header-placeholder');
  await loadComponent(COMPONENTS.footer, 'footer-placeholder');

  initMobileMenu();
  initModal();
  initToTop();

  try {
    const res = await fetch(CONFIG_URL);
    if (!res.ok) throw new Error(res.status);
    const cfg = await res.json();
    renderConfig(cfg);
  } catch (err) {
    console.error('Не вдалося завантажити config.json:', err);
    observeReveals(); /* усе одно показати статичний контент */
  }

  initCarousel();
})();
