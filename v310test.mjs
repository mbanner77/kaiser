/* v3.10: Bot-Reaktionen, Expeditions-Heimkehr-Szene, einstellbare Bot-Stärke */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) Kriegserklärung des Menschen: der Bot meldet sich zu Wort */
const r1 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  p.titel = 2; p.heer = { inf:300, kav:20, art:2 }; b.mauer = 0; b.burg = 0; b.schiffe = 0;
  G.aktiv = 0; G._parley = [];
  kriegVorbereiten(1);
  const zitat = (G._parley||[]).some(x => x.von === b.name);
  const kats = ["angriff","sieg","niederlage","verrat","kassiert"]
    .every(k => typeof botAntwortText(b, k) === "string" && botAntwortText(b, k).length > 4);
  G._kr = null; G._s && clearInterval(G._s.iv); G._s = null;
  return { zitat, kats };
});
check("Angegriffener Bot antwortet mit Zitat", r1.zitat);
check("Alle neuen Antwort-Kategorien vorhanden", r1.kats);

/* 2) Bot-Stimme nach der Schlacht (Sieg des Menschen -> bittere Worte) */
const r2 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  p.heer = { inf:500, kav:40, art:4 }; b.heer = { inf:60, kav:0, art:0 };
  b.land = 9000; b.maerkte = 2; b.muehlen = 1;
  G._kr = { a:0, d:1, weg:[], fragen:[], wahl:{}, aufA:[2,2,2,2,2], aufD:[2,2,2,2,2],
            gelaende: wuerfleGelaende() };
  schlachtStarten();
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, true);
  schlachtAbschliessen();
  const stimme = G._s.botStimme;
  zeige("schlacht");
  const html = document.querySelector("#screen").innerHTML;
  return { da: !!stimme && stimme.name === b.name && stimme.text.length > 4,
           sichtbar: !!stimme && html.includes(stimme.text.slice(2, 20)) };
});
check("Bot kommentiert den Schlachtausgang", r2.da);
check("Bot-Zitat in der Ergebniskarte sichtbar", r2.sichtbar);

/* 3) Gefasster Spion: der bestohlene Bot schimpft */
const r3 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  p.geld = 50000; p.spionGenutzt = false; b.korn = 4000;
  G._parley = []; G._angriffe = [];
  G.aktiv = 0; zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  document.getElementById("spionMission").value = "brand";
  const orig = Math.random; Math.random = () => 0.95;   /* gefasst, aber kein Krieg */
  spionEntsenden();
  Math.random = orig;
  return { zitat: (G._parley||[]).some(x => x.von === b.name) };
});
check("Gefasster Spion: Bot reagiert mit Verrats-Zitat", r3.zitat);

/* 4) Expeditions-Heimkehr: Szene für den Menschen, danach Bilanz */
const r4 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.expedition = { start: G.jahr - 3, dauer: 3 };
  p.haefen = 1;
  G.aktiv = 0; zeige("bauen");
  const orig = Math.random; Math.random = () => 0.1;   /* Schatz */
  jahrAbschliessen();
  Math.random = orig;
  const szene = G.screen === "expedition" && !!G._expHeim && G._expHeim.art === "schatz";
  const canvas = !!document.getElementById("expBild");
  G._expStart = performance.now() - 5000;               /* Endphase: Knopf erscheint */
  zeichneExpedition(performance.now());
  const knopf = document.getElementById("expWeiter").style.display !== "none";
  expeditionWeiter();
  const danach = G.screen === "bilanz" && !G._expHeim;
  return { szene, canvas, knopf, danach };
});
check("Heimkehr-Szene erscheint vor der Bilanz", r4.szene && r4.canvas);
check("Hafenbild zeichnet und gibt den Weiter-Knopf frei", r4.knopf);
check("Nach der Szene folgt die Jahresbilanz", r4.danach);

/* 5) Verschollene Expedition: Trauer-Szene rendert fehlerfrei */
const r5 = await page.evaluate(() => {
  G._expHeim = { art:"verloren", farbe:"#6ea8dc", wappen:"🦅" };
  G._expStart = null;
  zeige("expedition");
  const da = !!document.getElementById("expBild");
  zeichneExpedition(performance.now());
  G._expStart = performance.now() - 5000;
  zeichneExpedition(performance.now());
  const txt = document.querySelector("#screen").innerHTML.includes("Warten am Kai");
  G._expHeim = null; G._expStart = null; zeige("bauen");
  return { da, txt };
});
check("Verschollen-Szene rendert mit Trauertext", r5.da && r5.txt);

/* 6) Setup: Spielstärke-Auswahl je Bot */
const r6 = await page.evaluate(() => {
  zeige("setup");
  const selects = document.querySelectorAll("[id^=pstark]").length === 9;
  const menschAus = document.getElementById("pstark0").disabled === true;
  const botAn = document.getElementById("pstark1").disabled === false;
  document.getElementById("pki1").value = "0"; setupKiWechsel(1);
  const nachWechsel = document.getElementById("pstark1").disabled === true;
  document.getElementById("pki1").value = "1"; setupKiWechsel(1);
  return { selects, menschAus, botAn, nachWechsel };
});
check("Stärke-Auswahl in allen Setup-Zeilen", r6.selects);
check("Stärke nur für Computer-Regenten wählbar", r6.menschAus && r6.botAn && r6.nachWechsel);

