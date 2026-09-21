/* «Обери свій формат» — the three format cards in the style of the offer box on
   the reference offer box given for this block: title, big price with its
   period, a check-mark list, the yellow button and a small note under it.

   That box belongs to the split-text teaser, whose chunk (1988) is not in the clone, so
   the card markup is copied from the live page — its classes, the check-mark icon, the
   button — and filled with our text. Titles run on the site's card-title step (see the
   type-scale rule) instead of the box's 2.5rem, which would not fit three cards in a
   row. The header block above (textteaser «Умови / Обери свій формат.») stays React's;
   the old shoutout price row is switched off in the data and this row takes its place,
   added after hydration (media/ready.js). */
(function () {
  var CHECK = '<div class="self-start mr-4 h-6 flex items-center"><div class="text-black">' +
    '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false">' +
    '<path d="M6.9739 13.7824C6.66086 13.7824 6.3739 13.678 6.13912 13.4432L0.947816 8.25192C0.478251 7.78236 0.478251 7.05193 0.947816 6.58236C1.41738 6.1128 2.14782 6.1128 2.61738 6.58236L6.99999 10.9389L17.4087 0.556275C17.8783 0.0867103 18.6087 0.0867103 19.0783 0.556275C19.5478 1.02584 19.5478 1.75628 19.0783 2.22584L7.83477 13.4432C7.5739 13.678 7.28695 13.7824 6.9739 13.7824Z" fill="currentColor"></path></svg></div></div>';

  var CARDS = [
    { title: 'Сімейний', per: '/місяць', items: [
      'Вся сім’я тренується одночасно',
      'Платите як команда',
      'Великий дитячий басейн із тренером',
      'Перший ранок — безкоштовно'] },
    { title: 'Разовий', per: '/візит', items: [
      'Будь-яка зона',
      'Прийшов, спробував, пішов',
      'Перший ранок — безкоштовно'] },
    { title: 'Місяць', per: '/місяць', items: [
      'Всі зони',
      'Групові заняття',
      'Хол і коворкінг',
      'Перший ранок — безкоштовно'] }
  ];

  function card(c) {
    return '<div class="p-6 sm:p-8 text-center w-full bg-white shadow-activeShadow flex flex-col">' +
      '<h3 class="headline-group style-h3 break-words flex flex-wrap gap-x-3 font-bold font-extrabold uppercase font-gravitas-one justify-center">' + c.title + '</h3>' +
      '<div class="w-full flex flex-col items-center"><div class="w-full flex items-center justify-center mb-6">' +
        '<h2 class="font-bold mx-4 text-3.5xl sm:text-5.5xl leading-14 whitespace-nowrap font-gravitas-one">—</h2>' +
        '<p class="uppercase leading-6 text-2xl font-sofia-sans-extra-condensed">' + c.per + '</p></div></div>' +
      '<div class="flex flex-col w-full">' +
        c.items.map(function (t) { return '<div class="w-full flex mb-6">' + CHECK + '<p class="text-left leading-6 text-lg font-sofia-sans">' + t + '</p></div>'; }).join('') +
      '</div>' +
      '<div class="mt-auto">' +
        '<a class="cta-button variant-primary text-center duration-250 ease-in-out active:shadow-activeShadow font-sofia-sans-extra-condensed font-bold text-[1.3rem] leading-6.5 tracking-0.125 uppercase box-border py-3.5 text-black active:text-black hover:text-ci-yellow bg-ci-yellow active:bg-ci-yellow hover:bg-black border-2 border-ci-yellow hover:border-black active:border-ci-yellow w-full inline-flex items-center justify-center" href="#waitlist">У вейт-лист</a>' +
        '<div class="rte-style"><p>Ціни діють з відкриття.</p></div>' +
      '</div></div>';
  }

  var css = document.createElement('style');
  css.textContent = [
    // the row: the flip-card geometry used for the price row before (3 equal cards,
    // 24px apart, 60px / 228px side margins); stacked below lg at the box's own lg:w-120
    '[data-gg="formats"] .gg-row{display:flex;flex-direction:column;gap:1.5rem;padding:0 1.5rem 2rem}',
    '[data-gg="formats"] .gg-row > div{max-width:30rem;margin:0 auto}',
    // bottom space on the section container's own steps (py-8 sm:py-10 md:py-12 xl:py-16)
    '@media (min-width:576px){[data-gg="formats"] .gg-row{padding-bottom:2.5rem}}',
    '@media (min-width:768px){[data-gg="formats"] .gg-row{padding-bottom:3rem}}',
    '@media (min-width:1024px){[data-gg="formats"] .gg-row{flex-direction:row;align-items:stretch;padding-left:3.75rem;padding-right:3.75rem}',
    '  [data-gg="formats"] .gg-row > div{flex:1 1 0%;max-width:none;margin:0}}',
    '@media (min-width:1440px){[data-gg="formats"] .gg-row{padding-left:14.25rem;padding-right:14.25rem;padding-bottom:4rem}}',
    // card title on the site's card-title step
    '[data-gg="formats"] h3{font-size:1.25rem;line-height:2rem;margin-bottom:.5rem}',
    '@media (min-width:640px){[data-gg="formats"] h3{font-size:1.75rem}}',
    '[data-gg="formats"] .rte-style p{margin:1rem 0 0}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  function place() {
    if (document.querySelector('[data-gg="formats"]')) return;
    var head = [].filter.call(document.querySelectorAll('main h2.headline-group'), function (h) {
      return h.textContent.indexOf('Обери свій формат') > -1;
    })[0];
    var main = head && head.closest('main.relative');
    if (!main) return;
    var block = head;
    while (block.parentElement && block.parentElement !== main) block = block.parentElement;
    var sec = document.createElement('section');
    sec.setAttribute('data-gg', 'formats');
    sec.className = 'relative w-full min-h-0 overflow-hidden bg-black';
    sec.innerHTML = '<div class="gg-row">' + CARDS.map(card).join('') + '</div>';
    main.insertBefore(sec, block.nextSibling);
  }

  (window.ggReady || function (f) { f(); })(function () {
    place();
    var mo = new MutationObserver(place);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); place(); }, 12000);
  });
})();
