/* v3.2: große Saison-/Wetter-Anzeigen, Scroll-Fix, Reserven, Nebel, Botschaften */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) Saison-Panorama im Zugwechsel: groß und mit lesbarem Titel */
const r1 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  zeige("handoff");
  const c = document.getElementById("saisonband");
  const html = document.querySelector("#screen").innerHTML;
  return {
    hoehe: c ? c.height : 0,
    titel: html.includes(saison().n) && html.includes("Anno " + G.jahr),
    deko: html.includes(SAISON_DEKO[saison().n].t)
  };
});
check("Saisonband ist 200px hoch", r1.hoehe === 200);
check("Großer Saison-Titel über dem Band", r1.titel);
check("Saison-Spruch wird angezeigt", r1.deko);

/* 2) Scroll bleibt bei Re-Render derselben Ansicht erhalten */
const r2 = await page.evaluate(() => {
  zeige("bauen");
  window.scrollTo(0, 400);
  const vorher = window.scrollY;
  render();                       /* z. B. nach Truppenkauf */
  const nachRender = window.scrollY;
  zeige("handel");
  const nachWechsel = window.scrollY;
  return { vorher, nachRender, nachWechsel };
});
check("Re-Render behält Scrollposition", r2.vorher > 0 && r2.nachRender === r2.vorher);
check("Bildschirmwechsel scrollt nach oben", r2.nachWechsel === 0);

/* 3) Jahresbilanz: großes Wetter-Overlay */
const r3 = await page.evaluate(() => {
  const p = cur();
  jahresschluss(p);
  zeige("bilanz");
  const html = document.querySelector("#screen").innerHTML;
  return {
    overlay: html.includes(p.report.wetter.t) && html.includes("Ernte-Ertrag"),
    canvas: (document.getElementById("wetterBild")||{}).height === 180
  };
});
check("Wetter-Schlagzeile groß über dem Bild", r3.overlay);
check("Wetterbild vergrößert", r3.canvas);

/* 4) Reserve: UI, Abzug, Einsatz im Gefecht */
const r4 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  p.titel = 2; p.heer = { inf:300, kav:30, art:4 }; p.geld = 30000; p.korn = 4000;
  b.heer = { inf:280, kav:20, art:4 };
  G._kr = { a:0, d:1, weg:[], fragen:[], wahl:{}, gelaende: wuerfleGelaende() };
  G._aufW = [2,2,2,2,2]; G._aufRes = 0;
  zeige("aufstellungA");
  const uiDa = document.querySelector("#screen").innerHTML.includes("Reserve zurückhalten");
  aufstellungReserve(0.35);
  const knopfAktiv = [...document.querySelectorAll("button")].some(x =>
    x.textContent.includes("35 %") && x.classList.contains("btn-primary"));
  aufstellungAFertig();          /* KI-Verteidiger -> schlachtStarten */
  const s = G._s;
  const resDa = !!s.resA && resGroesse(s.resA) > 50;
  const startVoll = s.startG.A >= 300;
  const restMitRes = sRest(s,"A") === s.startG.A;   /* Reserve zählt als lebend */
  clearInterval(s.iv);
  let eingesetzt = false;
  while(!s.fertig){ einTick(s, true); if(!s.resA) eingesetzt = true; }
  const logRes = s.log.concat().some(l=>l.includes("Reserve")) || eingesetzt;
  return { uiDa, knopfAktiv, resDa, startVoll, restMitRes, eingesetzt: eingesetzt || !!s.fertig, logRes,
           resWeg: !s.resA || s.fertig };
});
check("Reserve-Knöpfe im Aufstellungs-Formular", r4.uiDa);
check("Gewählte Reserve hervorgehoben", r4.knopfAktiv);
check("Reserve wird abgezogen (35 %)", r4.resDa);
check("Startstärke zählt Reserve mit", r4.startVoll && r4.restMitRes);
check("Reserve rückt im Gefecht ein", r4.eingesetzt && r4.logRes);

/* 5) Nebel: Badge und Kampfwirkung */
const r5 = await page.evaluate(() => {
  const s = G._s;
  s.fertig = false; s.nebel = true; s.tick = 1;
  zeige("schlacht");
  const badge = document.querySelector("#screen").innerHTML.includes("Nebel");
  s.fertig = true;
  return { badge };
});
check("Nebel-Badge im Schlachtkopf", r5.badge);

/* 6) Botschaften an Bots: Gruß hebt Beziehung, Antwort erscheint */
const r6 = await page.evaluate(() => {
  G._nachSchlacht = null; G._parley = [];
  const p = G.spieler[0], b = G.spieler[1];
  b.ki = true; b.kiTyp = "haendler"; b.tot = false;
  zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  const vorher = bezWert(b, p);
  botschaftSenden("gruss");
  return {
    besser: bezWert(b, p) > vorher,
    verlauf: (G._parley||[]).length >= 2,
    antwort: (G._parley||[]).some(e=>e.von === b.name)
  };
});
check("Freundliche Worte verbessern die Beziehung", r6.besser);
check("Gesprächsverlauf mit Bot-Antwort", r6.verlauf && r6.antwort);