/* 7) starteSpiel übernimmt die Stärke, Speichern/Laden erhält sie */
const r7 = await page.evaluate(() => {
  starteSpiel(3, ["Ich","Sanft","Brutal"], [false,true,true], 1.8, [false,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei", staerken:[2,1,4] });
  const gesetzt = !G.spieler[0].kiStufe && G.spieler[1].kiStufe === 1 && G.spieler[2].kiStufe === 4;
  const d = spielstand();
  ladeSpielstand(d);
  return { gesetzt, geladen: G.spieler[2].kiStufe === 4 && kiStufe(G.spieler[2]) === 4 };
});
check("Bot-Stärke wird gesetzt (Mensch bleibt frei)", r7.gesetzt);
check("Stärke überlebt Speichern/Laden", r7.geladen);

/* 8) Kluge Bots würfeln keine Zufalls-Aufstellung, Verteidiger-Reserve auf hoher Stufe */
const r8 = await page.evaluate(() => {
  const heer2 = { inf:100, kav:0, art:12 };
  const orig = Math.random; Math.random = () => 0.1;    /* würde normal die Zufalls-Aufstellung ziehen */
  const schlau = kiAufstellung(heer2, true).join() === AUFSTELLUNGEN[1].g.join();
  Math.random = orig;
  /* Verteidigender Gnadenlos-Bot hält 25 % Reserve */
  const p = G.spieler[0], b = G.spieler[2];
  p.titel = 2; p.heer = { inf:300, kav:20, art:2 }; b.heer = { inf:200, kav:10, art:1 };
  b.mauer = 0; b.burg = 0; b.schiffe = 0;
  G.aktiv = 0;
  G._kr = { a:0, d:2, weg:[], fragen:[], frageIdx:0, wahl:{}, gelaende: wuerfleGelaende() };
  G._aufW = [2,2,2,2,2]; G._aufRes = 0;
  aufstellungAFertig();
  const res = G._kr && G._kr.resD === 0.25;
  const iv = G._s && G._s.iv; iv && clearInterval(iv);
  G._kr = null; G._s = null;
  return { schlau, res };
});
check("Gerissene Bots stellen planvoll auf", r8.schlau);
check("Gnadenloser Verteidiger hält 25 % Reserve", r8.res);

/* 9) Gnadenlos-Bot: rüstet gemischt, stellt Gegenspione, kassiert Steuerbonus */
const r9 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Hart"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei", staerken:[2,4] });
  const b = G.spieler[1];
  b.titel = 2; b.geld = 120000; b.heer = { inf:10, kav:0, art:0 };
  b.kiTyp = "baumeister";
  const orig = Math.random; Math.random = () => 0.99;   /* keine Kriege/Ereignisse */
  kiZug(b);
  Math.random = orig;
  const mix = b.heer.kav > 0 && b.heer.art > 0;
  const spione = b.gegenspione === true;
  /* Steuerbonus: gleicher Stand, Stufe 4 vs Stufe 2 */
  const mess = (stufe) => {
    const z = { ...JSON.parse(JSON.stringify(b)), ki:true, kiStufe:stufe };
    z.geld = 10000; z.report = null;
    const o2 = Math.random; Math.random = () => 0.5;
    jahresschluss(z);
    Math.random = o2;
    return z.report.steuern;
  };
  const s4 = mess(4), s2 = mess(2);
  return { mix, spione, bonus: s4 > s2 };
});
check("Gnadenlos-Bot rüstet Reiterei und Geschütze", r9.mix);
check("Gnadenlos-Bot stellt Gegenspione", r9.spione);
check("Hohe Stufe erhält Wirtschaftsbonus", r9.bonus);

/* 10) Gnadenlos-Bot greift den Menschen auch bei passablem Verhältnis an */
const r10 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Wolf"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei", staerken:[2,4] });
  const p = G.spieler[0], b = G.spieler[1];
  b.kiTyp = "aggressor"; b.titel = 2; b.heer = { inf:600, kav:60, art:6 }; b.geld = 40000;
  p.heer = { inf:40, kav:0, art:0 }; p.pop = 2000;
  b.bez = { 0: 45 };                                    /* Stufe 2 würde hier nie angreifen (Grenze 35) */
  G._angriffe = [];
  const orig = Math.random; Math.random = () => 0.05;
  kiZug(b);
  Math.random = orig;
  return { krieg: (G._angriffe||[]).some(x => x.kr.a === 1 && x.kr.d === 0) };
});
check("Gnadenlos-Bot erklärt trotz +45-Verhältnis den Krieg", r10.krieg);

/* 11) Behäbiger Bot bleibt friedlich, wo der Normale zuschlagen würde */
const r11 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Lamm"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei", staerken:[2,1] });
  const p = G.spieler[0], b = G.spieler[1];
  b.kiTyp = "aggressor"; b.titel = 2; b.heer = { inf:600, kav:60, art:6 }; b.geld = 40000;
  p.heer = { inf:40, kav:0, art:0 }; b.bez = { 0: -20 };
  G._angriffe = [];
  const orig = Math.random; Math.random = () => 0.1;    /* 0.1 > 0.24*0.35: kein Krieg auf Stufe 1 */
  kiZug(b);
  Math.random = orig;
  return { friede: !(G._angriffe||[]).some(x => x.kr.a === 1) };
});
check("Behäbiger Bot lässt die Heere daheim", r11.friede);

/* 12) Update-Kennung und Footer auf v3.10 */
const r12 = await page.evaluate(() => ({
  cache: /^kaiser-v\d+$/.test(APP_CACHE),
  footer: /Kaiser v3\.\d+/.test(document.querySelector("footer").textContent)
}));
check("APP_CACHE und Footer gepflegt", r12.cache && r12.footer);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
