import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
/* Desktop: Verteidigungs-Intro + Aufstellung */
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.on("pageerror", e => console.log("PAGEERROR:", e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");
await page.evaluate(() => {
  starteSpiel(2, ["Ich","Aggro"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], ki = G.spieler[1];
  ki.kiTyp = "aggressor"; ki.heer = { inf:380, kav:30, art:5 };
  p.heer = { inf:120, kav:10, art:2 }; p.maerkte = 3; p.mauer = 2;
  G._angriffe = [{ kr: { a:1, d:0, weg:[], fragen:[], wahl:{}, aufA:[1,2,4,2,1], gelaende: wuerfleGelaende(), belagerung:"sturm" } }];
  G.aktiv = 0;
  beginneZug();
});
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/v31-verteidigung.png", clip:{x:0,y:0,width:1100,height:700} });
await page.evaluate(() => verteidigungStarten());
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/v31-aufstellung.png", clip:{x:0,y:60,width:1100,height:700} });
await page.close();
/* Mobil: Schlacht */
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
mob.on("pageerror", e => console.log("PAGEERROR-MOB:", e.message));
await mob.goto("file:///home/claude/kaiser/kaiser.html");
await mob.evaluate(() => {
  starteSpiel(2, ["Ich","Ki"], [false,true], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], ki = G.spieler[1];
  ki.heer = { inf:150, kav:10, art:3 };
  p.titel = 1; p.heer = { inf:200, kav:20, art:4 };
  G.aktiv = 0;
  kriegVorbereiten(1);
  G._aufW = [2,2,2,2,2];
  aufstellungAFertig();
  clearInterval(G._s.iv);
  G._s.introBis = 0; G._s.regen = false;
  for(let i=0;i<6;i++) einTick(G._s, false);
  render();
});
await mob.waitForTimeout(600);
await mob.screenshot({ path: "/tmp/v31-mobil-schlacht.png", fullPage: false });
await browser.close();
console.log("done");
