/* v3.7: Revolutions-Mechanik + Unruhe-UI */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* Elende Stimmung erzwingen: Steuern maximal, Justiz hart, kein Korn */
const elend = `p.einkSt = 60; p.mwSt = 60; p.zoll = 40; p.justiz = 4; p.ausgabe = 0; p._stimmungBasis = 5; p.stimmung = 5;`;

/* 1) Warnstufen: Gärung -> Plünderung */
const r1 = await page.evaluate((elend) => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  eval(elend);
  p.unruheJahre = 0; p.korn = 1000;
  const orig = Math.random; Math.random = () => 0.9;   /* keine Zufalls-Ereignisse */
  zwischenbilanz(p);
  const stufe1 = p.unruheJahre === 1 && p.zb.ereignisse.some(e=>e.t.includes("gärt"));
  eval(elend);
  zwischenbilanz(p);
  Math.random = orig;
  const stufe2 = p.unruheJahre === 2 && p.zb.ereignisse.some(e=>e.t.includes("plündern")) && p.korn < 1000;
  zeige("zwbilanz");
  const warnung = document.querySelector("#screen").innerHTML.includes("Revolutionsgefahr");
  return { stufe1, stufe2, warnung };
}, elend);
check("Jahr 1: Gärungs-Warnung", r1.stufe1);
check("Jahr 2: Speicher-Plünderung", r1.stufe2);
check("Revolutionsgefahr in der Zwischenbilanz", r1.warnung);

/* 2) Aufstand mit starkem Heer: niedergeschlagen */
const r2 = await page.evaluate((elend) => {
  const p = G.spieler[0];
  eval(elend);
  p.unruheJahre = 2; p.heer = { inf:600, kav:50, art:5 }; p.maerkte = 4; p.pop = 3000;
  const orig = Math.random; Math.random = () => 0.3;
  zwischenbilanz(p);
  Math.random = orig;
  return { aufstand: p.zb.ereignisse.some(e=>e.t.includes("VOLKSAUFSTAND")),
           lebt: !p.tot, heerDezimiert: p.heer.inf < 600,
           ruinen: (p._ruinen||0) >= 0, zurueckgesetzt: p.unruheJahre === 1 };
}, elend);
check("Aufstand wird vom Heer niedergeschlagen", r2.aufstand && r2.lebt && r2.heerDezimiert && r2.zurueckgesetzt);

/* 3) Aufstand ohne Heer, mit erwachsenem Erben: erzwungene Abdankung */
const r3 = await page.evaluate((elend) => {
  const p = G.spieler[0];
  eval(elend);
  p.unruheJahre = 3; p.heer = { inf:0, kav:0, art:0 }; p.maerkte = 0; p.pop = 4000;
  p.erbe = { name:"Konrad", w:false, geb:G.jahr-20, zug:"volksnah" };
  const alterName = p.name;
  const orig = Math.random; Math.random = () => 0.3;
  zwischenbilanz(p);
  Math.random = orig;
  return { abdankung: p.zb.ereignisse.some(e=>e.t.includes("REVOLUTION")),
           erbeRegiert: p.name === "Konrad" && !p.tot,
           neustart: p.stimmung === 45 && p.unruheJahre === 0,
           anders: p.name !== alterName };
}, elend);
check("Revolution erzwingt Abdankung zugunsten des Erben", r3.abdankung && r3.erbeRegiert && r3.anders);
check("Der neue Regent startet mit Stimmung 45", r3.neustart);

/* 4) Aufstand ohne Heer und ohne Erben: Sturz und Ausscheiden */
const r4 = await page.evaluate((elend) => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  eval(elend);
  p.unruheJahre = 3; p.heer = { inf:0, kav:0, art:0 }; p.maerkte = 0; p.erbe = null; p.pop = 4000;
  const orig = Math.random; Math.random = () => 0.3;
  zwischenbilanz(p);
  Math.random = orig;
  const gestuerzt = p.tot === true && p.gestuerzt === true;
  /* Alleinherrschaft: der Bot ist der letzte -> Kaiser */
  const botKaiser = G.sieger === G.spieler[1] && G.spieler[1].titel === 8;
  return { gestuerzt, botKaiser };
}, elend);
check("Sturz ohne Erben: Regent scheidet aus", r4.gestuerzt);
check("Letzter Verbliebener wird nach dem Sturz Kaiser", r4.botKaiser);

/* 5) Erholung setzt den Unruhe-Zähler zurück */
const r5 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  p.unruheJahre = 2;
  p.einkSt = 5; p.mwSt = 5; p.zoll = 0; p.justiz = 2; p.korn = 9000;
  p.ausgabe = noetigKorn(p) * 1.5; p._stimmungBasis = 60; p.stimmung = 60;
  const orig = Math.random; Math.random = () => 0.9;
  zwischenbilanz(p);
  Math.random = orig;
  return { zurueck: p.unruheJahre === 0 };
});
check("Bessere Stimmung beruhigt das Volk", r5.zurueck);

/* 6) Status-Warnbox + rote Stimmungs-Kachel */
const r6 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.stimmung = 10; p.unruheJahre = 1;
  zeige("status");
  const html = document.querySelector("#screen").innerHTML;
  return { box: html.includes("Im Volk gärt es"), smiley: html.includes("🤬"),
           puls: html.includes("unruhePuls") };
});
check("Status warnt vor Unruhen mit Abhilfe-Tipps", r6.box);
check("Stimmungs-Kachel pulsiert rot mit wütendem Smiley", r6.smiley && r6.puls);

/* 7) Titelmenü aufgeräumt */
const r7 = await page.evaluate(() => {
  G.spieler = []; zeige("title");
  return { menu: !!document.querySelector(".titelmenu"),
           knoepfe: document.querySelectorAll(".titelmenu button").length >= 6 };
});
check("Titelmenü als aufgeräumte Spalte", r7.menu && r7.knoepfe);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