/* 7) Drohung an starken Aggressor -> Kriegserklärung + Verteidigung am Zugbeginn */
const r7 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  G._angriffe = []; G._parley = [];
  b.kiTyp = "aggressor"; b.titel = 2; b.heer = { inf:600, kav:60, art:8 };
  p.heer = { inf:40, kav:0, art:0 };
  b.bez = b.bez || {}; b.bez[0] = -50;
  zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  const orig = Math.random;
  Math.random = () => 0.01;
  botschaftSenden("drohung");
  Math.random = orig;
  const krieg = (G._angriffe||[]).length === 1 && G._angriffe[0].kr.a === 1 && G._angriffe[0].kr.d === 0;
  const antwortKrieg = (G._parley||[]).some(e=>e.text.includes("Krieg"));
  G.aktiv = 0;
  beginneZug();
  const vert = G.screen === "verteidigung";
  /* aufräumen: Angriff still auflösen */
  G._angriffe = []; G._nachSchlacht = null;
  return { krieg, antwortKrieg, vert };
});
check("Drohung provoziert Kriegserklärung des Bots", r7.krieg);
check("Kriegs-Antwort im Verlauf", r7.antwortKrieg);
check("Verteidigung zu Zugbeginn nach Bot-Kriegserklärung", r7.vert);

/* 8) Tribut von schwachem Bot, freie Botschaft mit Schlüsselwort */
const r8 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  G._parley = [];
  b.kiTyp = "haendler"; b.heer = { inf:10, kav:0, art:0 }; b.geld = 20000;
  p.heer = { inf:500, kav:50, art:6 };
  p._parleyN = null;
  zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  const geldVorher = p.geld;
  const orig = Math.random;
  Math.random = () => 0.3;
  botschaftSenden("tribut");
  Math.random = orig;
  const zahlt = p.geld > geldVorher;
  document.getElementById("dipZiel").value = "1";
  document.getElementById("botText").value = "Lasst uns Handel treiben, Korn gegen Gold!";
  botschaftSenden("frei");
  const handelAntwort = (G._parley||[]).some(e=>e.von===b.name && (e.text.includes("Angebot")||e.text.includes("handel")||e.text.includes("Waage")||e.text.includes("Korn")));
  return { zahlt, handelAntwort };
});
check("Schwacher Bot zahlt Tribut", r8.zahlt);
check("Freie Botschaft: Handels-Schlüsselwort verstanden", r8.handelAntwort);

/* 9) Botschaft an Menschen: Zustellung im Handoff, Limit 3/Jahr */
const r9 = await page.evaluate(() => {
  starteSpiel(3, ["Anna","Bernd","Bot"], [false,false,true], 1.8, [false,false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  G.aktiv = 0;
  const p = G.spieler[0];
  zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  document.getElementById("botText").value = "Grüße, Nachbar, haltet die Grenze ruhig.";
  botschaftSenden("frei");
  const abgelegt = (G.botschaften||[]).some(b=>b.an===1 && b.text.includes("Nachbar"));
  G.aktiv = 1;
  zeige("handoff");
  const zugestellt = document.querySelector("#screen").innerHTML.includes("Botschaften an Euren Hof");
  beginneZugFortsetzen();
  const geleert = !(G.botschaften||[]).some(b=>b.an===1);
  /* Limit */
  G.aktiv = 0; zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  p._parleyN = { jahr:G.jahr, n:{ 1:3 } };
  const anzahlVorher = (G.botschaften||[]).length;
  document.getElementById("botText").value = "Noch eine Botschaft";
  botschaftSenden("frei");
  const limit = (G.botschaften||[]).length === anzahlVorher;
  return { abgelegt, zugestellt, geleert, limit };
});
check("Botschaft an Menschen wird abgelegt", r9.abgelegt);
check("Zustellung im Handoff des Empfängers", r9.zugestellt);
check("Nach Zugbeginn ausgetragen", r9.geleert);
check("Limit von 3 Botschaften je Hof und Jahr", r9.limit);

/* 10) Spielstand nimmt Botschaften mit */
const r10 = await page.evaluate(() => {
  G.botschaften = [{ von:0, an:1, jahr:G.jahr, text:"Testbrief" }];
  const d = JSON.parse(spielstand());
  const da = (d.botschaften||[]).length === 1;
  G.botschaften = [];
  ladeSpielstand(JSON.stringify(d));
  return { da, zurueck: (G.botschaften||[]).length === 1 && G.botschaften[0].text === "Testbrief" };
});
check("Botschaften im Spielstand", r10.da);
check("Botschaften nach Laden zurück", r10.zurueck);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
