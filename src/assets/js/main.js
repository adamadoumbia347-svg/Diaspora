(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // Scroll reveal
  var targets = document.querySelectorAll('main article.card-lift, main section > h2, main article > h2, main details, main ol.timeline > li.relative, main figure, main table, main form:not(#planner), .rv-map, [data-rv]');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) {
      var i = 0, sib = el;
      while ((sib = sib.previousElementSibling) && i < 5) if (sib.tagName === el.tagName) i++;
      el.style.setProperty('--i', el.classList.contains('card-lift') || el.tagName === 'DETAILS' ? i : 0);
      el.classList.add('rv');
      io.observe(el);
    });
    // safety net: never leave content hidden
    setTimeout(function () { if (!document.querySelector('.rv.in')) targets.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  var header = document.querySelector('header.sticky');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  var btn = document.getElementById('menu-btn'), nav = document.getElementById('mobile-nav');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('hidden') === false;
    nav.classList.toggle('flex', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  var planner = document.getElementById('planner');
  if (planner) {
    var data = JSON.parse(document.getElementById('planner-data').textContent);
    planner.addEventListener('submit', function (e) {
      e.preventDefault();
      var hub = planner.querySelector('#hub').value, dur = planner.querySelector('#duration').value, style = planner.querySelector('#style').value;
      var key = 'bolzano5';
      if (hub === 'venice' || dur === 'd4') key = 'venice4';
      else if (dur === 'd7') key = 'loop7';
      else if (hub === 'trento' || style === 'family') key = 'moena';
      var r = data[key], box = document.getElementById('planner-result');
      document.getElementById('planner-title').textContent = r.title;
      document.getElementById('planner-desc').textContent = r.desc;
      document.getElementById('planner-a').href = r.a;
      document.getElementById('planner-b').href = r.b;
      box.hidden = false;
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  var filters = document.getElementById('filters');
  if (filters) filters.addEventListener('click', function (e) {
    var b = e.target.closest('[data-filter]');
    if (!b) return;
    filters.querySelectorAll('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    document.querySelectorAll('#cards [data-region]').forEach(function (card) {
      card.hidden = b.dataset.filter !== 'all' && card.dataset.region !== b.dataset.filter;
    });
  });

  var print = document.getElementById('print-btn');
  if (print) print.addEventListener('click', function () { window.print(); });
})();
