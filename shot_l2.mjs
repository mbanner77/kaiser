import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.on("pageerror", e => console.log("PAGEERROR:", e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");
await page.evaluate(() => {
  starteSpiel(3, ["Ich","K1","K2"], [false,true,false], 1.8, [false,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0], ki = G.spieler[1];
  ki.heer = { inf:150, kav:15, art:4 };
  p.titel = 1; p.heer = { inf:240, kav:30, art:6 };
  G.aktiv = 0;
  kriegVorbereiten(1);
  G._aufW = [2,2,2,2,2];
  aufstellungAFertig();
  clearInterval(G._s.iv);
  G._s.regen = false;
  for(let i=0;i<3;i++) einTick(G._s, false);
  render();
});
await page.waitForTimeout(700);
await page.screenshot({ path: "/tmp/l2-schlacht.png", clip:{x:0,y:60,width:1100,height:560} });
await page.evaluate(() => {
  clearInterval(G._s.iv);
  while(!G._s.fertig) einTick(G._s, true);
  schlachtAbschliessen();
  render();
});
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/l2-sieg.png", clip:{x:0,y:60,width:1100,height:560} });
await page.evaluate(() => {
  const p = cur();
  p.report = { ereignisse:[], wetter: WETTER[2], ernte: 500, steuern: 2000, unterhalt: 0, gehaelter:0, ueberzeit: 0, holzErtrag:0, steinErtrag:0, routenGeld:0 };
  zeige("bilanz");
});
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/l2-wetter.png", clip:{x:0,y:100,width:1100,height:330} });
await browser.close();
console.log("done");
