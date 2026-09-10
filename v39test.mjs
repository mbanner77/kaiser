/* v3.9: Seeschlachten, Belagerungsring, Audienzen, Porträts, Nachbericht, Messe, Intro, Zoom, Update */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) Kriegsschiffe + Seeweg + Seegefecht */
const r1 = await page.evaluate(() => {
  starteSpiel(4, ["Ich","B","Fern","D"], [false,true,true,true], 1.8, [false,true,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], fern = G.spieler[2];
  p.haefen = 1; p.geld = 20000; p.holz = 100; p.schiffe = 0;
  werbeSchiff(); werbeSchiff();
  const gebaut = p.schiffe === 2 && p.geld === 14000 && p.holz === 20;
  /* Fernziel (Index 2 ist kein Nachbar bei 4 Spielern) mit eigener Flotte */
  fern.schiffe = 1; fern.mauer = 0; fern.burg = 0;
  p.titel = 2; p.heer = { inf:300, kav:20, art:2 };
  G.aktiv = 0;
  const orig = Math.random; Math.random = () => 0.4;   /* Angreifer gewinnt (2 vs 1 Schiffe) */
  kriegVorbereiten(2);                                  /* KI-Antworten + Seegefecht laufen sofort */
  Math.random = orig;
  const seeweg = G._kr && G._kr.seeweg === true && G._kr.weg.length === 0;
  const gefecht = G.screen === "seegefecht" && !!G._kr.seeErgebnis;
  const sieg = G._kr.seeErgebnis.sieger === "A";
  seegefechtWeiter();
  const weiter = G._kr && G._kr.seeGeklaert === true;
  G._kr = null; G._s && clearInterval(G._s.iv); G._s = null;
  return { gebaut, seeweg, gefecht, sieg, weiter };
});
check("Kriegsschiffe kosten 3.000 T + 40 Holz", r1.gebaut);
check("Flotte ersetzt Durchmarschrechte", r1.seeweg);
check("Seegefecht vor der Landung", r1.gefecht && r1.sieg);
check("Nach dem Seesieg geht es an Land", r1.weiter);

/* 2) Belagerungsring: legen, Verteidiger-Optionen, Sturm-Vorteil */
const r2 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  p.titel = 2; p.heer = { inf:300, kav:20, art:2 }; b.mauer = 2;
  G.aktiv = 0;
  G._kr = { a:0, d:1, weg:[], fragen:[], wahl:{}, gelaende: wuerfleGelaende() };
  belagerungWahl("ring");
  const gelegt = (G.belagerungen||[]).length === 1 && p.kriegGefuehrt === true && G.screen === "bauen";
  const karte = document.querySelector("#screen").innerHTML.includes("Belagerung von");
  /* Sturm nach 2 Jahren: Hunger-Vorteil */
  G.jahr += 2;
  ringSturm(1);
  const sturm = G._kr && G._kr.hunger === true && G._kr.belagerung === "aushungern" && (G.belagerungen||[]).length === 0;
  G._kr = null; G._s && clearInterval(G._s.iv); G._s = null;
  return { gelegt, karte, sturm };
});
check("Belagerungsring wird gelegt und angezeigt", r2.gelegt && r2.karte);
check("Sturm aus dem Ring bringt Hunger-Vorteil", r2.sturm);

/* 3) Verteidiger im Ring: Freikaufen */
const r3 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  G.belagerungen = [{ a:1, d:0, seit:G.jahr }];
  p.geld = 10000;
  G.aktiv = 0;
  beginneZug();
  const gezeigt = G.screen === "belagerungD";
  ringFreikaufen();
  return { gezeigt, frei: (G.belagerungen||[]).length === 0 && p.geld === 8500 && b.geld > 0 };
});
check("Belagerter sieht den Ring-Bildschirm", r3.gezeigt);
check("Freikaufen kostet 15 % und löst den Ring", r3.frei);

/* 4) Audienz mit Porträt */
const r4 = await page.evaluate(() => {
  const p = cur();
  G._ereignis = audienzWuerfeln(p);
  zeige("entscheidung");
  const html = document.querySelector("#screen").innerHTML;
  return { audienz: html.includes("Audienz am Hofe"), canvas: !!document.getElementById("audienzBild"),
           rolle: html.includes(G._ereignis.audienz.rolle) };
});
check("Audienz-Bildschirm mit Bittsteller-Porträt", r4.audienz && r4.canvas && r4.rolle);

/* 5) Porträts in Diplomatie und Dossier */
const r5 = await page.evaluate(() => {
  G._ereignis = null;
  zeige("diplo");
  const dip = !!document.getElementById("dipPortrait");
  weltAuf();
  G._dossier = 1; render();
  const dos = !!document.getElementById("dossierBild");
  return { dip, dos };
});
check("Porträt neben der Partner-Wahl", r5.dip);
check("Porträt im Weltkarten-Dossier", r5.dos);

