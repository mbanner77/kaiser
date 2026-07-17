/* KAISER — Mehrspieler-Relay-Server
   Kleiner WebSocket-Relay: verwaltet Räume mit Beitritts-Codes und leitet
   Spielzustände zwischen den Clients weiter. Keine Spiellogik auf dem Server.
   Asynchrone Partien: der letzte Spielstand jedes Raums wird gespeichert —
   Spieler können Tage später mit Code und Namen wieder einsteigen. */
const http = require("http");
const { WebSocketServer } = require("ws");
const fs = require("fs");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end("KAISER Mehrspieler-Server läuft.");
});
const wss = new WebSocketServer({ server });

/* code -> { clients: Map(id -> {ws,name}), hostId, pass,
             gestartet, startMsg, syncMsg, zuletzt } */
const raeume = new Map();

/* ---------- Persistenz: Räume überleben Neustarts (soweit /tmp erhalten bleibt) ---------- */
const RAUM_DATEI = "/tmp/kaiser-raeume.json";
try {
  const roh = JSON.parse(fs.readFileSync(RAUM_DATEI, "utf8"));
  for (const r of roh) {
    raeume.set(r.code, { clients: new Map(), hostId: null, pass: r.pass || "",
      gestartet: !!r.gestartet, startMsg: r.startMsg || null, syncMsg: r.syncMsg || null,
      zuletzt: r.zuletzt || Date.now() });
  }
} catch (e) {}
let speicherTimer = null;
function raeumeSpeichern(){
  clearTimeout(speicherTimer);
  speicherTimer = setTimeout(() => {
    const roh = [];
    for (const [code, r] of raeume) {
      if (!r.gestartet) continue;                 /* nur laufende Partien sichern */
      roh.push({ code, pass: r.pass, gestartet: true,
        startMsg: r.startMsg, syncMsg: r.syncMsg, zuletzt: r.zuletzt });
    }
    try { fs.writeFileSync(RAUM_DATEI, JSON.stringify(roh)); } catch (e) {}
  }, 500);
}
/* Aufräumen: Partien ohne Aktivität seit 60 Tagen verfallen */
setInterval(() => {
  const limit = Date.now() - 60*24*3600*1000;
  for (const [code, r] of raeume)
    if (!r.clients.size && (r.zuletzt || 0) < limit) raeume.delete(code);
  raeumeSpeichern();
}, 3600*1000);

/* Weltrangliste (im Speicher; auf Gratis-Servern nach Neustart leer) */
const RANG_DATEI = "/tmp/kaiser-rangliste.json";
let rangliste = [];
try { rangliste = JSON.parse(fs.readFileSync(RANG_DATEI, "utf8")); } catch (e) {}
function ranglisteSpeichern(){
  try { fs.writeFileSync(RANG_DATEI, JSON.stringify(rangliste)); } catch (e) {}
}
let naechsteId = 1;
const ZEICHEN = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const neuerCode = () => Array.from({ length: 6 }, () => ZEICHEN[Math.floor(Math.random() * ZEICHEN.length)]).join("");

function sende(ws, obj){ try { ws.send(JSON.stringify(obj)); } catch (e) {} }
function roster(raum){
  return [...raum.clients.entries()].map(([id, c]) => ({ id, name: c.name, host: id === raum.hostId }));
}
function broadcast(raum, obj, ausser){
  for (const [id, c] of raum.clients) if (id !== ausser) sende(c.ws, obj);
}

