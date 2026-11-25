# Tidslinjen — koncept

**Mål (en sak per app):** barnet övar på att placera historiska händelser i kronologisk
ordning — äldst först — och koppla händelsen till rätt år och period.

**Målgrupp:** åk 4–6 (10–12 år), bandet 3–6 i katalogens åldersmatris.
**Tom cell:** mätt på katalogens admin-yta 2026-11-25 (84 rader): **Samhälle × 3–6 = 0 appar**
(Matte 37, STEM 17, Språk 16, Kreativt 8, Samhälle 5 totalt — och Samhälle består bara av
FS 2, FK–2 1 och 7–9 2). Hela historien för mellanstadiet saknas.

**Inspiration (namngiven källa):** mekaniken "ordna händelserna i tid" kommer från brädspel
traden *När då då?* (kronologisk ordning av historiska händelser, klassiskt klassrumsspel —
se playiro.com och Wikipedias artikel) och från elevspel.se, där lärarrapporten
(diva2:1872166) visar att tidslinjeövning är den vanligaste historieleken i mellanstadiet.
Ingen bild eller text kopieras — bara ordningsmekaniken.

**Kärnmekanik (touch först):** frågan står skriven och läses upp ("Vilket hände först? Lägg
äldst till vänster"), tidslinjen löper vänster–höger med led numrerade 1..n (vänster = äldst)
och korten ligger under. Ett tryck på ett kort placerar det på nästa led om det är det äldsta
som återstar. Fel kort: kortet skakar, inget flyttar sig, meddelandet säger "Den hände
senare" — efter två försök pulserar det äldsta kortet (motion + text + tal, och
`hint`-händelsen rapporteras). Aldrig liv, aldrig tid. När alla kort ligger syns årstalet
och perioden (Vikingatiden … Nutid) på varje kort och raden "Rätt! 793 · 1361 · …" skrivs och
läses upp.

**Nivåer (svårigheten stiger genom antal kort och hur nära årtalen ligger — aldrig tid):**
1. 3 kort, minst 100 år mellan grannarna, 4 uppgifter
2. 4 kort, minst 40 år, 4 uppgifter
3. 5 kort, minst 25 år, 3 uppgifter

**5-minuterssession:** 11 uppgifter, "Nästa nivå" mellan nivåerna, slutskaerm
"Alla nivåer klara! 10 av 11 stjärnor".

**Belöning barnet kan berätta om:** stjärnor (en per uppgift utan fel) och årstalen man
lärde sig: "Kalmarunionen var 1397, EU 1995".

**Vad barnet lär:** att historienlöper i en ordning som går att veta — medeltiden före
reformationen, förlusten av Finland före unionen med Norge — och vilka händelser som hör
till 800–1500, 1500–1800 och tiden därefter.

**Ingen hemlighet i korten:** korttexten innehåller inga siffror alls (verifieras av
`verify.cjs`) — annars kunde barnet lösa uppgiften genom att sortera siffror i stället för
att veta historien. Årstalet visas först efter rätt ordning.

**Lgr22 (ordagrant ur Skolverkets Syllabus API, hämtat 2026-11-23):**
- HI.4-6.1.2 — ”Statsbildning och kristendomens etablerande i Norden samt konsekvenser av dessa förändringar.”
- HI.4-6.2.1 — ”Kampen om den politiska makten i Norden. Reformationen och framväxten av en stark kungamakt i Sverige. Uppror och motstånd mot kungamakten.”
- HI.4-6.3.1 — ”Nya maktförhållanden i Sverige och mellan länder i Norden.”

Kopplingen: uppgifterna är hämtade ur just de tre perioderna (Kalmarunionen 1397,
Stockholms blodbad 1520, Gustav Vasa 1523, Reformationen 1527, Finland 1809, Norge 1814,
representationsreformen 1866, unionens upplösning 1905, EU 1995) och barnet ser perioden
på kortet när ordningen stämmer.

