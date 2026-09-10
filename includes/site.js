/* ============================================================
   СПІЛЬНИЙ СКРИПТ САЙТУ
   1) Підвантажує шапку та підвал (includes/header.html, includes/footer.html)
      у елементи <div data-include="header"></div> / <div data-include="footer"></div>
   2) Накладає спільну поведінку: мобільне меню, navbar при скролі,
      плавний скрол, динамічний рік, анімація появи блоків
   3) Завантажує config.json і заповнює всі data-config елементи
      (ціни, телефони, графік, адреса, соцмережі) на будь-якій сторінці

   Підключення на сторінці:
     <link rel="stylesheet" href="includes/site.css">
     <script src="includes/site.js" defer></script>
   ============================================================ */
(function() {
  'use strict';

  /* ---------- 1. ВСТАВЛЕННЯ ШАПКИ ТА ПІДВАЛА ---------- */
  function injectInclude(name) {
    var host = document.querySelector('[data-include="' + name + '"]');
    if (!host) return Promise.resolve();
    return fetch('includes/' + name + '.html', { cache: 'no-store' })
      .then(function(r) {
        if (!r.ok) throw new Error(name + ': HTTP ' + r.status);
        return r.text();
      })
      .then(function(html) {
        host.innerHTML = html;
        // На підсторінках якірні посилання (#services тощо) ведуть на головну
        if (!document.getElementById('services')) {
          host.querySelectorAll('a[href^="#"]').forEach(function(a) {
            a.setAttribute('href', 'index.html' + a.getAttribute('href'));
          });
        }
      })
      .catch(function(err) {
        console.error('Не вдалося завантажити includes/' + name + '.html:', err);
      });
  }

  /* ---------- 2. СПІЛЬНА ПОВЕДІНКА ---------- */
  function initBehaviour() {
    // Navbar — фон при скролі
    var navbar = document.getElementById('navbar');
    if (navbar) {
      var onScroll = function() { navbar.classList.toggle('scrolled', window.scrollY > 40); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // Мобільне меню
    var burger = document.getElementById('burger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (burger && mobileMenu) {
      burger.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        burger.classList.toggle('active');
      });
      mobileMenu.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() {
          mobileMenu.classList.remove('active');
          burger.classList.remove('active');
        });
      });
    }

    // Динамічний рік та стаж
    var cy = document.getElementById('currentYear');
    if (cy) cy.textContent = new Date().getFullYear();
    var ye = document.getElementById('yearsExp');
    if (ye) ye.textContent = new Date().getFullYear() - 2009;

    // Плавна поява блоків
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function(el) { observer.observe(el); });
    }

    // Плавний скрол до якорів з відступом на шапку
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var href = anchor.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------- 3. CONFIG.JSON ---------- */
  function applyConfig(cfg) {
    var phoneSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    var tgSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>';

    // ===== ТЕЛЕФОНИ (hero, index.html) =====
    var hp = document.querySelector('[data-config="hero-phones"]');
    if (hp && cfg.phones) {
      var heroHtml = cfg.phones.map(function(p) {
        return '<a href="tel:' + p.tel + '" class="phone-btn">' +
          '<span class="phone-icon">' + phoneSvg + '</span>' +
          '<span class="phone-number">' + p.number + '</span></a>';
      }).join('');
      if (cfg.telegram) {
        heroHtml += '<a href="' + cfg.telegram.url + '" target="_blank" class="btn-telegram" data-config="hero-telegram">' + tgSvg + ' ' + cfg.telegram.label + '</a>';
      }
      hp.innerHTML = heroHtml;
    }

    // ===== ТЕЛЕФОНИ (блок "Контакти", index.html) =====
    var cp = document.querySelector('[data-config="contact-phones"]');
    if (cp && cfg.phones) {
      cp.innerHTML = cfg.phones.map(function(p) {
        return '<a class="cm-value" href="tel:' + p.tel + '">' + p.number + '</a><br>';
      }).join('');
    }

    // ===== ТЕЛЕФОНИ (сторінка цін) =====
    var pp = document.getElementById('page-phones');
    if (pp && cfg.phones) {
      pp.innerHTML = cfg.phones.map(function(p) {
        return '<a href="tel:' + p.tel + '">' + p.number + '</a>';
      }).join('');
    }

    // ===== TELEGRAM =====
    var ct = document.querySelector('[data-config="contact-telegram"]');
    if (ct && cfg.telegram) { ct.href = cfg.telegram.url; ct.textContent = 'Написати в Telegram'; }
    var pt = document.querySelector('[data-config="page-telegram"]');
    if (pt && cfg.telegram) { pt.href = cfg.telegram.url; }

    // ===== ФУТЕР: ТЕЛЕФОНИ =====
    var fc = document.getElementById('footer-contacts');
    if (fc && cfg.phones) {
      fc.querySelectorAll('li.fphone').forEach(function(li) { li.remove(); });
      var tgA = fc.querySelector('[data-config="social-telegram"]');
      var tgLi = tgA ? tgA.closest('li') : null;
      cfg.phones.forEach(function(p) {
        var li = document.createElement('li');
        li.className = 'fphone';
        li.innerHTML = '<a href="tel:' + p.tel + '">' + p.number + '</a>';
        fc.insertBefore(li, tgLi);
      });
    }

    // ===== СОЦМЕРЕЖІ (усі data-config="social-*") =====
    if (cfg.social) {
      [['social-telegram', cfg.social.telegram],
       ['social-youtube', cfg.social.youtube],
       ['social-facebook', cfg.social.facebook],
       ['social-instagram', cfg.social.instagram]].forEach(function(pair) {
        var key = pair[0], url = pair[1];
        if (!url) return;
        document.querySelectorAll('[data-config="' + key + '"]').forEach(function(a) {
          a.href = url;
        });
      });
    }

    // ===== ГРАФІК РОБОТИ =====
    if (cfg.schedule) {
      var sw = document.querySelector('[data-config="schedule-weekdays"]');
      if (sw) sw.textContent = cfg.schedule.weekdays;
      var swe = document.querySelector('[data-config="schedule-weekends"]');
      if (swe) swe.textContent = cfg.schedule.weekends;
      var ms = document.querySelector('[data-config="map-schedule"]');
      if (ms) ms.textContent = cfg.schedule.weekdays;
      var pw = document.querySelector('[data-config="page-schedule-weekdays"]');
      if (pw) pw.textContent = cfg.schedule.weekdays;
      var pe = document.querySelector('[data-config="page-schedule-weekends"]');
      if (pe) pe.textContent = cfg.schedule.weekends;
    }

    // ===== АДРЕСА =====
    if (cfg.address) {
      var ca = document.querySelector('[data-config="contact-address"]');
      if (ca) ca.innerHTML = (cfg.address.full || '').replace(/\n/g, '<br>');
      var ma = document.querySelector('[data-config="map-address"]');
      if (ma) ma.textContent = cfg.address.short;
      var pa = document.querySelector('[data-config="page-address"]');
      if (pa) pa.textContent = cfg.address.full;
    }

    // ===== FAQ: адреса + графік =====
    var fa = document.querySelector('[data-config="faq-address-schedule"]');
    if (fa && cfg.address && cfg.schedule) {
      fa.textContent = cfg.address.full + '. ' + cfg.schedule.weekdays;
    }

    // ===== ЦІНИ =====
    var pc = document.querySelector('[data-config="pricing"]');
    if (pc && cfg.pricing) {
      var tapeSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/></svg>';
      var dvSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>';
      var reelSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/></svg>';
      var audioSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
      var betaSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>';
      var scanSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
      var svgs = [tapeSvg, dvSvg, reelSvg, audioSvg, betaSvg, scanSvg];
      pc.innerHTML = cfg.pricing.map(function(row, i) {
        var tag = row.tag ? ' <span class="tag">' + row.tag + '</span>' : '';
        var svg = svgs[i] || svgs[0];
        return '<div class="pricing-row">' +
          '<div class="fmt">' + svg + ' ' + row.format + tag + '</div>' +
          '<div class="pr">' + row.price + ' ₴ <small>' + row.unit + '</small></div>' +
        '</div>';
      }).join('');
    }
  }

  /* ---------- ЗАПУСК ---------- */
  function boot() {
    Promise.all([injectInclude('header'), injectInclude('footer')]).then(initBehaviour);

    fetch('config.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(applyConfig)
      .catch(function(err) {
        console.error('Помилка завантаження config.json — дані на сторінці не оновлено. Перевірте синтаксис JSON:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
