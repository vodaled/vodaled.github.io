/* ==========================================================================
   VodaLed — main.js
   1) Динамічне підвантаження header.html та footer.html
   2) Завантаження config.json та рендеринг даних (ціни, контакти, графік...)
   3) Мобільне меню, модальне вікно замовлення, карусель партнерів,
      анімації появи (reveal on scroll), звук «буль» на розділі Ціни
   ========================================================================== */

const CONFIG_URL = 'config.json';
const DROP_SOUND_URL = 'assets/drop.wav';
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
  snow: '<svg viewBox="0 0 24 24"><path d="M22 11h-3.4l2.3-2.3-1.4-1.4L15.4 11H13V8.6l3.7-4.1-1.4-1.4L12 7 8.7 3.1 7.3 4.5 11 8.6V11H8.6L4.5 7.3 3.1 8.7 7 12l-3.9 3.3 1.4 1.4L8.6 13H11v2.4l-3.7 4.1 1.4 1.4L12 17l3.3 3.9 1.4-1.4-3.7-4.1V13h2.4l4.1 3.7 1.4-1.4L17 12l3.9-3.3-1.4-1.4L15.4 11z"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5.5z"/></svg>',
  /* Соцмережі */
  instagram: '<svg viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.9 2 22 4.1 22 7.8v8.4c0 3.7-2.1 5.8-5.8 5.8H7.8C4.1 22 2 19.9 2 16.2V7.8C2 4.1 4.1 2 7.8 2zm-.2 2C5.7 4 4 5.7 4 7.6v8.8C4 18.3 5.7 20 7.6 20h8.8c1.9 0 3.6-1.7 3.6-3.6V7.6C20 5.7 18.3 4 16.4 4H7.6zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24"><path d="M21.9 4.6 19 19.3c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.6 7c.4-.3-.1-.5-.6-.2L8 13.2l-4.4-1.4c-1-.3-1-1 .2-1.4l17.2-6.6c.8-.3 1.5.2 1 1.4z"/></svg>',
  viber: '<svg viewBox="0 0 24 24"><path d="M12 1C7.2 1 3 4.7 3 10.1c0 3.5 1.6 6 4 7.6V22l2.8-1.7c.7.2 1.4.3 2.2.3 4.8 0 9-3.7 9-9.1S16.8 1 12 1zm.9 13.4c-1.9-.4-3.9-2.5-4.3-4.4-.2-1 .3-1.9 1.2-2l.6 1.9-.8.7c.4 1.1 1.3 2 2.4 2.4l.7-.8 1.9.6c-.2.9-1 1.5-1.7 1.6z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H8v2.8h2.5v7z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24"><path d="M16.6 3c.3 1.7 1.4 3 3.4 3.2v2.9c-1.3 0-2.5-.4-3.4-1v6.4c0 3.2-2.1 5.3-5 5.3-2.8 0-4.9-2-4.9-4.7 0-2.9 2.5-4.9 5.4-4.6v3c-.3-.1-.6-.2-1-.2-1.1 0-1.9.8-1.9 1.8 0 1.1.8 1.8 1.8 1.8 1.2 0 2-.9 2-2.3V3z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8l5.2 3.2z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 0 0 1.4 0l4-4a3 3 0 0 0-4.2-4.2l-2.3 2.3 1.4 1.4 2.3-2.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 0 0 1.4zm2.8-2.8a1 1 0 0 0-1.4 0l-4 4a3 3 0 0 0 4.2 4.2l2.3-2.3-1.4-1.4-2.3 2.3a1 1 0 0 1-1.4-1.4l4-4a1 1 0 0 0 0-1.4z"/></svg>'
};

/* --------------------------- Рендеринг з config -------------------------- */

