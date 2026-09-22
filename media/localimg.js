/* Local photos inside next/image cards.

   The app configures next/image with a cloudinary loader pointed at a remote image host,
   so every src is rewritten onto that host — a file of ours (media/…) ends up as
   .../image/upload/<transforms>/media/….jpg and 404s. The plain <img> blocks (the
   image-text teaser) keep the path as written, only next/image does this. Here the
   loader's prefix is taken back off: the src (and the srcset it built) is pointed at
   the file itself. */
(function () {
  var RE = /^https?:\/\/[^/]+\/image\/upload\/[^?]*?\/(media\/[^?]+)$/;

  function fix() {
    [].forEach.call(document.images, function (img) {
      if (img.__hscLocal) return;
      var m = RE.exec(img.getAttribute('src') || '');
      if (!m) return;
      img.__hscLocal = true;
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      // the builder drops the file extension on its way through cloudinary
      var path = m[1];
      if (!/\.[a-z0-9]+$/i.test(path)) path += '.jpg';
      img.setAttribute('src', path);
    });
  }

  // not before React has taken over the server HTML (see media/ready.js)
  (window.hscReady || function (f) { f(); })(function () {
    fix();
    // the carousel swaps its lazy placeholders for real sources as slides come into view,
    // long after the page settles, so the watch stays on for the life of the page
    new MutationObserver(fix).observe(document.documentElement,
      { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    document.addEventListener('error', function (e) {
      if (e.target && e.target.tagName === 'IMG') fix();
    }, true);
  });
})();
