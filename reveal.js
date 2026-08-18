(function () {
  function reveal(e) { e.style.opacity = '1'; e.style.transform = 'none'; }
  function apply() {
    var els = document.querySelectorAll('section:not([data-reveal]):not([data-revealed])');
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var supported = 'IntersectionObserver' in window;
    var io = supported ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        reveal(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }) : null;
    els.forEach(function (e) {
      e.setAttribute('data-revealed', '1');
      var top = e.getBoundingClientRect().top;
      // Already visible on load (above the fold): show immediately, no fade.
      if (!supported || top < vh * 0.85) { reveal(e); return; }
      e.style.opacity = '0';
      e.style.transform = 'translateY(24px)';
      e.style.transition = 'opacity .7s ease-out, transform .7s ease-out';
      io.observe(e);
    });
  }
  function init() { apply(); setTimeout(apply, 200); setTimeout(apply, 800); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
