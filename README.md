# KAISER

Retro-Wirtschaftssimulation im C64-Stil — eine eigenständige Neu-Implementierung
der Spielmechanik des Klassikers von 1984 (Hommage, keine Portierung).

## Spielen

Einfach `kaiser.html` im Browser öffnen — keine Installation, komplett offline,
eine einzige Datei.

## Oberfläche

Moderne, responsive Dashboard-Oberfläche (dunkles Design, Phasen-Stepper, Statuskarten,
Kachelkarte). Spielstand-Export/-Import als Datei plus Browser-Schnellspeicher.
Eine vollständige GAP-Analyse gegenüber dem C64-Original liegt in `GAP-ANALYSE.md`.

## Features

- 1–9 Spieler im Hotseat-Modus
- Kornausgabe, Korn- und Landhandel mit schwankenden Preisen (20–430 Taler, 10 % Verkaufsprovision)
- Steuern (Zoll, Einkommen-, Mehrwertsteuer) und Justiz von „sehr fair" bis „gierig"
- Märkte, Kornmühlen, Städte (5 Märkte + 3 Mühlen), Palast (16 Teile), Kathedrale (14 Teile)
- Aufstieg über 8 Beförderungen: Bürger → Baron → Landgraf → Markgraf → Fürst → Herzog → Kurfürst → König → Kaiser
- Zufallsereignisse: Ratten, Pest, Missernten, Feuersbrünste, Siedlertrecks
- Stehendes Heer mit Sold (steigt mit dem Rang), Kriege ab Baronsrang
- Kriegs-Diplomatie: Mitspieler unterstützen Angreifer oder Verteidiger mit ihrem Heer,
  gewähren oder verweigern Durchmarschrechte (Sitzreihenfolge = Nachbarschaft)
- Taktische Schlachten: Angreifer-Taktik vs. geheime Verteidiger-Order (Schere-Stein-Papier),
  drei Gefechtsphasen (Artillerie-Duell, Kavallerie-Attacke, Nahkampf), Moral & Flucht,
  Canvas-Schlachtfeld mit Truppenformationen und Explosionen, Gefechtsprotokoll, Sound
- Begrenzte Lebenszeit (Todesjahr ca. 1760–1768) und 90-Sekunden-Zeitfaktor pro Zug
- Zwischenbilanz-Phase, Wettermodell für Ernten, wachsende SVG-Monumente
- Web-Audio-Soundkulisse (abschaltbar), Konfetti-Zeremonien, Enter-Taste als Hauptaktion
- Kornkurs-Chart im Handel, Jahres-Deltas auf den Statuskarten, Reichsvergleich bei der
  Zugübergabe, animierte Zähler, Spielhilfe (❓)
- Zwei Modi: Original (lange Partie) und Kurzspiel

## Lizenz

MIT

## Neu in Ausbaustufe 5

- **Reichskarte**: prozedural gezeichnete Landkarte je Reich — die Grenze wächst mit dem
  Landbesitz, Fluss, Wälder, Felder und Dorf entstehen dynamisch, und jedes neue Bauwerk
  (Markt, Mühle, Palast- und Dom-Teile, Stadtmauern) erscheint dauerhaft an seinem Platz
  auf der Karte (Neubauten mit goldenem Ring markiert)
- **Wappen & Farben**: jedes Reich hat Wappen und Hausfarbe — auf Karte, Grenzbannern,
  im Schlachtfeld, bei der Übergabe und in allen Übersichten
- **Chronik**: Verlaufsgraph von Untertanen, Land und Vermögen über die Regierungsjahre
- **KI-Regenten**: Reiche können vom Computer geführt werden (Solo-Partien!) — inklusive
  eigener Wirtschafts-, Bau- und Kriegsentscheidungen und automatischer Diplomatie
- **Übergabe-Berichte**: „Derweil in den anderen Reichen …" fasst die KI-Züge zusammen
- Option: Reichsvergleich bei der Zugübergabe ein-/ausblenden

## Version 1.0 — Release-Features