wss.on("connection", ws => {
  let raumCode = null, meinId = null;

  ws.on("message", data => {
    let m; try { m = JSON.parse(data); } catch (e) { return; }

    if (m.t === "rangliste") {
      sende(ws, { t: "rangliste", liste: rangliste.slice(0, 20) });
      return;
    }
    if (m.t === "ergebnis") {
      const e = {
        name: String(m.name || "?").substring(0, 16),
        wappen: String(m.wappen || "").substring(0, 4),
        titel: Math.max(0, Math.min(8, +m.titel || 0)),
        jahr: Math.max(1700, Math.min(1800, +m.jahr || 1700)),
        punkte: Math.max(0, Math.min(99999999, Math.round(+m.punkte || 0)))
      };
      rangliste = rangliste.concat(e).sort((a, b) => b.punkte - a.punkte).slice(0, 50);
      ranglisteSpeichern();
      return;
    }
    if (m.t === "neu") {
      let code; do { code = neuerCode(); } while (raeume.has(code));
      meinId = naechsteId++;
      raeume.set(code, { clients: new Map([[meinId, { ws, name: (m.name || "Gastgeber").substring(0, 14) }]]),
        hostId: meinId, pass: (m.pass || "").substring(0, 24),
        gestartet: false, startMsg: null, syncMsg: null, zuletzt: Date.now() });
      raumCode = code;
      sende(ws, { t: "raum", code, id: meinId, roster: roster(raeume.get(code)) });

    } else if (m.t === "beitritt") {
      const code = (m.code || "").toUpperCase().trim();
      const raum = raeume.get(code);
      if (!raum) { sende(ws, { t: "fehler", text: "Raum nicht gefunden — Code prüfen." }); return; }
      if (raum.pass && raum.pass !== (m.pass || "")) { sende(ws, { t: "fehler", text: "Falsches Passwort." }); return; }
      if (raum.clients.size >= 9) { sende(ws, { t: "fehler", text: "Der Raum ist voll (max. 9)." }); return; }
      const name = (m.name || "Gast").substring(0, 14);
      for (const [, c] of raum.clients)
        if (c.name === name) { sende(ws, { t: "fehler", text: "Dieser Name ist im Raum bereits vergeben." }); return; }
      meinId = naechsteId++;
      raumCode = code;
      raum.clients.set(meinId, { ws, name });
      if (raum.hostId == null || !raum.clients.has(raum.hostId)) raum.hostId = meinId;
      raum.zuletzt = Date.now();
      sende(ws, { t: "raum", code, id: meinId, roster: roster(raum) });
      broadcast(raum, { t: "roster", roster: roster(raum) }, meinId);
      /* Asynchron: laufende Partie? Dann den gespeicherten Stand nachreichen. */
      if (raum.gestartet) {
        if (raum.syncMsg) sende(ws, raum.syncMsg);
        else if (raum.startMsg) sende(ws, raum.startMsg);
      }

    } else {
      /* start, sync, … — stumpf an alle anderen im Raum weiterleiten */
      const raum = raeume.get(raumCode);
      if (!raum) return;
      raum.zuletzt = Date.now();
      if (m.t === "start") { raum.gestartet = true; raum.startMsg = { ...m, von: meinId }; raeumeSpeichern(); }
      if (m.t === "sync")  { raum.gestartet = true; raum.syncMsg  = { ...m, von: meinId }; raeumeSpeichern(); }
      broadcast(raum, { ...m, von: meinId }, meinId);
    }
  });

  ws.on("close", () => {
    const raum = raeume.get(raumCode);
    if (!raum || meinId == null) return;
    const wegName = raum.clients.get(meinId) ? raum.clients.get(meinId).name : "";
    raum.clients.delete(meinId);
    if (!raum.clients.size) {
      /* Laufende Partien bleiben für den Wiedereinstieg bestehen */
      if (!raum.gestartet) raeume.delete(raumCode);
      else raeumeSpeichern();
      return;
    }
    if (raum.hostId === meinId) raum.hostId = raum.clients.keys().next().value;
    broadcast(raum, { t: "roster", roster: roster(raum) }, null);
    broadcast(raum, { t: "weg", id: meinId, name: wegName }, null);
  });
});

const port = process.env.PORT || 8081;
server.listen(port, () => console.log("KAISER-Mehrspieler-Server auf Port", port));
