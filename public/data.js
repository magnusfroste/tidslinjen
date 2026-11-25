/* Tidslinjen — 14 riktiga händelser ur svensk historia med årstalet i data (aldrig i korttexten).
   Källor till varje år står på startskärmen i INSKICK/KONCEPT och i index.html.
   Skolverkets API (hämtat 2026-11-23) ger punkterna HI.4-6.* */
(function (global) {
  'use strict';

  var HAE = [
    { id: 'lindisfarne', ar: 793,  text: 'Vikingarna angriper klostret i Lindisfarne', tid: 'Vikingatiden' },
    { id: 'gotland',     ar: 1361, text: 'Gotland tas av danskarna', tid: 'Medeltiden' },
    { id: 'kalmar',      ar: 1397, text: 'Sverige, Danmark och Norge förenas i Kalmarunionen', tid: 'Medeltiden' },
    { id: 'blodbad',     ar: 1520, text: 'Blodbad på Stortorget i Stockholm', tid: 'Medeltiden' },
    { id: 'vasa',        ar: 1523, text: 'Gustav Vasa väljs till Sveriges kung', tid: 'Vasatiden' },
    { id: 'reformation', ar: 1527, text: 'Reformationen beslutas i Västerås', tid: 'Vasatiden' },
    { id: 'roskilde',    ar: 1658, text: 'Skåne, Halland och Bohuslän blir svenska', tid: 'Stormaktstiden' },
    { id: 'karl12',      ar: 1718, text: 'Karl XII dör och kriget tar slut', tid: 'Stormaktstiden' },
    { id: 'finland',     ar: 1809, text: 'Sverige förlorar Finland till Ryssland', tid: '1800-talet' },
    { id: 'norge1814',   ar: 1814, text: 'Norge förenas med Sverige i union', tid: '1800-talet' },
    { id: 'riksdagen',   ar: 1866, text: 'Ståndsriksdagen ersätts av tvåkammarriksdagen', tid: '1800-talet' },
    { id: 'union1905',   ar: 1905, text: 'Unionen med Norge upplöses', tid: '1900-talet' },
    { id: 'kriget1945',  ar: 1945, text: 'Andra världskriget tar slut', tid: '1900-talet' },
    { id: 'eu1995',      ar: 1995, text: 'Sverige blir medlem i EU', tid: 'Nutid' }
  ];

  /* En mekanik per app: lägg korten i kronologisk ordning. Svårigheten stiger genom
     antal kort och hur nära årtalen varandra ligger — aldrig genom tid. */
  var NIVAAER = [
    { namn: 1, kort: 3, antal: 4, mellan: 100, instr: 'Nivå 1. Lägg tre kort i rätt ordning – äldst först.' },
    { namn: 2, kort: 4, antal: 4, mellan: 40,  instr: 'Nivå 2. Fyra kort, äldst först.' },
    { namn: 3, kort: 5, antal: 3, mellan: 25,  instr: 'Nivå 3. Fem kort, äldst först.' }
  ];

  function giltig(komb, mellan) {
    for (var i = 1; i < komb.length; i++) {
      if (komb[i].ar - komb[i - 1].ar < mellan) return false;
    }
    return true;
  }

  /* Alla giltiga delmängder per nivå (räknas en gång och cacheas). */
  var cache = {};
  function allaKomb(niva) {
    var key = niva.kort + ':' + niva.mellan;
    if (cache[key]) return cache[key].komber;
    var ut = [];
    (function pick(start, vald) {
      if (vald.length === niva.kort) {
        if (giltig(vald, niva.mellan)) ut.push(vald.slice());
        return;
      }
      for (var i = start; i < HAE.length; i++) {
        vald.push(HAE[i]);
        pick(i + 1, vald);
        vald.pop();
      }
    })(0, []);
    /* nycklar förberäkns en gång (används av slumpa i stor skala i verify) */
    cache[key] = {
      komber: ut,
      nycklar: ut.map(function (k) { return k.map(function (h) { return h.id; }).sort().join('|'); })
    };
    return cache[key].komber;
  }

  function nyckelLista(niva) {
    var key = niva.kort + ':' + niva.mellan;
    if (!cache[key]) allaKomb(niva);
    return cache[key].nycklar;
  }

  /* Slumpa en uppgift: en giltig komb blanda[ad], utan upprepning inom rundan (anvanda = nycklar). */
  function slumpa(niva, anvanda) {
    var alla = allaKomb(niva), nycklar = nyckelLista(niva);
    var fria = [];
    for (var i = 0; i < alla.length; i++) {
      if (anvanda.indexOf(nycklar[i]) < 0) fria.push(alla[i]);
    }
    if (!fria.length) return null; /* noll kvar – ringen runt (anvanda töms av anroparen) */
    return fria[Math.floor(Math.random() * fria.length)];
  }

  function nyckel(komb) {
    return komb.map(function (h) { return h.id; }).sort().join('|');
  }

  function blanda(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var X = { HAE: HAE, NIVAAER: NIVAAER, allaKomb: allaKomb, slumpa: slumpa, nyckel: nyckel, blanda: blanda, giltig: giltig };
  if (typeof module !== 'undefined' && module.exports) module.exports = X;
  else global.TID = X;
})(typeof window !== 'undefined' ? window : this);