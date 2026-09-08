/* v3.3: Veteranen, Feldherren, Saison-Wirkung, Bot-Initiative, Raubritter, Bündnisse, Erfolge, Zeitstrahl */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) Veteranen: XP nach Schlacht, Verwässerung, Anzeige */
const r1 = await page.evaluate(() => {
  starteSpiel(3, ["Ich","Aggro","Kauz"], [false,true,true], 1.8, [false,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  p.titel = 2; p.heer = { inf:300, kav:20, art:2 }; b.heer = { inf:80, kav:0, art:0 };
  p.heerXp = 0;
  const s = kiSchlacht(0, 1);
  const xpNachher = p.heerXp;
  const rangVoll = (()=>{ p.heerXp = 70; return heerRang(p) === 2 && xpFaktor(2) === 1.1; })();
  const vorW = p.heerXp;
  const alt = heerGroesse(p.heer);
  G.aktiv = 0; p.geld = 99999;
  werbe("inf", 10);
  const verduennt = p.heerXp < vorW && p.heerXp > 0;
  zeige("bauen");
  const anzeige = document.querySelector("#screen").innerHTML.includes("Kampferfahrung");
  return { kampf: !!s, xpNachher, rangVoll, verduennt, anzeige };
});
check("Schlacht bringt Kampferfahrung", r1.kampf && r1.xpNachher > 0);
check("Veteranen-Rang und Faktor", r1.rangVoll);
check("Rekruten verwässern Erfahrung", r1.verduennt);
check("Erfahrung im Heer-Bildschirm", r1.anzeige);

/* 2) Feldherren: Anwerben, Sold, Wirkung, KI */
const r2 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.feldherr = null; p.geld = 10000;
  const soldOhne = unterhalt(p);
  const ui = document.querySelector("#screen").innerHTML.includes("Feldherr");
  feldherrAnwerben("sturm");
  const gekauft = p.feldherr && p.feldherr.id === "sturm" && p.geld === 7500;
  const soldMit = unterhalt(p) === soldOhne + 500;
  const fx = seitenFaktoren(p, false);
  const wirkung = fx.tempo > 1.2 && fx.nah > 1.05;
  const defFx = seitenFaktoren(p, true);
  const nurAngriff = defFx.tempo === 1;
  /* KI wirbt an */
  const b = G.spieler[2];
  b.feldherr = null; b.titel = 3; b.geld = 30000; b.kiTyp = "aggressor";
  const orig = Math.random; Math.random = () => 0.99;   /* keine Kriege/Ereignisse */
  kiZug(b);
  Math.random = orig;
  return { ui, gekauft, soldMit, wirkung, nurAngriff, kiHat: !!b.feldherr };
});
check("Feldherren-Karte im Heer-Bildschirm", r2.ui);
check("Anwerben kostet 2.500 T", r2.gekauft);
check("Feldherren-Sold im Unterhalt", r2.soldMit);
check("Sturmherr wirkt nur im Angriff", r2.wirkung && r2.nurAngriff);
check("KI wirbt Feldherrn an", r2.kiHat);

/* 3) Jahreszeiten-Wirkung */
const r3 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.pop = 2000;
  G.jahr = 1700;                                        /* Frühling */
  const fruehling = noetigKorn(p) === 200;
  G.kornMarkt = 100;
  const orig = Math.random; Math.random = () => 0.5;    /* rf -> Mittelwert */
  const preisF = saisonKornPreis();
  G.jahr = 1703;                                        /* Winter */
  const preisW = saisonKornPreis();
  Math.random = orig;
  const winterBedarf = noetigKorn(p) === Math.ceil(2000/10*1.15);
  /* Winterschlacht: Frost-Tribut */
  const b = G.spieler[1];
  b.heer = { inf:200, kav:0, art:0 };
  G.spieler[0].heer = { inf:250, kav:10, art:2 };
  const s = kiSchlacht(0, 1);
  const frost = s && s.log.some(l=>l.includes("Wintermarsch"));
  return { fruehling, preisF, preisW, winterBedarf, frost };
});
check("Frühling: Korn rund 15 % billiger", r3.preisF === 85 && r3.preisW === 100);
check("Winter: 15 % mehr Kornbedarf", r3.fruehling && r3.winterBedarf);
check("Winterfeldzug fordert Frost-Tribut", r3.frost);

/* 4) Bot-Initiative: Tributforderung mit Zahlen/Ablehnen */
const r4 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Aggro"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  b.kiTyp = "aggressor"; b.titel = 2; b.heer = { inf:500, kav:40, art:6 }; b.geld = 30000;
  p.heer = { inf:30, kav:0, art:0 }; p.geld = 10000;
  b.bez = { 0: -10 };
  const orig = Math.random; Math.random = () => 0.05;
  kiZug(b);
  Math.random = orig;
  const forderung = (G.botschaften||[]).find(x=>x.art==="forderung" && x.an===0);
  G.aktiv = 0; zeige("handoff");
  const knoepfe = document.querySelector("#screen").innerHTML.includes("zahlen");
  const geldVor = p.geld, botGeldVor = b.geld;
  forderungZahlen(G.botschaften.indexOf(forderung));
  const bezahlt = p.geld === geldVor - forderung.betrag && b.geld === botGeldVor + forderung.betrag;
  const weg = !(G.botschaften||[]).some(x=>x.art==="forderung");
  return { da: !!forderung, knoepfe, bezahlt, weg };
});
check("Aggressor-Bot stellt Tributforderung", r4.da);
check("Zahlen/Ablehnen-Knöpfe im Handoff", r4.knoepfe);
check("Zahlung wird verbucht und Forderung erledigt", r4.bezahlt && r4.weg);

