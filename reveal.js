(function () {
  var HIDDEN_ATTR = 'data-tf-hidden';

  function show(el) {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.removeAttribute(HIDDEN_ATTR);
  }

  // Reveal EVERYTHING that is or could be hidden, and run any pending counters.
  function revealAll() {
    var els = document.querySelectorAll('[' + HIDDEN_ATTR + '], [data-reveal], [data-revealed]');
    for (var i = 0; i < els.length; i++) show(els[i]);
    var nums = document.querySelectorAll('[data-count]');
    for (var j = 0; j < nums.length; j++) runCount(nums[j]);
  }

  function runCount(el) {
    if (el.getAttribute('data-tf-counted')) return;
    el.setAttribute('data-tf-counted', '1');
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = (target % 1 !== 0) ? 1 : 0;
    var start = performance.now(), dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Unconditional failsafe: whatever happens, content is visible shortly after load.
  setTimeout(revealAll, 1500);
  window.addEventListener('load', function () { setTimeout(revealAll, 600); });

  if (!('IntersectionObserver' in window)) { revealAll(); return; }

  // Probe that IntersectionObserver actually delivers callbacks in this environment.
  // Only if it does will we hide anything for animation.
  function probe(cb) {
    var probeEl = document.body;
    if (!probeEl) return cb(false);
    var fired = false;
    var io;
    try {
      io = new IntersectionObserver(function () {
        fired = true;
        try { io.disconnect(); } catch (e) {}
        cb(true);
      });
      io.observe(probeEl);
    } catch (e) { return cb(false); }
    setTimeout(function () {
      if (!fired) { try { io.disconnect(); } catch (e) {} cb(false); }
    }, 300);
  }

  function animate() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var candidates = document.querySelectorAll('section:not([data-reveal]):not([data-revealed])');
    var toWatch = [];

    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      el.setAttribute('data-revealed', '1');
      var top = el.getBoundingClientRect().top;
      // Above the fold (or unmeasurable): leave visible, no animation.
      if (!top || top < vh * 0.9) continue;
      el.setAttribute(HIDDEN_ATTR, '1');
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .7s ease-out, transform .7s ease-out';
      toWatch.push(el);
    }

    // Sections the page author marked with data-reveal (hidden inline in markup)
    var authored = document.querySelectorAll('[data-reveal]');
    for (var k = 0; k < authored.length; k++) {
      var a = authored[k];
      if (a.getBoundingClientRect().top < vh * 0.9) { show(a); continue; }
      toWatch.push(a);
    }

    if (!toWatch.length) return;

    var io = new IntersectionObserver(function (entries) {
      for (var n = 0; n < entries.length; n++) {
        if (!entries[n].isIntersecting) continue;
        show(entries[n].target);
        var counts = entries[n].target.querySelectorAll('[data-count]');
        for (var c = 0; c < counts.length; c++) runCount(counts[c]);
        io.unobserve(entries[n].target);
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    for (var w = 0; w < toWatch.length; w++) io.observe(toWatch[w]);

    // Safety net in case the observer stops delivering mid-session.
    setTimeout(revealAll, 4000);
  }

  function start() {
    // Wait for layout to settle (two frames) before measuring anything.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        probe(function (ioWorks) {
          if (!ioWorks) { revealAll(); return; }
          animate();
        });
      });
    });
  }

  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
  // DC content streams in; re-run once more after the tree has settled.
  setTimeout(start, 900);
})();
