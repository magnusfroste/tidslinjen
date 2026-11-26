/* Tidslinjen – lägg historiska händelser i kronologisk ordning. åk 4–6, HI.4-6.*.
   Allt ritas i kod (DOM + färger som CSS-variabler). Inga bildfiler i spelet,
   inga tredjepartsförfrågningar utom kotten.js (kodsnutten). */
(function () {
  'use strict';

  var T = window.TID, $ = function (id) { return document.getElementById(id); };
  var TOTALT = T.NIVAAER.reduce(function (a, n) { return a + n.antal; }, 0); /* 11 uppgifter */

  var S = {
    niva: 0, opp: 0, ko: [], kort: [], ordning: [], plac: [],
    fel: 0, skakaId: null, hint: false, lost: false, last: false,
    stjarnor: 0, ljud: true, klar: false, anvanda: []
  };

  var el = {
    start: $('startskarm'), spel: $('spel'), niva: $('niva'), stjarnor: $('stjarnor'),
    fraga: $('fraga'), tidslinje: $('tidslinje'), axelbakre: $('axelbakre'),
    axelframre: $('axelframre'), kort: $('kort'), fakta: $('faktaruta'),
    overlay: $('overlay'), ovTitel: $('ov-titel'), ovStjarnor: $('ov-stjarnor'),
    ovNasta: $('ov-nasta'), ovOm: $('ov-om'), ovBild: $('ov-bild'),
    ljud: $('ljud'), ljudikon: $('ljudikon')
  };

  /* ---------------- ljud och tal ---------------- */
  var ac = null;
  function slappLjud() {
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
    } catch (e) {}
  }
  function blipp(f, len, typ, vol) {
    if (!S.ljud) return;
    slappLjud(); if (!ac) return;
    try {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, ac.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (len || 0.18));
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + (len || 0.18) + 0.02);
    } catch (e) {}
  }
  var senasteTal = 0;
  function sag(text) {
    /* Färdiga mp3-filer ur ljud/ (se ljud/lines.js) – ingen talsyntes, så rösten
       låter likadant i alla webbläsare. Saknas filen blir det tyst. */
    if (!S.ljud) return;
    var nu = Date.now();
    if (nu - senasteTal < 200) return;
    senasteTal = nu;
    try { if (window.__rost && window.__rost(text, true)) return; } catch (e) {}
    try { if (window.console && window.__rostFinns && !window.__rostFinns(text)) console.warn('saknar mp3:', text); } catch (e) {}
  }
  function ritaLjudikon() {
    el.ljudikon.innerHTML = S.ljud
      ? '<path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/>'
      : '<path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16 9l5 6M21 9l-5 6"/>';
    el.ljud.setAttribute('aria-label', S.ljud ? 'Stäng av ljudet' : 'Sätt på ljudet');
  }
  function handelse(namn, varde) {
    if (window.skolappar && window.skolappar.event) {
      try { window.skolappar.event(namn, varde); } catch (e) {}
    }
  }

  /* ---------------- HUD ---------------- */
  function ritaNiva() {
    var s = '';
    for (var i = 0; i < T.NIVAAER.length; i++) s += '<i class="' + (i < S.niva ? 'klar' : '') + '"></i>';
    el.niva.innerHTML = s;
    el.niva.setAttribute('aria-label', 'Nivå ' + (S.niva + 1) + ' av ' + T.NIVAAER.length);
  }
  function ritaStjarnor() {
    el.stjarnor.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.5 7 .9-5.2 4.8 1.4 6.9L12 17.7 5.8 21l1.4-6.9L2 9.4l7-.9z"/></svg><span>' +
      S.stjarnor + '</span>';
    el.stjarnor.setAttribute('aria-label', S.stjarnor + ' stjärnor');
  }

  /* ---------------- rundans uppgifter ---------------- */
  function valjOppgaver() {
    S.anvanda = [];
    S.ko = T.NIVAAER.map(function (niva) {
      var lista = [];
      for (var i = 0; i < niva.antal; i++) {
        var k = T.slumpa(niva, S.anvanda);
        if (!k) { S.anvanda = []; k = T.slumpa(niva, S.anvanda); }
        S.anvanda.push(T.nyckel(k));
        lista.push(T.blanda(k));
      }
      return lista;
    });
  }

  function nyOppgave() {
    var niva = T.NIVAAER[S.niva];
    if (S.opp >= niva.antal) { nivaKlar(); return; }
    S.kort = S.ko[S.niva][S.opp];
    S.ordning = S.kort.slice(); /* stsed, vridd redan vid val */
    S.plac = [];
    S.fel = 0; S.skakaId = null; S.hint = false; S.lost = false; S.last = false;
    el.fraga.textContent = 'Vilket hände först? Lägg äldst till vänster.';
    el.fakta.textContent = '';
    render();
    sag('Nu igen: äldst först.');
  }

  function kvar() { return S.kort; }
  function minKvar() {
    var m = null;
    S.kort.forEach(function (h) { if (!m || h.ar < m.ar) m = h; });
    return m;
  }

  function tryck(id) {
    if (S.last || S.klar) return;
    var h = null;
    S.kort.forEach(function (x) { if (x.id === id) h = x; });
    if (!h) return;
    var ratt = minKvar();

    if (h.id === ratt.id) {
      S.kort = S.kort.filter(function (x) { return x.id !== id; });
      S.plac.push(h);
      S.skakaId = null;
      blipp(600, 0.08);
      if (S.kort.length === 0) los(); else render();
      return;
    }

    /* fel kort: ingen förlust, inget flyttar sig */
    S.fel++;
    S.skakaId = id;
    blipp(190, 0.16, 'triangle');
    if (S.fel < 2) {
      el.fakta.textContent = 'Den hände senare. Prova den som hände först.';
      sag('Den hände senare. Prova den som hände först.');
      render();
      setTimeout(function () { S.skakaId = null; render(); }, 420);
    } else {
      S.hint = true;
      el.fakta.textContent = 'Titta på kortet som lyser – det är det äldsta som återstår.';
      sag('Titta på kortet som lyser.');
      handelse('hint');
      render();
      setTimeout(function () { S.skakaId = null; render(); }, 420);
    }
  }

  function los() {
    S.last = true;
    S.lost = true;
    var ars = S.plac.map(function (h) { return h.ar; });
    el.fakta.textContent = 'Rätt! ' + ars.join(' · ');
    if (S.fel === 0) {
      S.stjarnor++;
      ritaStjarnor();
      blipp(660, 0.09); setTimeout(function () { blipp(990, 0.16); }, 90);
    } else {
      blipp(520, 0.12); setTimeout(function () { blipp(700, 0.16); }, 110);
    }
    render();
    sag('Bra ordning!');
    setTimeout(nasta, 2200);
  }

  function nasta() {
    if (S.klar) return;
    var niva = T.NIVAAER[S.niva];
    if (S.opp + 1 >= niva.antal) { nivaKlar(); return; }
    S.opp++;
    nyOppgave();
  }

  /* ---------------- rendering ---------------- */
  function render() {
    /* tidslinjen: första led = äldst */
    var slots = '';
    for (var i = 0; i < T.NIVAAER[S.niva].kort; i++) {
      var h = S.plac[i];
      slots += '<div class="plats ' + (h ? 'ifylld' : '') + '">' +
        (h ? '<span class="pl-ar">' + h.ar + '</span><span class="pl-text">' + h.text + '</span>'
           : '<span class="pl-nr">' + (i + 1) + '</span>') +
        '</div>';
    }
    el.tidslinje.innerHTML = slots;
    el.axelbakre.hidden = S.kort.length === 0 ? false : false;
    el.axelbakre.style.visibility = S.plac.length ? 'visible' : 'hidden';
    el.axelframre.style.visibility = S.plac.length ? 'visible' : 'hidden';

    /* korten: stabilt décor, pulserar rätt kort när hint visas */
    var ratt = minKvar();
    var kortHtml = '';
    S.ordning.forEach(function (h) {
      var finns = S.kort.some(function (x) { return x.id === h.id; });
      if (!finns && !S.plac.some(function (x) { return x.id === h.id; })) return;
      if (!finns) return; /* redan på tidslinjen */
      var cls = 'kort';
      if (S.hint && ratt && h.id === ratt.id) cls += ' andar';
      if (S.skakaId === h.id) cls += ' fel';
      kortHtml += '<button type="button" class="' + cls + '" data-id="' + h.id +
        '" aria-label="' + h.text + '">' +
        '<span class="kort-text">' + h.text + '</span></button>';
    });
    el.kort.innerHTML = kortHtml;
    Array.prototype.forEach.call(el.kort.querySelectorAll('.kort'), function (b) {
      b.addEventListener('click', function () { tryck(b.getAttribute('data-id')); });
    });
  }

  /* ---------------- nivå klart / slut ---------------- */
  function visaOverlay(titel, knappText, omSynlig) {
    el.ovBild.src = ikonDataURL();
    var s = '';
    for (var i = 0; i < T.NIVAAER.length; i++) s += '<i class="' + (i < S.niva ? '' : 'tom') + '"></i>';
    el.ovStjarnor.innerHTML = s;
    el.ovTitel.textContent = titel;
    el.ovNasta.textContent = knappText;
    el.ovNasta.hidden = false;
    el.ovOm.hidden = !omSynlig;
    el.overlay.hidden = false;
  }

  function nivaKlar() {
    S.klar = true;
    S.niva++;
    if (S.niva >= T.NIVAAER.length) { slut(); return; }
    visaOverlay('Nivå ' + S.niva + ' klar!', 'Nästa nivå', false);
    blipp(660, 0.1); setTimeout(function () { blipp(880, 0.1); }, 110);
    setTimeout(function () { blipp(1100, 0.22); }, 230);
    sag('Nivå klar!');
  }

  function slut() {
    S.klar = true;
    S.niva = T.NIVAAER.length;
    visaOverlay('Alla nivåer klara! ' + S.stjarnor + ' av ' + TOTALT + ' stjärnor', 'Spela igen', true);
    blipp(660, 0.1); setTimeout(function () { blipp(880, 0.1); }, 110);
    setTimeout(function () { blipp(1100, 0.22); }, 230);
    sag('Alla nivåer klara!');
    handelse('round_done', Math.round(100 * S.stjarnor / TOTALT));
  }

  function ikonDataURL() {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
      '<rect width="200" height="200" rx="40" fill="#dff0ec"/>' +
      '<rect x="26" y="86" width="148" height="14" rx="7" fill="#3f8f84"/>' +
      '<circle cx="52" cy="93" r="20" fill="#fff" stroke="#3f8f84" stroke-width="8"/>' +
      '<circle cx="100" cy="93" r="20" fill="#fff" stroke="#3f8f84" stroke-width="8"/>' +
      '<circle cx="148" cy="93" r="20" fill="#e0a13a" stroke="#b87c1f" stroke-width="8"/>' +
      '<path d="M60 140h80" stroke="#3f8f84" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M132 126l16 14-16 14" fill="none" stroke="#3f8f84" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------------- start / asp ---------------- */
  function startaOm() {
    S.niva = 0; S.opp = 0; S.stjarnor = 0; S.klar = false; S.last = false;
    el.overlay.hidden = true;
    valjOppgaver();
    ritaNiva(); ritaStjarnor();
    nyOppgave();
    sag(T.NIVAAER[0].instr);
    handelse('level', 1);
  }

  function starta() {
    el.start.hidden = true;
    el.spel.hidden = false;
    ritaLjudikon();
    startaOm();
    handelse('round_start');
  }

  $('spela').addEventListener('click', function () { slappLjud(); starta(); });
  el.ovNasta.addEventListener('click', function () {
    el.overlay.hidden = true;
    if (S.niva >= T.NIVAAER.length) { startaOm(); return; }
    S.klar = false; S.opp = 0;
    ritaNiva(); ritaStjarnor();
    nyOppgave();
    sag(T.NIVAAER[S.niva].instr);
    handelse('level', S.niva + 1);
  });
  el.ovOm.addEventListener('click', function () { el.overlay.hidden = true; startaOm(); });
  el.ljud.addEventListener('click', function () {
    S.ljud = !S.ljud;
    if (!S.ljud) {
      try { if (window.__rostStopp) window.__rostStopp(); } catch (e) {}
      handelse('sound_off');
    }
    ritaLjudikon();
  });

  /* dev-hake för verifiering i webbläsare */
  window.__spel = {
    S: S, T: T, tryck: tryck, nasta: nasta, nyOppgave: nyOppgave, starta: starta,
    valjOppgaver: valjOppgaver, render: render,
    lage: function () {
      return {
        niva: S.niva + 1, opp: S.opp, kvar: S.kort.length, plac: S.plac.length,
        ratt: S.kort.length ? minKvar().id : null, stjarnor: S.stjarnor,
        klar: S.klar, last: S.last, overlay: !el.overlay.hidden
      };
    }
  };
})();