/* 5) Ablehnen kann Krieg auslösen */
const r5 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  G._angriffe = [];
  G.botschaften = [{ von:1, an:0, jahr:G.jahr, art:"forderung", betrag:500, text:"„Zahlt!“" }];
  b.kriegGefuehrt = false;
  const orig = Math.random; Math.random = () => 0.01;
  forderungAblehnen(0);
  Math.random = orig;
  return { krieg: (G._angriffe||[]).some(x=>x.kr.a===1 && x.kr.d===0) };
});
check("Abgelehnte Forderung führt zur Kriegserklärung", r5.krieg);

/* 6) Raubritter: Route pausiert, Ereignis würfelbar */
const r6 = await page.evaluate(() => {
  G._angriffe = [];
  const p = G.spieler[0];
  routeEroeffnen(0, 1);
  const zollVoll = routenZoll(p) > 0;
  EREIGNIS_RAUBRITTER.wahl[2].fx(p);                    /* Ignorieren */
  const pausiert = routenZoll(p) === 0;
  G.jahr++;
  const wieder = routenZoll(p) > 0;
  G.aktiv = 0;
  const orig = Math.random; Math.random = () => 0.05;
  const e = ereignisWuerfeln(p);
  Math.random = orig;
  return { zollVoll, pausiert, wieder, gewuerfelt: e && e.id === "raubritter" };
});
check("Ignorierter Überfall pausiert den Routenzoll", r6.zollVoll && r6.pausiert && r6.wieder);
check("Raubritter-Ereignis trifft Routenbesitzer", r6.gewuerfelt);

/* 7) Bündnis: Abschluss, Schutz, Beistand, Bruch */
const r7 = await page.evaluate(() => {
  starteSpiel(4, ["Ich","Alli","Feind","Vierter"], [false,true,true,true], 1.8, [false,true,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], alli = G.spieler[1], feind = G.spieler[2];
  p.geld = 20000;
  p.bez = {1:40}; alli.bez = {0:40};
  G.aktiv = 0; zeige("diplo");
  const knopf = document.querySelector("#screen").innerHTML.includes("Bündnis anbieten");
  document.getElementById("dipZiel").value = "1";
  diploAktion("buendnis");
  const zustande = buendnisAktiv(p, alli) && buendnisAktiv(alli, p);
  zeige("kriegPlan");
  const geschuetzt = !document.querySelector("#screen").innerHTML.includes(`value="1"`);
  /* Verbündeter Bot steht automatisch bei */
  const kr = { a:2, d:0, weg:[], fragen:[1,3], wahl:{} };
  const beistand = kiDiploWahl(alli, kr) === "def";
  /* Beistand verweigern bricht das Bündnis */
  G._kr = { a:2, d:1, weg:[], fragen:[0], frageIdx:0, wahl:{} };
  diploWahl("frei");
  const gebrochen = !buendnisAktiv(p, alli);
  return { knopf, zustande, geschuetzt, beistand, gebrochen };
});
check("Bündnis-Aktion in der Diplomatie", r7.knopf);
check("KI nimmt Bündnis bei gutem Verhältnis an", r7.zustande);
check("Verbündete nicht als Kriegsziel wählbar", r7.geschuetzt);
check("Verbündeter Bot leistet automatisch Beistand", r7.beistand);
check("Verweigerter Beistand bricht das Bündnis", r7.gebrochen);

/* 8) Erfolge-Galerie: Bonus-Wappen */
const r8 = await page.evaluate(() => {
  ERFOLGE.slice(0,5).forEach(e=>erfolge().add(e.id));
  const frei = wappenFrei().includes("👑");
  const nochZu = !wappenFrei().includes("⚜️");
  G._vorErf = "handoff";
  zeige("erfolge");
  const html = document.querySelector("#screen").innerHTML;
  return { frei, nochZu, kabinett: html.includes("Wappen-Kabinett"), balken: html.includes("moral") };
});
check("Bonus-Wappen ab 4 Erfolgen frei", r8.frei && r8.nochZu);
check("Wappen-Kabinett in der Galerie", r8.kabinett);

/* 9) Zeitstrahl in Statistik */
const r9 = await page.evaluate(() => {
  geschichte("⚔️", "Testkrieg tobt.");
  geschichte("💍", "Testhochzeit gefeiert.");
  G._vorStat = "handoff";
  zeige("statistik");
  const c = document.getElementById("zeitstrahl");
  const html = document.querySelector("#screen").innerHTML;
  return { canvas: !!c && c.width === 920,
           liste: html.includes("Testkrieg"),
           knopf: html.includes("Als Bild speichern") };
});
check("Zeitstrahl-Canvas in der Statistik", r9.canvas);
check("Chronik-Liste und Speichern-Knopf", r9.liste && r9.knopf);

/* 10) Spielstand-Roundtrip mit neuen Feldern */
const r10 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.heerXp = 42; p.feldherr = { id:"defensiv", ruhm:2 };
  p.buendnisse = { 3: G.jahr + 5 };
  const d = JSON.parse(spielstand());
  ladeSpielstand(JSON.stringify(d));
  const q = G.spieler[0];
  return { ok: q.heerXp === 42 && q.feldherr && q.feldherr.id === "defensiv"
             && q.buendnisse && q.buendnisse[3] === G.jahr + 5 };
});
check("Neue Felder überleben Speichern/Laden", r10.ok);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
