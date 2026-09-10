/* Puts the location line next to the header CTA.

   Typography is not re-specified here: the element carries the same classes as the
   hero eyebrow (tracking-subline / font-sofia-sans-extra-condensed / font-bold /
   text-2.75xl sm:text-3.5xl / uppercase), so it inherits exactly the same font and
   size, including the size overrides in hero.js. Colour is left to the header's own
   text-white. The header is rendered by the bundle, so this runs after render. */
(function () {
  var TEXT = 'ЖК на Счастливому · Рівне';
  var CLS = 'tracking-subline font-bold font-sofia-sans-extra-condensed ' +
            'text-2.75xl sm:text-3.5xl uppercase leading-7 sm:leading-8';
  // pin drawn in the same idiom as the site's inline icons: single path, currentColor
  var PIN = '<svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">' +
            '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" ' +
            'd="M5 0C2.239 0 0 2.239 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.761-2.239-5-5-5zm0 6.75' +
            'A1.75 1.75 0 1 1 5 3.25a1.75 1.75 0 0 1 0 3.5z"/></svg>';

  function misc() {
    // the bundle stamps lang from its own locale; the content is Ukrainian
    if (document.documentElement.lang !== 'uk') document.documentElement.lang = 'uk';
    // the waitlist module's jumpmark id is its label; give it a plain anchor for the CTAs
    var jump = document.getElementById('Вейт-лист');
    if (jump && !document.getElementById('waitlist')) {
      var a = document.createElement('span');
      a.id = 'waitlist';
      jump.parentNode.insertBefore(a, jump);
    }
  }

  function place() {
    misc();
    var btns = document.querySelectorAll('button.cta-button, a.cta-button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.closest('.stage-module')) continue;               // hero CTA, not the header
      var row = b.closest('.flex.items-center');
      if (!row || row.querySelector('[data-gg="place"]')) continue;
      var el = document.createElement('div');
      el.setAttribute('data-gg', 'place');
      el.className = CLS;
      el.innerHTML = PIN + '<span>' + TEXT + '</span>';
      row.insertBefore(el, b.parentElement === row ? b : b.closest('div'));
    }
  }

  var css = document.createElement('style');
  css.textContent = [
    '[data-gg="place"]{display:none;align-items:center;gap:.5rem;margin-right:1.5rem;white-space:nowrap}',
    '[data-gg="place"] svg{flex:0 0 auto}',
    '@media (min-width:1024px){[data-gg="place"]{display:flex}}',
    // header CTA matched to the hero CTA: same font size, same py-3.5 / px-7, sized to its text
    '.sticky .cta-button{font-size:1.04rem!important;padding:.875rem 1.75rem!important;min-width:0!important;white-space:nowrap!important}',
    // the countdown banner above the header is yellow now, so the header CTA goes white;
    // hover keeps the site's own invert (black fill, light label)
    '.sticky .cta-button{background-color:#fff!important;border-color:#fff!important;color:#000!important}',
    '.sticky .cta-button:hover{background-color:#000!important;border-color:#000!important;color:#fff!important}',
    // Desktop header: the centred nav block was squeezing the logo down to 30px while
    // tablet keeps it at the site's own w-12 (48px). Stop the logo shrinking and move
    // the menu to the left, next to it, using the site's own spacing step (mr-8 = 2rem).
    '@media (min-width:1024px){',
    '  .sticky .navi-brand-logo{flex:0 0 auto}',
    '  .sticky .navi-brand-logo button{width:3rem!important;min-width:3rem!important;height:3rem!important}',
    '  .sticky .flex.w-full.justify-center{justify-content:flex-start!important;padding-left:5rem}',
    '}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  place();
  document.addEventListener('DOMContentLoaded', place);
  window.addEventListener('load', place);
  var mo = new MutationObserver(place);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { mo.disconnect(); place(); }, 10000);

  // NOTE: <html lang> stays 'de' in the live DOM — the Next bundle rewrites it from
  // its own locale on every render, and switching the locale to 'uk' blanks the page
  // (no translation bundle for it). The served HTML carries lang="uk"; leave it there.
})();
