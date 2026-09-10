/* Rebrands the site's own intro overlay instead of adding a second preloader.

   The overlay (div.z-50 > black div) is the site's native preloader: it holds the
   screen, its 1750ms translateY(-100%) is the exit, and the same component's timer
   flips initStageAnimation2 — the flag every stage module waits on for its reveal.
   Measured on this clone: hero reveal 2000-2715ms, overlay exit 3600-5300ms.

   So the Gold's Gym logo video is only hidden, and our logo is placed in the same
   black div with the flip-in already used for the previous preloader. Timing, easing
   and the exit stay the site's own — nothing is invented here. */
(function () {
  var LOGO = 'media/logo-icon-yellow.png';

  // ?nointro — skip the 5.5s intro overlay. Used for quick visual checks while
  // building; the stage reveal is driven by its own timer, so nothing else changes.
  if (/[?&]nointro\b/.test(location.search)) {
    var skip = document.createElement('style');
    skip.textContent = 'div.z-50:has(video){display:none!important}';
    (document.head || document.documentElement).appendChild(skip);
    try { sessionStorage.setItem('introAnimationShown', 'true'); } catch (e) {}
  }
  var SPEED = 0.85; // intro + stage run 15% faster

  // Scales the site's own transition timings instead of replacing them with new ones:
  // each element's computed duration/delay is read and written back multiplied by SPEED.
  // Elements are marked so repeated observer passes never compound the factor.
  function faster(root) {
    var els = root.querySelectorAll('*');
    for (var i = -1; i < els.length; i++) {
      var el = i < 0 ? root : els[i];
      if (el.__ggSpeed) continue;
      var cs = getComputedStyle(el);
      var d = cs.transitionDuration, dl = cs.transitionDelay;
      if ((!d || d === '0s') && (!dl || dl === '0s')) continue;
      el.__ggSpeed = true;
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

  function brand() {
    var vids = document.querySelectorAll('div.z-50 video');
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i];
      // keep the node (its load/ended handlers drive the site's intro state), hide the frame
      v.style.setProperty('visibility', 'hidden', 'important');
      var black = v.closest('div.z-50') && v.closest('div.z-50').firstElementChild;
      if (!black || black.querySelector('[data-gg="intro-logo"]')) continue;
      var img = document.createElement('img');
      img.setAttribute('data-gg', 'intro-logo');
      img.src = LOGO;
      img.alt = '';
      black.appendChild(img);
    }
    var overlay = document.querySelector('div.z-50');
    if (overlay) faster(overlay);
    var stage = document.querySelector('.stage-module');
    if (stage) faster(stage);
  }

  var css = document.createElement('style');
  css.textContent = [
    '@keyframes ggPreIn{from{transform:rotateX(-90deg) translateY(100%)}to{transform:rotateX(0deg) translateY(0)}}',
    'div.z-50 > div{perspective:800px}',
    'img[data-gg="intro-logo"]{position:absolute;top:50%;left:50%;width:12rem;max-width:40vw;' +
      'margin:-3rem 0 0 -6rem;transform-style:preserve-3d;backface-visibility:hidden;' +
      'animation:ggPreIn .85s cubic-bezier(.215,.61,.355,1) both}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  brand();
  document.addEventListener('DOMContentLoaded', brand);
  window.addEventListener('load', brand);
  var mo = new MutationObserver(brand);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { mo.disconnect(); }, 15000);
})();
