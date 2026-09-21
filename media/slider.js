/* Slider: no arrows, drag to move, and it advances on its own.

   Dragging was already on (Swiper runs with allowTouchMove + simulateTouch); only the
   arrow buttons had to go, and grabCursor is Swiper's own option so the pointer shows
   the grab hand.

   Autoplay is NOT bundled in this copy of Swiper (sw.autoplay is undefined), so the
   carousel is stepped with the instance's own slideNext() on a timer (see autoplay()).
   It pauses while the user drags and whenever the section is off screen.

   The reveal is the site's own: every slide already carries the `imagereveal` wrapper
   (clip-path, 700ms, ease-in-out) with the scale(1.1) zoom layer inside — the same
   markup the stage uses. Replaying it means resetting those two inline values and
   letting the site's own transition run. Nothing new is animated here. */
(function () {
  var STEP = 3500;                                                   // pause between slides
  var FIRST = 1000;                              // first move after the carousel shows up

  // One autoplay clock for both carousels. It runs only while the carousel is on screen:
  // the first move comes FIRST ms after it appears (a full STEP there read as "starts
  // late"), then one every STEP. Only a drag pauses it — the pointer merely resting on
  // the cards used to stop it too, and in a preview the pointer is almost always there,
  // so the carousel seemed not to start at all.
  function autoplay(target, step) {
    var kick = null, tick = null;
    function start(delay) {
      if (kick || tick) return;
      kick = setTimeout(function () {
        kick = null;
        if (!document.hidden) step();
        tick = setInterval(function () { if (!document.hidden) step(); }, STEP);
      }, delay == null ? FIRST : delay);
    }
    function stop() {
      if (kick) { clearTimeout(kick); kick = null; }
      if (tick) { clearInterval(tick); tick = null; }
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? start() : stop();
      }, { threshold: 0.25 }).observe(target);
    } else {
      start();
    }
    return { start: start, stop: stop };
  }
  var HIDDEN = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';    // the site's start state
  var SHOWN = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

  // the shoutout band — the only grid row that is a carousel
  var S = '.grid-module:has(.shoutout-teaser p.tracking-subline) .grid-wrapper';
  // every other grid row — here the price cards
  var P = '.grid-module:not(:has(.shoutout-teaser p.tracking-subline)) .grid-wrapper';

  var css = document.createElement('style');
  css.textContent = [
    '.slider-module .slider-button{display:none!important}',
    // phone: the flip-card carousel's inset (see fit() in apply)
    '@media (max-width:699px){.slider-module .swiper{margin-left:1.5rem;margin-right:1.5rem}}',
    // the card copy carries the module's own w-90vw, written for a full-width slide.
    // Our phone row shows a card plus a sliver of the next one, so 90vw is wider than
    // the card and the text ran over its neighbour. It follows the card instead.
    '@media (max-width:699px){.slider-module .swiper-slide .w-90vw{width:100%!important}}',
    // the module's own phone controls (a dot between two 7px arrows) are dropped —
    // the row is swiped, and the marks only added noise under the headline
    '[aria-label="Mobile slider navigation"]{display:none!important}',
    // Every grid row (the shoutout cards and the price cards): the card body carries the
    // module's lg:-translate-y-16 / lg:-mb-16, which lifts it 64px into the block above.
    // Here a text block sits above each row, so the lift would cover its text — dropped.
    '.grid-wrapper .shoutout-teaser > div{transform:none!important;margin-bottom:0!important}',
    // side by side (lg), the cards take the height of the tallest one: the card carries
    // h-full, and a flex item with a set height ignores align-items:stretch — released
    '@media (min-width:1024px){',
    '  .grid-wrapper{align-items:stretch!important}',
    '  .grid-wrapper .shoutout-teaser{height:auto!important;align-self:stretch}',
    '  .grid-wrapper .shoutout-teaser > div{height:100%}',
    '}',
    // The price row (Сімейний / Разовий / Місяць) takes the geometry of the flip cards
    // above it («Одна година. Три тренування.»): three equal cards, 24px apart (their
    // Swiper spaceBetween), inside the same side margins — measured 60px up to 1440 and
    // 228px from 1440 (the module's md:px-10 / xl:px-52 plus the slider's own 20px).
    '@media (min-width:1024px){',
    '  ' + P + '{padding-left:3.75rem!important;padding-right:3.75rem!important;'
    + 'column-gap:1.5rem;justify-content:center!important}',
    '  ' + P + ' .shoutout-teaser{flex:1 1 0%;max-width:none!important;'
    + 'margin-left:0!important;margin-right:0!important}',
    // the card body carries sm:max-w-112 (448px); wider than that (1920) it would sit
    // narrower than its column
    '  ' + P + ' .shoutout-teaser > div{max-width:none!important}',
    '}',
    '@media (min-width:1440px){',
    '  ' + P + '{padding-left:14.25rem!important;padding-right:14.25rem!important}',
    '}',
    // Only the shoutout band (Бранчі / Зустрічі / Події / Люди — its cards carry a subline)
    // is a carousel: four cards do not fit the row, so it becomes a horizontal strip with
    // native sideways scrolling plus the drag handler below for the mouse. The price
    // cards stay the module's own row of three.
    S + '{flex-wrap:nowrap!important;flex-direction:row!important;overflow-x:auto;'
    + 'overscroll-behavior-x:contain;scrollbar-width:none;cursor:grab;'
    + 'justify-content:flex-start;align-items:stretch}',
    S + '::-webkit-scrollbar{display:none}',
    // Phone and tablet: one card at a time with the next one showing at the edge — the
    // same read as every other carousel here (slidesPerView 1.1, a ~32px sliver); card
    // width + the 1rem gutter (the module's lg:mx-6 step halved) add up to that sliver
    S + ' .shoutout-teaser{flex:0 0 calc(100% - 3rem);max-width:calc(100% - 3rem);'
    + 'margin-right:1rem;transform:none!important;margin-top:0!important;'
    + 'margin-bottom:0!important;height:auto!important;align-self:stretch}',
    S + ' .shoutout-teaser > div{height:100%}',
    // from lg the strip holds the full-size cards side by side, as on the clone
    '@media (min-width:1024px){',
    '  ' + S + ' .shoutout-teaser{flex:0 0 28rem;max-width:28rem;margin-right:0}',
    '}',
    // ONE card-title size for the whole site, on the site's own steps: text-1.5xl
    // (1.25rem) on a phone, text-2.875xl (1.75rem) from sm up — the slider card title a
    // step down from its text-2xl/text-3.5xl, and the three-small and shoutout cards
    // brought onto the same step so every card in the page reads as the same class.
    // Above them stays the section headline (text-3.5xl / md:text-5xl), below them the
    // subline (text-xl) and the copy (text-lg).
    '.alice-carousel__slider-item__title,',
    '.background-three-small-module-card-component h4,',
    '.grid-module .shoutout-teaser h2{font-size:1.25rem!important;line-height:2rem!important}',
    '@media (min-width:640px){',
    '  .alice-carousel__slider-item__title,',
    '  .background-three-small-module-card-component h4,',
    '  .grid-module .shoutout-teaser h2{font-size:1.75rem!important;line-height:2rem!important}',
    '}',
    // Equal cards in the three-small carousel: Swiper already makes every slide as tall as
    // the tallest, but the card inside kept its own height (inline-flex items-center), so
    // a card with a two-line subline ran longer than its neighbours. The card now fills
    // its slide and the dark body (bg-gray12) takes the rest, text still from the top.
    // Its hover growth (w-[calc(100%+2rem)] m-[-1rem]) keeps growing 1rem on every side.
    '.background-three-small-module .swiper-slide > .background-three-small-module-card-component'
    + '{height:100%;align-items:stretch}',
    '.background-three-small-module .swiper-slide > .background-three-small-module-card-component:hover'
    + '{height:calc(100% + 2rem)}',
    '.background-three-small-module-card-component > .w-full{display:flex;flex-direction:column}',
    '.background-three-small-module-card-component > .w-full > .flex-col{flex:1 1 auto}',
    '.background-three-small-module-card-component .bg-gray12{flex:1 1 auto}',
    // card text sits on the module's own p-6 (24px); one step up on the site's scale
    // (p-8 = 32px) gives the copy a little more room from the card edge
    '.background-three-small-module-card-component .p-6{padding:2rem!important}',
    // room for the 4th card without shrinking the cards: the section carries the
    // site's xl:px-52 (208px) inset — drop it to the site's own md value (px-10)
    '@media (min-width:1280px){.xl\\:px-52:has(.slider-module){padding-left:2.5rem!important;padding-right:2.5rem!important}}',
    // From xl the track column is pinned to w-300/min-w-300 (1200px), so it starts after
    // the headline and ends 200px past the right edge of a 1440 screen. Swiper measures
    // that off-screen box as its viewport, so at the end of the drag it believes the last
    // card is fully shown while it is still cut off. Releasing the fixed width lets the
    // column end where the screen ends.
    '@media (min-width:1280px){',
    // the headline wrapper is w-full with no cap of its own (the xl width sits on an
    // inner div), so once the track stops being 1200px wide it swallows the whole row
    // the module's xl:px-20 also pads the right side, which left a black gutter after the
    // last card; the original runs the track to the very edge of the screen
    '  .background-three-small-module{padding-right:0!important}',
    '  .background-three-small-module > div:first-child{flex:0 0 auto;width:auto!important;max-width:23rem}',
    '  .background-three-small-module > div:nth-child(2)'
    + '{width:auto!important;min-width:0!important;max-width:none!important;flex:1 1 0%}',
    '}',
    // Tablet gets the desktop composition — headline beside the cards. It only fits if
    // the headline column is narrower than the xl one (220px instead of 300) and its
    // type drops to the site's smaller step (text-3.5xl = 2rem); otherwise the words
    // break into 3-4 characters per line. The track must be told to take the rest of
    // the row: without a width in a flex row it grows unbounded and Swiper breaks.
    '@media (min-width:768px) and (max-width:1279px){',
    '  .background-three-small-module{flex-direction:row!important;column-gap:1.5rem;'
    + 'align-items:center;padding-left:2.5rem;padding-right:0}',
    '  .background-three-small-module > div:first-child{flex:0 0 380px;max-width:380px;min-width:380px}',
    '  .background-three-small-module > div:last-child{flex:1 1 0%;min-width:0;max-width:100%}',
    // headline keeps the site's own large type and sits left, like the image-text
    // teasers; the cards simply run past the right edge and are pulled into view
    '  .background-three-small-module h2{text-align:left!important;justify-content:flex-start!important}',
    '  .background-three-small-module h2 > div{justify-content:flex-start!important;text-align:left!important}',
    '  .background-three-small-module > div:first-child > div{align-items:flex-start!important}',
    '  .background-three-small-module > div:first-child p{text-align:left!important}',
    '}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  function reveal(slide) {
    if (!slide) return;
    var wrap = slide.querySelector('.imagereveal');
    var zoom = wrap && wrap.firstElementChild;
    if (!wrap) return;
    wrap.style.transition = 'none';
    wrap.style.clipPath = HIDDEN;
    if (zoom) { zoom.style.transition = 'none'; zoom.style.transform = 'scale(1.1)'; }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        wrap.style.transition = '';                                  // back to duration-700 from the class
        wrap.style.clipPath = SHOWN;
        if (zoom) { zoom.style.transition = ''; zoom.style.transform = 'scale(1)'; }
      });
    });
  }

  // Every carousel the site marks as scrollable (allowTouchMove) gets the same treatment:
  // its own .swiper-no-swiping opt-out switched off and Swiper's grab cursor on. Without
  // it a drag that STARTS on a card is ignored — which is why the three-card block could
  // not be moved by mouse and its last card stayed cut off at the edge.
  // The card wrapper flips its text to black on hover (group-hover:text-black), and
  // every child inherits — except the subline, which carries its own text-white from the
  // module data and so stayed white on the white background. Dropping that one class lets
  // it inherit like the title and the body copy, using the site's own hover mechanism.
  function fixSublineHover() {
    [].forEach.call(document.querySelectorAll(
      '.background-three-small-module-card-component p.tracking-subline.text-white'), function (p) {
      p.classList.remove('text-white');
    });
  }

  // Mouse drag for the shoutout strip: it is a plain overflow container, not Swiper,
  // so it scrolls with a finger or trackpad on its own but needs this for a mouse.
  function dragScroll() {
    [].forEach.call(document.querySelectorAll('.grid-wrapper'), function (row) {
      if (row.__ggDragScroll) return;
      row.__ggDragScroll = true;
      var down = false, startX = 0, startLeft = 0, moved = 0;
      row.addEventListener('pointerdown', function (e) {
        if (e.button || getComputedStyle(row).overflowX !== 'auto') return;
        down = true; moved = 0; startX = e.clientX; startLeft = row.scrollLeft;
        row.style.cursor = 'grabbing';
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        moved = Math.max(moved, Math.abs(dx));
        var target = startLeft - dx;
        // dragging out of either end of the strip is carried over into the other copy of
        // the cards, and the grab point is carried with it, so the row keeps following the
        // pointer instead of stopping at the first or the last card
        var p = row.__ggPeriod ? row.__ggPeriod() : 0;
        if (p) {
          while (target < 0) { target += p; startLeft += p; }
          while (target >= p) { target -= p; startLeft -= p; }
        }
        row.scrollLeft = target;
        if (moved > 4) e.preventDefault();
      });
      window.addEventListener('pointerup', function () {
        down = false; row.style.cursor = '';
      });
      // a drag must not fire the link/click underneath it
      row.addEventListener('click', function (e) { if (moved > 4) { e.preventDefault(); e.stopPropagation(); } }, true);
    });
  }

  // The shoutout strip is a plain scroll container, not Swiper, so "endless" is done the
  // way a marquee is: the cards are cloned once and the scroll offset is wrapped by half
  // the track whenever it runs past either copy. Both halves are identical, so the wrap
  // cannot be seen. It advances on the same cadence and with the same pause rules as the
  // slider below.
  function stripLoop() {
    [].forEach.call(document.querySelectorAll('.grid-wrapper'), function (row) {
      var rs = getComputedStyle(row);
      if (rs.overflowX !== 'auto' || rs.flexDirection !== 'row') return;   // stacked: no strip
      var cards = [].filter.call(row.children, function (c) {
        return c.classList.contains('shoutout-teaser') && !c.hasAttribute('data-gg-clone');
      });
      if (cards.length < 2) return;
      if (!row.querySelector('[data-gg-clone]')) {
        cards.forEach(function (c) {
          var k = c.cloneNode(true);
          k.setAttribute('data-gg-clone', '');
          k.setAttribute('aria-hidden', 'true');
          // the text block sits in a spacer whose height the site's reveal writes inline
          // while it measures; a copy keeps whatever number was there at that instant and
          // nothing corrects it afterwards. Dropped, so the spacer sizes to its content.
          [].forEach.call(k.querySelectorAll('[style*="height"]'), function (d) {
            d.style.removeProperty('height');
          });
          row.appendChild(k);
        });
      }
      if (row.__ggStrip) return;
      row.__ggStrip = true;

      // The wrap distance is the width of one copy of the set — the distance between a
      // card and its clone — not half the scroll width: the row's own padding sits once
      // at each end, so the two halves are not the same length and wrapping by half would
      // shift the strip sideways by that padding.
      function period() {
        var cs = row.querySelectorAll('.shoutout-teaser');
        var n = cs.length / 2;
        return n >= 1 ? cs[n].offsetLeft - cs[0].offsetLeft : 0;
      }
      row.__ggPeriod = period;                                     // the mouse drag wraps too
      // the new position is kept off the far boundary, so the scroll event it fires itself
      // can never wrap it straight back
      function wrapScroll() {
        var p = period();
        if (p && row.scrollLeft >= p) row.scrollLeft -= p;
      }
      row.addEventListener('scroll', function () {
        if (row.__ggSmooth) return;                                // don't cut a running step
        wrapScroll();
      });

      function stride() {
        var cs = row.querySelectorAll('.shoutout-teaser');
        if (cs.length < 2) return 0;
        return cs[1].getBoundingClientRect().left - cs[0].getBoundingClientRect().left;
      }
      // wrapped before the step, and only when the step would run past the copy, so the
      // strip never has to jump while it is moving
      function step() {
        var d = stride(), p = period();
        if (!d || !p) return;
        if (row.scrollLeft + d >= p) row.scrollLeft -= p;
        row.__ggSmooth = true;
        row.scrollBy({ left: d, behavior: 'smooth' });
        setTimeout(function () { row.__ggSmooth = false; }, 800);
      }
      var play = autoplay(row, step);
      row.addEventListener('pointerdown', play.stop);
      window.addEventListener('pointerup', function () {
        if (row.__ggWasDown) { row.__ggWasDown = false; play.start(STEP); }
      });
      row.addEventListener('pointerdown', function () { row.__ggWasDown = true; });
    });
  }

  function freeDrag() {
    [].forEach.call(document.querySelectorAll('.swiper'), function (el) {
      var sw = el.swiper;
      if (!sw || el.__ggDrag || !sw.params.allowTouchMove) return;
      el.__ggDrag = true;
      sw.params.noSwiping = false;
      sw.params.grabCursor = true;
      if (sw.setGrabCursor) sw.setGrabCursor();

      // A track whose slides add up to exactly its own width has nothing to drag, and
      // the last card sits flush against the screen edge — it reads as cut off. Leaving
      // a gutter on the right makes the row longer than the viewport, so the carousel
      // becomes draggable and the last card can be pulled fully into view.
      if (!el.closest('.slider-module') && !el.closest('.stage-module')) {
        // Keep the cards at a set width instead of stretching three of them to fill the
        // track. When they no longer fit, the row runs past the edge — which is what makes
        // the carousel draggable, and what the original does with its cut-off third card.
        var ORIG3 = sw.params.slidesPerView;
        var fitCards = function () {
          var w = window.innerWidth;
          // fractional counts leave the next card peeking, so the row is longer than the
          // track and can be pulled left — the same read as the original's cut-off card
          var per = w >= 1280 ? 2.6 : (w >= 768 ? 1.1 : ORIG3);
          if (sw.params.slidesPerView !== per) { sw.params.slidesPerView = per; sw.update(); }
        };
        fitCards();
        window.addEventListener('resize', fitCards);
      }
    });
  }

  function apply() {
    freeDrag();
    fixSublineHover();
    dragScroll();
    stripLoop();
    var el = document.querySelector('.slider-module .swiper');
    if (!el || !el.swiper || el.__ggSlider) return;
    el.__ggSlider = true;
    var sw = el.swiper;

    // 4 cards from the site's lg breakpoint up; below that keep whatever the module set.
    var ORIG = sw.params.slidesPerView;
    // Phone (below the module's own 700px breakpoint): the flip-card carousel's geometry —
    // a 24px inset (its px-6) with the first card against the left edge, so the next card
    // shows at the right. This slider ran full width with centeredSlides, which left 8px of
    // the next card, and mostly off screen.
    var ORIG_CENTER = sw.params.centeredSlides;
    function fit() {
      var w = window.innerWidth;
      var want = w >= 1024 ? 4 : ORIG;
      var center = w < 700 ? false : ORIG_CENTER;
      if (sw.params.slidesPerView !== want || sw.params.centeredSlides !== center) {
        sw.params.slidesPerView = want;
        sw.params.centeredSlides = center;
        sw.update();
        sw.slideTo(sw.activeIndex, 0);
      }
    }
    fit();
    window.addEventListener('resize', fit);

    // Endless in the hand as well as on the timer. The loop in this build never moves the
    // track back: it slides to the last snap and from then on only rotates the slide order
    // (the auto-advance cycles through all nine cards over and over on its own). Parked on
    // that last snap, Swiper treats a forward drag as dragging past the end and applies its
    // rubber-band resistance, so the row barely moved under the pointer and read as a dead
    // end. With resistance off the drag tracks the pointer 1:1 and the rotation does the
    // wrapping: measured over a drag, the visible cards move by exactly the pointer's
    // distance and the next card enters from the right, with no jump.
    sw.params.resistance = false;
    sw.params.resistanceRatio = 0;

    // Only the card that just entered view gets the reveal — the active slide is the
    // left-most of the visible group, i.e. one that was already on screen.
    sw.on('slideChangeTransitionStart', function () {
      var per = Math.ceil(sw.params.slidesPerView) || 1;
      var back = sw.previousIndex > sw.activeIndex;
      var entering = back ? sw.activeIndex : sw.activeIndex + per - 1;
      reveal(sw.slides[entering]);
    });

    // started when the section comes into view, stopped when it leaves (see autoplay)
    // this build runs the slider without Swiper's loop, so at the last snap slideNext()
    // does nothing and the row is left parked at the end — on a phone that reads as an
    // empty band. Wrap by hand: past the last card the carousel goes back to the first.
    var play = autoplay(el, function () {
      if (sw.isEnd) sw.slideTo(0); else sw.slideNext();
    });
    sw.on('touchStart', play.stop);
    sw.on('touchEnd', function () { play.start(STEP); });
  }

  // not before React has taken over the server HTML (see media/ready.js)
  (window.ggReady || function (f) { f(); })(function () {
    apply();
    document.addEventListener('DOMContentLoaded', apply);
    window.addEventListener('resize', stripLoop);
    window.addEventListener('load', apply);
    var mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); apply(); }, 12000);
  });
})();
