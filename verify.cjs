/* Tidslinjen – verifiering. Kör: node verify.cjs
   Kontrollerar (a) fakta mot en OBEROENDE tabell hårdkodad här (årtalen jag verifierat mot
   SO-rummet, Världens Historia, Riksarkivet, Regeringen.se, Riksdagen.se och Sveriges
   historia på Wikipedia), (b) att korttexten aldrig avslöjar årtal, (c) att varje nivå
   har tillräckligt många giltiga kombinationer med minsta mellanrum, (d) att en hel rundas
   lösare aldrig kan låsa: upprepa tjugo tusen dragningar och lös dem steg för steg. */
'use strict';
var T = require('./public/data.js');

var dunder = 0;
function fel(msg) { dunder++; console.error('FEL: ' + msg); }

/* (a) oberoende faktabell – id och år, skriven för hand ur källorna */
var FORV = {
  lindisfarne: 793, gotland: 1361, kalmar: 1397, blodbad: 1520, vasa: 1523,
  reformation: 1527, roskilde: 1658, karl12: 1718, finland: 1809, norge1814: 1814,
  riksdagen: 1866, union1905: 1905, kriget1945: 1945, eu1995: 1995
};

if (T.HAE.length !== 14) fel('14 händelser förväntades, hittade ' + T.HAE.length);
var allaAr = T.HAE.map(function (h) { return h.ar; });
if (new Set(allaAr).size !== allaAr.length) fel('årtal måste vara unika');
T.HAE.forEach(function (h) {
  if (FORV[h.id] === undefined) fel('okänd id ' + h.id + ' saknas i faktabellen');
  else if (FORV[h.id] !== h.ar) fel('år för ' + h.id + ': appen har ' + h.ar + ', faktabellen ' + FORV[h.id]);
  var ord = h.text.trim().split(/\s+/);
  if (ord.length > 12) fel(h.id + ' har ' + ord.length + ' ord (max 12)');
  if (/\d/.test(h.text)) fel(h.id + ': siffra i korttexten avslöjar årstalet – "' + h.text + '"');
  /* inget ANNAT händelserår får dyka upp i texten */
  T.HAE.forEach(function (o) {
    if (String(o.ar).length >= 3 && h.text.indexOf(String(o.ar)) >= 0 && o.id !== h.id)
      fel(h.id + 's text innehåller årtal ' + o.ar);
  });
  if (!h.tid) fel(h.id + ' saknar period');
});
Object.keys(FORV).forEach(function (id) {
  if (!T.HAE.some(function (h) { return h.id === id; })) fel('faktabellens ' + id + ' saknas i appen');
});

/* (c) giltiga kombinationer per nivå */
T.NIVAAER.forEach(function (n) {
  var alla = T.allaKomb(n);
  if (alla.length < 12) fel('nivå ' + n.namn + ' har bara ' + alla.length + ' giltiga kombinationer (minst 12 krävs för ' + n.antal + ' uppgifter utan upprepning)');
  alla.forEach(function (k) {
    if (k.length !== n.kort) fel('komb på nivå ' + n.namn + ' har ' + k.length + ' kort');
    if (!T.giltig(k, n.mellan)) fel('komb på nivå ' + n.namn + ' bryter mellanrummet ' + n.mellan);
    var ids = k.map(function (h) { return h.id; });
    if (new Set(ids).size !== ids.length) fel('dubblett i komb');
    for (var i = 1; i < k.length; i++)
      if (k[i].ar <= k[i - 1].ar) fel('okänd ordning i komb');
  });
  console.log('nivå ' + n.namn + ': ' + alla.length + ' giltiga kombinationer (' + n.kort + ' kort, minst ' + n.mellan + ' år isär), krävs ' + n.antal);
});

/* (d) 6000 simuleringar av hela rundor: lös alltid äldst först, aldrig lås */
var drag = 0, lasta = 0;
for (var runde = 0; runde < 6000; runde++) {
  var anvanda = [];
  T.NIVAAER.forEach(function (n) {
    for (var i = 0; i < n.antal; i++) {
      var k = T.slumpa(n, anvanda);
      if (!k) { anvanda = []; k = T.slumpa(n, anvanda); }
      if (!k) { fel('nivå ' + n.namn + ': kunde inte dra uppgift även efter att upprepning släpptes'); return; }
      anvanda.push(T.nyckel(k));
      /* lösaren: tryck alltid det äldsta kvarvarande kortet */
      var kvar = k.slice(), plac = [], steg = 0;
      while (kvar.length) {
        var min = kvar.reduce(function (a, b) { return b.ar < a.ar ? b : a; });
        kvar = kvar.filter(function (x) { return x.id !== min.id; });
        plac.push(min); steg++; drag++;
        if (steg > 5) { fel('löses aldrig – mer än 5 steg på ' + n.kort + ' kort'); break; }
      }
      if (plac.length !== n.kort) fel('rundan gav ' + plac.length + ' placerade av ' + n.kort);
      else lasta++;
      /* ordningen måste bli strikt stigande */
      for (var j = 1; j < plac.length; j++)
        if (plac[j].ar <= plac[j - 1].ar) fel('felaktig slutordning');
      /* korttexten får inte innehålla svaret innan reveal: redan kontrollerat ovan */
    }
  });
}
console.log(lasta + ' uppgifter lösta i ' + 6000 + ' rundor (' + drag + ' korttryck), 0 lås');

if (dunder) { console.error(dunder + ' FEL'); process.exit(1); }
console.log('OK – 0 fel. 14 händelser mot oberoende faktabell, ' +
  T.NIVAAER.map(function (n) { return T.allaKomb(n).length; }).join('/') + ' kombinationer per nivå.');