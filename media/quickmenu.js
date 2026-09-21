/* Quick menu — cloned from the widget on clever-fit.com (the reference the user gave).

   Geometry and behaviour are taken from their stylesheet verbatim:
     #quick-menu      position:fixed; right:0; bottom:5vh; z-index:20
     .nav             absolute, right:0, transition all .44s ease
     collapsed        every item except the toggle shifts translate(100%)
     item button      min-width:72px; padding:16px 5px; column; gap:6px
     label            9px / 700 / uppercase / centred / white
     icon             25px tall
     corners          10px on the first and last item
     panel            slides in from the right, blur(4px), max-width 600px
   Colours are ours, not theirs: the site's #0D0D0D and ci-yellow #FFDD00
   replace clever-fit's greys and red. */
(function () {
  var ITEMS = [
    { id: 'contact', name: 'Контакти', icon: 'phone', html:
      '<div class="qm-title">Зв’язок</div>' +
      '<p>Телефон — додати</p>' +
      '<p>Пиши в Telegram або Instagram — відповідаємо швидше.</p>' },
    { id: 'address', name: 'Адреса', icon: 'pin', html:
      '<div class="qm-title">Де ми</div>' +
      '<p>Рівне, ЖК «На Счастливому»<br>квартал Happy Street</p>' +
      '<p>Критий перехід до гімназії StarLand.</p>' },
    { id: 'times', name: 'Графік', icon: 'clock', html:
      '<div class="qm-title">Графік роботи</div>' +
      '<p>Клуб відкривається скоро.</p>' +
      '<p>Точний графік з’явиться перед відкриттям — він буде у вейт-листі першим.</p>' },
    { id: 'social', name: 'Соцмережі', icon: 'social', html:
      '<div class="qm-title">Ми в мережі</div>' +
      '<p><a href="https://www.instagram.com/" target="_blank" rel="noopener">Instagram</a></p>' +
      '<p><a href="https://t.me/" target="_blank" rel="noopener">Telegram</a></p>' }
  ];

  var ICONS = {
    phone: '<svg viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1z" fill="currentColor"/></svg>',
    pin:   '<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-13h-2v6l5 3 1-1.7-4-2.3z" fill="currentColor"/></svg>',
    social:'<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .18 1L8.9 8.6a3 3 0 1 0 0 6.8l6.28 3.6A3 3 0 1 0 18 16a3 3 0 0 0-1.9.68L9.9 13.1a3 3 0 0 0 0-2.2l6.2-3.58A3 3 0 0 0 18 8z" fill="currentColor"/></svg>',
    menu:  '<svg viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>'
  };

  var CSS = [
    '#gg-qm{position:fixed;right:0;bottom:5vh;z-index:20;display:block;padding:0;font-family:inherit}',
    '#gg-qm .qm-nav{position:relative;right:0;list-style:none;margin:0;padding:0;transition:all .44s ease;z-index:2}',
    '#gg-qm .qm-item{display:flex;justify-content:center;position:relative;transform:translate(0);transition:all .44s ease;border-bottom:1px solid rgba(255,255,255,.18)}',
    '#gg-qm .qm-item:last-child{border:none}',
    '#gg-qm .qm-btn{align-items:center;background-color:rgba(13,13,13,.74);cursor:pointer;display:flex;flex-direction:column;gap:6px;justify-content:center;min-width:72px;padding:16px 5px;transition:all .3s ease;width:100%;border:0}',
    '#gg-qm .qm-btn:hover{background-color:#0D0D0D}',
    '#gg-qm .qm-item:first-child .qm-btn{border-radius:10px 0 0 0}',
    '#gg-qm .qm-item:nth-last-child(2) .qm-btn{border-radius:0 0 0 10px}',
    '#gg-qm .qm-item.active .qm-btn{background-color:rgba(255,221,0,.9);color:#0D0D0D}',
    '#gg-qm .qm-name{color:#fff;font-size:9px;font-weight:700;line-height:1;text-align:center;text-transform:uppercase;letter-spacing:.05em}',
    '#gg-qm .qm-item.active .qm-name{color:#0D0D0D}',
    '#gg-qm .qm-icon{display:inline-block;height:25px;width:29px;color:#fff}',
    '#gg-qm .qm-item.active .qm-icon{color:#0D0D0D}',
    '#gg-qm .qm-icon svg{width:100%;height:100%;display:block}',
    // collapsed: everything but the toggle slides off to the right
    '#gg-qm.collapsed .qm-item:not(.qm-toggle){transform:translate(100%)}',
    // the toggle tab carries the brand yellow, like the site's primary buttons
    '#gg-qm .qm-toggle .qm-btn{border-radius:10px 0 0 10px;background-color:#FFDD00}',
    '#gg-qm .qm-toggle .qm-btn:hover{background-color:#0D0D0D}',
    '#gg-qm .qm-toggle .qm-name,#gg-qm .qm-toggle .qm-icon{color:#0D0D0D}',
    '#gg-qm .qm-toggle .qm-btn:hover .qm-name,#gg-qm .qm-toggle .qm-btn:hover .qm-icon{color:#FFDD00}',
    '#gg-qm .qm-toggle .qm-name{white-space:nowrap}',
    // panel
    // hidden state must clear its own width AND the 72px nav strip it sits next to;
    // translate(110%) left ~44px of the panel poking out at the screen edge
    '#gg-qm .qm-panel{position:absolute;right:72px;bottom:0;transform:translateX(calc(100% + 72px));pointer-events:none;transition:transform .44s ease;background-color:rgba(255,221,0,.94);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border-radius:10px 0 0 10px;color:#0D0D0D;min-width:280px;max-width:min(600px,calc(100vw - 100px));padding:24px 28px;line-height:1.7;font-size:14px}',
    '#gg-qm .qm-panel.active{transform:translate(0);pointer-events:auto}',
    '#gg-qm .qm-panel .qm-title{font-weight:700;text-transform:uppercase;letter-spacing:.25rem;margin-bottom:8px;font-size:13px}',
    '#gg-qm .qm-panel p{margin:0 0 10px}',
    '#gg-qm .qm-panel p:last-child{margin-bottom:0}',
    '#gg-qm .qm-panel a{color:#0D0D0D;text-decoration:underline}',
    // Phone: the widget sits in the very corner and takes less room, and it stays hidden
    // while the first screen is up — there it would land on the hero's phone field. It
    // fades in once the page is scrolled past the hero (see the scroll handler below).
    '@media (max-width:767px){',
    '  #gg-qm{bottom:0;opacity:0;pointer-events:none;transition:opacity .3s ease}',
    '  #gg-qm.qm-shown{opacity:1;pointer-events:auto}',
    '  #gg-qm .qm-btn{min-width:56px;padding:10px 4px;gap:4px}',
    '  #gg-qm .qm-icon svg{height:20px}',
    '  #gg-qm .qm-name{font-size:8px}',
    '}',
    '@media (max-width:640px){#gg-qm .qm-panel{right:60px;transform:translateX(calc(100% + 60px));padding:18px 20px;min-width:220px}#gg-qm .qm-panel.active{transform:translate(0)}#gg-qm .qm-btn{min-width:60px;padding:12px 4px}}'
  ].join('\n');

  function build() {
    if (document.getElementById('gg-qm')) return;
    if (!document.body) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);

    var root = document.createElement('div');
    root.id = 'gg-qm';
    root.className = 'collapsed';

    var panel = document.createElement('div');
    panel.className = 'qm-panel';

    var nav = document.createElement('ul');
    nav.className = 'qm-nav';
    ITEMS.forEach(function (it) {
      var li = document.createElement('li');
      li.className = 'qm-item';
      li.innerHTML = '<button type="button" class="qm-btn"><span class="qm-icon">' + ICONS[it.icon] +
                     '</span><span class="qm-name">' + it.name + '</span></button>';
      li.addEventListener('click', function () {
        var wasActive = li.classList.contains('active');
        nav.querySelectorAll('.qm-item').forEach(function (x) { x.classList.remove('active'); });
        if (wasActive) { panel.classList.remove('active'); return; }
        li.classList.add('active');
        panel.innerHTML = it.html;
        panel.classList.add('active');
      });
      nav.appendChild(li);
    });

    var toggle = document.createElement('li');
    toggle.className = 'qm-item qm-toggle';
    toggle.innerHTML = '<button type="button" class="qm-btn"><span class="qm-icon">' + ICONS.menu +
                       '</span><span class="qm-name qm-label">Швидке меню</span></button>';
    toggle.addEventListener('click', function () {
      var collapsed = root.classList.toggle('collapsed');
      toggle.querySelector('.qm-label').textContent = collapsed ? 'Швидке меню' : 'Згорнути';
      if (collapsed) {
        panel.classList.remove('active');
        nav.querySelectorAll('.qm-item').forEach(function (x) { x.classList.remove('active'); });
      }
    });
    nav.appendChild(toggle);

    root.appendChild(panel);
    root.appendChild(nav);
    document.body.appendChild(root);

    // phone: hold the widget back until the hero is scrolled past (see the CSS above)
    var shown = function () {
      var past = window.scrollY > window.innerHeight * 0.6;
      root.classList.toggle('qm-shown', past);
    };
    shown();
    window.addEventListener('scroll', shown, { passive: true });
    window.addEventListener('resize', shown);
  }

  build();
  document.addEventListener('DOMContentLoaded', build);
  window.addEventListener('load', build);
})();
