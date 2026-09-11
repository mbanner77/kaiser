/* v3.11: Kompanien, Dynastie-Ausbau, Intrigen, Einstellungen, Komfort, Chronik-Buch, MP-Ausbau, Katastrophen */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) Einstellungen: Animationstempo + Persistenz + Screen */
const r1 = await page.evaluate(() => {
  einstSetzen("anim", 2);
  const schnell = animFaktor() === 2.4;
  const gespeichert = JSON.parse(window.localStorage.getItem("kaiser_einst")).anim === 2;
  einstSetzen("anim", 0);
  const aus = animFaktor() === 60;
  einstSetzen("anim", 1);
  const normal = animFaktor() === 1;
  einstellungenAuf();
  const screen = G.screen === "einstellungen" && document.querySelector("#screen").innerHTML.includes("Szenen");
  zeige("title");
  return { schnell, gespeichert, aus, normal, screen };
});
check("Animationstempo einstellbar und gespeichert", r1.schnell && r1.gespeichert && r1.aus && r1.normal);
check("Einstellungs-Bildschirm öffnet", r1.screen);

/* 2) Farbenblind-Modus: Palette wechselt, laufende Partie wird umgefärbt */
const r2 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const vorher = G.spieler[0].farbe;
  einstSetzen("cb", true); farbenAnwenden();
  const cb = FARBEN[0] === FARBEN_CB[0] && G.spieler[0].farbe === FARBEN_CB[FARBEN_STD.indexOf(vorher)];
  einstSetzen("cb", false); farbenAnwenden();
  const zurueck = FARBEN[0] === FARBEN_STD[0] && G.spieler[0].farbe === vorher;
  return { cb, zurueck };
});
check("Farbenblind-Palette färbt Partie um und zurück", r2.cb && r2.zurueck);

/* 3) Handel: Rückgängig + Schnellwahl-Knöpfe */
const r3 = await page.evaluate(() => {
  const p = G.spieler[0];
  p.geld = 10000; p.korn = 100; p.kornPreis = 100;
  G.aktiv = 0; zeige("handel");
  const knoepfe = document.querySelector("#screen").innerHTML.includes("¼")
               && document.querySelector("#screen").innerHTML.includes("Letzte Aktion rückgängig");
  document.getElementById("kkauf").value = "20";
  handelKorn(1);
  const gekauft = p.geld === 8000 && p.korn === 120;
  handelUndo();
  const rueck = p.geld === 10000 && p.korn === 100 && !G._handelUndo;
  return { knoepfe, gekauft, rueck };
});
check("Schnellwahl- und Rückgängig-Knöpfe im Handel", r3.knoepfe);
check("Rückgängig stellt den Stand wieder her", r3.gekauft && r3.rueck);

/* 4) Tastaturkürzel: d öffnet die Diplomatie */
const r4 = await page.evaluate(() => {
  zeige("bauen");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "d", bubbles: true }));
  const diplo = G.screen === "diplo";
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true }));
  return { diplo, zurueck: G.screen === "bauen" };
});
check("Tastaturkürzel wechseln die Ansicht", r4.diplo && r4.zurueck);

/* 5) Söldner-Kompanie: anwerben, Sold, Ruf nach Sieg */
const r5 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  p.geld = 10000; p.heer = { inf:10, kav:0, art:0 };
  G.aktiv = 0; zeige("bauen");
  const karte = document.querySelector("#screen").innerHTML.includes("Freie Kompanien");
  const soldVor = unterhalt(p);
  anwerbenKompanie("eisern");
  const geworben = p.kompanie && p.kompanie.id === "eisern" && p.geld === 10000 - 2800
    && p.heer.inf === 50 && p.heer.kav === 60;
  const soldMit = unterhalt(p) === soldVor ? false : unterhalt(p) > soldVor + 1000;
  const belegt = !kompanieFrei("eisern");
  /* Sieg mehrt den Ruf */
  p.heer = { inf:500, kav:60, art:4 }; b.heer = { inf:40, kav:0, art:0 }; b.land = 9000;
  G._kr = { a:0, d:1, weg:[], fragen:[], wahl:{}, aufA:[2,2,2,2,2], aufD:[2,2,2,2,2], gelaende: wuerfleGelaende() };
  schlachtStarten();
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, true);
  schlachtAbschliessen();
  const ruhm = G._s.sieger === "A" && p.kompanie.ruhm === 1 && kompanieSold(p) === 1500;
  G._kr = null; G._s = null;
  return { karte, geworben, soldMit, belegt, ruhm };
});
check("Kompanien-Karte im Heer-Bildschirm", r5.karte);
check("Anwerben: Handgeld, Truppen, Sold", r5.geworben && r5.soldMit && r5.belegt);
check("Sieg mehrt Ruf und Sold der Kompanie", r5.ruhm);

