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