function priceCardHTML(item, isWater = false) {
  const badge = item.popular ? '<span class="badge-popular">Хіт</span>' : '';
  const img = item.image
    ? `<img class="card-img" src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">`
    : '';
  const cls = 'card reveal' + (isWater ? ' card-water' : '') + (item.image ? ' card-with-img' : '') + (item.popular && !isWater ? ' card-popular' : '');
  if (isWater) {
    const note = item.note ? `<span class="note-inline">${esc(item.note)}</span>` : '';
    return `
      <article class="${cls}">
        ${badge}
        <svg class="wave-deco" viewBox="0 0 420 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 22c60-14 120-14 180 0s120 14 180 0 60-9 60-9V34H0z"/></svg>
        <svg class="bottle-sketch" viewBox="0 0 120 260" fill="none" aria-hidden="true">
          <g stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="44" y="4" width="32" height="20" rx="5"/>
            <line x1="50" y1="10" x2="70" y2="10" opacity=".7"/>
            <line x1="50" y1="16" x2="70" y2="16" opacity=".7"/>
            <path d="M50 24 v10 c0 8 -10 12 -14 20 h48 c-4-8-14-12-14-20 v-10"/>
            <rect x="16" y="54" width="88" height="192" rx="26"/>
            <path d="M16 120 c-8 4 -8 24 0 28" opacity=".8"/>
            <path d="M104 120 c8 4 8 24 0 28" opacity=".8"/>
            <path d="M16 150 c14 -6 28 6 44 0 s30 -6 44 0" stroke-width="2.5" opacity=".6"/>
            <rect x="32" y="160" width="56" height="52" rx="8" stroke-width="2.5" opacity=".85"/>
            <line x1="42" y1="177" x2="78" y2="177" stroke-width="2.5" opacity=".6"/>
            <line x1="42" y1="189" x2="70" y2="189" stroke-width="2.5" opacity=".6"/>
            <path d="M30 72 c-4 20 -4 58 0 86" stroke-width="4" opacity=".3"/>
          </g>
        </svg>
        <h3>${esc(item.name)}</h3>
        <p class="muted">${esc(item.description)}</p>
        <div class="price-row">
          <span class="price">${formatPrice(item.price)} грн</span>
          <span class="unit">/ ${esc(item.unit)}</span>
        </div>
        ${note}
        <button class="btn order-btn js-order" type="button">Замовити</button>
      </article>`;
  }
  const note = item.note ? `<p class="muted" style="margin-top:.4rem;font-size:.82rem">${esc(item.note)}</p>` : '';
  return `
    <article class="${cls}">
      ${badge}
      ${img}
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
  if (item.image) {
    return `
      <article class="card card-with-img reveal">
        <img class="card-img" src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">
        <h3>${esc(item.name)}</h3>
        <p class="muted">${esc(item.description)}</p>
        <div class="price-row">
          <span class="price">${formatPrice(item.price)} грн</span>
          <span class="unit">/ ${esc(item.unit)}</span>
        </div>
        <button class="btn btn-ghost btn-sm order-btn js-order" type="button">Замовити</button>
      </article>`;
  }
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
    <article class="card card-feature reveal delay-${(i % 4) + 1}">
      <div class="card-head">
        <div class="icon">${icon}</div>
        <h3>${esc(item.title)}</h3>
      </div>
      <p class="muted">${esc(item.text)}</p>
    </article>`;
}

