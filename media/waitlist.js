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
    '@media (max-width:767px){[data-gg="wl-media"]{display:none!important}}',
    '[data-gg="wl-right"]{display:none}',
    '@media (min-width:768px){[data-gg="wl-right"]{display:flex}',
    '  [data-gg="wl-moved"]{display:none}}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  function place() {
    var jump = document.getElementById('Вейт-лист');
    var sec = jump && jump.closest('section');
    var mod = sec && sec.querySelector('.image-text-teaser-module');
    if (!mod || mod.querySelector('[data-gg="wl-right"]')) return;
    var media = mod.querySelector(':scope > div:empty');
    var rte = mod.querySelector('.rte-style');
    if (!media || !rte) return;

    var perks = [].filter.call(rte.querySelectorAll(':scope > p'), function (p) {
      return p.querySelector('strong');
    });
    if (!perks.length) return;

    var col = document.createElement('div');
    col.setAttribute('data-gg', 'wl-right');
    col.className = 'flex-col justify-center w-full h-full md:pr-10 lg:pr-20 xl:pr-52';
    var box = document.createElement('div');
    // same text colour as the copy column (text-white on dark, text-black on light)
    var tone = rte.closest('.text-white, .text-black');
    box.className = rte.className + ' ' + (tone && tone.classList.contains('text-black') ? 'text-black' : 'text-white');
    perks.forEach(function (p) {
      box.appendChild(p.cloneNode(true));
      p.setAttribute('data-gg', 'wl-moved');
    });
    col.appendChild(box);
    media.setAttribute('data-gg', 'wl-media');
    media.appendChild(col);
  }

  // not before React has taken over the server HTML (see media/ready.js)
  (window.ggReady || function (f) { f(); })(function () {
    place();
    var mo = new MutationObserver(place);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); place(); }, 12000);
  });
})();
