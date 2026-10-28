/* ALMA Partners — language, header, menu, scroll effects, contact form */
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');

  // ---- language (Korean default, remembered between pages) ----
  var saved = null;
  try { saved = localStorage.getItem('alma-lang'); } catch (e) {}
  setLang(saved === 'en' ? 'en' : 'ko');

  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    var t = root.getAttribute('data-title-' + l);
    if (t) document.title = t;
    var d = document.querySelector('meta[name="description"]');
    var dv = root.getAttribute('data-desc-' + l);
    if (d && dv) d.setAttribute('content', dv);
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-set') === l ? 'true' : 'false');
    });
    try { localStorage.setItem('alma-lang', l); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.lang button');
    if (b) setLang(b.getAttribute('data-set'));
  });

  // ---- header turns solid on scroll ----
  var head = document.querySelector('.site-head');
  function onScroll() {
    if (head) head.classList.toggle('solid', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- mobile menu ----
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
    });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- fade/rise in as things come into view ----
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // ---- slow-moving background photo ----
  var bg = document.querySelector('.hero-bg');
  if (bg && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight * 1.2);
        bg.style.transform = 'translate3d(0,' + (y * 0.28) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  // ---- contact form: show thank-you after sending ----
  if (/[?&]sent=1/.test(location.search)) {
    var box = document.querySelector('.form-area');
    if (box) box.classList.add('is-sent');
  }
  var next = document.querySelector('input[name="_next"]');
  if (next) next.value = location.origin + location.pathname + '?sent=1';
})();