**Varför det funkar på iPad:** ett tryck per kort, kort och led är 96+ px, frågan är skriven
och uppläst, allt ryms på en skärm, ingen hover och ingen pröcisionsgest — bara peka i den
ordning man tror.

**Källor till årtalen (anges på startskärmen):** SO-rummet (blodbad 1520, Vasa 1523,
Västerås 1527, Lindisfarne 793), Världens Historia (strängnäsvalet 6 juni 1523),
Riksarkivet (finland 1809), Regeringen.se (EU 1995), Riksdagen.se (representationsreformen
1866), Wikipedia Sveriges historia (Kalmarunionen 1397, gotland 1361, Roskilde 1658,
Karl XII 1718, Norge-unionen 1814/1905, världskriget 1945).

## Testplan (mätbara krav)
1. Allt ryms: `scrollHeight-innerHeight == 0` och `scrollWidth-innerWidth == 0` i 1024×768,
   768×1024, 390×844, 1440×900 — både startskärm OCH spel (klicka `#spela` först).
2. Hela rundan (11 uppgifter, tre nivåer) spelas med `Input.dispatchTouchEvent` (touchStart/
   touchMove/ touchEnd), inte klick — korten flyttar sig medan fingret är nere och stannar
   efter touchEnd.
3. Ingen uppgift går att låsa: `node verify.cjs` — 6000 rundor, 66 000 uppgifter, alltid
   äldst först → 0 fel, 0 lås.
4. Korttexten innehåller ingen siffra (slår annars ut på att sortera siffror) och max 12 ord.
5. Fel tryck flyttar ingenting; efter två fel pulserar det äldsta kvarvarande kortet och
   `hint` rapporteras; rätt svar först ger stjärna.
6. Årstalet och perioden syns först efter rätt ordning (testa i dev-läget `window.__spel`).
7. Ingen inloggning, ingen reklam, inga länkar ut, inga tredjepartsförfrågningar utom
   `kotten.js`; ljudknapp 44 px stänger av tal och blipp; `sound_off` rapporteras.
8. Text i spelbilden ≥ 18 px; `lang="sv"`; `prefers-reduced-motion` stänger pulseringen men
   behåller den statiska ringen; slutskärmen är opak (`position: fixed; inset: 0`).
9. Kortbilden: 1200×900 spelmoment (fyllda led + kort), ingen pålagd text.

## Validering (go/no-go)
`delegate_task` finns inte i denna körnings verktygslåda, så valideringen gjordes som skriven
motfråga mot de tre kraven:
(a) *Spelar ett barn frivilligt 5 minuter?* Mekaniken är "ett till bara": 11 korta
ordningsuppgifter, omedelbar belöning och årstal som dyker upp först när man lyckats.
Risk: nivå 1 (3 kort, 100 års mellanrum) kan kännas lätt — därför går nivå 3 till fem kort med
25 års mellanrum, där 1520/1523/1527-effekten blir verklig. Gå.
(b) *Träffar det ett verkligt kunskapskrav?* Ja: HI.4-6.2.1 innehåller ordagrant
"Reformationen och framväxten av en stark kungamakt" — Reformationen 1527 och Gustav Vasas
kungadöme 1523 är uppgifter i appen; HI.4-6.1.2 "Statsbildning" bär Kalmarunionen 1397;
HI.4-6.3.1 "Nya maktförhållanden i Sverige och mellan länder i Norden" bär 1809/1814/1905/1995.
Kan barnet lösa det genom annat än kunskap? Nej — korten bär inga siffror. Gå.
(c) *Teknisk risk?* Låg: ren DOM-inget canvas, inget dragningskrävande, tillräckligt många
giltiga kombinationer (190/639/1260) så rundor aldrig upprepas eller låser. Enda
fallgropen är att rätt rad (stigande år) måste finnas — den garanteras konstruktivt
(sortering) och bevisas av verify. Gå.