/* Marks the blocks the restyle has reached.

   The stylesheet needs to address one section at a time, and the sections carry no id
   of their own — only the modules inside them do. So each block that has been taken
   through the new style gets a data-eq name here, and the rules in the stylesheet hang
   off that name. A block without a name keeps the old look, which is what lets the
   restyle roll out a screen at a time. */
(function () {
  function tag() {
    var slider = document.querySelector('.slider-module');
    if (slider) {
      var s = slider.closest('section');
      if (s) s.setAttribute('data-eq', 'zones');
    }
    // the first image-text teaser on the page is «Тобі більше не потрібна сила волі»
    var teaser = document.querySelector('.image-text-teaser-module');
    if (teaser) {
      var t = teaser.closest('section');
      if (t && !t.getAttribute('data-eq')) t.setAttribute('data-eq', 'willpower');
    }
    // the waitlist block goes black with the rest once the yellow is gone (2026-11-09)
    var wl = document.getElementById('Вейт-лист');
    var w = wl && wl.closest('section');
    if (w && !w.getAttribute('data-eq')) w.setAttribute('data-eq', 'waitlist');
  }


  /* The first screen stays put while the next one rides over it.

     Measured on the reference: its hero sits in a wrapper of exactly twice the hero's
     height and is `position:sticky; top:<header height>`, so it holds for one screen of
     scrolling while the section below — opaque, in normal flow — climbs over it. The
     markup here has no such wrapper, so one is put around the hero and kept the right
     height; the sections after it are lifted a layer so they paint above. */
  function pinHero() {
    var hero = document.querySelector('.stage-module');
    var wrap = hero && hero.parentElement;
    if (!wrap || !wrap.parentElement) return;
    var pin = wrap.parentElement.hasAttribute('data-eq-pin') ? wrap.parentElement : null;
    if (!pin) {
      pin = document.createElement('div');
      pin.setAttribute('data-eq-pin', '');
      wrap.parentElement.insertBefore(pin, wrap);
      pin.appendChild(wrap);
    }
    size(pin, hero);
    // the hero changes height after the page settles (the phone layout lets it grow with
    // its content), and a wrapper measured once leaves a band of empty page behind it
    if (window.ResizeObserver && !pin.__eqWatch) {
      pin.__eqWatch = true;
      new ResizeObserver(function () { size(pin, hero); }).observe(hero);
    }
  }

  function size(pin, hero) {
    var head = document.querySelector('.sticky.top-0.z-20');
    var top = head ? Math.round(head.getBoundingClientRect().height) : 0;
    var h = Math.round(hero.getBoundingClientRect().height);
    if (!h) return;
    // the reference's geometry: a wrapper of twice the hero's height pulled back up by
    // one, so the block below starts right under the hero while the wrapper still holds
    // a hero's worth of scroll — that is the distance over which it climbs across
    pin.style.height = (h * 2) + 'px';
    pin.style.marginBottom = (-h) + 'px';
    document.documentElement.style.setProperty('--eq-head', top + 'px');
  }

  function resize() {
    var pin = document.querySelector('[data-eq-pin]');
    var hero = document.querySelector('.stage-module');
    if (pin && hero) size(pin, hero);
  }


  /* Text arrives rather than appears.

     The reference brings a block in as one: the lines of a block share a start and the
     same curve as the headline above them (750ms, cubic-bezier(0.33, 1, 0.68, 1)). Only
     the words inside a headline follow one another — everything else moves together, or
     the screen reads as a scatter of separate arrivals.

     It runs once per element. A visitor who asked the system for less motion gets none. */
  // Only the blocks that already sit in normal flow are lifted over the pinned hero.
  // Anything the page positions itself — the intro overlay, the stage's own layers — is
  // left alone: forcing it into the flow pushed the hero a screen down and left white.
  function layer() {
    var main = document.querySelector('main.relative');
    if (!main) return;
    [].forEach.call(main.children, function (el) {
      if (el.hasAttribute('data-eq-pin') || el.hasAttribute('data-eq-above')) return;
      if (getComputedStyle(el).position !== 'static') return;
      el.setAttribute('data-eq-above', '');
    });
  }

  function arrive() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    [].forEach.call(document.querySelectorAll('section[data-eq], .stage-module'), function (sec) {
      var bits = sec.querySelectorAll('.rte-style, [data-hsc="para"], [data-hsc="fine"],'
        + ' .alice-carousel__slider-item__title, .alice-carousel__slider-item__paragraph,'
        + ' .cta-link, .cta-button, [data-hsc="form"]');
      [].forEach.call(bits, function (el) {
        if (el.__eqIn || el.closest('.sticky')) return;
        el.__eqIn = true;
        el.setAttribute('data-eq-in', '');
        el.style.transitionDelay = '0ms';
        // inside the stage the cue is the intro, not the scroll (see heroCue)
        if (!el.closest('.stage-module')) watch(el);
      });
    });
  }

  var seen = window.IntersectionObserver ? new IntersectionObserver(function (rows) {
    rows.forEach(function (r) {
      if (!r.isIntersecting) return;
      if (r.target.__eqRelease) r.target.__eqRelease();
      else r.target.classList.add('eq-shown');
      seen.unobserve(r.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' }) : null;

  function watch(el) {
    if (seen) seen.observe(el); else el.classList.add('eq-shown');
  }


  /* Headlines: the words ride up from under a mask.

     Measured on the reference, frame by frame: every word sits in a box of its own with
     overflow clipped, and the word inside starts a line below and travels up to its
     place. It never fades — the opacity is 1 the whole way — and the travel decays
     (79, 60, 45, 33, 25, 19, 14, 10, 7, 5, 4 px on consecutive frames), which is the
     shape of the easing the build already carries: cubic-bezier(0.33, 1, 0.68, 1) over
     750ms. The words follow each other 60ms apart — the reference's headlines run to
     three words and ours to nine, so its tenth of a second would stretch into a crawl.

     The build animates its words only on the first screen; here every headline gets it,
     the first screen when the intro lets go, the rest as the eye reaches them. */
  var WORD = 60;
  var heroOut = false;                 // the intro has let the first screen go
  function headlines() {
    [].forEach.call(document.querySelectorAll('section[data-eq] .headline-group, .stage-module .headline-group'), function (h) {
      if (h.__eqHead) return;
      var words = h.querySelectorAll('span > span');
      if (!words.length) return;
      h.__eqHead = true;
      [].forEach.call(words, function (w, i) {
        var box = w.parentElement;
        box.style.display = 'inline-block';
        box.style.overflow = 'clip';
        // A tight box cuts what rises above the letters — the breve on й, any accent.
        // The box is opened upwards and pulled back by the same amount, so the line stays
        // where it was and only the clip edge moves out of the glyph's way. The word then
        // waits 130% down, far enough that the opened top shows nothing of it either.
        box.style.paddingTop = '.18em';
        box.style.marginTop = '-.18em';
        w.style.transition = 'transform .75s cubic-bezier(0.33,1,0.68,1)';
        w.style.transitionDelay = (i * WORD) + 'ms';
        w.style.transform = 'translateY(130%)';
        w.style.opacity = '1';
      });
      h.__eqRelease = function () {
        [].forEach.call(words, function (w) { w.style.transform = 'translateY(0)'; });
      };
      if (h.closest('.stage-module')) {
        // the first screen waits for the intro — unless it has already gone, which is
        // what happens when React renders this headline again after the page settled
        if (heroOut) requestAnimationFrame(function () { requestAnimationFrame(h.__eqRelease); });
        return;
      }
      watch(h);
    });
  }

  /* The first screen comes in when the intro lets go.

     The overlay holds the screen for several seconds; anything released before it lifts
     has already finished by the time anyone can see it — which is what happened when the
     cue was the headline's own timings. So the cue is the overlay itself: the moment it
     leaves the page, the lines of the first screen follow one after another.

     A repeat visit, where the intro does not play at all, gets them at once. */
  function heroCue() {
    var stage = document.querySelector('.stage-module');
    var bits = stage ? stage.querySelectorAll('[data-eq-in]') : [];
    if (!stage || !bits.length || stage.__eqCue) return;
    stage.__eqCue = true;

    var head = stage.querySelector('.headline-group');
    function go() {
      // a frame apart, or the browser jumps to the end state without playing it
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          heroOut = true;
          if (head && head.__eqRelease) head.__eqRelease();
          [].forEach.call(bits, function (el) {
            el.style.transitionDelay = '0ms';
            el.classList.add('eq-shown');
          });
        });
      });
    }

    // not "the overlay has gone" but "the overlay is going": the two motions overlap,
    // the way they do on the reference, and the screen no longer waits in silence
    // The overlay's outer box never moves — its black panel does (translateY to -100%),
    // and the box itself is removed only 1.7s after the panel is gone. So the panel is
    // what is watched: the first pixel it rises is the cue.
    function leaving() {
      var ov = document.querySelector('div.z-50');
      if (!ov) return true;
      var panel = ov.firstElementChild || ov;
      var c = getComputedStyle(panel);
      if (c.display === 'none' || c.visibility === 'hidden') return true;
      return panel.getBoundingClientRect().top < -2;
    }

    if (leaving()) return go();
    var tick = setInterval(function () {
      if (!leaving()) return;
      clearInterval(tick); clearTimeout(net); go();
    }, 40);
    var net = setTimeout(function () { clearInterval(tick); go(); }, 12000);
  }

  // not before React has taken over the server HTML (see media/ready.js)
  (window.hscReady || function (f) { f(); })(function () {
    tag();
    pinHero();
    layer();
    arrive();
    headlines();
    heroCue();
    window.addEventListener('resize', resize);
    var mo = new MutationObserver(function () { tag(); pinHero(); layer(); arrive(); headlines(); heroCue(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); tag(); pinHero(); arrive(); headlines(); }, 12000);
  });
})();
