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
- Animierte Schlachten mit Gefechtsprotokoll, Kampfkraftbalken und Sound
- Begrenzte Lebenszeit (Todesjahr ca. 1760–1768) und 90-Sekunden-Zeitfaktor pro Zug
- Zwischenbilanz-Phase, Wettermodell für Ernten, wachsende SVG-Monumente
- Web-Audio-Soundkulisse (abschaltbar), Konfetti-Zeremonien, Enter-Taste als Hauptaktion
- Zwei Modi: Original (lange Partie) und Kurzspiel

## Lizenz

MIT
