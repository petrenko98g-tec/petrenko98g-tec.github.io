/* Waitlist block: the three perks («Знижки — першим 300», «Футболка — кожному»,
   «Тренування в парку — вже зараз») sit in the right column, where the photo was.

   The block is the site's image-text teaser without an image, so its media column stays
   empty. The perks are written in the block's copy as <p><strong>title</strong><br>text</p>;
   from md up (where the module is two columns) they are shown in that empty column inside
   the same rte-style box, with the text column's padding mirrored (md:pr-10 lg:pr-20
   xl:pr-52, as the teaser uses when the text is on the right). Below md the module is one
   column, so the perks stay in the copy where they are. */
(function () {
  var css = document.createElement('style');
  css.textContent = [
    // below md the filled media box would still keep its mb-6 above the headline
    '@media (max-width:767px){[data-hsc="wl-media"]{display:none!important}}',
    '[data-hsc="wl-right"]{display:none}',
    '@media (min-width:768px){[data-hsc="wl-right"]{display:flex}',
    '  [data-hsc="wl-moved"]{display:none}}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  // The headline sits inside the copy column, which is half the block: at the section's
  // own size a single word filled a line by itself. It is lifted into the module's grid
  // instead, across both columns, so it keeps that size and breaks into whole phrases —
  // the copy and the perks stay in their columns underneath.
  function headline() {
    var jump = document.getElementById('Вейт-лист');
    var sec = jump && jump.closest('section');
    var mod = sec && sec.querySelector('.image-text-teaser-module');
    if (!mod || mod.querySelector('[data-hsc="wl-head"]')) return;
    var h2 = mod.querySelector('h2.headline-group');
    if (!h2) return;
    var row = document.createElement('div');
    row.setAttribute('data-hsc', 'wl-head');
    // the copy column's own indents on both sides, so the headline starts on the
    // same line as the text under it
    row.className = 'md:col-span-2 md:pl-10 lg:pl-20 xl:pl-52 md:pr-10 lg:pr-20 xl:pr-52';
    mod.insertBefore(row, mod.firstChild);
    row.appendChild(h2);
  }

  function place() {
    headline();
    var jump = document.getElementById('Вейт-лист');
    var sec = jump && jump.closest('section');
    var mod = sec && sec.querySelector('.image-text-teaser-module');
    if (!mod || mod.querySelector('[data-hsc="wl-right"]')) return;
    var media = mod.querySelector(':scope > div:empty');
    var rte = mod.querySelector('.rte-style');
    if (!media || !rte) return;

    var perks = [].filter.call(rte.querySelectorAll(':scope > p'), function (p) {
      return p.querySelector('strong');
    });
    if (!perks.length) return;

    var col = document.createElement('div');
    col.setAttribute('data-hsc', 'wl-right');
    col.className = 'flex-col justify-center w-full h-full md:pr-10 lg:pr-20 xl:pr-52';
    var box = document.createElement('div');
    // same text colour as the copy column (text-white on dark, text-black on light)
    var tone = rte.closest('.text-white, .text-black');
    box.className = rte.className + ' ' + (tone && tone.classList.contains('text-black') ? 'text-black' : 'text-white');
    perks.forEach(function (p) {
      box.appendChild(p.cloneNode(true));
      p.setAttribute('data-hsc', 'wl-moved');
    });
    col.appendChild(box);
    media.setAttribute('data-hsc', 'wl-media');
    media.appendChild(col);
  }

  // not before React has taken over the server HTML (see media/ready.js)
  (window.hscReady || function (f) { f(); })(function () {
    place();
    var mo = new MutationObserver(place);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); place(); }, 12000);
  });
})();
