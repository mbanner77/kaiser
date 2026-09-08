/* v3.1: KI-Angriff auf Menschen -> interaktive Verteidigung; Aufstellungs-UI */
import { chromium } from "playwright";
const ok = [], bad = [];
const check = (n,c) => (c?ok:bad).push(n);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("pageerror", e => bad.push("PAGEERROR: " + e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");

/* 1) KI erklärt dem Menschen den Krieg */
const r1 = await page.evaluate(() => {
  starteSpiel(2, ["Ich","Aggro"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], ki = G.spieler[1];
  ki.kiTyp = "aggressor"; ki.titel = 2;
  ki.heer = { inf:400, kav:40, art:6 }; ki.geld = 30000;
  p.heer = { inf:30, kav:0, art:0 }; p.maerkte = 2; p.mauer = 1;
  /* Kriegswürfel erzwingen */
  const orig = Math.random;
  Math.random = () => 0.01;
  kiZug(ki);
  Math.random = orig;
  return {
    erklaert: (G._angriffe||[]).length === 1 && G._angriffe[0].kr.a === 1 && G._angriffe[0].kr.d === 0,
    kiGefuehrt: ki.kriegGefuehrt === true,
    belagerung: !!G._angriffe[0].kr.belagerung,
    chronik: (G.geschichte||[]).some(e=>e.t.includes("erklärt"))
  };
});
check("KI erklärt dem Menschen den Krieg", r1.erklaert);
check("KI-Feldzug verbraucht", r1.kiGefuehrt);
check("Belagerung gegen Mauer gewählt", r1.belagerung);
check("Chronik-Eintrag", r1.chronik);

/* 2) Verteidigung zu Zugbeginn: Intro -> Aufstellung -> Schlacht -> Zug geht weiter */
const r2 = await page.evaluate(() => {
  G.aktiv = 0;
  beginneZug();
  const introDa = G.screen === "verteidigung";
  const html = document.querySelector("#screen").innerHTML;
  const introOk = html.includes("Feindliche Heere") && html.includes("Aggro") && html.includes("Zur Verteidigung");
  verteidigungStarten();
  const aufD = G.screen === "aufstellungD";
  const queueLeer = (G._angriffe||[]).length === 0;
  aufstellungDFertig();
  const inSchlacht = G.screen === "schlacht";
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, true);
  schlachtAbschliessen();
  render();
  const weiterKnopf = document.querySelector("#screen").innerHTML.includes("schlachtWeiter()");
  const verteidigerDarfNoch = G.spieler[0].kriegGefuehrt === false;
  schlachtWeiter();
  const zugGehtWeiter = ["status","angebote","reichstag"].includes(G.screen);
  return { introDa, introOk, aufD, queueLeer, inSchlacht, weiterKnopf, verteidigerDarfNoch, zugGehtWeiter,
           sieger: G._s.sieger };
});
check("Verteidigungs-Intro erscheint", r2.introDa && r2.introOk);
check("Weiter zur Verteidigungs-Aufstellung", r2.aufD && r2.queueLeer);
check("Schlacht startet (KI-Angreifer, lokal)", r2.inSchlacht);
check("Schlacht endet mit Sieger", r2.sieger === "A" || r2.sieger === "D");
check("Weiter-Knopf routet über schlachtWeiter", r2.weiterKnopf);
check("Verteidiger behält eigenen Feldzug", r2.verteidigerDarfNoch);
check("Nach der Schlacht geht der Zug weiter", r2.zugGehtWeiter);

/* 3) Angriff überlebt Speichern/Laden */
const r3 = await page.evaluate(() => {
  G._angriffe = [{ kr: { a:1, d:0, weg:[], fragen:[], wahl:{}, aufA:[2,2,2,2,2], gelaende: wuerfleGelaende() } }];
  const s = spielstand();
  G._angriffe = [];
  ladeSpielstand(s);
  return { da: (G._angriffe||[]).length === 1 && G._angriffe[0].kr.d === 0 };
});
check("Angriffe überleben Spielstand", r3.da);

/* 4) Aufstellungs-UI: Prozente, Preset-Hervorhebung, Nord/Süd */
const r4 = await page.evaluate(() => {
  const p = G.spieler[0], ki = G.spieler[1];
  p.titel = 1; p.kriegGefuehrt = false; p.heer = { inf:100, kav:10, art:2 };
  ki.heer = { inf:50, kav:0, art:0 }; ki.mauer = 0;
  G.aktiv = 0;
  kriegVorbereiten(1);
  const res = {};
  res.aufA = G.screen === "aufstellungA";
  const html = () => document.querySelector("#screen").innerHTML;
  res.nord = html().includes("Nordflanke") && !html().includes("Linker Flügel");
  res.prozent = html().includes("20 %");                       /* 2/10 je Abschnitt */
  res.breiteAktiv = /btn-sm btn-primary[^>]*data-preset="0"|data-preset="0"[^>]*class="[^"]*btn-primary/.test(html())
    || html().includes('btn-sm btn-primary" data-preset="0"');
  aufstellungPreset(1);                                        /* massiertes Zentrum */
  res.zentrumAktiv = html().includes('data-preset="1"') && /btn-primary[^>]*data-preset="1"|data-preset="1"/.test(html())
    && document.querySelector('[data-preset="1"]').classList.contains("btn-primary")
    && !document.querySelector('[data-preset="0"]').classList.contains("btn-primary");
  aufstellungGewicht(0, 4);                                    /* manuell -> kein Preset mehr */
  res.keinsAktiv = !document.querySelector('[data-preset="1"]').classList.contains("btn-primary");
  res.labelLive = document.getElementById("gw0").textContent.includes("%");
  return res;
});
check("Aufstellungs-Screen offen", r4.aufA);
check("Nord/Süd statt links/rechts", r4.nord);
check("Prozentanteile angezeigt", r4.prozent);
check("Aktives Preset hervorgehoben", r4.breiteAktiv);
check("Preset-Wechsel wird markiert", r4.zentrumAktiv);
check("Manuelle Änderung löst Markierung", r4.keinsAktiv);
check("Label live mit Prozent", r4.labelLive);

await browser.close();
console.log("OK:", ok.length);
if (bad.length){ console.log("FEHLER:", bad.length); bad.forEach(n=>console.log("  ✗", n)); process.exit(1); }
