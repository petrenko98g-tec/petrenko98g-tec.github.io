/* FAQ as an accordion, built out of the three-small card.

   The bundle does carry the site's own accordion (acf/accordionteaser → AccordionModule),
   but its webpack chunk (8427) is not part of the bundle we ship, so the module renders
   nothing. The block therefore stays the site's
   image-text teaser and its copy — already written as <p><strong>question</strong><br>
   answer</p> — is folded into rows here.

   Every class below is taken from .background-three-small-module-card-component, so a row
   is that card: bg-gray12 body, rounded-md, the h4 title (font-sofia-sans-extra-condensed
   text-3.5xl leading-8 tracking-0.125 uppercase), the 80x2 ci-color rule under it, the
   rte-style copy. On hover the row grows the way the card does (its own
   hover:w-[calc(100%+2rem)] hover:m-[-1rem] on a 500ms transition-all), without the
   card's white inversion. Only the row layout and the +/x marker are added, after the
   sketch for this block. */
(function () {
  var EASE = 'cubic-bezier(0.33, 1, 0.68, 1)';

  var CARD = 'w-full flex flex-col overflow-hidden rounded-md bg-gray12 text-white';
  var TITLE = 'uppercase font-bold font-sofia-sans-extra-condensed text-3.5xl leading-8 '
            + 'tracking-0.125';
  var RULE = 'h-0.5 w-20 bg-ci-color';
  var BODY = 'rte-style alt:font-montserrat club:font-sofia-sans alt2:font-open-sans '
           + 'leading-5.5 w-full rte-clear-p';

  function build() {
    // found by the block's jumpmark (jumpmarkLabel "Питання" in the data), not by its
    // headline, so a new headline does not switch the accordion off
    var mark = document.getElementById('Питання') || document.getElementById('App');
    var sec = mark && mark.closest('section');
    var mods = sec ? [sec.querySelector('.image-text-teaser-module')] : [];
    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      var rte = mod && mod.querySelector('.rte-style');
      if (!rte || rte.querySelector('[data-hsc="faq-item"]')) continue;

      var ps = rte.querySelectorAll('p');
      var rows = [];
      for (var j = 0; j < ps.length; j++) {
        var q = ps[j].querySelector('strong');
        if (!q) continue;
        var answer = '', node = q.nextSibling;              // everything after the <br>
        while (node) {
          answer += node.nodeType === 1 ? node.outerHTML : (node.textContent || '');
          node = node.nextSibling;
        }
        rows.push({ q: q.textContent.trim(), a: answer.replace(/^\s*(<br\s*\/?>)?\s*/, '') });
      }
      if (!rows.length) continue;

      var html = '';
      for (var k = 0; k < rows.length; k++) {
        html +=
          '<div data-hsc="faq-item" class="' + CARD + '">' +
            '<button type="button" data-hsc="faq-q" aria-expanded="false">' +
              '<span data-hsc="faq-mark" aria-hidden="true">' +
                '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">' +
                  '<path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2"/>' +
                '</svg>' +
              '</span>' +
              '<span class="' + TITLE + '">' + rows[k].q + '</span>' +
            '</button>' +
            '<div data-hsc="faq-a" style="height:0">' +
              '<div data-hsc="faq-inner">' +
                '<div class="' + RULE + '"></div>' +
                '<div class="' + BODY + '"><p>' + rows[k].a + '</p></div>' +
              '</div>' +
            '</div>' +
          '</div>';
      }
      rte.innerHTML = html;
      wire(rte);
    }
  }

  function wire(root) {
    [].forEach.call(root.querySelectorAll('[data-hsc="faq-q"]'), function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.parentElement;
        var panel = item.querySelector('[data-hsc="faq-a"]');
        var open = btn.getAttribute('aria-expanded') === 'true';
        [].forEach.call(root.querySelectorAll('[data-hsc="faq-item"]'), function (other) {
          if (other === item) return;                       // one row at a time
          other.querySelector('[data-hsc="faq-q"]').setAttribute('aria-expanded', 'false');
          other.querySelector('[data-hsc="faq-a"]').style.height = '0';
        });
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        panel.style.height = open ? '0' : panel.firstElementChild.offsetHeight + 'px';
      });
    });
  }

  var css = document.createElement('style');
  css.textContent = [
    // the card's own p-6 / sm:p-8 box, split between the header row and the panel
    // hover: the row grows on every side — 1rem out left and right (the card's own
    // hover:m-[-1rem]) and .5rem up and down, so it keeps .5rem of the 1rem gap to its
    // neighbours. Padding grows by the same amount, so the question and the answer stay
    // where they are under the pointer and nothing around the row moves. Tailwind's
    // duration-300 on its default ease.
    '[data-hsc="faq-item"]{--gx:0rem;--gy:0rem;padding:var(--gy) 0;margin-bottom:calc(-1 * var(--gy));'
      + 'margin-top:calc(-1 * var(--gy));transition:width .3s cubic-bezier(.4,0,.2,1),'
      + 'margin .3s cubic-bezier(.4,0,.2,1),padding .3s cubic-bezier(.4,0,.2,1)}',
    '[data-hsc="faq-item"] + [data-hsc="faq-item"]{margin-top:calc(1rem - var(--gy))}',
    '@media (hover:hover){[data-hsc="faq-item"]:hover{--gx:1rem;--gy:.5rem;width:calc(100% + 2rem);'
      + 'margin-left:-1rem;margin-right:-1rem}}',
    '[data-hsc="faq-q"],[data-hsc="faq-inner"]{transition:padding .3s cubic-bezier(.4,0,.2,1)}',
    '[data-hsc="faq-q"]{display:flex;align-items:center;gap:1rem;width:100%;text-align:left;'
      + 'padding:1.5rem calc(1.5rem + var(--gx));background:none;border:0;cursor:pointer;color:inherit}',
    '@media (min-width:640px){[data-hsc="faq-q"]{padding:2rem calc(2rem + var(--gx))}}',
    '[data-hsc="faq-mark"]{flex:0 0 auto;display:flex;align-items:center;justify-content:center;'
      + 'width:2rem;height:2rem;border:1px solid currentColor;border-radius:9999px;'
      + 'transition:transform .25s ' + EASE + '}',
    '[data-hsc="faq-q"][aria-expanded="true"] [data-hsc="faq-mark"]{transform:rotate(45deg)}',
    // the question reads as a control, not a card title, so it runs on the step the CTA
    // and the menu items use (text-1.75xl = 1.375rem) instead of the card-title step
    '[data-hsc="faq-q"] .text-3\\.5xl{font-size:1.375rem!important;line-height:2rem!important}',
    '[data-hsc="faq-a"]{overflow:hidden;transition:height .3s ' + EASE + '}',
    '[data-hsc="faq-inner"]{padding:0 calc(1.5rem + var(--gx)) 1.5rem calc(4rem + var(--gx))}',
    '@media (min-width:640px){[data-hsc="faq-inner"]{padding:0 calc(2rem + var(--gx)) 2rem calc(5rem + var(--gx))}}',
    // the rule sits above the copy with the card's own mb-4 / sm:mb-6 gap
    '[data-hsc="faq-inner"] > .h-0\\.5{margin-bottom:1rem}',
    '@media (min-width:640px){[data-hsc="faq-inner"] > .h-0\\.5{margin-bottom:1.5rem}}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  // not before React has taken over the server HTML (see media/ready.js)
  (window.hscReady || function (f) { f(); })(function () {
    build();
    document.addEventListener('DOMContentLoaded', build);
    window.addEventListener('load', build);
    var mo = new MutationObserver(build);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); build(); }, 12000);
  });
})();
