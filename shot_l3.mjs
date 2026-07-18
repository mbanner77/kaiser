import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.on("pageerror", e => console.log("PAGEERROR:", e.message));
await page.goto("file:///home/claude/kaiser/kaiser.html");
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/l3-title.png", clip:{x:0,y:0,width:1100,height:620} });
await page.evaluate(() => {
  starteSpiel(2, ["Wilhelmine","K1"], [true,false], 1.8, [false,true],
    { vergleich:true, tutorial:false, diff:2, szenario:"frei" });
  const p = G.spieler[0];
  p.titel = 7; p.startAlter = 30;
  beginneZug();
  zeige("status");
});
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/l3-status.png", clip:{x:0,y:60,width:1100,height:620} });
await page.evaluate(() => { cur().titel = 8; zeige("befoerderung"); });
await page.waitForTimeout(700);
await page.screenshot({ path: "/tmp/l3-portrait.png", clip:{x:250,y:0,width:620,height:640} });
await browser.close();
console.log("done");
