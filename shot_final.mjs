import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
let fehler = 0;
page.on("pageerror", e => { fehler++; console.log("PAGEERROR:", e.message); });
await page.goto("file:///home/claude/kaiser/kaiser.html");
await page.waitForTimeout(800);
/* Alle wichtigen Screens einmal durchschalten und auf Fehler prüfen */
await page.evaluate(() => {
  starteSpiel(4, ["Ich","K1","K2","K3"], [false,true,false,true], 1.8, [false,true,true,true],
    { vergleich:true, tutorial:true, diff:2, szenario:"frei" });
  beginneZug();
});
for (const s of ["status","korn","handel","zwbilanz","steuern","bauen","diplo","welt","statistik","hilfe","kampagne","online","erfolge","ruhm"]) {
  await page.evaluate(sc => {
    if(sc==="zwbilanz") zwischenbilanz(cur());
    zeige(sc);
  }, s);
  await page.waitForTimeout(120);
}
console.log("Screens ok, Fehler:", fehler);
await page.evaluate(() => zeige("status"));
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/final-status.png", fullPage: false });
await browser.close();