function socialBtnHTML(s) {
  if (!s || !s.url) return '';           /* порожній url — не показуємо */
  const icon = ICONS[s.id] || ICONS.link;
  return `
    <a class="social-btn social-${esc(s.id)}" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.id)}">
      ${icon}
    </a>`;
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
  document.getElementById('waterPrices').innerHTML = cfg.prices.water.map(w => priceCardHTML(w, true)).join('');
  document.getElementById('icePrices').innerHTML = cfg.prices.ice.map(w => priceCardHTML(w, false)).join('');
  document.getElementById('accessoriesGrid').innerHTML = cfg.prices.accessories.map(accessoryCardHTML).join('');

  /* --- Банер акції ПОРУЧ З КАРТКОЮ води (права частина сітки) --- */
  const waterSection = document.getElementById('waterPrices');
  if (waterSection && cfg.prices.water_banner && cfg.prices.water_banner.image) {
    const banner = document.createElement('aside');
    banner.className = 'promo-banner reveal';
    banner.innerHTML = `<img src="${esc(cfg.prices.water_banner.image)}" alt="${esc(cfg.prices.water_banner.alt || 'Акція')}" loading="lazy">`;
    waterSection.appendChild(banner);
  }

  /* --- Соцмережі (під «Зв'язок» та у футері) --- */
  if (Array.isArray(cfg.socials)) {
    const html = cfg.socials.map(socialBtnHTML).join('');
    ['socialsRow', 'footerSocials'].forEach(id => {
      const row = document.getElementById(id);
      if (row) {
        row.innerHTML = html;
        row.style.display = html ? '' : 'none';
      }
    });
  }

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

/* ------------------------ Звук «буль» (hover на «Ціни») ------------------ */

function initDropSound() {
  const section = document.querySelector('[data-drop-sound]');
  if (!section) return;

  const fx = section.querySelector('.drop-fx');
  let audio = null;
  let unlocked = false;

  const ensureAudio = () => {
    if (!audio) {
      try {
        audio = new Audio(DROP_SOUND_URL);
        audio.preload = 'auto';
      } catch (e) {
        return null;
      }
    }
    return audio;
  };

  /* Браузери дозволяють play() лише після дії користувача — розблоковуємо */
  let unlocking = false;
  const unlock = () => {
    if (unlocked || unlocking) return;
    const a = ensureAudio();
    if (!a) return;
    unlocking = true;
    a.volume = 0;   /* тихо розблоковуємо, щоб перший дотик не грав звук */
    a.play().then(() => {
      unlocked = true;
      unlocking = false;
      a.pause();
      a.currentTime = 0;
    }).catch(() => { unlocking = false; });
  };
  document.addEventListener('pointerdown', unlock, { capture: true });
  document.addEventListener('keydown', unlock);
  /* На тачскрінах pointerdown іноді не доходить до документу перед touch-action
     обробкою — дублюємо розблокування на touchend та перший скрол-стоп */
  document.addEventListener('touchend', unlock, { passive: true, capture: true });
  document.addEventListener('touchstart', function firstTouch() {
    document.removeEventListener('touchstart', firstTouch);
    setTimeout(unlock, 350);
  }, { passive: true, capture: true });

  /* Звук має грати саме коли користувач ЗАВОДИТЬ курсор у секцію,
     а не коли секція «проїжджає» під нерухомим курсором під час скролу.
     Тому граємо лише якщо миша реально рухалась останні 400 мс. */
  let lastMouseMove = 0;
  let lastPlay = 0;
  document.addEventListener('mousemove', () => { lastMouseMove = performance.now(); }, { passive: true });

  /* На тачскрінах немає mouseenter від курсора — тригеримо на торканні секції */
  const touchTrigger = () => {
    const now = performance.now();
    if (now - lastPlay < 800) return;
    lastPlay = now;
    playFx();
  };
  section.addEventListener('touchstart', touchTrigger, { passive: true });

  section.addEventListener('mouseenter', () => {
    const now = performance.now();
    if (now - lastMouseMove > 400) return;  /* курсор нерухомий — це скрол */
    if (now - lastPlay < 800) return;       /* захист від повторів */
    lastPlay = now;
    playFx();
  });

  function playFx() {

    /* анімована крапля: падіння + бризки + кола на воді */
    if (fx) {
      fx.classList.remove('run');
      void fx.offsetWidth; /* reflow — перезапуск CSS-анімації */
      fx.classList.add('run');
    }

    const a = ensureAudio();
    if (a && unlocked) {
      a.currentTime = 0;
      a.volume = 0.3;
      a.play().catch(() => {});
    }
  }
}

/* ------------------------------ Карта Leaflet: Київ ---------------------- */
/* Контур міста цілком + маркер бази. Зум колесом миші вмикається після кліка
   по карті (щоб скрол сторінки не заважав) та вимикається, коли курсор
   йде з карти. Межі міста — GeoJSON з OpenStreetMap (Nominatim). */

const KYIV_CENTER = [50.4273, 30.5116]; /* вул. Казимира Малевича */

async function initKyivMap() {
  const holder = document.getElementById('kyivMap');
  if (!holder || !window.L) return;

  let bounds = null;
  try {
    const res = await fetch('assets/kyiv-boundary.geojson');
    if (res.ok) bounds = await res.json();
  } catch (e) { /* без меж карти все одно працюватиме */ }

  const map = L.map(holder, {
    attributionControl: true,
    scrollWheelZoom: false,      /* вмикається після кліку по карті */
    dragging: true,              /* переміщення карти мишкою/пальцем */
    tap: true,
    zoomSnap: 0.25
  });
  window.__kyivMap = map;        /* для діагностики в консолі */

  /* Зум колесом — лише коли користувач «зафіксов» карту кліком */
  map.on('click', () => map.scrollWheelZoom.enable());
  map.getContainer().addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

  map.setMinZoom(9);
  map.setMaxZoom(17);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  /* Шари та початковий вигляд додаємо ТІЛЬКИ після того,
     як контейнер отримав розмір (інакше Leaflet падає на нульовому розмірі) */
  const setup = () => {
    /* Початковий вигляд — увесь Київ видно цілком */
    map.setView(KYIV_CENTER, 10.5);

    if (bounds) {
      L.geoJSON(bounds, {
        style: { color: '#1668B3', weight: 2, fillColor: '#1668B3', fillOpacity: 0.06 },
        interactive: false
      }).addTo(map);
    }

    L.circleMarker(KYIV_CENTER, {
      radius: 9,
      color: '#0B3C7A',
      weight: 3,
      fillColor: '#1668B3',
      fillOpacity: 1
    }).addTo(map).bindTooltip('База: вул. Казимира Малевича', { direction: 'top', offset: [0, -8] });
  };

  if (holder.offsetWidth > 0 && holder.offsetHeight > 0) {
    setup();
  } else if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      if (holder.offsetWidth > 0 && holder.offsetHeight > 0) {
        ro.disconnect();
        map.invalidateSize();
        setup();
      }
    });
    ro.observe(holder);
  } else {
    setTimeout(() => { map.invalidateSize(); setup(); }, 300);
  }
}

/* ------------------------------ Мобільне меню ----------------------------- */

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
  initDropSound();

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
  initKyivMap();
})();
