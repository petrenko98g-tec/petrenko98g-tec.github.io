/* Removes the "Studios" and "Shop" entries from the navigation.
   The nav is rendered by the JS bundle (its labels are not in the static HTML),
   so the entries are taken out of the DOM after render and kept out on re-render. */
(function () {
  var DROP = ['studios', 'shop'];

  function isNavItem(el) {
    var c = (el.className || '').toString();
    return el.tagName === 'DIV' && c.indexOf('inline-flex') > -1 && c.indexOf('mr-8') > -1;
  }

  function clean() {
    // desktop nav items
    Array.prototype.forEach.call(document.querySelectorAll('div[class*="inline-flex"][class*="mr-8"]'), function (el) {
      var t = (el.textContent || '').trim().toLowerCase();
      if (DROP.indexOf(t) > -1) el.remove();
    });
    // mobile / off-canvas menu entries with the same labels
    Array.prototype.forEach.call(document.querySelectorAll('a, button'), function (el) {
      if (el.closest('[data-gg-keep]')) return;
      var t = (el.textContent || '').trim().toLowerCase();
      if (DROP.indexOf(t) === -1) return;
      var item = el.closest('li') || (isNavItem(el.parentElement) ? el.parentElement : null);
      if (item) item.remove(); else el.remove();
    });
  }

  clean();
  document.addEventListener('DOMContentLoaded', clean);
  window.addEventListener('load', clean);

  // the nav is re-rendered by the framework — keep the entries out
  var mo = new MutationObserver(function () { clean(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { mo.disconnect(); clean(); }, 10000);
})();
