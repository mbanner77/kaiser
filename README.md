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

## Version 2.2 — Dynastien, Intrigen und die weite Welt

- **Dynastie**: beim Tod übernimmt der Erbe (Erbstreit kostet Vermögen, Land und
  eine Titelstufe) — Partien werden zur Generationen-Saga (abschaltbar)
- **Spionage**: Spione beschaffen Geheimberichte über Heer, Speicher und Kasse
  fremder Reiche — mit Entdeckungsrisiko
- **Stadteroberung**: bei tiefem Durchbruch fällt eine ganze Stadt (5 Märkte,
  3 Mühlen) an den Sieger statt zerstört zu werden
- **Häfen**: neues Gebäude am Fluss — halbierte Verkaufsprovision, Zolleinnahmen,
  Piraten-Ereignisse; die Händler-KI baut mit
- **Der Hofstaat**: Schatzmeister, Marschall und Kanzler mit Boni, Gehältern
  und eigenen Agenden (Veruntreuung, Rücktritt bei leerer Kasse)
- **Bauen per Kartenklick**: Markt und Mühle selbst auf der Reichskarte platzieren
- **Chronik der Partie**: alle großen Momente als Zeitleiste in der Schlusswertung,
  exportierbar als Bild
- **Online**: Räume mit Passwort, Weltrangliste auf dem Server (Top 20),
  Ergebnismeldung am Partie-Ende; zwei neue Erfolge (17 gesamt)

## Version 2.3 — Belagerungen, Kampagne und die asynchrone Welt

- **Baustoffe Holz & Stein**: Bauwerke kosten neben Talern nun Material — zukaufbar
  im Handel oder aus eigenen Forsthöfen (+30 Holz/Jahr) und Steinbrüchen
  (+20 Stein/Jahr); beide erscheinen auf der Reichskarte, die KI wirtschaftet mit
- **Festungen & Belagerungen**: Stadtmauer (3 Stufen) und Burg (2 Stufen) stärken
  die Verteidiger deutlich und decken das Hinterland vor Plünderern; Angreifer
  müssen befestigte Reiche erst belagern — Sturmangriff, Beschuss (Artillerie
  schießt Breschen) oder Aushungern, jeweils mit eigenen Kosten und Folgen
- **Heiratspolitik**: Vermählungen zwischen Häusern (Mitgift verhandelbar) stiften
  12 Jahre Frieden — und beim Tod des Partners erbt das vermählte Haus Land;
  auch KI-Häuser heiraten untereinander
- **Handelsrouten**: bis zu drei Routen je Reich (sichtbar als goldene Wege mit
  wandernden Karawanen auf der Gesamtkarte) bringen beiden Seiten jährlichen
  Zoll — eine Kriegserklärung kappt die Route
- **Kampagne**: vier verkettete Kapitel „Vom Bauernsohn zum Kaiser" mit eigenen
  Zielen, Fristen, Erzähltexten und Vermögens-Übernahme ins nächste Kapitel
- **Statistik-Dashboard**: Kurven aller Reiche über die Jahre (Untertanen,
  Vermögen, Land, Heer), Kornkurs-Historie des Weltmarkts und eine
  Kriegs- und Handelsbilanz — im Spiel und in der Schlusswertung
- **Asynchroner Online-Modus**: der Server merkt sich laufende Partien; mit
  Raum-Code und demselben Namen steigen Spieler jederzeit wieder ein, auch
  Tage später — niemand muss gleichzeitig online sein (Sitzbindung über Namen,
  Rückkehrer werden automatisch erkannt); vier neue Erfolge (21 gesamt)

## Version 2.4 — Reichstag, Lehrjahre und die belagerte Mauer

- **Festungen im Schlachtbild**: Stadtmauer mit Zinnen und Burg des Verteidigers
  werden auf dem Schlachtfeld gezeichnet — nach Beschuss klaffen Breschen mit
  Trümmern, Artillerie-Einschläge stauben im Mauerwerk, dazu dumpfe
  Belagerungsklänge und ein eigener Belagerungs-Marsch
- **Ereignisketten**: Hof-Entscheidungen wirken Jahre später nach — geduldete
  Räuber verschanzen sich im Wald, gespeiste Bettler bringen dankbare Siedler,
  abgewiesene bringen Aufruhr, Feste locken Mäzene, geflickte Deiche brechen erneut
- **Der Reichstag**: alle zehn Jahre Abstimmung mit Stimmgewicht nach Rang —
  Reichsfrieden (2 Jahre Kriegsverbot), Reichssteuer (5 % ans ärmste Reich) oder
  Handelsprivileg (+50 % Routenzoll); Gegenstimmen lassen sich kaufen, die KI
  stimmt nach Interesse
