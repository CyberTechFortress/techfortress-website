(function () {
  var CSS = [
    '@media(max-width:980px){',
    '  .tf-burger{display:flex !important}',
    '  .tf-nav{display:none !important;order:3;width:100%;flex-direction:column;align-items:flex-start !important;gap:2px !important;padding:10px 0 4px;border-top:1px solid rgba(255,255,255,.08);margin-top:10px}',
    '  .tf-nav-open .tf-nav{display:flex !important}',
    '  .tf-nav>a,.tf-nav>.nav-item{width:100%}',
    '  .tf-nav>a{padding:11px 2px;font-size:15px !important;border-bottom:none !important}',
    '  .tf-nav .nav-item{flex-direction:column;align-items:flex-start;padding-bottom:0 !important;margin-bottom:0 !important}',
    '  .tf-nav .nav-item>a{padding:11px 2px;font-size:15px !important;width:100%;border-bottom:none !important}',
    '  .tf-nav .dropdown,.tf-nav .dropdown-l1{position:static !important;display:none !important;width:100% !important;min-width:0 !important;box-shadow:none !important;margin:0 0 6px !important;background:rgba(255,255,255,.04) !important;border-color:rgba(255,255,255,.08) !important;grid-template-columns:1fr !important}',
    '  .tf-nav .nav-item.open>.dropdown,.tf-nav .nav-item.open>.dropdown-l1{display:block !important}',
    '  .tf-nav .dropdown a,.tf-nav .dropdown-l1 a,.tf-nav .flyout a{color:#e8e2e4 !important;font-size:13.5px !important}',
    '  .tf-nav .dropdown a:hover,.tf-nav .dropdown-l1 a:hover,.tf-nav .flyout a:hover{background:rgba(255,255,255,.07) !important}',
    '  .tf-nav .l1-row{padding-right:0 !important;margin-right:0 !important}',
    '  .tf-nav .flyout{position:static !important;display:block !important;width:100% !important;margin:0 0 0 12px !important;box-shadow:none !important;background:transparent !important;border:none !important;padding:0 0 6px !important}',
    '}'
  ].join('\n');

  function findHeader() {
    var divs = document.querySelectorAll('div');
    for (var i = 0; i < divs.length; i++) {
      var d = divs[i];
      if (!d.querySelector('nav')) continue;
      var cs = window.getComputedStyle(d);
      if (cs.position === 'sticky' || cs.position === 'fixed') return d;
    }
    return null;
  }

  function init() {
    var header = findHeader();
    if (!header) return;
    var bar = header.firstElementChild;
    var nav = header.querySelector('nav');
    if (!bar || !nav || bar.querySelector('.tf-burger')) return;

    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    nav.classList.add('tf-nav');

    var btn = document.createElement('button');
    btn.className = 'tf-burger';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.setAttribute('aria-expanded', 'false');
    btn.style.cssText = 'display:none;align-items:center;justify-content:center;width:42px;height:42px;flex-shrink:0;background:transparent;border:1px solid rgba(255,255,255,.22);border-radius:10px;cursor:pointer;order:2';
    btn.innerHTML = '<span style="display:block;width:18px"><span style="display:block;height:2px;background:#f2eef0;margin:3px 0;border-radius:2px"></span><span style="display:block;height:2px;background:#f2eef0;margin:3px 0;border-radius:2px"></span><span style="display:block;height:2px;background:#f2eef0;margin:3px 0;border-radius:2px"></span></span>';

    btn.addEventListener('click', function () {
      var open = bar.classList.toggle('tf-nav-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) {
        var os = nav.querySelectorAll('.nav-item.open');
        for (var i = 0; i < os.length; i++) os[i].classList.remove('open');
      }
    });

    // insert burger before the CTA button (last child) so order is: logo, burger, CTA, nav
    bar.insertBefore(btn, nav);

    // on mobile, tapping a dropdown parent expands it instead of navigating
    var items = nav.querySelectorAll('.nav-item');
    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var link = item.querySelector(':scope > a');
        if (!link) return;
        link.addEventListener('click', function (e) {
          if (window.innerWidth > 980) return;
          if (!item.classList.contains('open')) {
            e.preventDefault();
            var sibs = nav.querySelectorAll('.nav-item.open');
            for (var j = 0; j < sibs.length; j++) if (sibs[j] !== item) sibs[j].classList.remove('open');
            item.classList.add('open');
          }
        });
      })(items[i]);
    }
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 400);
  setTimeout(init, 1200);
})();
