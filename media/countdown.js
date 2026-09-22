/* Countdown banner.

   The build carries this as a React component, but its chunk is not in the bundle we
   ship: the banner was switched off by its dates when the build was made, so Next never
   loaded it. Every CSS class it needs is still in the stylesheet, so the markup below is
   written out here (classes, structure, close button, sr-only <time>).

   Settings are read from __NEXT_DATA__ (countdownSettings), the same place the real
   component reads them, so the banner stays data-driven rather than hard-coded. */
(function () {
  function settings() {
    var el = document.getElementById('__NEXT_DATA__');
    if (!el) return null;
    var found = null;
    (function walk(o) {
      if (found || !o || typeof o !== 'object') return;
      if (o.countdownSettings && typeof o.countdownSettings === 'object') { found = o.countdownSettings; return; }
      for (var k in o) walk(o[k]);
    })(JSON.parse(el.textContent));
    return found;
  }

  var CFG = settings();
  if (!CFG || !CFG.active || !CFG.depublishDate) return;
  var END = new Date(CFG.depublishDate).getTime();
  var CTA = (CFG.ctaGroup && CFG.ctaGroup.isActive) ? CFG.ctaGroup : null;
  var UNITS = [['d', 'днів'], ['h', 'годин'], ['m', 'хвилин'], ['s', 'секунд']];


  // Where the banner goes.
  // With the intro overlay (home page): as in the base build, first child of the sticky
  // header wrapper, so it sits above the menu and stays pinned with it. That wrapper is
  // React's markup, so the banner is added after hydration — the overlay covers it.
  // Without the overlay nothing would cover a late banner, and adding it after hydration
  // pushed the header down in view. There it goes in before the first paint, right
  // before React's root (#__next) where React never looks, and is pinned by itself:
  // sticky at the top, with the header's own sticky offset moved down by its height.
  var INTRO = !!document.querySelector('div.z-50 video');

  function build() {
    var host = INTRO ? document.querySelector('.sticky') : document.body;
    if (!host || document.querySelector('[data-hsc="countdown"]')) return;
    if (!INTRO && !document.getElementById('__next')) return;

    var bar = document.createElement('div');
    bar.setAttribute('data-hsc', 'countdown');
    bar.className = '\n\t\t\t\tgrid grid-cols-1 md:grid-cols-[1fr_auto_1fr]\n\t\t\t\tmd:grid-rows-1\n\t\t\t\t' +
      'sm:px-[1.875rem] \n\t\t\t\tcontent-center        \n        text-center sm:text-left\n\t\t\t\t' +
      'place-items-center\t\t\t\t\n        overflow-hidden\n        relative\n        z-1\n\t\t ' +
      'grid-rows-countdownMobile bg-ci-yellow text-black';

    var units = UNITS.map(function (u) {
      return '<div class="\n\t\t\t\tflex flex-col \n\t\t\t\titems-center \n\n\t\t\t px-5 py-3.5 md:py-6">' +
        '<span data-u="' + u[0] + '" class="club:font-gravitas-one text-3.5xl sm:text-5.5xl leading-8 sm:leading-14">0</span>' +
        '<span class="leading-4 font-bold font-sofia-sans uppercase text-xxs">' + u[1] + '</span></div>';
    }).join('');

    bar.innerHTML =
      '<h4 class="\n\t\t\t\t\trow-start-2 md:row-start-auto\n          px-2 sm:px-0\n         \n          ' +
      'font-sofia-sans sm:font-sofia-sans-extra-condensed\n          font-bold\n          text-xl md:text-3.5xl\n          ' +
      'leading-[2.375rem] md:leading-8\n          tracking-normal md:tracking-0.125\n          uppercase\n        ">' +
      (CFG.ctitle || '') + '</h4>' +
      '<div class="\n\t\t\t\t\trow-start-1 md:row-start-auto\n\t\t\t\t\tw-full md:w-auto\n\t\t\t">' +
      '<time class="sr-only" dateTime="' + CFG.depublishDate + '"></time>' +
      '<div class="flex justify-center">' + units + '</div></div>' +
      (CTA ? '<div class="\n\t\t\t\t\trow-start-3 md:row-start-auto\n          self-start md:self-auto\n\t\t\t">' +
        '<a class="\n                    font-sofia-sans-extra-condensed\n                    font-bold\n                    ' +
        'text-xl md:text-3.5xl\n                    leading-[2.375rem] md:leading-8\n                    ' +
        'tracking-normal sm:tracking-0.125\n                    uppercase\n                    underline\n                  " ' +
        'href="' + CTA.ctaLink + '">' + CTA.ctaText + '</a></div>' : '');


    if (INTRO) {
      host.insertBefore(bar, host.firstChild);
    } else {
      bar.setAttribute('data-hsc-out', '');
      host.insertBefore(bar, document.getElementById('__next'));
      var setH = function () {
        document.documentElement.style.setProperty('--gg-cd-h', bar.offsetHeight + 'px');
      };
      setH();
      if (window.ResizeObserver) new ResizeObserver(setH).observe(bar);
    }
    tick();
  }

  function tick() {
    var left = Math.max(0, END - Date.now());
    var v = {
      d: Math.floor(left / 86400000),
      h: Math.floor(left / 3600000) % 24,
      m: Math.floor(left / 60000) % 60,
      s: Math.floor(left / 1000) % 60
    };
    var bar = document.querySelector('[data-hsc="countdown"]');
    if (!bar) return;
    UNITS.forEach(function (u) {
      var el = bar.querySelector('[data-u="' + u[0] + '"]');
      if (el) el.textContent = v[u[0]];
    });
  }

  // tablet only (the site's sm..lg range, 640-1023px): digits 27.75% down (15% twice) from the
  // native sm:text-5.5xl / sm:leading-14 (3.5rem). Phone and desktop keep their own sizes.
  var css = document.createElement('style');
  css.textContent = [
    // out-of-root banner: pinned on its own, above the header (z-20); the header sticks
    // right under it instead of at 0
    '[data-hsc="countdown"][data-hsc-out]{position:sticky;top:0;z-index:21}',
    'html:has([data-hsc-out]) .sticky{top:var(--gg-cd-h,0px)!important}',
    // Phone (below md, where the banner stacks): title and link share one row under the
    // digits instead of taking a row each. The rows become the site's own 2-row template
    // (grid-rows-countdownMobileNoCTA: 2fr 1fr), the digits span both columns, and the
    // two texts sit side by side with the site's gap-4 (1rem) between them.
    '@media (max-width:767px){',
    '  [data-hsc="countdown"]{grid-template-columns:auto auto;grid-template-rows:auto auto;'
    + 'justify-content:center;column-gap:1rem}',
    '  [data-hsc="countdown"] > div:nth-child(2){grid-column:1 / -1;grid-row:1}',
    '  [data-hsc="countdown"] > h4{grid-column:1;grid-row:2;padding-left:0;padding-right:0}',
    '  [data-hsc="countdown"] > div:nth-child(3){grid-column:2;grid-row:2;align-self:center}',
    '}',
    // phone: the banner eats a quarter of the screen at the site's own digit size, so the
    // digits and both texts drop a step and the box keeps a tighter vertical padding
    '@media (max-width:639px){',
    '  [data-hsc="countdown"]{padding-top:.5rem!important;padding-bottom:.5rem!important;row-gap:0}',
    '  [data-hsc="countdown"] [data-u]{font-size:1.75rem!important;line-height:2rem!important}',
    '  [data-hsc="countdown"] [data-u] + *{font-size:.625rem!important;line-height:1rem!important}',
    '  [data-hsc="countdown"] h4,[data-hsc="countdown"] a{font-size:1rem!important;line-height:1.5rem!important}',
    '}',
    '@media (min-width:640px) and (max-width:1023px){',
    '  [data-hsc="countdown"] [data-u]{font-size:2.5rem!important;line-height:2.5rem!important}',
    // heading and link cut by the same amount as the digits, so the title stops
    // wrapping to three lines and the link clears the close button
    '  [data-hsc="countdown"] h4,[data-hsc="countdown"] a{font-size:1.375rem!important;line-height:1.7rem!important}',
    '}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  if (!INTRO) build();                                   // before the first paint

  // not before React has taken over the server HTML (see media/ready.js)
  (window.hscReady || function (f) { f(); })(function () {
    build();
    document.addEventListener('DOMContentLoaded', build);
    window.addEventListener('load', build);
    setInterval(tick, 1000);
    var mo = new MutationObserver(build);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 10000);
  });
})();
