/* Static-safe interactivity: layer selectors + forms. Content is in the HTML;
   this only adds behaviour, so the page reads fine with JS disabled. */
(function () {
  var ACTIVE_BORDER = 'oklch(0.55 0.22 25 / 0.7)';
  var ACTIVE_BG = 'oklch(0.18 0.05 25)';
  var IDLE_BORDER = 'oklch(0.26 0.015 25)';
  var IDLE_BG = 'oklch(0.15 0.012 25)';

  function bullets(points) {
    return points.map(function (p) {
      return '<div style="display:flex;gap:10px;align-items:flex-start">' +
        '<div style="width:6px;height:6px;border-radius:50%;background:oklch(0.58 0.22 25);margin-top:8px;flex-shrink:0"></div>' +
        '<span style="color:oklch(0.85 0.01 250);font-size:14px">' + p + '</span></div>';
    }).join('');
  }

  /* ---- Security page: pill tab selector ---- */
  function initSecurityLayers() {
    var wrap = document.querySelector('[data-layer-tabs]');
    if (!wrap || wrap.__init) return;
    wrap.__init = true;
    var btns = wrap.querySelectorAll('[data-layer]');
    var nameEl = document.querySelector('[data-layer-name]');
    var descEl = document.querySelector('[data-layer-desc]');
    var ptsEl = document.querySelector('[data-layer-points]');
    if (!nameEl || !descEl || !ptsEl) return;

    function show(btn) {
      for (var i = 0; i < btns.length; i++) {
        var on = btns[i] === btn;
        btns[i].style.borderColor = on ? 'oklch(0.58 0.22 25)' : IDLE_BORDER;
        btns[i].style.background = on ? 'oklch(0.58 0.22 25 / 0.15)' : 'transparent';
        btns[i].style.color = on ? 'oklch(0.68 0.22 25)' : 'oklch(0.65 0.02 250)';
        btns[i].setAttribute('aria-selected', on ? 'true' : 'false');
      }
      nameEl.textContent = btn.getAttribute('data-name');
      descEl.textContent = btn.getAttribute('data-desc');
      ptsEl.innerHTML = bullets(JSON.parse(btn.getAttribute('data-points')));
    }
    for (var i = 0; i < btns.length; i++) {
      (function (b) { b.addEventListener('click', function () { show(b); }); })(btns[i]);
    }
    show(btns[0]);
  }

  /* ---- Home page: defence-in-depth panel, auto-advancing ---- */
  function initHomeLayers() {
    var list = document.querySelector('[data-depth-list]');
    if (!list || list.__init) return;
    list.__init = true;
    var btns = list.querySelectorAll('[data-depth]');
    var nameEl = document.querySelector('[data-depth-name]');
    var descEl = document.querySelector('[data-depth-desc]');
    if (!nameEl || !descEl || !btns.length) return;
    var idx = 0, timer = null;

    function show(n) {
      idx = n;
      for (var i = 0; i < btns.length; i++) {
        var on = i === n;
        btns[i].style.borderColor = on ? ACTIVE_BORDER : IDLE_BORDER;
        btns[i].style.background = on ? ACTIVE_BG : IDLE_BG;
        var mark = btns[i].querySelector('[data-mark]');
        if (mark) mark.textContent = on ? '\u25CF' : '\u203A';
      }
      nameEl.textContent = btns[n].getAttribute('data-name');
      descEl.textContent = btns[n].getAttribute('data-desc');
    }
    function start() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { show((idx + 1) % btns.length); }, 5000);
    }
    for (var i = 0; i < btns.length; i++) {
      (function (b, n) {
        b.addEventListener('click', function () { show(n); start(); });
      })(btns[i], i);
    }
    show(0);
    start();
  }

  /* ---- Forms: post to Netlify, then show the thank-you panel ---- */
  function initForms() {
    var forms = document.querySelectorAll('form[data-netlify]');
    for (var i = 0; i < forms.length; i++) {
      (function (form) {
        if (form.__init) return;
        form.__init = true;
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var okId = form.getAttribute('data-success');
          var body = new URLSearchParams(new FormData(form)).toString();
          fetch(location.pathname, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
          }).catch(function () {});
          var ok = okId ? document.getElementById(okId) : null;
          if (ok) { ok.style.display = ''; form.style.display = 'none'; }
          else {
            var note = form.querySelector('[data-inline-success]');
            if (note) note.style.display = '';
            form.reset();
          }
        });
      })(forms[i]);
    }
  }

  function init() { initSecurityLayers(); initHomeLayers(); initForms(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 500);
  setTimeout(init, 1500);
})();
