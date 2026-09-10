/* Slider: no arrows, drag to move, and it advances on its own.

   Dragging was already on (Swiper runs with allowTouchMove + simulateTouch); only the
   arrow buttons had to go, and grabCursor is Swiper's own option so the pointer shows
   the grab hand.

   Autoplay is NOT bundled in this copy of Swiper (sw.autoplay is undefined), so the
   carousel is stepped with the instance's own slideNext() on a timer. It pauses while
   the pointer is over it, while the user drags, and whenever the section is off screen.

   The reveal is the site's own: every slide already carries the `imagereveal` wrapper
   (clip-path, 700ms, ease-in-out) with the scale(1.1) zoom layer inside — the same
   markup the stage uses. Replaying it means resetting those two inline values and
   letting the site's own transition run. Nothing new is animated here. */
(function () {
  var TIMER = null;
  var STEP = 3500;                                                   // pause between slides
  var HIDDEN = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';    // the site's start state
  var SHOWN = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

  var css = document.createElement('style');
  css.textContent = [
    '.slider-module .slider-button{display:none!important}',
    // room for the 4th card without shrinking the cards: the section carries the
    // site's xl:px-52 (208px) inset — drop it to the site's own md value (px-10)
    '@media (min-width:1280px){.xl\\:px-52:has(.slider-module){padding-left:2.5rem!important;padding-right:2.5rem!important}}',
    // three-small module: the site turns its row layout on at xl (1280px). Bring the
    // same layout down to the tablet range so the headline sits beside the cards there
    // too, using the module's own xl values (max-w-92 = 23rem, min-w 300px).
    '@media (min-width:768px) and (max-width:1279px){',
    '  .background-three-small-module{flex-direction:row!important;column-gap:3rem;align-items:center;'
    + 'justify-content:space-between;padding-left:5rem;padding-right:0}',
    '  .background-three-small-module > div:first-child{max-width:23rem!important;min-width:300px!important;flex:0 0 auto}',
    // the track column must be told to take the rest of the row: at xl the module
    // gives it a fixed w-300, and without a width in a flex row it grows unbounded
    '  .background-three-small-module > div:last-child{flex:1 1 0%;min-width:0;max-width:100%}',
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
      if (!el.closest('.slider-module')) {
        // Keep the cards at a set width instead of stretching three of them to fill the
        // track. When they no longer fit, the row runs past the edge — which is what makes
        // the carousel draggable, and what the original does with its cut-off third card.
        var ORIG3 = sw.params.slidesPerView;
        var fitCards = function () {
          var w = window.innerWidth;
          // fractional counts leave the next card peeking, so the row is longer than the
          // track and can be pulled left — the same read as the original's cut-off card
          var per = w >= 1280 ? 2.6 : (w >= 768 ? 1.6 : ORIG3);
          if (sw.params.slidesPerView !== per) { sw.params.slidesPerView = per; sw.update(); }
        };
        fitCards();
        window.addEventListener('resize', fitCards);
      }
    });
  }

  function apply() {
    freeDrag();
    var el = document.querySelector('.slider-module .swiper');
    if (!el || !el.swiper || el.__ggSlider) return;
    el.__ggSlider = true;
    if (TIMER) { clearInterval(TIMER); TIMER = null; }   // never stack timers
    var sw = el.swiper;

    // 4 cards from the site's lg breakpoint up; below that keep whatever the module set.
    var ORIG = sw.params.slidesPerView;
    function fit() {
      var want = window.innerWidth >= 1024 ? 4 : ORIG;
      if (sw.params.slidesPerView !== want) { sw.params.slidesPerView = want; sw.update(); }
    }
    fit();
    window.addEventListener('resize', fit);

    // Only the card that just entered view gets the reveal — the active slide is the
    // left-most of the visible group, i.e. one that was already on screen.
    sw.on('slideChangeTransitionStart', function () {
      var per = Math.ceil(sw.params.slidesPerView) || 1;
      var back = sw.previousIndex > sw.activeIndex;
      var entering = back ? sw.activeIndex : sw.activeIndex + per - 1;
      reveal(sw.slides[entering]);
    });

    // The timer is started when the section comes into view and stopped when it leaves,
    // instead of ticking from page load and skipping turns. A free-running interval made
    // the first move land anywhere between 0 and STEP after the slider appeared, which
    // read as the carousel "switching on late". Stopping also keeps a single timer alive
    // if the framework rebuilds the slider — the previous one is always cleared.
    var hover = false;
    function step() { if (!hover && !document.hidden) sw.slideNext(); }
    function start() { if (!TIMER) TIMER = setInterval(step, STEP); }
    function stop() { if (TIMER) { clearInterval(TIMER); TIMER = null; } }

    el.addEventListener('pointerenter', stop);
    el.addEventListener('pointerleave', start);
    sw.on('touchStart', stop);
    sw.on('touchEnd', function () { setTimeout(start, STEP); });

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? start() : stop();
      }, { threshold: 0.25 }).observe(el);
    } else {
      start();
    }
  }

  apply();
  document.addEventListener('DOMContentLoaded', apply);
  window.addEventListener('load', apply);
  var mo = new MutationObserver(apply);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { mo.disconnect(); apply(); }, 12000);
})();
