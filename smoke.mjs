/* Kompakter Smoke-Test: Kernflüsse + alle Screens */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

const r = await page.evaluate(() => {
  const res = {};
  starteSpiel(3, ["A","B","C"], [false,true,false], 1.8, [false,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  beginneZug();
  const p = cur(), ki = G.spieler[1];
  res.start = G.spieler.length === 3 && p.zug;
  /* Ereignis mit Ergebnis-Screen */
  G._ereignis = EREIGNISSE.find(e=>e.id==="gaukler");
  p.geld = 10000;
  G.screen = "entscheidung";
  ereignisWahl(0);
  res.ereignis = G.screen === "ereignisErgebnis" && p.geld === 9600;
  G._ereignisErgebnis = null;
  /* Schlacht komplett */
  ki.mauer = 1; ki.heer = { inf:80, kav:5, art:2 };
  p.titel = 1; p.heer = { inf:180, kav:20, art:5 }; p.kriegGefuehrt = false;
  G.aktiv = 0;
  kriegVorbereiten(1);
  res.belagerung = G.screen === "belagerung";
  belagerungWahl("sturm");
  aufstellungAFertig();
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, true);
  schlachtAbschliessen();
  res.schlacht = !!G._s.sieger;
  /* Reichstag */
  reichstagEinberufen();
  G.reichstag.stimmen = {};
  G.spieler.forEach((x,i)=>{ if(x.ki) G.reichstag.stimmen[i] = "ja"; });
  G.aktiv = 0; G.screen = "status";
  reichstagStimme("ja");
  res.reichstag = G.reichstag === null;
  /* Auftrag */
  p.auftrag = { id:"heerschau", ziel:10, frist:G.jahr+2, basis:0, lohn:1000 };
  jahresschluss(p);
  res.auftrag = p.auftrag === null && !!p.report.auftragErfuellt;
  /* Jahresschluss/Bilanz + Screens */
  zeige("bilanz");
  res.bilanz = document.querySelector("#screen").innerHTML.includes("Jahresbilanz");
  return res;
});
for(const [k,v] of Object.entries(r)) check(k, !!v);

/* Alle Screens rendern ohne Fehler */
for (const s of ["status","korn","handel","zwbilanz","steuern","bauen","diplo","welt","statistik","hilfe","kampagne","online","erfolge","ruhm","title","setup"]) {
  await page.evaluate(sc => { if(sc==="zwbilanz") zwischenbilanz(cur()); zeige(sc); }, s);
  await page.waitForTimeout(60);
  const leer = await page.evaluate(() => document.querySelector("#screen").innerHTML.length < 50);
  check("Screen " + s, !leer);
}
await browser.close();
console.log("OK:", ok.length);
if (bad.length){ console.log("FEHLER:", bad.length); bad.forEach(n=>console.log("  ✗", n)); process.exit(1); }
