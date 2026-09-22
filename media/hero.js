/* Hero block: the paragraph under the headline and the phone field beside the button.

   The headline, the eyebrow and the button's wording live in the page data, so they are
   in the server HTML as well. What is left here has no field of its own and is added
   after React renders, then re-added if React renders again. */
(function () {
  // broken by hand into four lines that step out from 311px to 450px at the copy's own
  // size — the long middle sentence used to wrap and leave two words alone on a line
  var PARA = 'Для батьків, у яких немає часу.\n' +
             'Ти тренуєшся, дитина плаває за стіною\n' +
             'або сидить на уроці через перехід.\n' +
             'Ніяких нянь і розвозок. І вперше — жодної провини.';
  var CTA = 'Хочу бути серед перших';
  var FINE = 'Отримай першим доступ до стартових умов клубу.';

  function applyHero() {
    var group = document.querySelector('.stage-module-headline-content-group');
    if (!group) return;

    // 1. descriptive paragraph under the headline
    var headWrap = group.querySelector('h1.headline-group');
    headWrap = headWrap && headWrap.parentElement;
    var existing = group.querySelector('[data-hsc="para"]');
    if (headWrap && !existing) {
      var p = document.createElement('p');
      p.setAttribute('data-hsc', 'para');
      // white-space keeps the line breaks the copy is written with
      // full white at the site's normal weight — the earlier 300/75% washed out over the photo
      p.style.cssText = 'max-width:29em;font-size:1.375rem;font-weight:400;line-height:1.55;color:#fff;margin-top:20px;text-align:left;white-space:pre-line';
      p.textContent = PARA;
      headWrap.appendChild(p);
    } else if (existing && existing.textContent !== PARA) {
      existing.textContent = PARA;
    }

    // 2. phone field + CTA button, replacing the plain link
    var ctaRow = group.querySelector('.flex.flex-col.sm\\:flex-row, div[class*="space-y-4"][class*="p-3"]');
    if (ctaRow && !ctaRow.querySelector('[data-hsc="form"]')) {
      var holder = ctaRow.firstElementChild || ctaRow;
      var link = holder.querySelector('a, button');
      var label = CTA;
      var box = document.createElement('div');
      box.setAttribute('data-hsc', 'form');
      // phone field (min 160) + gap + the button's natural single-line width; the label
      // runs at the header's 1.375rem now, so the row needs the extra space
      box.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;max-width:560px';
      box.innerHTML =
        '<input type="tel" placeholder="Твій номер телефону" style="flex:1;min-width:160px;background:#fff;color:#000;border:none;padding:16px 20px;font-size:1.125rem;font-family:inherit;outline:none;box-sizing:border-box">' +
        '<button data-variant="primary" style="width:auto;flex:0 0 auto;white-space:nowrap;font-size:1.375rem;padding-left:1.75rem;padding-right:1.75rem" class="cta-button variant-primary text-center duration-250 ease-in-out font-sofia-sans-extra-condensed font-bold text-[1.3rem] leading-6.5 tracking-0.125 uppercase box-border py-3.5 text-black hover:text-ci-yellow bg-ci-yellow hover:bg-black border-2 border-ci-yellow hover:border-black stage-content__cta checkout-cta">' + label + '</button>';
      if (link) link.remove();
      holder.appendChild(box);

      var fine = document.createElement('p');
      fine.setAttribute('data-hsc', 'fine');
      fine.style.cssText = 'font-size:.875rem;line-height:1.6;color:#fff;margin:12px 0 0;max-width:460px';
      fine.textContent = FINE;
      holder.appendChild(fine);
    }
  }

  /* The yellow countdown bar built here was replaced by the site's own countdown
     banner (white, above the header), which the bundle already ships: it is driven
     by countdownSettings in __NEXT_DATA__ and was only dormant because its dates
     had passed. Nothing hand-made is needed. */

  // The stage video component re-renders with an empty poster attribute. An empty
  // poster is resolved by the browser as a URL relative to the page, so it tries to
  // paint index.html as an image — that is the frame that flashed before playback.
  function dropPoster() {
    var v = document.querySelector('.stage-module video');
    if (!v) return;
    var p = v.getAttribute('poster');
    if (p !== null && (p === '' || /\.html?($|\?)/.test(p))) v.removeAttribute('poster');
  }


  /* The hero video is marked autoplay, but a browser can still leave it standing: a tab
     that loads in the background never gets its first frame scheduled, a laptop on low
     power refuses the start, and coming back to the tab does not always resume it. So
     the start is asked for again — when the page becomes visible, when the video scrolls
     into view, and at the visitor's first touch of the page, which is the one moment a
     browser will never refuse.

     Only the visitor may stop it for good: the module's own control sets the flag below,
     and after that nothing here starts it again. */
  var userStopped = false;

  function keepPlaying() {
    var v = document.querySelector('.stage-module video');
    if (!v || v.__hscPlay) return;
    v.__hscPlay = true;
    // what a browser wants to see before it allows a start without a gesture
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');
    v.playsInline = true; v.setAttribute('playsinline', '');
    v.setAttribute('autoplay', '');
    v.loop = true;

    // a click on the module's own control is not a gesture to start on: it is the
    // visitor reaching for stop, and the module flips the state right after it
    var onControl = false;

    function go() {
      if (onControl || userStopped || !v.paused) return;
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* still refused — the next event tries */ });
    }

    // the module's own stop/play control decides for good
    document.addEventListener('click', function (e) {
      var hit = e.target && e.target.closest && e.target.closest('.stage-video-cta');
      if (!hit) return;
      onControl = true;                       // this listener runs before the ones below
      setTimeout(function () { userStopped = v.paused; onControl = false; }, 120);
    }, true);

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) go();
    });
    ['canplay', 'loadeddata', 'stalled', 'suspend'].forEach(function (ev) {
      v.addEventListener(ev, go);
    });
    // a touch is the one context a browser never refuses, so these stay on until the
    // video actually runs — on a phone in low power mode the first tap is the start
    var gestures = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown', 'wheel', 'scroll'];
    gestures.forEach(function (ev) {
      window.addEventListener(ev, go, { passive: true });
    });
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (rows) {
        rows.forEach(function (r) { if (r.isIntersecting) go(); });
      }, { threshold: 0.1 }).observe(v);
    }
    [0, 400, 1500, 4000].forEach(function (ms) { setTimeout(go, ms); });
  }


  // Before anything else: the video is in the server HTML, and Safari makes up its mind
  // about starting it as soon as the file's metadata arrives — long before React hydrates
  // and the tweaks below run. So the flags it asks for are set the moment this file is
  // parsed, and the first start is asked for right there.
  (function early() {
    var v = document.querySelector('.stage-module video');
    if (!v) { return document.addEventListener('DOMContentLoaded', early); }
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');
    v.playsInline = true; v.setAttribute('playsinline', '');
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* the watchers in keepPlaying ask again */ });
  })();

  function run() { applyHero(); dropPoster(); keepPlaying(); }

  var css = document.createElement('style');
  css.textContent = [
    '.stage-module-headline-content-group{align-items:flex-start!important;justify-content:center!important}',
    '.stage-module-headline-content-group>div.relative{text-align:left!important;align-items:flex-start!important}',
    'h1.headline-group.style-h2{justify-content:flex-start!important}',
    // the CTA row carries p-3, which pushed the field/button 12px right of the headline
    '.stage-module-headline-content-group .p-3{padding-left:0!important;padding-right:0!important}',
    // on xl the site indents the stage content by px-52 (208px); use its own md value
    // (px-10) instead, so the desktop text starts at the left like the tablet layout
    '@media (min-width:1280px){.stage-module .xl\\:px-52{padding-left:2.5rem!important;padding-right:2.5rem!important}}',
    // gap eyebrow -> headline: the site's mb-6 (24px) cut by 35%
    '.stage-module .tracking-subline.mb-6{margin-bottom:15.6px!important}',
    // the line above the headline keeps the build's own steps (1.625rem, 2rem from sm),
    // which is what carries it against a full-bleed photo; the same classes sit on the
    // header's location line, where the small steps stay
    '.tracking-subline.text-2\\.75xl{font-size:.75rem!important}',
    '.tracking-subline.sm\\:text-3\\.5xl{font-size:.875rem!important}',
    '.stage-module .tracking-subline.text-2\\.75xl{font-size:1.125rem!important}',
    '@media (min-width:640px){.stage-module .tracking-subline.sm\\:text-3\\.5xl{font-size:1.25rem!important}}',
    '@media (max-width:640px){.cta-button.stage-content__cta.checkout-cta{width:100%!important}}',
    // on a phone the written line breaks only make ragged half-lines — let the copy flow,
    // and the copy steps back down so it does not read as loud as the headline above it
    '@media (max-width:640px){p[data-hsc="para"]{white-space:normal!important;',
    '  font-size:1.125rem!important;line-height:1.6!important;',
    // the flowing copy evens its own lines out rather than dropping two words alone
    '  text-wrap:balance}}'
  ].join('\n');
  document.head.appendChild(css);

  // not before React has taken over the server HTML (see media/ready.js)
  (window.hscReady || function (f) { f(); })(function () {
    run();
    document.addEventListener('DOMContentLoaded', run);
    window.addEventListener('load', run);
    var mo = new MutationObserver(run);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); run(); }, 10000);
  });
})();
