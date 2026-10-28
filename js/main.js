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

  // ---- contact form: send in the background, then show thank-you ----
  var form = document.querySelector('form[data-ajax]');
  if (form) {
    var area = document.querySelector('.form-area');
    form.addEventListener('submit', function (e) {
      if (!window.fetch) return; // very old browsers: normal post
      e.preventDefault();
      if (form.querySelector('[name="_honey"]').value) return;
      if (area.classList.contains('is-busy')) return;
      area.classList.remove('has-error');
      area.classList.add('is-busy');
      var data = new URLSearchParams();
      new FormData(form).forEach(function (v, k) { if (k !== '_honey') data.append(k, v); });
      data.append('language', root.getAttribute('data-lang') === 'en' ? 'English' : 'Korean');
      // FormSubmit delivers the email quickly but can be slow to reply to the page.
      // If it hasn't answered within 6 seconds, treat the message as sent.
      var done = false;
      function finish(ok) {
        if (done) return; done = true;
        area.classList.remove('is-busy');
        if (ok) { area.classList.add('is-sent'); form.reset(); } else { area.classList.add('has-error'); }
      }
      var timer = setTimeout(function () { finish(true); }, 6000);
      fetch(form.getAttribute('data-ajax'), {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      }).then(function (r) { return r.json(); })
        .then(function (j) { clearTimeout(timer); finish(String(j.success) === 'true'); })
        .catch(function () { clearTimeout(timer); finish(false); });
    });
  }
})();
