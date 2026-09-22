/* Waitlist form — the sign-up panel behind every «У вейт-лист» button.

   Built after the checkout form of the reference the user gave (its «Персональні дані»
   step): a 560px panel over the page on the right, a serif heading in the site's own
   display face, and fields as boxes with a 2px black frame, no rounding, the caption in
   grey 14px above the value in 16px, 16px apart, and one full-width black button under
   them. Our own fields: name, phone, e-mail and the format the person is after.

   Nothing is sent anywhere yet — there is no address for it. On submit the panel shows
   the confirmation and keeps the entry in this browser (localStorage), so the number is
   not lost while the destination is being decided. */
(function () {
  var FIELDS = [
    { id: 'name',  label: 'Ім’я',            type: 'text',  auto: 'given-name', required: true },
    { id: 'phone', label: 'Телефон',         type: 'tel',   auto: 'tel',        required: true },
    { id: 'email', label: 'E-mail (не обов’язково)', type: 'email', auto: 'email' }
  ];
  var FORMATS = ['Ще не обрав', 'Сімейний', 'Разовий', 'Місяць'];

  var css = document.createElement('style');
  css.textContent = [
    '[data-gg="wf-scrim"]{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.55);',
    '  opacity:0;pointer-events:none;transition:opacity .3s ease}',
    '[data-gg="wf-scrim"].open{opacity:1;pointer-events:auto}',
    '[data-gg="wf"]{position:fixed;top:0;right:0;bottom:0;z-index:61;width:min(35rem,100%);',
    '  background:#fff;color:#000;overflow-y:auto;transform:translateX(100%);',
    '  transition:transform .35s cubic-bezier(0.33,1,0.68,1);',
    '  font-family:var(--font-sofia-sans),sans-serif}',
    '[data-gg="wf"].open{transform:translateX(0)}',
    '[data-gg="wf"] .wf-in{padding:2.5rem 2rem 3rem}',
    '@media (min-width:640px){[data-gg="wf"] .wf-in{padding:3rem 3.5rem 4rem}}',
    '[data-gg="wf"] h2{font-family:var(--font-gravitas-one),serif;font-size:2.5rem;line-height:1;',
    '  text-transform:uppercase;margin:0 0 .5rem}',
    '[data-gg="wf"] .wf-sub{font-size:1rem;line-height:1.6;color:rgb(107 107 107);margin:0 0 2rem}',
    '[data-gg="wf"] label.wf-box{display:block;border:2px solid #000;padding:.5rem 1rem;',
    '  margin-bottom:1rem;cursor:text}',
    '[data-gg="wf"] label.wf-box span{display:block;font-size:.875rem;line-height:1.5rem;color:rgb(107 107 107)}',
    '[data-gg="wf"] label.wf-box input,[data-gg="wf"] label.wf-box select{width:100%;border:0;outline:none;',
    '  background:#fff;font:inherit;font-size:1rem;line-height:1.5rem;color:#000;padding:0}',
    '[data-gg="wf"] .wf-agree{display:flex;gap:.75rem;align-items:flex-start;font-size:.875rem;',
    '  line-height:1.5;color:rgb(107 107 107);margin:.5rem 0 1.5rem}',
    '[data-gg="wf"] .wf-agree input{width:1.25rem;height:1.25rem;accent-color:#000;flex:0 0 auto;margin-top:.125rem}',
    '[data-gg="wf"] .wf-send{width:100%;border:2px solid #000;background:#000;color:#fff;cursor:pointer;',
    '  font-family:var(--font-sofia-sans-extra-condensed),sans-serif;font-weight:700;text-transform:uppercase;',
    '  letter-spacing:.125rem;font-size:1.375rem;line-height:2rem;padding:.875rem 1.75rem;',
    '  transition:background .25s ease,color .25s ease}',
    '[data-gg="wf"] .wf-send:hover{background:rgb(255 221 0);border-color:rgb(255 221 0);color:#000}',
    '[data-gg="wf"] .wf-close{position:absolute;top:1rem;right:1rem;width:2.75rem;height:2.75rem;',
    '  border:0;background:none;cursor:pointer;font-size:1.75rem;line-height:1;color:#000}',
    '[data-gg="wf"] .wf-err{border-color:rgb(190 30 30)}',
    '[data-gg="wf"] .wf-note{font-size:.875rem;color:rgb(107 107 107);margin:1rem 0 0}',
    '[data-gg="wf"] .wf-done{display:none}',
    '[data-gg="wf"].sent .wf-form{display:none}',
    '[data-gg="wf"].sent .wf-done{display:block}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  var panel, scrim;

  function build() {
    if (panel) return;
    scrim = document.createElement('div');
    scrim.setAttribute('data-gg', 'wf-scrim');

    panel = document.createElement('div');
    panel.setAttribute('data-gg', 'wf');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Вейт-лист');
    panel.style.position = 'fixed';

    var html = '<button class="wf-close" type="button" aria-label="Закрити">×</button>' +
      '<div class="wf-in">' +
        '<div class="wf-form">' +
          '<h2>Вейт-лист</h2>' +
          '<p class="wf-sub">Залиш контакт — і ти серед перших 300. Персональна знижка, ' +
          'вхід у клуб до відкриття і тренування в парку вже зараз.</p>';
    FIELDS.forEach(function (f) {
      html += '<label class="wf-box" data-for="' + f.id + '"><span>' + f.label + '</span>' +
        '<input type="' + f.type + '" name="' + f.id + '" autocomplete="' + (f.auto || 'off') + '"></label>';
    });
    html += '<label class="wf-box"><span>Формат, який цікавить</span><select name="format">';
    FORMATS.forEach(function (o) { html += '<option>' + o + '</option>'; });
    html += '</select></label>' +
          '<label class="wf-agree"><input type="checkbox" name="agree">' +
          '<span>Даю згоду на обробку контактних даних, щоб клуб міг написати про відкриття та умови.</span></label>' +
          '<button class="wf-send" type="button">Записатися</button>' +
          '<p class="wf-note">Ні до чого не зобов’язує. Перший ранок у клубі — безкоштовно.</p>' +
        '</div>' +
        '<div class="wf-done">' +
          '<h2>Ти у списку</h2>' +
          '<p class="wf-sub">Записали. Напишемо, коли будуть дати, умови і запрошення на перший ранок — ' +
          'без дзвінків «від менеджера».</p>' +
          '<button class="wf-send" type="button" data-close>Закрити</button>' +
        '</div>' +
      '</div>';
    panel.innerHTML = html;

    document.body.appendChild(scrim);
    document.body.appendChild(panel);

    scrim.addEventListener('click', close);
    panel.querySelector('.wf-close').addEventListener('click', close);
    panel.querySelector('.wf-done [data-close]').addEventListener('click', close);
    panel.querySelector('.wf-form .wf-send').addEventListener('click', send);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function open(prefillPhone) {
    build();
    // a second visit starts clean — the previous entry is already saved
    if (panel.classList.contains('sent')) reset();
    panel.classList.remove('sent');
    if (prefillPhone) panel.querySelector('input[name="phone"]').value = prefillPhone;
    scrim.classList.add('open');
    panel.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () {
      var first = panel.querySelector('input[name="' + (prefillPhone ? 'name' : 'name') + '"]');
      if (first) first.focus();
    }, 380);
  }

  function reset() {
    [].forEach.call(panel.querySelectorAll('.wf-form input'), function (el) {
      if (el.type === 'checkbox') el.checked = false; else el.value = '';
    });
    panel.querySelector('select[name="format"]').selectedIndex = 0;
    [].forEach.call(panel.querySelectorAll('.wf-err'), function (el) { el.classList.remove('wf-err'); });
    panel.querySelector('.wf-agree span').style.color = '';
  }

  function close() {
    if (!panel) return;
    scrim.classList.remove('open');
    panel.classList.remove('open');
    document.documentElement.style.overflow = '';
  }

  function send() {
    var ok = true;
    FIELDS.forEach(function (f) {
      var box = panel.querySelector('label[data-for="' + f.id + '"]');
      var el = box.querySelector('input');
      var bad = f.required && !el.value.trim();
      box.classList.toggle('wf-err', bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    var agree = panel.querySelector('input[name="agree"]');
    if (!agree.checked) {
      agree.closest('.wf-agree').classList.add('wf-err');
      agree.parentElement.querySelector('span').style.color = 'rgb(190 30 30)';
      if (ok) agree.focus();
      return;
    }
    agree.parentElement.querySelector('span').style.color = '';
    if (!ok) return;

    var entry = { at: new Date().toISOString() };
    panel.querySelectorAll('input[name], select[name]').forEach(function (el) {
      if (el.type !== 'checkbox') entry[el.name] = el.value.trim();
    });
    try {
      var all = JSON.parse(localStorage.getItem('hsc-waitlist') || '[]');
      all.push(entry);
      localStorage.setItem('hsc-waitlist', JSON.stringify(all));
    } catch (e) { /* private mode — the confirmation still shows */ }
    panel.classList.add('sent');
    panel.scrollTop = 0;
  }

  // every waitlist call to action opens the panel; the hero's own field hands over the
  // number the visitor already typed
  function wire() {
    // links carry a waitlist target; the two header calls to action are bare buttons
    // with no target at all, so they are taken by their wording
    var calls = [].slice.call(document.querySelectorAll('a[href*="waitlist"], a[href*="#top"]'));
    [].forEach.call(document.querySelectorAll('button'), function (b) {
      if (/вейт-лист/i.test(b.textContent) && !b.closest('[data-gg="wf"]')) calls.push(b);
    });
    calls.forEach(function (el) {
      if (el.__ggWf) return;
      el.__ggWf = true;
      el.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    var form = document.querySelector('[data-gg="form"]');
    if (form && !form.__ggWf) {
      form.__ggWf = true;
      var input = form.querySelector('input');
      var btn = form.querySelector('button');
      if (btn) btn.addEventListener('click', function () { open(input && input.value.trim()); });
      if (input) input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); open(input.value.trim()); }
      });
    }
  }

  // not before React has taken over the server HTML (see media/ready.js)
  (window.ggReady || function (f) { f(); })(function () {
    wire();
    new MutationObserver(wire).observe(document.documentElement, { childList: true, subtree: true });
  });
})();
