/* v3.5.1: Landmarkt-Limit, Setup-Layout, Eroberungssieg */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) Landmarkt: begrenztes Angebot */
const r1 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Bot"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  p.geld = 500000; p.landAngebot = 1200; p.landPreis = 20;
  G.aktiv = 0; zeige("handel");
  const anzeige = document.querySelector("#screen").innerHTML.includes("Angebot am Markt");
  document.getElementById("lkauf").value = "5000";
  const landVor = p.land;
  handelLand(1);
  const abgelehnt = p.land === landVor && document.getElementById("hmsg").textContent.includes("1.200");
  document.getElementById("lkauf").value = "1200";
  handelLand(1);
  const gekauft = p.land === landVor + 1200 && p.landAngebot === 0;
  /* Verkauf legt Land zurück in den Markt */
  document.getElementById("lverk").value = "500";
  handelLand(-1);
  const zurueck = p.landAngebot === 500;
  return { anzeige, abgelehnt, gekauft, zurueck };
});
check("Markt zeigt begrenztes Land-Angebot", r1.anzeige);
check("Kauf über dem Angebot wird abgelehnt", r1.abgelehnt);
check("Kauf verbraucht das Angebot", r1.gekauft);
check("Verkauf füllt den Markt wieder", r1.zurueck);

/* 2) KI kauft nur aus dem Angebot */
const r2 = await page.evaluate(() => {
  const b = G.spieler[1];
  b.geld = 300000; b.land = 5000;
  const orig = Math.random; Math.random = () => 0.5;
  b.landAngebot = undefined;
  kiZug(b);
  Math.random = orig;
  return { ok: b.landAngebot >= 0 };   /* nie negativ */
});
check("KI respektiert das Land-Angebot", r2.ok);

/* 3) Setup: responsive Zeilen, Namensfeld nutzbar */
const r3 = await page.evaluate(() => {
  zeige("setup");
  const zeilen = document.querySelectorAll(".setuprow").length === 9;
  const name = document.getElementById("pname0");
  name.value = "Testkaiser";
  const schmal = (()=>{ /* Zeile bricht um statt zu überlappen: flex-wrap gesetzt */
    const st = getComputedStyle(document.querySelector(".setuprow"));
    return st.flexWrap === "wrap" && st.display === "flex";
  })();
  setupAnzahl();
  return { zeilen, name: name.value === "Testkaiser", schmal, keineTabelle: !document.querySelector(".setup-tabelle") };
});
check("Setup nutzt 9 flexible Zeilen statt starrer Tabelle", r3.zeilen && r3.keineTabelle);
check("Namensfeld beschreibbar, Zeilen umbrechen", r3.name && r3.schmal);

/* 4) Kein Beschriftungs-Balken mehr im Wetterbild */
const r4 = await page.evaluate(() => {
  return !zeichneWetter.toString().includes("fillRect(10, H-28");
});
check("Schwarzer Balken aus der Jahresbilanz entfernt", r4);

/* 5) Eroberung: Reich ohne Land scheidet aus, letzter wird Kaiser */
const r5 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Opfer"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  p.titel = 3; p.heer = { inf:900, kav:100, art:10 }; p.heerXp = 70;
  b.land = 1400; b.maerkte = 0; b.muehlen = 0; b.heer = { inf:10, kav:0, art:0 };
  b.geld = 8000; b.pop = 900;
  G._kr = { a:0, d:1, weg:[], fragen:[], wahl:{}, aufA:[2,2,2,2,2], aufD:[2,2,2,2,2],
            gelaende: wuerfleGelaende() };
  schlachtStarten();
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, true);
  schlachtAbschliessen();
  const vernichtet = b.tot === true && b.besiegt === true && b.land === 0;
  const beuteDa = p.land > 10000;
  const kaiser = G.sieger === p && p.titel === 8;
  const ergebnisText = G._s.ergebnis.includes("vernichtet");
  /* Weiterleitung zur Krönung */
  schlachtWeiter();
  const kroenung = G.screen === "kroenung";
  return { vernichtet, beuteDa, kaiser, ergebnisText, kroenung,
           sieg: G._s.sieger === "A" };
});
check("Besiegtes Reich scheidet aus (Land 0, tot)", r5.sieg && r5.vernichtet);
check("Rest-Land und halbe Kasse an den Sieger", r5.beuteDa);
check("Alleinherrschaft macht zum Kaiser", r5.kaiser && r5.ergebnisText);
check("Nach dem Sieg folgt die Krönung", r5.kroenung);

/* 6) Bei mehr als einem Rest-Gegner kein vorzeitiger Kaiser */
const r6 = await page.evaluate(() => {
  starteSpiel(3, ["Ich","A","B"], [false,true,true], 1.8, [false,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], a = G.spieler[1];
  p.titel = 3; p.heer = { inf:900, kav:100, art:10 };
  a.land = 1200; a.maerkte = 0; a.muehlen = 0; a.heer = { inf:5, kav:0, art:0 };
  G._kr = { a:0, d:1, weg:[], fragen:[], wahl:{}, aufA:[2,2,2,2,2], aufD:[2,2,2,2,2],
            gelaende: wuerfleGelaende() };
  schlachtStarten();
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, true);
  schlachtAbschliessen();
  return { raus: a.tot === true, keinKaiser: !G.sieger && p.titel === 3 };
});
check("Ausscheiden ohne Alleinherrschaft macht nicht zum Kaiser", r6.raus && r6.keinKaiser);

/* 7) Tiefer Durchbruch nimmt auch bebautes Land, Gebäude verfallen */
const r7 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Dick"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], b = G.spieler[1];
  p.titel = 3; p.heer = { inf:1200, kav:150, art:12 }; p.heerXp = 80;
  b.land = 8000; b.maerkte = 8; b.muehlen = 0;       /* minLand = 8000 -> freiLand 0 */
  b.heer = { inf:20, kav:0, art:0 }; b.pop = 3000;
  G._kr = { a:0, d:1, weg:[], fragen:[], wahl:{}, aufA:[2,2,2,2,2], aufD:[2,2,2,2,2],
            gelaende: wuerfleGelaende() };
  schlachtStarten();
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, true);
  const vorherLand = b.land, vorherM = b.maerkte;
  schlachtAbschliessen();
  return { sieg: G._s.sieger === "A", tiefe: G._s.tiefe,
           landWeg: b.land < vorherLand || b.tot,
           gebaeudeWeg: b.maerkte < vorherM || b.tot,
           konsistent: b.tot || minLand(b) <= b.land };
});
check("Tiefer Durchbruch erobert auch bebautes Land", r7.sieg && r7.tiefe >= 4 && r7.landWeg);
check("Verfallene Gebäude halten minLand konsistent", r7.gebaeudeWeg && r7.konsistent);

await browser.close();
if(bad.length){ console.log("FEHLER:"); bad.forEach(b=>console.log(" ✗ " + b)); process.exit(1); }
console.log("OK: " + ok.length);