/* 6) Unbezahlte Kompanie meutert und wechselt die Seite */
const r6 = await page.evaluate(() => {
  const p = G.spieler[0], b = G.spieler[1];
  const k = kompanieArt(p);
  const infVor = p.heer.inf, kornVor = p.korn = 2000;
  p.geld = -500;
  const r = { ereignisse: [] };
  const orig = Math.random; Math.random = () => 0.1;    /* wechselt zum Feind */
  kompanieMeuterei(p, r);
  Math.random = orig;
  return { weg: !p.kompanie && p.heer.inf === Math.max(0, infVor - k.inf),
           beute: p.korn < kornVor,
           uebergelaufen: b.kompanie && b.kompanie.id === "eisern" && b.heer.kav >= 60,
           ereignis: r.ereignisse.some(e=>e.t.includes("Meuterei")) };
});
check("Meuterei: Kompanie plündert und läuft zum Feind über", r6.weg && r6.beute && r6.uebergelaufen && r6.ereignis);

/* 7) Dynastie: Geschwister, Kind vermählen, Regentschaftsrat */
const r7 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  p.startAlter = 30;
  p.erbe = { name:"Erik", w:false, geb:G.jahr-2, zug:"gelehrt" };
  p.korn = 5000; p.pop = 1000;                          /* keine Pest (pop<=1200) */
  const orig = Math.random; Math.random = () => 0.05;
  zwischenbilanz(p);
  Math.random = orig;
  const geschwister = (p.kinder||[]).length === 1;
  /* Heiratsmarkt */
  p.kinder = [{ name:"Ada", w:true, geb:G.jahr-16, zug:"volksnah" }];
  p.bez = {1: 20}; b.bez = {0: 20};
  p.diploZaehler = 0; p.geld = 1000;
  G.aktiv = 0; zeige("diplo");
  const knopf = document.querySelector("#screen").innerHTML.includes("Kind vermählen");
  document.getElementById("dipZiel").value = "1";
  diploAktion("kindehe");
  const vermaehlt = p.kinder.length === 0 && p.geld > 1000 && paktAktiv(p, b) && p.diploZaehler === 1;
  /* Regentschaftsrat: unmündiger Erbe folgt nach */
  p.erbe = { name:"Otto", w:false, geb:G.jahr-9, zug:"volksnah" };
  p.kinder = [{ name:"Ida", w:true, geb:G.jahr-1, zug:null }];
  erben(p);
  const rat = p.name === "Otto" && p.regentschaft === true && alterJahre(p) === 9
           && p.erbe && p.erbe.name === "Ida";
  const o2 = Math.random; Math.random = () => 0.5;
  jahresschluss(p);
  Math.random = o2;
  const wirkung = p.regentschaft === true && p.report.ereignisse.some(e=>e.t.includes("Regentschaftsrat"));
  /* Muendig */
  p.startAlter += 7;                                    /* jetzt 16+ */
  const o3 = Math.random; Math.random = () => 0.5;
  jahresschluss(p);
  Math.random = o3;
  const muendig = !p.regentschaft && p.report.ereignisse.some(e=>e.t.includes("mündig"));
  return { geschwister, knopf, vermaehlt, rat, wirkung, muendig };
});
check("Geschwister des Thronfolgers werden geboren", r7.geschwister);
check("Heiratsmarkt: Kind wird vermählt (Brautgeld, Frieden)", r7.knopf && r7.vermaehlt);
check("Unmündiger Erbe: Regentschaftsrat regiert", r7.rat && r7.wirkung);
check("Mit 16 endet die Regentschaft", r7.muendig);

