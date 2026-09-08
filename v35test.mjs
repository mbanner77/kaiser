/* v3.5: Thronfolger, Spionage-Missionen, Expedition, Feste/Turnier, Dossier, Katastrophen, Machtindex, Slots, Krönung */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) Thronfolger: Geburt, Erziehung, Erbfolge */
const r1 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei", dynastie:true });
  const p = G.spieler[0];
  p.startAlter = 30;
  const orig = Math.random; Math.random = () => 0.05;
  zwischenbilanz(p);
  Math.random = orig;
  const geboren = !!p.erbe && !p.erbe.zug;
  zeige("zwbilanz");
  const wahlUi = document.querySelector("#screen").innerHTML.includes("Erziehung von");
  erziehen("gelehrt");
  const erzogen = p.erbe.zug === "gelehrt";
  /* Erbfolge nach 20 Jahren */
  G.jahr = 1700 + 20; p.erbe.geb = 1702;
  const erbName = p.erbe.name;
  erben(p);
  return { geboren, wahlUi, erzogen,
    uebernahme: p.name === erbName && p.zug === "gelehrt" && alterJahre(p) === G.jahr - 1702,
    geraeumt: p.erbe === null };
});
check("Kind wird geboren", r1.geboren);
check("Erziehungswahl in der Zwischenbilanz", r1.wahlUi && r1.erzogen);
check("Thronfolger übernimmt mit Erziehung und Alter", r1.uebernahme && r1.geraeumt);

/* 2) Spionage: Sabotage-Erfolg und Fehlschlag mit Kriegsfolge */
const r2 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  p.geld = 50000; p.spionGenutzt = false; b.mauer = 2; b.korn = 4000;
  G._angriffe = [];
  G.aktiv = 0; zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  document.getElementById("spionMission").value = "sabotage";
  const orig = Math.random; Math.random = () => 0.1;   /* Erfolg */
  spionEntsenden();
  Math.random = orig;
  const sabotiert = b.mauer === 1;
  /* Fehlschlag: Krieg */
  p.spionGenutzt = false; b.kiTyp = "aggressor"; b.titel = 2;
  b.heer = { inf:400, kav:20, art:4 }; b.kriegGefuehrt = false;
  zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  document.getElementById("spionMission").value = "brand";
  const o2 = Math.random; Math.random = () => 0.95;    /* gefasst */
  let ersterWurf = true;
  Math.random = () => { if(ersterWurf){ ersterWurf = false; return 0.95; } return 0.01; };
  spionEntsenden();
  Math.random = o2;
  const krieg = (G._angriffe||[]).some(x=>x.kr.a===1 && x.kr.d===0);
  /* Gegenspione */
  gegenspioneToggle(true);
  return { sabotiert, krieg, gegen: p.gegenspione === true };
});
check("Sabotage sprengt einen Mauerring", r2.sabotiert);
check("Gefasster Spion kann Krieg auslösen", r2.krieg);
check("Gegenspione einstellbar", r2.gegen);

/* 3) Expedition: Start und Schatz-Rückkehr */
const r3 = await page.evaluate(() => {
  G._angriffe = [];
  const p = G.spieler[0];
  p.geld = 10000; p.expedition = null; p._seekarten = false;
  G.aktiv = 0; zeige("bauen");
  const knopf = document.querySelector("#screen").innerHTML.includes("Expedition ausrüsten");
  expeditionStarten();
  const unterwegs = !!p.expedition && p.geld === 7500;
  G.jahr = p.expedition.start + p.expedition.dauer;
  const r = { ereignisse: [] };
  const orig = Math.random; Math.random = () => 0.1;   /* Schatz */
  const geldVor = p.geld;
  expeditionAufloesen(p, r);
  Math.random = orig;
  return { knopf, unterwegs, schatz: p.geld > geldVor && r.ereignisse.length === 1, fertig: !p.expedition };
});
check("Expeditions-Knopf im Bauen-Bildschirm", r3.knopf);
check("Expedition startet für 2.500 T", r3.unterwegs);
check("Expedition kehrt mit Schatz zurück", r3.schatz && r3.fertig);

/* 4) Volksfest und Turnier */
const r4 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  p.geld = 20000; p.titel = 3; p.stimmung = 50; p.festJahr = 0; p.turnierJahr = 0;
  volksfest();
  const fest = p.stimmung === 60 && p.festJahr === G.jahr;
  b.bez = {}; p.bez = {};
  turnierStarten();
  const turnierLief = G.screen === "turnier" && !!G._turnier;
  const bezPlus = bezWert(p, b) >= 4;
  const sieger = G.spieler[G._turnier.sieger];
  G._turnier = null; zeige("bauen");
  return { fest, turnierLief, bezPlus, siegerDa: !!sieger };
});
check("Volksfest hebt die Stimmung", r4.fest);
check("Turnier öffnet die Tjost-Szene", r4.turnierLief && r4.siegerDa);
check("Turnier verbessert die Beziehungen", r4.bezPlus);