- **Partien-Browser & Beobachter**: Räume lassen sich öffentlich listen und im
  Browser durchstöbern; Zuschauer verfolgen Partien live ohne mitzuspielen;
  „Meine Partien" merkt sich laufende Runden für den Ein-Klick-Wiedereinstieg
- **Mobile-Optimierung**: daumengroße Touch-Ziele, einspaltiges Layout,
  scrollbarer Phasen-Stepper, 16-px-Eingaben gegen Auto-Zoom, PWA-Installationshinweis
- **Die Lehrjahre**: geführtes Tutorial — Meister Konrad stellt zehn Aufgaben
  von der Kornausgabe bis zur Heerwerbung, mit Fortschrittsbanner und Abschlussfeier
- **Klangausbau**: jahreszeitliches Ambiente (Vögel, Wind), Mühlenklappern und
  Hafenglocke aus dem eigenen Reich, Trauergeläut, Marschtrommeln vor den Toren
- **Partie-Replay**: die ganze Regentschaft als Jahres-Zeitraffer — wachsende
  und schrumpfende Reiche, mitlaufende Chronik, Geschwindigkeitsregler

## Version 2.5 — Der Feinschliff (Grafik, UI & Animationen)

- **Reichskarte**: Blumenwiesen im Frühling und Sommer, weidende Schafe nahe dem
  Dorf, ein Vogelschwarm zieht in V-Formation mit Flügelschlag über das Land
- **Gesamtkarte als Seekarte**: Weltmeer mit wandernden Wellenlinien und Glitzern,
  doppelter Goldrahmen mit Eckzier, Kompassrose, Kartusche in Antiqua
- **Schlachtfeld**: Boden mit Tiefenwirkung (Himmelstreifen, dunkler werdendes
  Feld), Grasbüschel und zertrampelte Erde, Pulverrauch treibt nach jedem Schuss
  davon, marschierende Linien wiegen im Schritt, Sieger-Vignette mit Ordensband
- **Wetterszenen**: ein blasser Regenbogen spannt sich bei Wechselwetter über die Hügel
- **Porträts als Ahnenbilder**: goldener Doppelrahmen mit Eck-Rosetten und
  Galerie-Vignette um jedes Regentenporträt
- **Titelpanorama**: funkelnde Sterne im Dämmerhimmel, warm erleuchtete,
  flackernde Burgfenster
- **UI-Feinschliff**: Zierlinie unter Überschriften, Karten heben sich beim
  Überfahren, schwebende Symbole auf den Statuskacheln, Glanzlauf über
  Primärknöpfen und Wappenschilden, einschwebende Toasts mit Goldakzent,
  Zeilen-Hover in Tabellen, einpoppende Veränderungs-Abzeichen

## Version 2.6 — Lebendige Szenen

- **Tag-/Nachtwechsel im Titelbild**: der Himmel durchläuft Abendrot, Nacht,
  Morgenrot und Tag (~80 s je Umlauf) — nachts steigt ein Sichelmond mit Hof auf,
  die Sterne funkeln heller und die Burgfenster glühen; tags wandert die Sonne
- **Reichskarte**: Lastkähne treiben mit Kielwasser den Fluss hinab (mit Häfen
  mehr Verkehr), Untertanen pendeln sichtbar zwischen Dorf und Bauwerken
- **Weltkarte**: ein Segelschiff mit geblähtem Segel kreuzt das Weltmeer
- **Schlacht-Auftakt**: Wappen und Namenszüge beider Heerführer fahren von den
  Seiten herein und prallen am gekreuzten Schwert aufeinander, ehe das Gefecht beginnt
- **Übergänge**: Karten schweben nacheinander gestaffelt ein
  (respektiert »Bewegung reduzieren«), feierliches Pulsleuchten hinter den
  Porträts bei Beförderung und Krönung, Kornkurs-Sparkline mit Füllverlauf
  und pulsierendem Endpunkt

## Version 2.7 — Zeremonien & Jahreszeiten

- **Feuerwerk zur Krönung**: Raketen steigen hinter dem Kaiserporträt auf und
  zerplatzen in farbigen Funkengarben mit Schwerkraft und Glitzern
- **Jahreszeiten-Band im Zugwechsel**: ein schmales Panorama zeigt die aktuelle
  Saison — Schneetreiben im Winter, wirbelnde Blätter im Herbst, Vogelflug in
  Frühling und Sommer
- **Krähen über dem Feld**: nach geschlagener Schlacht kreisen Krähen mit
  Flügelschlag über dem stillen Schlachtfeld
- **Setup**: jede Spielerzeile trägt ihr farbiges Wappenschild
- **Erfolge**: freigeschaltete Karten glänzen golden, verschlossene liegen im Grau
- **Bilanz**: Ernte und Vermögen zählen weich hoch