/* 8) Intrigen: Skandal, Günstling, Attentat */
const r8 = await page.evaluate(() => {
  starteSpiel(3, ["Ich","Opfer","Dritter"], [false,true,true], 1.8, [false,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], z = G.spieler[1];
  p.geld = 50000; p.intrigeGenutzt = false;
  G.aktiv = 0; zeige("diplo");
  const karte = document.querySelector("#screen").innerHTML.includes("Intrigen");
  document.getElementById("dipZiel").value = "1";
  const stVor = z.stimmung;
  const orig = Math.random; Math.random = () => 0.1;    /* gelingt */
  intrige("skandal");
  Math.random = orig;
  const skandal = z.stimmung === stVor - 8 && p.intrigeGenutzt === true && p.geld === 48500;
  /* Zweite Intrige im selben Jahr geht nicht */
  const geldVor = p.geld;
  intrige("guenstling");
  const gesperrt = p.geld === geldVor;
  /* Günstling im neuen Jahr */
  p.intrigeGenutzt = false;
  const o2 = Math.random; Math.random = () => 0.1;
  intrige("guenstling");
  Math.random = o2;
  const guenstling = guenstlingAktiv(p, 1) && p.spionage && p.spionage[1];
  /* Attentat gegen einen Feind */
  p.intrigeGenutzt = false;
  p.bez = { 1: -40 }; z.bez = { 0: -40 };
  const nameVor = z.name;
  z.erbe = { name:"Udo", w:false, geb:G.jahr-20, zug:"kriegerisch" };
  const wuerfe = [0.1, 0.9, 0.9, 0.9];                  /* gelingt, nicht enttarnt */
  let wi = 0;
  const o3 = Math.random; Math.random = () => wuerfe[Math.min(wi++, wuerfe.length-1)];
  intrige("attentat");
  Math.random = o3;
  const attentat = z.name === "Udo" && z.name !== nameVor && !z.tot;
  return { karte, skandal, gesperrt, guenstling, attentat };
});
check("Intrigen-Karte in der Diplomatie", r8.karte);
check("Skandal drückt die Stimmung des Ziels", r8.skandal);
check("Nur eine Intrige je Jahr", r8.gesperrt);
check("Günstling liefert Bericht und wirkt 6 Jahre", r8.guenstling);
check("Attentat stürzt den Regenten, der Erbe folgt", r8.attentat);

/* 9) Bot-Intrige gegen den stärksten Rivalen */
const r9 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Fuchs"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei", staerken:[2,3] });
  const p = G.spieler[0], b = G.spieler[1];
  b.titel = 0; b.geld = 100000; b.land = 8000; b.kiTyp = "haendler"; /* kein Krieg möglich, Kasse voll */
  p.geld = 500000; p.land = 90000;                      /* klarer Rivale Nr. 1 */
  const stVor = p.stimmung;
  const orig = Math.random; Math.random = () => 0.05;
  kiZug(b);
  Math.random = orig;
  return { intrige: p.stimmung === stVor - 6 || (G.geschichte||[]).some(e=>e.t.includes("Flugschriften")||e.t.includes("Schmähschriften")) };
});
check("Gerissener Bot streut Skandale gegen den Rivalen", r9.intrige);

/* 10) Katastrophen: Warnung, Flut mit/ohne Dämme, Persistenz */
const r10 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  G.katastrophe = { art:"flut", jahr: G.jahr + 1 };
  const orig = Math.random; Math.random = () => 0.5;
  jahresschluss(p);
  const warnung = p.report.ereignisse.some(e=>e.t.includes("Hofastrologe warnt"));
  /* Flutjahr mit Dämmen */
  G.katastrophe = { art:"flut", jahr: G.jahr };
  p.stein = 60;
  jahresschluss(p);
  const daemme = p.stein === 20 && p.report.ereignisse.some(e=>e.t.includes("Notdämme halten"));
  /* Flutjahr ohne Dämme */
  p.stein = 0; p.muehlen = 3; p.korn = 2000;
  jahresschluss(p);
  const schaden = p.muehlen === 2 && p.report.ereignisse.some(e=>e.t.includes("Jahrhundertflut"));
  /* Vulkan: Ereignis + Ernteeinbruch */
  G.katastrophe = { art:"vulkan", jahr: G.jahr };
  p.korn = 50; p.pop = 2000; p.land = 20000;
  jahresschluss(p);
  const vulkan = p.report.ereignisse.some(e=>e.t.includes("Vulkanwinter"));
  Math.random = orig;
  const d = JSON.parse(spielstand());
  const persistiert = d.katastrophe && d.katastrophe.art === "vulkan";
  ladeSpielstand(JSON.stringify(d));
  return { warnung, daemme, schaden, vulkan, persistiert: persistiert && G.katastrophe.art === "vulkan" };
});
check("Astrologe warnt ein Jahr vorher", r10.warnung);
check("Flut: Steindämme schützen", r10.daemme);
check("Flut ohne Dämme reißt Mühle und Korn fort", r10.schaden);
check("Vulkanwinter verdirbt die Ernte", r10.vulkan);
check("Katastrophe überlebt Speichern/Laden", r10.persistiert);

