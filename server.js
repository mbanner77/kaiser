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

const raeume = new Map();   /* code -> { clients: Map(id -> {ws,name}), hostId } */
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

    if (m.t === "neu") {
      let code; do { code = neuerCode(); } while (raeume.has(code));
      meinId = naechsteId++;
      raeume.set(code, { clients: new Map([[meinId, { ws, name: (m.name || "Gastgeber").substring(0, 14) }]]), hostId: meinId });
      raumCode = code;
      sende(ws, { t: "raum", code, id: meinId, roster: roster(raeume.get(code)) });

    } else if (m.t === "beitritt") {
      const code = (m.code || "").toUpperCase().trim();
      const raum = raeume.get(code);
      if (!raum) { sende(ws, { t: "fehler", text: "Raum nicht gefunden — Code prüfen." }); return; }
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