## Version 2.8 — Entscheidungen mit sichtbaren Folgen

- **Ergebnis-Anzeige für Hof-Ereignisse**: nach jeder Entscheidung erscheint eine
  eigene Folgen-Seite — mit der gewählten Option, dem Ausgang und einer Tabelle
  der konkreten Veränderungen (Taler, Korn, Untertanen, Stimmung, Land,
  Baustoffe, Heer) statt eines flüchtigen Hinweises; wirkungslose Ausgänge
  werden ehrlich benannt, kommende Spätfolgen angekündigt
- **Bugfix Stimmung**: Ereignis- und Kriegs-Effekte auf die Stimmung wurden
  bislang im Folgejahr von der Grundformel überschrieben — jetzt hallen sie
  mit halber Stärke ins nächste Jahr nach und haben echtes Gewicht
- **Pergament-Optik**: Entscheidungen, Folgen-Seite und Botschaften an den Hof
  erscheinen als Pergament mit Eckzier, Zierlinie ❦, pochendem Ereignis-Siegel
  und Ressourcen-Chips (aktueller Stand direkt beim Abwägen sichtbar)
- **Bedienung**: nummerierte Wahl-Knöpfe, Auswahl auch per Zifferntaste 1–3,
  Pergament-Rascheln als Klang

## Version 2.9 — Privilegien, neue Schicksale und die reiche Karte

- **Titel-Privilegien**: jeder Rang bringt einen bleibenden Vorteil — Baron
  (+5 % Steuern), Landgraf (5 % statt 10 % Provision auf Landverkäufe), Markgraf
  (−10 % Baukosten), Fürst (+1 Diplomatie-Aktion), Herzog (−10 % Sold), Kurfürst
  (+3 Reichstagsstimmen), König (+10 % Ernte); verkündet bei der Beförderung,
  gesammelt im Status sichtbar
- **Sechs neue Hof-Ereignisse**: Schweifstern-Omen, reisender Ingenieur (Kammrad-
  Kette: +35–45 % Ernte im Folgejahr), Rittersturnier (selbst in die Schranken
  reiten!), Gesandtschaft einer fernen Großmacht, Goldader im Steinbruch,
  Waldbrand am Forsthof — die letzten drei nur, wenn die Voraussetzung besteht
- **Reichskarte**: Dorfkirche mit goldenem Kreuz und Ziehbrunnen im Zentrum,
  sandiger Uferstreifen entlang der Grenze, und die Felder leben mit der
  Jahreszeit — zarte Saat im Frühling, im Wind wiegendes Korn im Sommer,
  Stoppeln und Garben im Herbst
- **Schlachtfeld**: fahle Sonne und ziehende Wolken über dem Feld, wehende
  Frontfahnen in den Hausfarben an jeder vorrückenden Linie, und Einschläge
  hinterlassen bleibende Brandnarben im Boden
- **Porträts**: drapierte Vorhänge mit Faltenwurf und goldener Kordel in der
  Hausfarbe, das Hauswappen als stilles Emblem, seidene Schärpe ab Fürstenrang

## Version 3.0 — Charakterköpfe, Reichsaufträge und das eigene Wappen

- **Charakterzüge**: jeder Regent — und jeder Erbe — bringt eine eigene Stärke
  mit: Sparsam (−5 % Baukosten), Gelehrt (+1 Diplomatie), Kriegerisch (−5 % Sold),
  Volksnah (+5 Grundstimmung) oder Händlerisch (−3 % Kornprovision); im Status
  sichtbar, Erben würfeln neu — jede Generation regiert anders
- **Reichsaufträge**: der Reichshof stellt immer wieder Aufgaben mit Frist und
  Belohnung — Kornlieferung, Heerschau oder Aufbauwerk; als goldenes Banner im
  Status, automatisch am Jahresende abgerechnet, Versäumnis verstimmt den Hof
- **Klügere Feldherren-KI**: die Computer-Gegner stellen passend zu ihrer
  Truppenmischung auf — Artillerie massiert das Zentrum, Reiterei geht auf die
  Flanken, Fußvolk hält die breite Linie
- **Eigenes Wappen & Hausfarbe**: im Setup frei wählbar (9 Wappen × 9 Farben)
  mit Live-Vorschau auf dem Schild — die Wahl färbt Karten, Fahnen, Porträts
  und Schlachtfeld
- **Mini-Trends**: die Statuskacheln für Vermögen, Land und Untertanen tragen
  winzige Verlaufskurven der letzten Jahre (grün steigend, rot fallend)
- **Baustellen**: Neubauten stehen bis zum Zugende in einem Holzgerüst
  mit Bauarbeiter, ehe der goldene Ring verblasst