/* 5) Klickbare Weltkarte: Dossier */
const r5 = await page.evaluate(() => {
  G.aktiv = 0;
  weltAuf();
  const hinweis = document.querySelector("#screen").innerHTML.includes("Dossier zu öffnen") ||
                  document.querySelector("#screen").innerHTML.includes("Dossier");
  /* Klick auf Reich 1 simulieren: Position direkt berechnen */
  const c = document.getElementById("welt");
  const n = G.spieler.length;
  const a = -Math.PI/2 + 1/n*6.2832;
  const px = c.width/2 + Math.cos(a)*c.width*0.36, py = c.height/2+4 + Math.sin(a)*c.height*0.32;
  const rect = c.getBoundingClientRect();
  weltKlick({ clientX: rect.left + px*(rect.width/c.width), clientY: rect.top + py*(rect.height/c.height) });
  const offen = G._dossier === 1 && document.querySelector("#screen").innerHTML.includes("Dossier:");
  const knopf = document.querySelector("#screen").innerHTML.includes("Diplomatie mit");
  return { hinweis, offen, knopf };
});
check("Klick auf Insel öffnet Dossier", r5.offen);
check("Dossier mit Diplomatie-Schnellzugriff", r5.knopf);

/* 6) Stadtbrand: Ruine entsteht und wird beim Bau getilgt */
const r6 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.maerkte = 4; p._ruinen = 0; p.geld = 50000; p.stimmung = 60;
  const orig = Math.random; Math.random = () => 0.9;    /* Löschen misslingt */
  const txt = EREIGNIS_STADTBRAND.wahl[0].fx(p);
  Math.random = orig;
  const ruine = p._ruinen === 1 && p.maerkte === 3;
  const gewuerfelt = (()=>{ const o=Math.random; Math.random=()=>0.05; const e=ereignisWuerfeln(p); Math.random=o; return e && e.id==="stadtbrand"; })();
  /* Wiederaufbau */
  p.holz = 999; p.stein = 999; G.aktiv = 0; zeige("status"); G._bauModus = null;
  const vorher = p._ruinen;
  p.land = 50000;
  baue("markt");                       /* außerhalb der Bauansicht: baut direkt */
  return { ruine, gewuerfelt, getilgt: p._ruinen === vorher - 1, txt: txt.length > 0 };
});
check("Stadtbrand hinterlässt Ruine", r6.ruine && r6.txt);
check("Brand-Ereignis würfelbar", r6.gewuerfelt);
check("Neubau tilgt die Ruine", r6.getilgt);

/* 7) Machtindex und Astrologe */
const r7 = await page.evaluate(() => {
  G.spieler.forEach(p=>{ p.chronik = []; });
  for(let j=0;j<6;j++){ G.jahr++; G.spieler.forEach(p=>{
    p.chronik.push({ j:G.jahr, pop:p.pop, geld:p.geld, land:p.land, heer:heerGroesse(p.heer), mi:score(p)+j*1000 }); }); }
  G._vorStat = "bauen";
  zeige("statistik");
  const html = document.querySelector("#screen").innerHTML;
  return { chart: html.includes("Machtindex"), astro: html.includes("Hofastrologe") };
});
check("Machtindex-Verlauf in der Statistik", r7.chart);
check("Astrologen-Prognose", r7.astro);

/* 8) Speicherplätze */
const r8 = await page.evaluate(() => {
  staendeAuf();
  const leer = document.querySelector("#screen").innerHTML.includes("Platz 1 · leer");
  slotSpeichern(1);
  const voll = !!slotRoh(1) && slotRoh(1).meta.jahr === G.jahr;
  const jahrVor = G.jahr;
  G.jahr = 1600;                        /* absichtlich verstellen */
  slotLaden(1);
  const geladen = G.jahr === jahrVor;
  slotLoeschen(1);
  const geloescht = !slotRoh(1);
  return { leer, voll, geladen, geloescht };
});
check("Leere Plätze angezeigt", r8.leer);
check("Speichern/Laden/Löschen der Plätze", r8.voll && r8.geladen && r8.geloescht);

/* 9) Krönung */
const r9 = await page.evaluate(() => {
  const p = cur();
  p.titel = 8; G.sieger = p;
  G._kroenStart = null;
  zeige("kroenung");
  const canvas = !!document.getElementById("kroenBild");
  zeichneKroenung(performance.now());
  G._kroenStart = performance.now() - 8000;   /* Endphase */
  zeichneKroenung(performance.now());
  const html = document.querySelector("#screen").innerHTML;
  return { canvas, knopf: html.includes("Lang lebe der Kaiser"), start: !!G._kroenStart };
});
check("Krönungs-Szene rendert", r9.canvas && r9.start);
check("Weiter-Knopf zur Schlusswertung", r9.knopf);

/* 10) Neue Felder überleben Speichern/Laden */
const r10 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.erbe = { name:"Testkind", w:false, geb:G.jahr-5, zug:"gelehrt" };
  p.expedition = { start:G.jahr, dauer:3 }; p.gegenspione = true; p._ruinen = 2;
  const d = spielstand();
  ladeSpielstand(d);
  const q = G.spieler[0];
  return { ok: q.erbe && q.erbe.name==="Testkind" && q.expedition && q.expedition.dauer===3
             && q.gegenspione === true && q._ruinen === 2 };
});
check("Neue Felder im Spielstand", r10.ok);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
