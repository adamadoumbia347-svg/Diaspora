(function () {
  var cfg = window.ROTTA_CONFIG || {};
  var form = document.getElementById('ricerca');
  var agesBox = document.getElementById('eta-box');
  var childrenSel = document.getElementById('bambini');
  var error = document.getElementById('errore');
  var depart = document.getElementById('andata');
  var ret = document.getElementById('ritorno');

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Date: non nel passato, ritorno dopo l'andata.
  var today = new Date();
  depart.min = iso(today);
  ret.min = iso(today);
  depart.addEventListener('change', function () {
    ret.min = depart.value || iso(today);
    if (ret.value && ret.value < depart.value) ret.value = '';
  });

  // Un menu "età" per ogni bambino.
  function renderAges() {
    var n = Number(childrenSel.value);
    var previous = Array.prototype.map.call(agesBox.querySelectorAll('select'), function (s) { return s.value; });
    agesBox.innerHTML = '';
    for (var i = 0; i < n; i++) {
      var wrap = document.createElement('div');
      wrap.className = 'field';
      var label = document.createElement('label');
      label.htmlFor = 'eta-' + i;
      label.textContent = 'Età bambino ' + (i + 1);
      var sel = document.createElement('select');
      sel.id = 'eta-' + i;
      for (var a = 0; a <= 17; a++) {
        var opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a === 0 ? 'meno di 1' : a + (a === 1 ? ' anno' : ' anni');
        sel.appendChild(opt);
      }
      sel.value = previous[i] !== undefined ? previous[i] : '5';
      wrap.appendChild(label);
      wrap.appendChild(sel);
      agesBox.appendChild(wrap);
    }
    agesBox.parentElement.hidden = n === 0;
  }
  childrenSel.addEventListener('change', renderAges);
  renderAges();

  function read() {
    var dest = document.getElementById('a');
    var opt = dest.options[dest.selectedIndex];
    return {
      from: document.getElementById('da').value,
      toCode: dest.value,
      toName: opt ? opt.textContent : '',
      depart: depart.value,
      ret: ret.value,
      adults: document.getElementById('adulti').value,
      ages: Array.prototype.map.call(agesBox.querySelectorAll('select'), function (s) { return s.value; })
    };
  }

  function validate(q) {
    if (!q.toCode) return 'Scegli una destinazione.';
    if (!q.depart || !q.ret) return 'Indica le date di andata e ritorno.';
    if (q.ret < q.depart) return 'Il ritorno deve essere dopo l\'andata.';
    return '';
  }

  function yymmdd(isoDate) {
    return isoDate.slice(2).replace(/-/g, '');
  }

  var builders = {
    voli: function (q) {
      var url = 'https://www.skyscanner.it/transport/flights/' + q.from.toLowerCase() + '/' + q.toCode.toLowerCase() +
        '/' + yymmdd(q.depart) + '/' + yymmdd(q.ret) + '/?adultsv2=' + q.adults +
        (q.ages.length ? '&childrenv2=' + encodeURIComponent(q.ages.join('|')) : '') +
        '&cabinclass=economy';
      return cfg.flightsLinkTemplate ? cfg.flightsLinkTemplate.replace('{url}', encodeURIComponent(url)) : url;
    },
    hotel: function (q) {
      var p = new URLSearchParams({
        ss: q.toName,
        checkin: q.depart,
        checkout: q.ret,
        group_adults: q.adults,
        no_rooms: '1',
        group_children: String(q.ages.length)
      });
      q.ages.forEach(function (a) { p.append('age', a); });
      if (cfg.bookingAid) p.set('aid', cfg.bookingAid);
      return 'https://www.booking.com/searchresults.it.html?' + p.toString();
    },
    attivita: function (q) {
      var p = new URLSearchParams({ q: q.toName + ' bambini', date_from: q.depart, date_to: q.ret });
      if (cfg.getYourGuidePartnerId) p.set('partner_id', cfg.getYourGuidePartnerId);
      return 'https://www.getyourguide.it/s/?' + p.toString();
    }
  };

  form.addEventListener('submit', function (e) { e.preventDefault(); });

  form.querySelectorAll('[data-cerca]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var q = read();
      var msg = validate(q);
      error.textContent = msg;
      error.hidden = !msg;
      if (msg) return;
      window.open(builders[btn.dataset.cerca](q), '_blank', 'noopener');
    });
  });

  // Le idee di destinazione compilano il modulo.
  document.querySelectorAll('[data-dest]').forEach(function (card) {
    card.addEventListener('click', function () {
      document.getElementById('a').value = card.dataset.dest;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      depart.focus({ preventScroll: true });
    });
  });

  // Esposto per i test.
  window.rottaBuild = function (kind) { return builders[kind](read()); };
})();
