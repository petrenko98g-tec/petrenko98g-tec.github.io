/* When the page tweaks in media/*.js may touch the DOM.

   Every tweak edits markup that React renders. If the server HTML is changed before
   React has hydrated it, React finds a DOM that does not match (minified error #418),
   throws the server HTML away and renders the page again from scratch — on the home page
   that rebuilt the intro overlay about 180ms in, so the logo animation started twice.

   So the tweaks wait until Next reports hydration done (its own performance mark
   "afterHydrate" / measure "Next.js-hydration"). Nothing visible depends on them early:
   on the home page the intro overlay covers the first two seconds, the countdown banner
   on the other pages is placed outside React's root before the first paint (see
   countdown.js), and the header location line is pure CSS (see header-place.js). */
(function () {
  var queue = [], done = false;

  function hydrated() {
    return performance.getEntriesByName('afterHydrate').length > 0 ||
           performance.getEntriesByName('Next.js-hydration').length > 0;
  }

  function flush() {
    if (done) return;
    done = true;
    var list = queue; queue = [];
    list.forEach(function (fn) {
      try { fn(); } catch (e) { if (window.console) console.error(e); }
    });
  }

  // ?rawreact — debugging only: none of the tweaks run, so the page shows exactly what
  // React renders. Used to compare that output with the server HTML.
  var raw = /[?&]rawreact\b/.test(location.search);

  // ?capture — debugging only: keeps a copy of React's very first render, taken at the
  // moment Next marks hydration done (a layout effect, before any later effect runs).
  // Used to bring the server HTML back in line with what React renders.
  if (/[?&]capture\b/.test(location.search) && performance.mark) {
    // React keeps the server's attributes when it hydrates (only tags and text are
    // compared), so a snapshot of a hydrated page would carry the old classes along —
    // a colour or background change in the data would never reach the server HTML.
    // Emptying the root makes React render the page from its data alone.
    var rootEl = document.getElementById('__next');
    if (rootEl) rootEl.innerHTML = '';
    var mark = performance.mark.bind(performance);
    performance.mark = function (name) {
      if (name === 'afterHydrate' && !window.__ggFirstRender) {
        var root = document.getElementById('__next');
        window.__ggFirstRender = root ? root.innerHTML : '';
        // also parked outside React's root, so a headless --dump-dom can read it back
        var park = document.createElement('script');
        park.type = 'text/plain'; park.id = 'gg-first-render';
        park.textContent = window.__ggFirstRender.replace(/<\/script/gi, '<\\/script');
        document.body.appendChild(park);
      }
      return mark.apply(null, arguments);
    };
  }

  window.ggReady = function (fn) {
    if (raw) return;
    if (done) fn(); else queue.push(fn);
  };

  var started = Date.now();
  (function wait() {
    if (hydrated()) return requestAnimationFrame(flush);
    if (Date.now() - started > 4000) return flush();            // safety net
    requestAnimationFrame(wait);
  })();
})();