- **Berater-Tutorial**: kontextbezogene Tipps in jeder Phase (abschaltbar)
- **10 Erfolge** mit Freischalt-Toasts, dauerhaft im Browser gespeichert
- **3 Schwierigkeitsgrade** (Startkapital, Schicksalsschläge, KI-Aggressivität)
- **Hintergrundmusik**: generative Lauten-Klänge (🎼 im Kopfbereich, Web Audio)
- **Schlusswertung mit Rückblick**: Chronik-Graphen aller Regenten
- **PWA**: installierbar als App (Manifest, Icons, Service Worker) — auf Render
  gehostet offline spielbar

## Deployment

Render (Blueprint `render.yaml`, statische Site) — jeder Push auf `main` deployt
automatisch. Die Seite ist als PWA installierbar (Browser-Menü → „App installieren").

## Version 2.0 — Online-Mehrspieler

- **Über das Internet spielen**: Raum eröffnen, 6-stelligen Code teilen, Mitspieler
  treten von ihren eigenen Geräten bei (bis zu 9, plus KI-Regenten)
- Rundenbasierte Synchronisation über einen kleinen WebSocket-Relay-Server
  (`server.js`, zweiter Render-Service `kaiser-mp` im Blueprint)
- Kriegs-Interaktionen werden an das richtige Gerät geroutet: Diplomatie-Anfragen,
  geheime Verteidiger-Aufstellung, Schlachtbericht
- Wartebildschirm mit Live-Reichsvergleich, Verbindungsverlust-Hinweise
- Außerdem: Einheiten-Sprites im Schlachtfeld (Reiter, Pikeniere, Kanonen) mit
  Truppenzahlen je Abschnitt, Plünderung nach Eindringtiefe (Gebäude-, Korn- und
  Monumentschäden), Vergleichs-Chart in der Schlusswertung, Gamepad-Steuerung,
  Phasen-Übergangsblenden, Blitz-Spielmodus

## Version 2.1 — Tiefe zwischen den Schlachten

- **Friedens-Diplomatie**: Geschenke, Kornhandel zwischen Regenten und
  Nichtangriffspakte (5 Jahre, blockieren Angriffe) — eine Aktion pro Jahr;
  Angebote an Menschen werden zu Beginn ihres Zuges beantwortet
- **Beziehungs-System**: Verhältnis von -100 bis +100 je Regentenpaar, sichtbar
  in Diplomatie und Gesamtkarte; Kriege zerstören, Geschenke und faire
  Geschäfte verbessern es
- **KI-Persönlichkeiten**: der Eroberer, der Händler, der Baumeister — mit
  eigener Kriegslust, Handelsfreude, Baupriorität und beziehungsgeleiteter
  Diplomatie in Kriegen
- **Gelände in der Schlacht**: Hügel (Verteidigerbonus), Furten (halber
  Vormarsch), Wald (Kavallerie/Artillerie behindert) je Abschnitt, sichtbar
  bei Aufstellung und auf dem Feld; Regen schwächt die Artillerie
- **Entscheidungs-Ereignisse**: sieben Hof-Ereignisse mit 2-3 Wahlmöglichkeiten
  und spürbaren Folgen (auch die KI entscheidet)
- **Gemeinsamer Kornmarkt**: ein Weltmarktpreis für alle — große Verkäufe
  drücken den Kurs des Folgejahres, Aufkäufe treiben ihn
- **Online-Ausbau**: Feldpost-Chat in Lobby und Wartebildschirm; getrennte
  Spieler kann der Gastgeber der KI übergeben (auch mitten in Diplomatie
  oder Verteidigung)
- **Musik**: eigenes Titelthema und Kriegsthema (Sequenzer), getrennte
  Lautstärkeregler für Musik und Effekte im Menü
- **Szenarien**: Das verschuldete Erbe, Die Kriegstreiber, Die Kornkrise —
  lokal und online wählbar; Bilanz der Regentschaften in der Schlusswertung;
  fünf neue Erfolge (15 gesamt)
