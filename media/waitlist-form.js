/* Waitlist form — in the waitlist block itself, and in a panel behind every other
   «У вейт-лист» button.

   Layout follows the checkout form of the reference the user gave: fields as boxes with
   the caption above the value, one full-width button under them. The block's own copy
   column carries the form directly, so the visitor signs up without leaving the place;
   the same form opens as a panel over the page (560px, from the right) wherever the call
   to action is only a button.

   Everything that is drawn comes from the site itself, by its own classes: the headline
   in .headline-group .font-gravitas-one at the headline step of the scale, copy in
   .font-sofia-sans, the greys in .text-gray13, the wrong-field colour in the bundle's
   own .border-error/.text-error, and each button the class list of the call to action it
   stands in for — the primary (yellow) one in the panel, the block's own black
   .cta-link.variant-tertiary in the yellow block. The CSS below only positions.

   Nothing is sent anywhere yet — there is no address for it. On submit the form shows
   the confirmation and keeps the entry in this browser (localStorage), so the number is
   not lost while the destination is being decided. */
(function () {
  var FIELDS = [
    { id: 'name',  label: 'Ім’я',            type: 'text',  auto: 'given-name', required: true },
    { id: 'phone', label: 'Телефон',         type: 'tel',   auto: 'tel',        required: true },
    { id: 'email', label: 'E-mail (не обов’язково)', type: 'email', auto: 'email' }
  ];
  var FORMATS = ['Ще не обрав', 'Сімейний', 'Разовий', 'Місяць'];

  var BASE = 'text-center duration-250 ease-in-out font-sofia-sans-extra-condensed ' +
    'font-bold text-[1.3rem] leading-6.5 tracking-0.125 uppercase box-border w-full ' +
    'inline-flex items-center justify-center';
  // the site's own primary call to action (panel, on white)
  var CTA = 'cta-button variant-primary ' + BASE + ' py-3.5 text-black hover:text-ci-yellow ' +
    'bg-ci-yellow hover:bg-black border-2 border-ci-yellow hover:border-black';
  // the waitlist block's own call to action (inline, on yellow)
  var CTA_DARK = 'cta-link variant-tertiary ' + BASE + ' py-4 text-white hover:text-black ' +
    'bg-black hover:bg-ci-yellow';
  var HEAD  = 'headline-group font-gravitas-one text-3.5xl font-extrabold uppercase text-black mb-2';
  var COPY  = 'font-sofia-sans text-lg leading-8 text-gray13';
  var BOX   = 'block border-2 border-black px-4 py-2 mb-4';
  var CAP   = 'block font-sofia-sans text-sm leading-6 text-gray13';
  var SMALL = 'font-sofia-sans text-sm leading-6 text-gray13';

  var css = document.createElement('style');
  css.textContent = [
    '[data-gg="wf-scrim"]{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.55);',
    '  opacity:0;pointer-events:none;transition:opacity .3s ease}',
    '[data-gg="wf-scrim"].open{opacity:1;pointer-events:auto}',
    '[data-gg="wf"]{position:fixed;top:0;right:0;bottom:0;z-index:61;width:min(35rem,100%);',
    '  overflow-y:auto;transform:translateX(100%);',
    '  transition:transform .35s cubic-bezier(0.33,1,0.68,1)}',
    '[data-gg="wf"].open{transform:translateX(0)}',
    '[data-gg="wf"] .wf-in{padding:2.5rem 1.5rem 3rem}',
    '@media (min-width:640px){[data-gg="wf"] .wf-in{padding:3rem 3.5rem 4rem}}',
    // the field's own chrome off, so the box around it is the only frame
    '.wf-root .wf-box input,.wf-root .wf-box select{width:100%;border:0;outline:none;',
    '  background:transparent;padding:0;color:inherit}',
    '.wf-root .wf-agree input{width:1.25rem;height:1.25rem;accent-color:#000;flex:0 0 auto;margin-top:.25rem}',
    '[data-gg="wf"] .wf-close{position:absolute;top:1rem;right:1rem;width:2.75rem;height:2.75rem;',
    '  border:0;background:none;cursor:pointer;line-height:1}',
    '.wf-root .wf-done{display:none}',
    '.wf-root.sent .wf-form{display:none}',
    '.wf-root.sent .wf-done{display:block}',
    // the block's own button steps aside for the form that replaces it
    '[data-gg="wf-cta"]{display:none!important}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  // the fields, the consent and the button — the same in the block and in the panel
  function formHTML(btn, done) {
    var html = '<div class="wf-form">';
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
      '<button class="' + btn + '" type="button" data-send>Записатися</button>' +
      '<p class="' + SMALL + ' mt-4">Ні до чого не зобов’язує. Перший ранок у клубі — безкоштовно.</p>' +
      '</div>' +
      '<div class="wf-done">' + done + '</div>';
    return html;
  }

  var panel, scrim;

  function build() {
    if (panel) return;
    scrim = document.createElement('div');
    scrim.setAttribute('data-gg', 'wf-scrim');

    panel = document.createElement('div');
    panel.setAttribute('data-gg', 'wf');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Вейт-лист');
    // the page's own ground and body face
    panel.className = 'wf-root bg-white text-black font-sofia-sans';

    panel.innerHTML = '<button class="wf-close text-black" type="button" aria-label="Закрити">' +
        '<span class="font-sofia-sans text-3.5xl leading-6">×</span></button>' +
      '<div class="wf-in">' +
        '<h2 class="' + HEAD + '">Вейт-лист</h2>' +
        '<p class="' + COPY + ' mb-8">Залиш контакт — і ти серед перших 300. Персональна знижка, ' +
        'вхід у клуб до відкриття і тренування в парку вже зараз.</p>' +
        formHTML(CTA,
          '<h2 class="' + HEAD + '">Ти у списку</h2>' +
          '<p class="' + COPY + ' mb-8">Записали. Напишемо, коли будуть дати, умови і запрошення ' +
          'на перший ранок — без дзвінків «від менеджера».</p>' +
          '<button class="' + CTA + '" type="button" data-close>Закрити</button>') +
      '</div>';

    document.body.appendChild(scrim);
    document.body.appendChild(panel);

    scrim.addEventListener('click', close);
    panel.querySelector('.wf-close').addEventListener('click', close);
    panel.querySelector('.wf-done [data-close]').addEventListener('click', close);
    panel.querySelector('.wf-form [data-send]').addEventListener('click', function () { send(panel); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // the waitlist block signs people up where they stand: the form takes the place of the
  // block's own button, in the copy column
  function inline() {
    var jump = document.getElementById('Вейт-лист');
    var sec = jump && jump.closest('section');
    var mod = sec && sec.querySelector('.image-text-teaser-module');
    if (!mod) return;
    var link = mod.querySelector('a.cta-link, a.cta-button');
    if (!link) return;
    var holder = link.parentElement;
    if (!holder || !holder.parentElement) return;
    if (holder.parentElement.querySelector('[data-gg="wf-inline"]')) return;

    var box = document.createElement('div');
    box.setAttribute('data-gg', 'wf-inline');
    box.className = 'wf-root w-full max-w-md text-black';
    box.innerHTML = formHTML(CTA_DARK,
      '<p class="font-sofia-sans text-lg leading-8 text-black"><strong>Ти у списку.</strong><br>' +
      'Напишемо, коли будуть дати, умови і запрошення на перший ранок — ' +
      'без дзвінків «від менеджера».</p>');
    holder.setAttribute('data-gg', 'wf-cta');
    holder.parentElement.insertBefore(box, holder.nextSibling);
    box.querySelector('[data-send]').addEventListener('click', function () { send(box); });
  }

  function open(prefillPhone) {
    build();
    // a second visit starts clean — the previous entry is already saved
    if (panel.classList.contains('sent')) reset(panel);
    panel.classList.remove('sent');
    if (prefillPhone) panel.querySelector('input[name="phone"]').value = prefillPhone;
    scrim.classList.add('open');
    panel.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () {
      var first = panel.querySelector('input[name="name"]');
      if (first) first.focus();
    }, 380);
  }

  function reset(root) {
    [].forEach.call(root.querySelectorAll('.wf-form input'), function (el) {
      if (el.type === 'checkbox') el.checked = false; else el.value = '';
    });
    root.querySelector('select[name="format"]').selectedIndex = 0;
    mark(root.querySelector('.wf-agree'), false);
    FIELDS.forEach(function (f) {
      mark(root.querySelector('label[data-for="' + f.id + '"]'), false);
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

  function send(root) {
    var ok = true;
    FIELDS.forEach(function (f) {
      var box = root.querySelector('label[data-for="' + f.id + '"]');
      var el = box.querySelector('input');
      var bad = !!f.required && !el.value.trim();
      mark(box, bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    var agree = root.querySelector('input[name="agree"]');
    mark(agree.closest('.wf-agree'), !agree.checked);
    if (!agree.checked) { if (ok) agree.focus(); return; }
    if (!ok) return;

    var entry = { at: new Date().toISOString() };
    [].forEach.call(root.querySelectorAll('input[name], select[name]'), function (el) {
      if (el.type !== 'checkbox') entry[el.name] = el.value.trim();
    });
    try {
      var all = JSON.parse(localStorage.getItem('hsc-waitlist') || '[]');
      all.push(entry);
      localStorage.setItem('hsc-waitlist', JSON.stringify(all));
    } catch (e) { /* private mode — the confirmation still shows */ }
    root.classList.add('sent');
    root.scrollTop = 0;
  }

  // every waitlist call to action opens the panel; the hero's own field hands over the
  // number the visitor already typed
  function wire() {
    inline();
    // links carry a waitlist target; the two header calls to action are bare buttons
    // with no target at all, so they are taken by their wording
    var calls = [].slice.call(document.querySelectorAll('a[href*="waitlist"], a[href*="#top"]'));
    [].forEach.call(document.querySelectorAll('button'), function (b) {
      if (/вейт-лист/i.test(b.textContent) && !b.closest('.wf-root')) calls.push(b);
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
