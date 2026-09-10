/* Countdown banner.

   golds-gym.de ships this as a React component, but our copy of the bundle does not
   contain it: when the site was cloned the banner was switched off by its dates, so
   Next never loaded that chunk. Every CSS class it needs is still in the stylesheet,
   so the markup below is copied verbatim from the live page (classes, structure,
   close button, sr-only <time>) and only the texts are ours.

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


  function build() {
    // same place as on golds-gym.de: first child of the sticky header wrapper,
    // so the banner sits above the menu and stays pinned with it
    var host = document.querySelector('.sticky');
    if (!host || host.querySelector('[data-gg="countdown"]')) return;

    var bar = document.createElement('div');
    bar.setAttribute('data-gg', 'countdown');
    bar.className = '\n\t\t\t\tgrid grid-cols-1 md:grid-cols-[1fr_auto_1fr]\n\t\t\t\tmd:grid-rows-1\n\t\t\t\t' +
      'sm:px-[1.875rem] \n\t\t\t\tcontent-center        \n        text-center sm:text-left\n\t\t\t\t' +
      'place-items-center\t\t\t\t\n        overflow-hidden\n        relative\n        z-1\n\t\t ' +
      'grid-rows-countdownMobile bg-ci-yellow text-black';

    var units = UNITS.map(function (u) {
      return '<div class="\n\t\t\t\tflex flex-col \n\t\t\t\titems-center \n\n\t\t\t px-5 py-3.5 md:py-6">' +
        '<span data-u="' + u[0] + '" class="gg:font-gravitas-one text-3.5xl sm:text-5.5xl leading-8 sm:leading-14">0</span>' +
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


    host.insertBefore(bar, host.firstChild);
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
    var bar = document.querySelector('[data-gg="countdown"]');
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
    '@media (min-width:640px) and (max-width:1023px){',
    '  [data-gg="countdown"] [data-u]{font-size:2.529rem!important;line-height:2.529rem!important}',
    // heading and link cut by the same amount as the digits, so the title stops
    // wrapping to three lines and the link clears the close button
    '  [data-gg="countdown"] h4,[data-gg="countdown"] a{font-size:1.444rem!important;line-height:1.7rem!important}',
    '}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  build();
  document.addEventListener('DOMContentLoaded', build);
  window.addEventListener('load', build);
  setInterval(tick, 1000);
  var mo = new MutationObserver(build);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { mo.disconnect(); }, 10000);
})();
