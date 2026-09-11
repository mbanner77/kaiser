/* v3.12: Seehandel/Piraten/Kaperbriefe, Ereignis-Ketten, Stadt-Panorama, Gegenangebote, Klangkulisse */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) Seerouten: Koggen tragen mehr Zoll */
const r1 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  G.routen = [{ a:0, b:1, seit:G.jahr }];
  p.haefen = 1; p._routenPause = 0; G.messe = null; G.handelsprivileg = 0;
  b.haefen = 0;
  const landZoll = routenZoll(p);
  b.haefen = 1;
  const seeZoll = routenZoll(p);
  return { see: routeZurSee(G.routen[0]), faktor: seeZoll === Math.round(Math.round((350 + staedte(p)*80 + 150) * 1.6) * 1),
           mehr: seeZoll > landZoll };
});
check("Route wird zur Seeroute (beide Häfen)", r1.see);
check("Seeroute bringt 60 % mehr Zoll", r1.mehr && r1.faktor);

/* 2) Piraten kapern ohne Geleitschutz, Schiffe schrecken ab */
const r2 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.schiffe = 0; p.geld = 20000;
  let orig = Math.random; Math.random = () => 0.01;
  jahresschluss(p);
  Math.random = orig;
  const ueberfall = p.report.ereignisse.some(e=>e.t.includes("Piraten"));
  p.schiffe = 5;
  orig = Math.random; Math.random = () => 0.05;         /* 0.05 > Gefahr 0.03 */
  jahresschluss(p);
  Math.random = orig;
  const ruhe = !p.report.ereignisse.some(e=>e.t.includes("Piraten"));
  return { ueberfall, ruhe };
});
check("Piraten plündern ungeschützte Seerouten", r2.ueberfall);
check("Geleitschiffe schrecken Piraten ab", r2.ruhe);

/* 3) Kaperbrief: Beute, einmal pro Jahr */
const r3 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Reeder"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  p.schiffe = 3; p.geld = 5000; p.kaperJahr = 0;
  b.haefen = 1; b.geld = 30000; b.korn = 2000; b.schiffe = 0;
  G.aktiv = 0; zeige("diplo");
  const knopf = document.querySelector("#screen").innerHTML.includes("Kaperbrief");
  document.getElementById("dipZiel").value = "1";
  const wuerfe = [0.1, 0.5, 0.9];                       /* Erfolg, Beutehöhe, nicht enttarnt */
  let wi = 0;
  const orig = Math.random; Math.random = () => wuerfe[Math.min(wi++, wuerfe.length-1)];
  kapern();
  Math.random = orig;
  const beute = p.geld > 4000 && b.geld < 30000 && b.korn < 2000 && p.kaperJahr === G.jahr;
  const geldVor = p.geld;
  kapern();                                             /* zweite Fahrt im selben Jahr: nichts passiert */
  return { knopf, beute, gesperrt: p.geld === geldVor };
});
check("Kaperbrief-Knopf in der Diplomatie", r3.knopf);
check("Kaperfahrt bringt Beute vom Ziel", r3.beute);
check("Nur eine Kaperfahrt je Jahr", r3.gesperrt);

/* 4) Gegenangebot: der Bot feilscht, Einschlagen führt den Handel aus */
const r4 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  b.kiTyp = "haendler"; b.korn = 5000; b.geld = 20000; b.bez = {0:0}; p.bez = {1:0};
  p.geld = 20000; p.korn = 100; p.diploZaehler = 0;
  G.kornMarkt = 100; G._gegenangebot = null;
  zeige("diplo");
  document.getElementById("dipZiel").value = "1";
  document.getElementById("dipRichtung").value = "kauf";
  document.getElementById("dipMenge").value = "100";
  document.getElementById("dipPreis").value = "60";     /* weit unter der Schmerzgrenze */
  const orig = Math.random; Math.random = () => 0.1;
  diploAktion("handel");
  Math.random = orig;
  const feilscht = G._gegenangebot && G._gegenangebot.preis > 60 && G._gegenangebot.an === 0;
  const anzeige = document.querySelector("#screen").innerHTML.includes("feilscht");
  const preis2 = G._gegenangebot.preis;
  gegenangebotAntwort(true);
  const vollzogen = p.korn === 200 && p.geld === 20000 - 100*preis2 && !G._gegenangebot;
  return { feilscht, anzeige, vollzogen };
});
check("Bot macht ein Gegenangebot statt platter Absage", r4.feilscht && r4.anzeige);
check("Einschlagen führt den Handel zum Bot-Preis aus", r4.vollzogen);

