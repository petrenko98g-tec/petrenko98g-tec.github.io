/* Header: the location line next to the CTA, the CTA sizing, the desktop logo/menu
   placement, and a plain #waitlist anchor.

   The location line is drawn in CSS (a ::after on the CTA's row), not added as an
   element: the header is React's markup, and an element slipped in before hydration
   made React throw the server HTML away and render the page again (#418). As CSS it is
   there from the first paint on every page and React never sees it. Its type copies
   the hero eyebrow's classes value for value — tracking-subline (.25rem),
   font-sofia-sans-extra-condensed, font-bold, uppercase, leading-8 — at the eyebrow's
   sm size (.875rem); before, the element took its size from overrides that only
   index.html loads, so on the other pages it rendered at the raw 2rem, 508px wide. */
(function () {
  // the video control in the hero is the one label the bundle still prints in German
  var LABELS = {
    'Video anhalten': 'Зупинити відео',
    'Video abspielen': 'Відтворити відео',
    'Video starten': 'Відтворити відео'
  };

  function labels() {
    [].forEach.call(document.querySelectorAll('button, a'), function (el) {
      var t = (el.textContent || '').trim();
      var uk = LABELS[t];
      if (uk) el.textContent = uk;
      var a = el.getAttribute('aria-label');
      if (a && LABELS[a]) el.setAttribute('aria-label', LABELS[a]);
    });
  }

  function misc() {
    labels();
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

  var css = document.createElement('style');
  css.textContent = [
    // desktop only, like before; the pin is the same single-path icon, white like the
    // header text, with the .5rem gap it had as an inline svg
    '@media (min-width:1024px){',
    '  .sticky .flex.items-center:has(> .cta-button) > .cta-button{order:2}',
    '  .sticky .flex.items-center:has(> .cta-button)::after{content:"ЖК на Счастливому · Рівне";order:1;'
    + 'display:block;margin-right:1.5rem;padding-left:calc(10px + .5rem);white-space:nowrap;'
    + 'font-family:var(--font-sofia-sans-extra-condensed,sans-serif),sans-serif;font-weight:700;'
    + 'font-size:.875rem;line-height:2rem;letter-spacing:.25rem;text-transform:uppercase;color:#fff;'
    + 'background:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%2714%27 viewBox=%270 0 10 14%27%3E%3Cpath fill=%27%23fff%27 fill-rule=%27evenodd%27 d=%27M5 0C2.239 0 0 2.239 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.761-2.239-5-5-5zm0 6.75A1.75 1.75 0 1 1 5 3.25a1.75 1.75 0 0 1 0 3.5z%27/%3E%3C/svg%3E") left center/10px 14px no-repeat}',
    '}',
    // header CTA on the same step as the menu items next to it (lg:text-1.75xl = 1.375rem);
    // the hero CTA carries the same size, so both buttons on the page read as one class
    // width:auto — the bundle pins the button to w-44 (176px) on a phone; with the bigger
    // label and px-7 the text no longer fit that box and spilled out to the right, 19px
    // off centre. Sized to its label, the padding is equal on both sides again.
    '.sticky .cta-button{min-width:0!important;width:auto!important;white-space:nowrap!important}',
    // phone: the label runs on the card-title step and the box keeps the site's own
    // py-3.5; the 1.375rem version below belongs to the desktop row, where it matches
    // the menu items beside it
    '@media (max-width:1023px){.sticky .cta-button{font-size:1.125rem!important;padding:.625rem 1rem!important;line-height:1.5rem!important}}',
    '@media (min-width:1024px){.sticky .cta-button{font-size:1.375rem!important;padding:.875rem 1.75rem!important}}',
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
    // the gap after the logo is the same step the menu items use between themselves
    // (their own lg:mr-8 = 2rem), so the row reads as one evenly spaced group
    '  .sticky .flex.w-full.justify-center{justify-content:flex-start!important;padding-left:2rem}',
    '}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  // not before React has taken over the server HTML (see media/ready.js)
  (window.ggReady || function (f) { f(); })(function () {
    misc();
    var mo = new MutationObserver(misc);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); misc(); }, 10000);
  });

  // NOTE: <html lang> stays 'de' in the live DOM — the Next bundle rewrites it from
  // its own locale on every render, and switching the locale to 'uk' blanks the page
  // (no translation bundle for it). The served HTML carries lang="uk"; leave it there.
})();
