/* KAISER — Mehrspieler-Relay-Server
   Kleiner WebSocket-Relay: verwaltet Räume mit Beitritts-Codes und leitet
   Spielzustände zwischen den Clients weiter. Keine Spiellogik auf dem Server. */
const http = require("http");
const { WebSocketServer } = require("ws");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end("KAISER Mehrspieler-Server läuft.");
});
const wss = new WebSocketServer({ server });

const raeume = new Map();   /* code -> { clients: Map(id -> {ws,name}), hostId, pass } */
/* Weltrangliste (im Speicher; auf Gratis-Servern nach Neustart leer) */
const fs = require("fs");
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
      raeume.set(code, { clients: new Map([[meinId, { ws, name: (m.name || "Gastgeber").substring(0, 14) }]]), hostId: meinId, pass: (m.pass || "").substring(0, 24) });
      raumCode = code;
      sende(ws, { t: "raum", code, id: meinId, roster: roster(raeume.get(code)) });

    } else if (m.t === "beitritt") {
      const code = (m.code || "").toUpperCase().trim();
      const raum = raeume.get(code);
      if (!raum) { sende(ws, { t: "fehler", text: "Raum nicht gefunden — Code prüfen." }); return; }
      if (raum.pass && raum.pass !== (m.pass || "")) { sende(ws, { t: "fehler", text: "Falsches Passwort." }); return; }
      if (raum.clients.size >= 9) { sende(ws, { t: "fehler", text: "Der Raum ist voll (max. 9)." }); return; }
      meinId = naechsteId++;
      raumCode = code;
      raum.clients.set(meinId, { ws, name: (m.name || "Gast " + meinId).substring(0, 14) });
      sende(ws, { t: "raum", code, id: meinId, roster: roster(raum) });
      broadcast(raum, { t: "roster", roster: roster(raum) }, meinId);

    } else {
      /* start, sync, … — stumpf an alle anderen im Raum weiterleiten */
      const raum = raeume.get(raumCode);
      if (!raum) return;
      broadcast(raum, { ...m, von: meinId }, meinId);
    }
  });

  ws.on("close", () => {
    const raum = raeume.get(raumCode);
    if (!raum || meinId == null) return;
    raum.clients.delete(meinId);
    if (!raum.clients.size) { raeume.delete(raumCode); return; }
    if (raum.hostId === meinId) raum.hostId = raum.clients.keys().next().value;
    broadcast(raum, { t: "roster", roster: roster(raum) }, null);
    broadcast(raum, { t: "weg", id: meinId }, null);
  });
});

const port = process.env.PORT || 8081;
server.listen(port, () => console.log("KAISER-Mehrspieler-Server auf Port", port));
