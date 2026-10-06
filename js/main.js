const CONFIG_URL = 'config.json';
const DROP_SOUND_URL = 'assets/drop.wav';
const CRYSTAL_SOUND_URL = 'assets/crystal.wav';
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
  /* Соцмережі */
  instagram: '<svg viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.9 2 22 4.1 22 7.8v8.4c0 3.7-2.1 5.8-5.8 5.8H7.8C4.1 22 2 19.9 2 16.2V7.8C2 4.1 4.1 2 7.8 2zm-.2 2C5.7 4 4 5.7 4 7.6v8.8C4 18.3 5.7 20 7.6 20h8.8c1.9 0 3.6-1.7 3.6-3.6V7.6C20 5.7 18.3 4 16.4 4H7.6zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24"><path d="M21.9 4.6 19 19.3c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6L18.6 7c.4-.3-.1-.5-.6-.2L8 13.2l-4.4-1.4c-1-.3-1-1 .2-1.4l17.2-6.6c.8-.3 1.5.2 1 1.4z"/></svg>',
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
        <img class="partner-logo" src="${esc(p.logo)}" alt="${esc(p.name)}" title="${esc(p.name)}" loading="lazy">
      </div>`;
  }
  const initial = (p.name || '?').trim().charAt(0).toUpperCase();
  return `
    <div class="partner-chip">
      <span class="partner-dot">${esc(initial)}</span>
    </div>`;
}

function renderConfig(cfg) {

  const secText = (id) => (cfg.sections && cfg.sections[id] && cfg.sections[id].text);

  /* --- Текстові дані (data-config) --- */
  const map = {
    'phone-display': cfg.phone_display,
    'phone-link': 'tel:' + cfg.phone.replace(/[^+\d]/g, ''),
    'telegram-link': cfg.telegram,
    'viber-link': cfg.viber,
    'schedule': cfg.schedule,
    'hero-subtitle': cfg.hero.subtitle,
    'hero-cta': cfg.hero.cta,
    'hero-note': cfg.hero.note,

    'hero-title': cfg.hero.title,
    /* Заголовок плашки — один ключ на дві версії (.hero-note і .hero-mob-card) */
    'hero-note-title': cfg.hero.note_title,
    'section-prices': secText('prices'),
    'section-accessories': secText('accessories'),
    'section-partners': secText('partners'),
    'section-contacts': secText('contacts'),
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
  document.getElementById('waterPrices').innerHTML = cfg.prices.water.map(w => priceCardHTML(w, true)).join('');
  document.getElementById('icePrices').innerHTML = cfg.prices.ice.map(w => priceCardHTML(w, false)).join('');
  document.getElementById('accessoriesGrid').innerHTML = cfg.prices.accessories.map(accessoryCardHTML).join('');

  const waterSection = document.getElementById('waterPrices');
  if (waterSection) {
    const banner = document.createElement('aside');
    banner.className = 'promo-banner reveal';
    banner.innerHTML = `
      <div class="video-shell">
        <video class="promo-video" controls playsinline preload="metadata"
               aria-label="Промо-відео VodaLed">
          <source src="assets/vodaled_promo.mp4" type="video/mp4">
          Ваш браузер не підтримує вбудоване відео.
        </video>
        <button class="video-cover" type="button" aria-label="Відтворити відео">
          <span class="play-ic">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          </span>
        </button>
      </div>`;
    waterSection.appendChild(banner);

    const video = banner.querySelector('.promo-video');
    const cover = banner.querySelector('.video-cover');
    if (video && cover) {
      const hide = () => cover.classList.add('hidden');
      const show = () => cover.classList.remove('hidden');
      cover.addEventListener('click', () => {
        hide();
        video.play().catch(() => show());
      });
      video.addEventListener('playing', hide);
      video.addEventListener('pause', show);
      video.addEventListener('ended', show);
    }
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

const CAROUSEL_AUTO_SPEED = 0.5;        /* px за кадр автопрокрутки */
const CAROUSEL_ARROW_MIN = 260;         /* мінімальний крок стрілки, px */

function initCarousel() {
  const track = document.getElementById('partnersCarousel');
  const prevBtn = document.getElementById('carPrev');
  const nextBtn = document.getElementById('carNext');
  if (!track) return;

  let x = 0;
  let half = 0;
  let mode = 'auto';          /* auto | arrow | drag */
  let arrowDir = 0;
  let arrowTargetX = 0;
  let drag = null;            /* { startX, startOffset } */
  let hoverPaused = false;

  const ensureLoopWidth = () => {
    const wrap = track.parentElement;
    if (!wrap) return;
    let guard = 0;
    while (track.scrollWidth / 2 < wrap.clientWidth + 40 && guard++ < 3) {
      track.innerHTML += track.innerHTML;
    }
    half = track.scrollWidth / 2;
  };

  const measure = () => { half = track.scrollWidth / 2; };
  ensureLoopWidth();

  const normalizeX = () => {
    let delta = 0;
    if (half <= 0) return delta;
    while (x <= -half) { x += half; delta += half; }
    while (x > 0) { x -= half; delta -= half; }
    return delta;
  };

  const apply = () => { track.style.transform = `translateX(${x}px)`; };

  const setMode = (m) => {
    mode = m;
    track.classList.toggle('dragging', m === 'drag');
  };

  /* --- Стрілки --- */
  const arrowStep = (dir) => {
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 0;
    const first = track.firstElementChild;
    const chip = first ? first.getBoundingClientRect().width + gap : 0;
    return dir * Math.max(chip, CAROUSEL_ARROW_MIN);
  };

  const nudge = (dir) => {
    measure();
    setMode('arrow');
    arrowDir = dir;
    arrowTargetX = x + arrowStep(dir);
  };

  /* Стрічка рухається вліво (x зменшується), тому «наступні» = x - крок */
  prevBtn?.addEventListener('click', () => nudge(1));
  nextBtn?.addEventListener('click', () => nudge(-1));

  /* --- Перетягування мишкою або пальцем --- */
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { startX: e.clientX, startOffset: x, moved: false };
    setMode('drag');
  });

  window.addEventListener('pointermove', (e) => {
    if (mode !== 'drag' || !drag) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 4) drag.moved = true;
    x = drag.startOffset + dx;
    normalizeX();
    apply();
  });

  window.addEventListener('pointerup', () => {
    if (mode !== 'drag' || !drag) return;
    drag = null;
    setMode('auto');
    hoverPaused = false;
  });

  track.addEventListener('mouseenter', () => { hoverPaused = true; });
  track.addEventListener('mouseleave', () => { hoverPaused = false; });

  window.addEventListener('resize', () => { ensureLoopWidth(); normalizeX(); apply(); });

  (function step() {
    if (mode === 'auto' && !hoverPaused && half > 0) {
      x -= CAROUSEL_AUTO_SPEED;
      normalizeX();
      apply();
    } else if (mode === 'arrow' && arrowDir !== 0) {
      /* Плавний рух до цілі стрілки, потім пауза 1.4 с і повернення до авто */
      const remain = arrowTargetX - x;
      if (Math.abs(remain) <= 3) {
        x = arrowTargetX;
        arrowTargetX += normalizeX();
        apply();
        arrowDir = 0;
        setTimeout(() => { if (mode === 'arrow') setMode('auto'); }, 1400);
      } else {
        x += remain * 0.14;
        arrowTargetX += normalizeX();
        apply();
      }
    }
    requestAnimationFrame(step);
  })();
}

/* ----------------- Звук «буль» (зона «Вода» + промо-відео) --------------- */

function initDropSound() {
  const section = document.querySelector('[data-drop-sound]');
  if (!section) return;

  const waterZone = section.querySelector('#water');
  const waterGrid = section.querySelector('#waterPrices');
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

  document.addEventListener('touchend', unlock, { passive: true, capture: true });
  document.addEventListener('touchstart', function firstTouch() {
    document.removeEventListener('touchstart', firstTouch);
    setTimeout(unlock, 350);
  }, { passive: true, capture: true });

  let lastMouseMove = 0;
  let lastPlay = 0;
  document.addEventListener('mousemove', () => { lastMouseMove = performance.now(); }, { passive: true });

  const positionFx = () => {
    if (!fx) return;
    const video = section.querySelector('.promo-video') || section.querySelector('.video-shell');
    if (!video) return;
    const sRect = section.getBoundingClientRect();
    const vRect = video.getBoundingClientRect();
    const cx = vRect.left + vRect.width / 2 - sRect.left;
    const cy = vRect.top + vRect.height / 2 - sRect.top;
    fx.style.left = Math.round(cx - fx.offsetWidth / 2) + 'px';
    fx.style.top = Math.round(cy - 240) + 'px';
  };
  positionFx();
  window.addEventListener('resize', positionFx);

  const zoneEls = [waterZone, waterGrid].filter(Boolean);
  const zones = zoneEls.length ? zoneEls : [section];

  /* На тачскрінах немає mouseenter від курсора — тригеримо на торканні зони */
  const touchTrigger = () => {
    const now = performance.now();
    if (now - lastPlay < 800) return;
    lastPlay = now;
    playFx();
  };
  const hoverTrigger = () => {
    const now = performance.now();
    if (now - lastMouseMove > 400) return;  /* курсор нерухомий — це скрол */
    if (now - lastPlay < 800) return;       /* захист від повторів */
    lastPlay = now;
    playFx();
  };
  zones.forEach(z => {
    z.addEventListener('touchstart', touchTrigger, { passive: true });
    z.addEventListener('mouseenter', hoverTrigger);
  });

  function playFx() {

    if (fx) {
      positionFx();
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

const KYIV_CENTER = [50.4273, 30.5116]; /* вул. Казимира Малевича */

/* ----------------- Звук кришталю (картки льоду) ------------------------- */

function initIceSound() {
  const iceZone = document.getElementById('ice');
  const iceGrid = document.getElementById('icePrices');
  if (!iceGrid) return;

  let audio = null;
  let unlocked = false;

  const ensureAudio = () => {
    if (!audio) {
      try {
        audio = new Audio(CRYSTAL_SOUND_URL);
        audio.preload = 'auto';
        audio.volume = 0.5;
      } catch (e) {
        return null;
      }
    }
    return audio;
  };

  let unlocking = false;
  const unlock = () => {
    if (unlocked || unlocking) return;
    const a = ensureAudio();
    if (!a) return;
    unlocking = true;
    a.volume = 0;                 /* тихо, щоб перший дотик не засвітився */
    a.play().then(() => {
      unlocked = true;
      unlocking = false;
      a.pause();
      a.currentTime = 0;
      a.volume = 0.5;
    }).catch(() => { unlocking = false; });
  };
  document.addEventListener('pointerdown', unlock, { capture: true });
  document.addEventListener('keydown', unlock);

  const play = () => {
    const a = ensureAudio();
    if (!a) return;
    a.currentTime = 0;
    a.volume = 0.5;
    const p = a.play();
    if (p && p.catch) p.catch(() => { /* ще не розблоковано — мовчки */ });
  };

  let lastMouseMove = 0;
  let lastPlay = 0;
  document.addEventListener('mousemove', () => { lastMouseMove = performance.now(); }, { passive: true });

  /* На тач-пристроях hover не існує — ловимо тап по картці */
  iceGrid.addEventListener('touchstart', () => {
    const now = performance.now();
    if (now - lastPlay < 600) return;
    lastPlay = now;
    play();
  }, { passive: true });

  let lastCard = null;
  iceGrid.addEventListener('mouseover', e => {
    const card = e.target.closest ? e.target.closest('.card') : null;
    if (!card || card === lastCard) return;   /* повторно всередині тієї ж картки — мовчки */
    lastCard = card;
    const now = performance.now();
    if (now - lastMouseMove > 400) return;    /* курсор нерухомий — це скрол */
    if (now - lastPlay < 600) return;         /* не частимо при швидкому перебігу */
    lastPlay = now;
    play();
  });

  iceGrid.addEventListener('mouseleave', () => { lastCard = null; });

  /* Заголовок «Лід» теж дзвенить — щоб зона відчувалася цілісною */
  if (iceZone) {
    iceZone.addEventListener('mouseenter', () => {
      const now = performance.now();
      if (now - lastMouseMove > 400) return;
      if (now - lastPlay < 600) return;
      lastPlay = now;
      play();
    });
  }
}

/* ------------------- Жести карти: 1 палець — сайт, 2 — карта ------------ */

function initMapTouchGestures(holder) {
  holder.addEventListener('touchstart', e => {
    if (e.touches.length < 2) e.stopImmediatePropagation();
  }, { capture: true });
}

/* --------------- Тап-анімації іконок-переваг (мобільний) ---------------- */

function initHeroFeatTaps() {
  const list = document.querySelector('.hero-mob-feats');
  if (!list) return;

  list.querySelectorAll('li').forEach(li => {
    let timer = 0;
    li.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;   /* мишею працює :hover */
      li.classList.remove('tap-anim');
      void li.offsetWidth;                     /* reflow — перезапуск анімації */
      li.classList.add('tap-anim');
      clearTimeout(timer);
      timer = setTimeout(() => li.classList.remove('tap-anim'), 900);
    });
  });
}

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

  /* Дотики: один палець гортає сайт, два — рухають/зумлять карту */
  initMapTouchGestures(holder);

  /* Зум колесом — лише коли користувач «зафіксов» карту кліком */
  map.on('click', () => map.scrollWheelZoom.enable());
  map.getContainer().addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

  map.setMinZoom(9);
  map.setMaxZoom(17);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

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

function initBottleMotion() {
  const bottle = document.querySelector('.hero-bottle');
  const hero = bottle && bottle.closest('.hero');
  if (!bottle || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const AMPLITUDE = 22;    /* px — амплітуда паралаксу */
  const EASE = 0.09;       /* згладжування паралаксу: менше = плавніше */
  const SCALE_UP = 1.028;  /* наскільки збільшується: ледь помітно, без «стрибка» */
  const SCALE_EASE = 0.07; /* згладжування: менше = повільніше й м'якше */

  let posTarget = 0;
  let posCurrent = 0;
  let scaleTarget = 1;
  let scaleCurrent = 1;
  let raf = 0;

  const computePosTarget = () => {
    if (window.innerWidth <= 760) return 0; /* мобільна сітка — без паралаксу */
    const r = hero.getBoundingClientRect();
    if (r.bottom <= 0) return 0; /* hero повністю прокручено */
    const p = Math.min(1, Math.max(0, -r.top / r.height)); /* 0 → 1 */
    return -p * AMPLITUDE;
  };

  const step = () => {
    posTarget = computePosTarget();
    posCurrent += (posTarget - posCurrent) * EASE;
    if (Math.abs(posTarget - posCurrent) < 0.05) posCurrent = posTarget;

    scaleCurrent += (scaleTarget - scaleCurrent) * SCALE_EASE;
    if (Math.abs(scaleTarget - scaleCurrent) < 0.001) scaleCurrent = scaleTarget;

    bottle.style.transform = 'translate3d(0, ' + posCurrent.toFixed(2) +
      'px, 0) scale(' + scaleCurrent.toFixed(4) + ')';

    const settled = posCurrent === posTarget && scaleCurrent === scaleTarget;
    const offscreen = hero.getBoundingClientRect().bottom <= 0;
    if (settled && offscreen) { raf = 0; return; } /* економимо кадри поза екраном */
    raf = requestAnimationFrame(step);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(step); };

  const setScale = (v) => { if (scaleTarget !== v) scaleTarget = v; wake(); };

  const overBottle = (x, y) => {
    const r = bottle.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
  /* Над кнопкою CTA та плашкою бутль не реагує: миша там — це не про нього */
  const overInteractive = (t) => !!(t && t.closest && t.closest('.hero-actions, .hero-note'));

  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    setScale(!overInteractive(e.target) && overBottle(e.clientX, e.clientY) ? SCALE_UP : 1);
  }, { passive: true });

  window.addEventListener('pointerdown', e => {
    if (!overInteractive(e.target) && overBottle(e.clientX, e.clientY)) setScale(SCALE_UP);
  }, { passive: true });

  /* Відпускання повертає бутль — і на touch, і на миші */
  const reset = () => setScale(1);
  window.addEventListener('pointerup', reset, { passive: true });
  window.addEventListener('pointercancel', reset, { passive: true });
  window.addEventListener('blur', reset);
  document.addEventListener('scroll', reset, { passive: true });

  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake);
  wake();
}

function initToTop() {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* -------- Ширина плашки «Для доставки води» = ширина CTA-кнопки --------- */

function syncNoteWidth() {
  const note = document.querySelector('.hero-note');
  const cta = document.querySelector('.hero-actions .btn');
  if (!note || !cta) return;
  if (window.innerWidth <= 760) { note.style.width = ''; return; }
  note.style.width = Math.ceil(cta.getBoundingClientRect().width) + 'px';
}

/* -------------------------------- Ініціалізація -------------------------- */

(async function init() {
  await loadComponent(COMPONENTS.header, 'header-placeholder');
  await loadComponent(COMPONENTS.footer, 'footer-placeholder');

  initMobileMenu();
  initModal();
  initToTop();
  initBottleMotion();
  initDropSound();
  initIceSound();

  try {
    const res = await fetch(CONFIG_URL);
    if (!res.ok) throw new Error(res.status);
    const cfg = await res.json();
    renderConfig(cfg);
  } catch (err) {
    console.error('Не вдалося завантажити config.json:', err);
    observeReveals(); /* усе одно показати статичний контент */
  }

  syncNoteWidth();
  window.addEventListener('resize', syncNoteWidth);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncNoteWidth);
  }

  initHeroFeatTaps();
  initCarousel();
  initKyivMap();
})();
