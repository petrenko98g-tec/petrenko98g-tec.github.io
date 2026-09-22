/* "Цей сайт наша робота" + the FCUA mark at the foot of the footer, the way the
   eurosport site carries it (its .ft__made row: the line, a 14px logo beside it, the
   logo inverted to sit on a dark ground).

   The footer comes from the bundle, so there is no field for this in the page data — the
   row is appended to the footer's bottom block after hydration, in the footer's own small
   type (font-sofia-sans text-sm text-grey4). */
(function () {
  var LINE = 'Цей сайт наша робота';

  var css = document.createElement('style');
  css.textContent = [
    // a row of its own under the footer columns, centred and sitting on the bottom edge
    '[data-hsc="credit"]{display:flex;align-items:center;justify-content:center;gap:.5rem;',
    // the block above ends on a half pixel, so the row overlaps it by one (the site's
    // own -mb-[1px] trick) and the page's white cannot show through the seam
    '  width:100%;padding:0 1.5rem 2rem;margin-top:-1px}',
    '@media (min-width:768px){[data-hsc="credit"]{padding-bottom:3rem}}',
    // the mark is drawn dark; on the black footer it runs inverted, as on the original
    '[data-hsc="credit"] img{height:14px;width:auto;filter:invert(1) brightness(2.2)}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  function place() {
    var foot = document.querySelector('footer.footer') || document.querySelector('footer');
    if (!foot || foot.querySelector('[data-hsc="credit"]')) return;
    var row = document.createElement('div');
    row.setAttribute('data-hsc', 'credit');
    // the row sits below the footer's own black block, so it carries the same ground
    row.className = 'bg-black';
    row.innerHTML = '<span class="font-sofia-sans text-sm text-grey4">' + LINE + '</span>' +
      '<img src="media/fcua.svg" alt="Fitness Consulting">';
    foot.appendChild(row);

    // target for the "Контакти" entry in the navigation
    if (!document.getElementById('Контакти')) {
      var a = document.createElement('span');
      a.id = 'Контакти';
      foot.insertBefore(a, foot.firstChild);
    }
  }

  // not before React has taken over the server HTML (see media/ready.js)
  (window.hscReady || function (f) { f(); })(function () {
    place();
    var mo = new MutationObserver(place);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); place(); }, 12000);
  });
})();
