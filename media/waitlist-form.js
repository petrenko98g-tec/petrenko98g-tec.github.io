/* Waitlist form — the sign-up panel behind every «У вейт-лист» button.

   Layout follows the sign-up form sketched for the club: a 560px panel over
   the page on the right, fields as boxes with the caption above the value, one
   full-width button under them.

   Everything that is drawn comes from the site itself, by its own classes: the headline
   in .headline-group .font-gravitas-one at the headline step of the scale, copy in
   .font-sofia-sans, the greys in .text-gray13, the wrong-field colour in the bundle's
   own .border-error/.text-error, and the button carrying the very class list of the
   site's primary call to action. The CSS below only positions the panel.

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

  // the site's own primary call to action, class for class (cta-button variant-primary)
  var CTA = 'cta-button variant-primary text-center duration-250 ease-in-out ' +
    'font-sofia-sans-extra-condensed font-bold text-[1.3rem] leading-6.5 tracking-0.125 ' +
    'uppercase box-border py-3.5 text-black hover:text-ci-yellow bg-ci-yellow ' +
    'hover:bg-black border-2 border-ci-yellow hover:border-black w-full';
  var HEAD  = 'headline-group font-gravitas-one text-3.5xl font-extrabold uppercase text-black mb-2';
  var COPY  = 'font-sofia-sans text-lg leading-8 text-gray13';
  var BOX   = 'block border-2 border-black px-4 py-2 mb-4';
  var CAP   = 'block font-sofia-sans text-sm leading-6 text-gray13';
  var SMALL = 'font-sofia-sans text-sm leading-6 text-gray13';

  var css = document.createElement('style');
  css.textContent = [
    '[data-hsc="wf-scrim"]{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.55);',
    '  opacity:0;pointer-events:none;transition:opacity .3s ease}',
    '[data-hsc="wf-scrim"].open{opacity:1;pointer-events:auto}',
    '[data-hsc="wf"]{position:fixed;top:0;right:0;bottom:0;z-index:61;width:min(35rem,100%);',
    '  overflow-y:auto;transform:translateX(100%);',
    '  transition:transform .35s cubic-bezier(0.33,1,0.68,1)}',
    '[data-hsc="wf"].open{transform:translateX(0)}',
    '[data-hsc="wf"] .wf-in{padding:2.5rem 1.5rem 3rem}',
    '@media (min-width:640px){[data-hsc="wf"] .wf-in{padding:3rem 3.5rem 4rem}}',
    // the field's own chrome off, so the box around it is the only frame
    '[data-hsc="wf"] .wf-box input,[data-hsc="wf"] .wf-box select{width:100%;border:0;outline:none;',
    '  background:transparent;padding:0;color:inherit}',
    '[data-hsc="wf"] .wf-agree input{width:1.25rem;height:1.25rem;accent-color:#000;flex:0 0 auto;margin-top:.25rem}',
    '[data-hsc="wf"] .wf-close{position:absolute;top:1rem;right:1rem;width:2.75rem;height:2.75rem;',
    '  border:0;background:none;cursor:pointer;line-height:1}',
    '[data-hsc="wf"] .wf-done{display:none}',
    '[data-hsc="wf"].sent .wf-form{display:none}',
    '[data-hsc="wf"].sent .wf-done{display:block}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  // Ukrainian numbers only, so the field starts at the country code and keeps it —
  // deleting into the prefix puts it back instead of leaving a bare number
  var CODE = '+380';
  function phoneField(el) {
    if (!el || el.__hscCode) return;
    el.__hscCode = true;
    if (!el.value.trim()) el.value = CODE;
    el.addEventListener('input', function () {
      if (el.value.indexOf(CODE) !== 0) {
        el.value = CODE + el.value.replace(/[^0-9]/g, '').replace(/^380/, '');
      }
    });
    el.addEventListener('focus', function () {
      if (!el.value.trim()) el.value = CODE;
    });
  }

  var panel, scrim;

  function build() {
    if (panel) return;
    scrim = document.createElement('div');
    scrim.setAttribute('data-hsc', 'wf-scrim');

    panel = document.createElement('div');
    panel.setAttribute('data-hsc', 'wf');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Вейт-лист');
    // the page's own ground and body face
    panel.className = 'bg-white text-black font-sofia-sans';

    var html = '<button class="wf-close text-black" type="button" aria-label="Закрити">' +
        '<span class="font-sofia-sans text-3.5xl leading-6">×</span></button>' +
      '<div class="wf-in">' +
        '<div class="wf-form">' +
          '<h2 class="' + HEAD + '">Вейт-лист</h2>' +
          '<p class="' + COPY + ' mb-8">Залиш контакт — і ти серед перших 300. Персональна знижка, ' +
          'вхід у клуб до відкриття і тренування в парку вже зараз.</p>';
    FIELDS.forEach(function (f) {
      html += '<label class="wf-box ' + BOX + '" data-for="' + f.id + '">' +
        '<span class="' + CAP + '">' + f.label + '</span>' +
        '<input type="' + f.type + '" name="' + f.id + '" autocomplete="' + (f.auto || 'off') + '" ' +
        'class="font-sofia-sans text-base leading-6 text-black"></label>';
    });
    html += '<label class="wf-box ' + BOX + '"><span class="' + CAP + '">Формат, який цікавить</span>' +
        '<select name="format" class="font-sofia-sans text-base leading-6 text-black">';
    FORMATS.forEach(function (o) { html += '<option>' + o + '</option>'; });
    html += '</select></label>' +
          '<label class="wf-agree flex gap-3 items-start mb-6"><input type="checkbox" name="agree">' +
          '<span class="' + SMALL + '">Даю згоду на обробку контактних даних, ' +
          'щоб клуб міг написати про відкриття та умови.</span></label>' +
          '<button class="' + CTA + '" type="button">Записатися</button>' +
          '<p class="' + SMALL + ' mt-4">Ні до чого не зобов’язує. Перший ранок у клубі — безкоштовно.</p>' +
        '</div>' +
        '<div class="wf-done">' +
          '<h2 class="' + HEAD + '">Ти у списку</h2>' +
          '<p class="' + COPY + ' mb-8">Записали. Напишемо, коли будуть дати, умови і запрошення ' +
          'на перший ранок — без дзвінків «від менеджера».</p>' +
          '<button class="' + CTA + '" type="button" data-close>Закрити</button>' +
        '</div>' +
      '</div>';
    panel.innerHTML = html;

    document.body.appendChild(scrim);
    document.body.appendChild(panel);

    phoneField(panel.querySelector('input[name="phone"]'));
    // a field marked as missing loses the mark as soon as it is being filled
    [].forEach.call(panel.querySelectorAll('.wf-form input'), function (el) {
      el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
        mark(el.closest('.wf-box') || el.closest('.wf-agree'), false);
      });
    });

    scrim.addEventListener('click', close);
    panel.querySelector('.wf-close').addEventListener('click', close);
    panel.querySelector('.wf-done [data-close]').addEventListener('click', close);
    panel.querySelector('.wf-form .cta-button').addEventListener('click', send);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function open(prefillPhone) {
    build();
    // a second visit starts clean — the previous entry is already saved
    if (panel.classList.contains('sent')) reset();
    panel.classList.remove('sent');
    if (prefillPhone && prefillPhone !== CODE) {
      panel.querySelector('input[name="phone"]').value = prefillPhone;
    }
    scrim.classList.add('open');
    panel.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () {
      var first = panel.querySelector('input[name="name"]');
      if (first) first.focus();
    }, 380);
  }

  function reset() {
    [].forEach.call(panel.querySelectorAll('.wf-form input'), function (el) {
      if (el.type === 'checkbox') el.checked = false; else el.value = '';
    });
    panel.querySelector('select[name="format"]').selectedIndex = 0;
    mark(panel.querySelector('.wf-agree'), false);
    FIELDS.forEach(function (f) {
      mark(panel.querySelector('label[data-for="' + f.id + '"]'), false);
    });
  }

  // a field that is missing carries the bundle's own error colour
  function mark(box, bad) {
    if (box.classList.contains('wf-box')) box.classList.toggle('border-error', bad);
    var cap = box.querySelector('span');
    if (cap) {
      cap.classList.toggle('text-error', bad);
      cap.classList.toggle('text-gray13', !bad);
    }
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
      var bad = !!f.required && !el.value.trim();
      mark(box, bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    var agree = panel.querySelector('input[name="agree"]');
    mark(agree.closest('.wf-agree'), !agree.checked);
    if (!agree.checked) { if (ok) agree.focus(); return; }
    if (!ok) return;

    var entry = { at: new Date().toISOString() };
    [].forEach.call(panel.querySelectorAll('input[name], select[name]'), function (el) {
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
    // by the wording, not by the target: the footer's contact lines and the countdown's
    // «Детальніше» also point at #waitlist, and those must keep their own jump to the
    // block instead of opening a form
    var calls = [];
    [].forEach.call(document.querySelectorAll('a, button'), function (el) {
      // the hero's own button is wired below, with the number typed beside it
      if (el.closest('[data-hsc="wf"], [data-hsc="form"]')) return;
      if (/^(у вейт-лист|записатися|хочу бути серед перших)$/i.test(el.textContent.trim())) calls.push(el);
    });
    calls.forEach(function (el) {
      if (el.__hscWf) return;
      el.__hscWf = true;
      el.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    var form = document.querySelector('[data-hsc="form"]');
    if (form && !form.__hscWf) {
      form.__hscWf = true;
      var input = form.querySelector('input');
      var btn = form.querySelector('button');
      phoneField(input);
      if (btn) btn.addEventListener('click', function () { open(input && input.value.trim()); });
      if (input) input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); open(input.value.trim()); }
      });
    }
  }

  // not before React has taken over the server HTML (see media/ready.js)
  (window.hscReady || function (f) { f(); })(function () {
    wire();
    new MutationObserver(wire).observe(document.documentElement, { childList: true, subtree: true });
  });
})();
