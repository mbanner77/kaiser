import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.on("pageerror", e => console.log("PAGEERROR:", e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");
await page.evaluate(() => {
  starteSpiel(4, ["Ich","K1","K2","K3"], [false,true,false,true], 1.8, [false,true,true,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  p.maerkte = 6; p.muehlen = 4; p.forst = 2; p.bruch = 1; p.haefen = 1; p.mauer = 2; p.burg = 1;
  p.land = 16000; p.palast = 8;
  for(let i=0;i<6;i++) platziereGebaeude(p,"m");
  for(let i=0;i<4;i++) platziereGebaeude(p,"k");
  for(let i=0;i<2;i++) platziereGebaeude(p,"f");
  platziereGebaeude(p,"s");
  p._neu = undefined;
  G.routen = [{a:0,b:1,seit:1701},{a:2,b:3,seit:1702}];
  beginneZug(); zeige("bauen");
});
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/l1-karte.png", clip:{x:0,y:120,width:1100,height:560} });
await page.evaluate(() => { G._vorWelt="bauen"; zeige("welt"); });
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/l1-welt.png", clip:{x:0,y:60,width:1100,height:600} });
await browser.close();
console.log("done");