/* 5) Ereignis-Kette: Falschmünzer über drei Teile bis zum Ende */
const r5 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  p.geld = 10000;
  p.kette = { id:"falschmuenzer", teil:0, faellig:G.jahr, flags:{} };
  G.aktiv = 0;
  const e1 = ereignisWuerfeln(p);
  const teil1 = e1 && e1.kette && e1.kette.teil === 1 && e1.kette.von === 3;
  G._ereignis = e1; zeige("entscheidung");
  const banner = document.querySelector("#screen").innerHTML.includes("FORTLAUFENDE GESCHICHTE");
  ereignisWahl(0);                                      /* Büttel ermitteln (400 T) */
  const weiter = p.kette && p.kette.teil === 1 && p.kette.faellig > G.jahr && p.geld === 9600;
  /* Teil 2: Werkstatt heimlich übernehmen */
  p.kette.faellig = G.jahr;
  G._ereignis = ereignisWuerfeln(p);
  ereignisWahl(1);
  const gier = p.kette && p.kette.flags.gier === true && p.kette.teil === 2;
  /* Teil 3: unentdeckt kassieren */
  p.kette.faellig = G.jahr;
  G._ereignis = ereignisWuerfeln(p);
  const orig = Math.random; Math.random = () => 0.1;
  ereignisWahl(0);
  Math.random = orig;
  const ende = !p.kette && (p._kettenFertig||[]).includes("falschmuenzer") && p.geld > 9600;
  return { teil1, banner, weiter, gier, ende };
});
check("Kette startet mit Teil 1 und Banner", r5.teil1 && r5.banner);
check("Entscheidung führt zum nächsten Teil (später fällig)", r5.weiter && r5.gier);
check("Kette endet mit Auflösung und gilt als erzählt", r5.ende);

/* 6) Erzählte Ketten wiederholen sich nicht */
const r6 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.kette = null;
  p._kettenFertig = ["siegelring","falschmuenzer","wunder"];
  const orig = Math.random; Math.random = () => 0.055;  /* unter dem Ketten-Start von 0.10 */
  p.maerkte = 0; p.muehlen = 0; p.haefen = 0; p.bruch = 0; p.forst = 0; G.routen = [];
  const e = ereignisWuerfeln(p);
  Math.random = orig;
  return { keineKette: !p.kette && (!e || !e.kette) };
});
check("Alle Geschichten erzählt: keine Wiederholung", r6.keineKette);

/* 7) Stadt-Panorama rendert in Voll-Ausbau und in Unruhe-Winter */
const r7 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.maerkte = 8; p.muehlen = 4; p.mauer = 2; p.burg = 2; p.palast = 5; p.dom = 3;
  p.haefen = 1; p.schiffe = 3; p._ruinen = 1; p.festJahr = G.jahr; p.unruheJahre = 0;
  G.aktiv = 0; zeige("bauen");
  const knopf = document.querySelector("#screen").innerHTML.includes("Stadtansicht");
  stadtAuf();
  const offen = G.screen === "stadt" && !!document.getElementById("stadtBild");
  zeichneStadt(performance.now());
  const chips = document.querySelector("#screen").innerHTML.includes("Märkte");
  /* Winter + Unruhen */
  G.jahr += (4 - (G.jahr - 1700) % 4) + 3;              /* irgendein Winterjahr */
  p.unruheJahre = 2; p.festJahr = 0;
  render(); zeichneStadt(performance.now());
  const zurueckKnopf = document.querySelector("#screen").innerHTML.includes("Zurück");
  zeige("bauen");
  return { knopf, offen, chips, zurueckKnopf };
});
check("Stadtansicht aus Status und Bauen erreichbar", r7.knopf && r7.offen);
check("Panorama rendert Voll-Ausbau und Unruhe-Winter fehlerfrei", r7.chips && r7.zurueckKnopf);

/* 8) Klangkulisse: Funktionen vorhanden, Schalter greift */
const r8 = await page.evaluate(() => {
  const da = ["sMoewe","sWelle","sHammern","sGemurmel","sKnistern","sBrise","ambientTick"]
    .every(f => { try{ return typeof eval(f) === "function"; }catch(e){ return false; } });
  let fehlerfrei = true;
  try{
    einstSetzen("amb", false);
    ambientTick(performance.now());                     /* darf still sein und nicht werfen */
    einstSetzen("amb", true);
    for(const s2 of ["handel","bauen","status","stadt","welt","expedition","bilanz"]){
      G.screen = s2; ambientTick(performance.now());
    }
    G.screen = "bauen";
  }catch(e){ fehlerfrei = false; }
  const schalter = (()=>{ einstellungenAuf(); const h = document.querySelector("#screen").innerHTML.includes("Klangkulisse"); zeige("bauen"); return h; })();
  return { da, fehlerfrei, schalter };
});
check("Klangkulisse spielt je Bildschirm ohne Fehler", r8.da && r8.fehlerfrei);
check("Klangkulisse-Schalter in den Einstellungen", r8.schalter);

/* 9) Neue Felder überleben Speichern/Laden */
const r9 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.kette = { id:"wunder", teil:1, faellig:G.jahr+2, flags:{ mild:true } };
  p._kettenFertig = ["falschmuenzer"];
  p.kaperJahr = G.jahr;
  const d = spielstand();
  ladeSpielstand(d);
  const q = G.spieler[0];
  return { ok: q.kette && q.kette.id === "wunder" && q.kette.teil === 1 && q.kette.flags.mild === true
             && (q._kettenFertig||[]).includes("falschmuenzer") && q.kaperJahr === G.jahr };
});
check("Kette/Kaperjahr überleben Speichern/Laden", r9.ok);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