/* 6) Schlacht-Nachbericht mit Flanken-Urteil */
const r6 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  p.titel = 2; p.heer = { inf:300, kav:30, art:3 }; b.heer = { inf:200, kav:10, art:2 };
  G._kr = { a:0, d:1, weg:[], fragen:[], wahl:{}, aufA:[2,2,2,2,2], aufD:[2,2,2,2,2], gelaende: wuerfleGelaende() };
  schlachtStarten();
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, false);
  schlachtAbschliessen();
  zeige("schlacht");
  const html = document.querySelector("#screen").innerHTML;
  return { urteil: html.includes("Feldherren-Urteil") && html.includes("Nordflanke"),
           gemaelde: html.includes("Als Gemälde speichern"),
           gefZaehler: Array.isArray(G._s.laneGef) && G._s.laneGef.some(x=>x>0) };
});
check("Nachbericht je Abschnitt mit Gefallenen-Zähler", r6.urteil && r6.gefZaehler);
check("Gemälde-Export angeboten", r6.gemaelde);

/* 7) Reichsmesse */
const r7 = await page.evaluate(() => {
  G._kr = null; G._s = null;
  G.messe = { jahr: G.jahr, gastgeber: 0 };
  const p = G.spieler[0];
  p.geld = 50000;
  const vorher = p.geld;
  const alt = p.heer.inf;
  G.aktiv = 0; zeige("bauen");
  werbe("inf", 10);
  const rabatt = (vorher - p.geld) === Math.round(KOSTEN.inf*10*0.8) && p.heer.inf === alt+10;
  p.maerkte = 10; p.muehlen = 6; G.routen = [{a:0,b:1,seit:G.jahr}]; p._routenPause = 0;
  const zoll = routenZoll(p);
  G.messe = null;
  const zollOhne = routenZoll(p);
  return { rabatt, zollBonus: zoll > zollOhne };
});
check("Messe: Söldner 20 % billiger", r7.rabatt);
check("Messe: Gastgeber kassiert höheren Zoll", r7.zollBonus);

/* 8) Intro-Sequenz + Krönung rendern fehlerfrei */
const r8 = await page.evaluate(() => {
  G._introStart = null;
  zeige("intro");
  const canvas = !!document.getElementById("introBild");
  zeichneIntro(performance.now());
  G._introStart = performance.now() - 9000;   /* Endphase: Siegel */
  zeichneIntro(performance.now());
  G._introStart = null;
  const p = cur(); p.titel = 8; G.sieger = p; G._kroenStart = performance.now() - 8000;
  zeige("kroenung");
  zeichneKroenung(performance.now());
  G._kroenStart = null;
  return { canvas };
});
check("Intro-Pergament und Krönung zeichnen fehlerfrei", r8.canvas);

/* 9) Weltkarte: Zoom ändert Trefferrechnung korrekt */
const r9 = await page.evaluate(() => {
  weltAuf();
  G._wz = { z: 2, x: 40, y: 10 };
  render();
  const reset = document.querySelector("#screen").innerHTML.includes("Ansicht zurücksetzen");
  /* Klick auf Insel 1 unter Zoom simulieren */
  const c = document.getElementById("welt");
  const n = G.spieler.length;
  const a = -Math.PI/2 + 1/n*6.2832;
  const px = c.width/2 + Math.cos(a)*c.width*0.36, py = c.height/2+4 + Math.sin(a)*c.height*0.32;
  /* Weltkoordinate -> Bildschirmkoordinate unter Transform */
  const sx = (px - c.width/2) * 2 + c.width/2 + 40;
  const sy = (py - c.height/2) * 2 + c.height/2 + 10;
  const rect = c.getBoundingClientRect();
  G._wdragMoved = false;
  weltKlick({ clientX: rect.left + sx*(rect.width/c.width), clientY: rect.top + sy*(rect.height/c.height) });
  return { reset, treffer: G._dossier === 1 };
});
check("Zoom-Zurücksetzen-Knopf erscheint", r9.reset);
check("Klick trifft Inseln auch im Zoom", r9.treffer);

/* 10) Update-Prüfung vorhanden, neue Felder im Spielstand */
const r10 = await page.evaluate(() => {
  const hatUpdate = typeof updatePruefen === "function" && typeof APP_CACHE === "string";
  const p = G.spieler[0];
  p.schiffe = 3;
  G.belagerungen = [{ a:0, d:1, seit:G.jahr }];
  G.messe = { jahr: G.jahr, gastgeber: 1 };
  const d = JSON.parse(spielstand());
  ladeSpielstand(JSON.stringify(d));
  return { hatUpdate,
    rund: G.spieler[0].schiffe === 3 && (G.belagerungen||[]).length === 1 && G.messe && G.messe.gastgeber === 1 };
});
check("Update-Prüfung eingebaut", r10.hatUpdate);
check("Schiffe/Ringe/Messe überleben Speichern", r10.rund);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
