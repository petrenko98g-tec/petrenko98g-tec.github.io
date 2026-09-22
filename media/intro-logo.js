/* Rebrands the site's own intro overlay instead of adding a second preloader.

   The overlay (div.z-50 > black div) is the site's native preloader: it holds the
   screen, its 1750ms translateY(-100%) is the exit, and the same component's timer
   flips initStageAnimation2 — the flag every stage module waits on for its reveal.
   Measured here: hero reveal 2000-2715ms, overlay exit 3600-5300ms.

   So the build’s own logo video is only hidden, and our logo sits in the same black
   panel with the flip-in already used for the previous preloader. Both are done in the
   stylesheet (_next/static/css/…, loaded in <head>), not here: this file runs at the end
   of the body, so anything it did to the overlay came after the first paint — and an
   <img> added to React's markup before hydration made React rebuild the whole page,
   overlay included, which restarted the logo animation. Timing, easing and the exit stay
   the site's own — nothing is invented here. */
(function () {
  // ?nointro — skip the 5.5s intro overlay for THIS page load only (used for quick
  // visual checks while building). It must not write introAnimationShown: that flag
  // lives in sessionStorage and would keep the intro switched off on later normal
  // loads in the same browser session.
  if (/[?&]nointro\b/.test(location.search)) {
    var skip = document.createElement('style');
    skip.textContent = 'div.z-50:has(video){display:none!important}';
    (document.head || document.documentElement).appendChild(skip);
  }
  var SPEED = 0.85; // intro + stage run 15% faster

  // Scales the site's own transition timings instead of replacing them with new ones:
  // each element's computed duration/delay is read and written back multiplied by SPEED.
  // Elements are marked so repeated observer passes never compound the factor.
  function faster(root) {
    var els = root.querySelectorAll('*');
    for (var i = -1; i < els.length; i++) {
      var el = i < 0 ? root : els[i];
      if (el.__hscSpeed) continue;
      var cs = getComputedStyle(el);
      var d = cs.transitionDuration, dl = cs.transitionDelay;
      if ((!d || d === '0s') && (!dl || dl === '0s')) continue;
      el.__hscSpeed = true;
      el.style.setProperty('transition-duration', scale(d), 'important');
      el.style.setProperty('transition-delay', scale(dl), 'important');
    }
  }

  function scale(list) {
    return list.split(',').map(function (v) {
      var s = parseFloat(v);
      return isNaN(s) ? v : (s * SPEED).toFixed(4) + 's';
    }).join(', ');
  }

  // Only timings are touched here (style attributes, which React does not check while
  // hydrating), so this can run straight away.
  function brand() {
    var overlay = document.querySelector('div.z-50');
    if (overlay) {
      faster(overlay);
      // the lift itself runs twice as fast as the rest: the site's 1750ms exit is already
      // at 1487ms after the global scaler, and this halves that leg only
      var panel = overlay.firstElementChild;
      if (panel && !panel.__hscLift) {
        panel.__hscLift = true;
        var dur = parseFloat(getComputedStyle(panel).transitionDuration) || 1.4875;
        panel.style.setProperty('transition-duration', (dur / 2).toFixed(4) + 's', 'important');
      }
    }
    var stage = document.querySelector('.stage-module');
    if (stage) faster(stage);
  }

  brand();
  document.addEventListener('DOMContentLoaded', brand);
  window.addEventListener('load', brand);
  var mo = new MutationObserver(brand);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { mo.disconnect(); }, 15000);
})();
