/* Lokale WS-Brücke: ws://localhost:9099 <-> wss://kaiser-mp.onrender.com */
import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 9099 });
wss.on("connection", client => {
  const up = new WebSocket("wss://kaiser-mp.onrender.com");
  const q = [];
  up.on("open", () => { q.forEach(m => up.send(m)); q.length = 0; });
  client.on("message", d => { const s = d.toString(); up.readyState === 1 ? up.send(s) : q.push(s); });
  up.on("message", d => { try{ client.send(d.toString()); }catch(e){} });
  client.on("close", () => up.close());
  up.on("close", () => client.close());
  up.on("error", () => client.close());
});
console.log("Brücke läuft auf 9099");