/* 11) Chronik-Buch: Seiten rendern, Blättern, Export-Knopf */
const r11 = await page.evaluate(() => {
  G.spieler.forEach(p=>{ p.chronik = []; });
  for(let j=0;j<8;j++){ G.jahr++; G.spieler.forEach((p,i)=>{
    p.chronik.push({ j:G.jahr, pop:p.pop+j*10, geld:p.geld+j*100, land:p.land, heer:100+j*(i+1), mi:score(p)+j*500 }); }); }
  geschichte("⚔️", "Die große Testschlacht tobt.");
  geschichte("👑", "Eine Testkrönung wird gefeiert.");
  G.sieger = G.spieler[0]; G.spieler[0].titel = 8;
  chronikBuchAuf("ende");
  const offen = G.screen === "chronikbuch" && !!document.getElementById("buchBild");
  let fehlerfrei = true;
  try{
    for(let s2=0; s2<5; s2++){ G._buch.seite = s2; G._buch.von = s2; zeichneChronikBuch(performance.now()); }
  }catch(e){ fehlerfrei = false; }
  const html = document.querySelector("#screen").innerHTML;
  const knoepfe = html.includes("Als Bild speichern") && html.includes("Blatt");
  G._buch.seite = 0; G._buch.von = 0; G._buch.flip = 0;
  buchBlaettern(1);
  const geblaettert = G._buch.seite === 1 && G._buch.flip > 0;
  zeige("title"); G.sieger = null;
  return { offen, fehlerfrei, knoepfe, geblaettert };
});
check("Chronik-Buch öffnet mit allen fünf Blättern", r11.offen && r11.fehlerfrei);
check("Blättern und Bild-Export vorhanden", r11.knoepfe && r11.geblaettert);

/* 12) MP: Schnellnachrichten im Feldpost-Kasten, stiller Wiederbeitritt */
const r12 = await page.evaluate(() => {
  MP = { name:"Tester", chat:[], roster:[], aktiv:true, rejoin:true, zuschauer:false, code:"ABC123" };
  const box = chatBox();
  const emotes = box.includes("🏆") && box.includes("Beeilt Euch");
  const da = typeof mpWiederverbinden === "function" && typeof chatSchnell === "function";
  /* Wiederbeitritt mitten in der Partie: kein Lobby-Wechsel */
  const screenVor = G.screen;
  mpNachricht({ t:"raum", code:"ABC123", id:7, roster:[{id:7,name:"Tester",host:false}] });
  const still = G.screen === screenVor && MP.rejoin === false && MP.id === 7;
  MP = null;
  return { emotes, da, still };
});
check("Schnellnachrichten-Knöpfe in der Feldpost", r12.emotes && r12.da);
check("Wiederbeitritt bleibt still im Spiel (keine Lobby)", r12.still);

/* 13) Neue Felder überleben Speichern/Laden */
const r13 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  p.kompanie = { id:"rose", seit:G.jahr, ruhm:2 };
  p.kinder = [{ name:"Ada", w:true, geb:G.jahr-3, zug:"volksnah" }];
  p.guenstlinge = { 1: G.jahr + 4 };
  p.regentschaft = true;
  const d = spielstand();
  ladeSpielstand(d);
  const q = G.spieler[0];
  return { ok: q.kompanie && q.kompanie.id === "rose" && q.kompanie.ruhm === 2
             && q.kinder && q.kinder[0].name === "Ada"
             && q.guenstlinge && q.guenstlinge[1] === G.jahr + 4
             && q.regentschaft === true };
});
check("Kompanie/Kinder/Günstlinge/Regentschaft im Spielstand", r13.ok);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
