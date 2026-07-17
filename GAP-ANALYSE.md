# GAP-Analyse: Kaiser-Neuimplementierung vs. Original (C64, 1984)

Stand: Juli 2026 · Bezugsversion: `kaiser.html` (moderne UI)

Diese Analyse vergleicht die Neuimplementierung mit dem dokumentierten Funktionsumfang
des C64-Originals. Quellen: C64-Wiki (Hauptartikel und Rombach-Spielbericht),
Wikipedia, Lemon64. Hinweis: Es handelt sich um eine eigenständige Neuimplementierung
der Spielmechanik — Original-Code, -Grafiken und -Texte werden nicht übernommen.
Einzelne Original-Werte sind zwischen Versionen unterschiedlich dokumentiert
(z. B. Palast mit 16 Teilen à 5.000 T laut C64-Wiki vs. 8 Teilen à 5.000 T laut
Rombach-Bericht); wo das der Fall ist, ist es vermerkt.

Legende: ✅ vorhanden · ⚠️ abweichend umgesetzt · ❌ fehlt

## 1. Spielstruktur & Rundenablauf

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Rundenzyklus = 1 Regierungsjahr | ja | ja | ✅ | — |
| Phase 1: Kornausgabe & Korn-/Landhandel | ja | ja | ✅ | — |
| Phase 2: **Zwischenbilanz** direkt nach dem Handel (Geburten, Sterbefälle, Zu-/Abwanderung, Einnahmen/Ausgaben) | ja, eigene Phase mitten in der Runde | Werte werden erst in der Jahresbilanz am Rundenende gezeigt | ⚠️ | P2 |
| Phase 3: Steuern & Justiz | ja | ja | ✅ | — |
| Phase 4: Landkarte | ja | ja (kombiniert mit Bauphase) | ✅ | — |
| Phase 5: Aktionen (Bauen, Krieg) | ja | ja | ✅ | — |
| „Ende des Zuges"-Menü mit Speicheroption | ja (F1) | Export/Import als Datei; Schnellspeichern im Browser, wo verfügbar | ⚠️ | P2 |

## 2. Spieler & Partie

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Mehrspieler-Hotseat | bis zu **9** Spieler | bis zu 9 Spieler | ✅ (mit moderner UI nachgezogen) | — |
| Anrede/Geschlecht je Spieler (Titel-Formen) | ja | ja | ✅ | — |
| Starttitel „Herr/Dame" vor Baron | ja | ja (vorher „Bürger", korrigiert) | ✅ | — |
| Spielstand speichern/laden | ja (Diskette, F1; Autosave bei bestimmten Ereignissen) | Datei-Export/-Import (JSON); Browser-Schnellspeicher wo verfügbar; kein Autosave bei Ereignissen | ⚠️ | P2 |
| Startwerte 15.000 Taler / 10.000 ha | ja | ja (zzgl. 400 Fuder Korn, 2.500 Untertanen als kalibrierte Annahme — Originalwerte nicht dokumentiert) | ⚠️ | P3 |

## 3. Wirtschaft & Handel

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Kornpreis-Spanne 20–430 Taler | ja | ja (mittelwert-reversiver Zufallspfad mit Preisspitzen) | ✅ | — |
| Landpreis-Spanne 16–70 Taler/ha | ja | ja | ✅ | — |
| 10 % Provision auf **alle** Verkäufe | ja (Korn **und** Land) | jetzt auf Korn- und Landverkäufe | ✅ (korrigiert) | — |
| Land-/Kornspekulation als Einnahmequelle | ja, zentral | ja | ✅ | — |
| Ernteertrag wetterabhängig | ja | Zufallsertrag + Ereignisse (Dürre/Rekordernte); kein explizites Saison-/Wettermodell | ⚠️ | P3 |
| Zielkonflikt „Bebauung frisst Ackerland" | ja („wer zubaut, produziert kein Getreide") | abgeschwächt: Bauplätze sind an Landbesitz gekoppelt (1/1.000 ha), reduzieren aber nicht direkt die Anbaufläche | ⚠️ | P2 |

## 4. Steuern & Justiz

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Zölle einstellbar | ja | ja (0–40 %) | ✅ | — |
| Einkommensteuer bis 99 % | ja | jetzt 0–99 % | ✅ (korrigiert) | — |
| Mehrwertsteuer | ja | ja (0–40 %) | ✅ | — |
| Justiz „sehr fair" bis „gierig" | ja | ja (4 Stufen) | ✅ | — |
| Auswirkung auf Stimmung/Migration | ja | ja (eigenes, kalibriertes Modell) | ⚠️ (Formeln des Originals unbekannt) | P3 |

## 5. Bevölkerung

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| „Nötiges Korn" wird angezeigt, Mehrausgabe lockt Einwanderer | ja | ja | ✅ | — |
| Hunger dezimiert Bevölkerung drastisch (bis > 2/3) und drückt Moral | ja | ja (Verhungern + Stimmungseinbruch; Größenordnung kalibriert) | ⚠️ | P3 |
| Geburten/Sterbefälle/Migration | ja | ja | ✅ | — |
| Krankheit/Seuchen | ja | ja (Pest-Ereignis) | ✅ | — |

## 6. Bauwesen

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Markt (1.000 T, 1 je 1.000 ha), bringt Einnahmen + Miliz | ja | ja | ✅ | — |
| Kornmühle (2.000 T), steigert Wirtschaft/Ernte | ja | ja (+5 % Ernte je Mühle, gedeckelt) | ✅ | — |
| Stadt = 5 Märkte + 3 Mühlen | ja | ja | ✅ | — |
| Palast als Voraussetzung für König | ja (16 Teile à 5.000 T lt. C64-Wiki; 8 Teile lt. Rombach) | ja (16 Teile à 5.000 T) | ✅ | — |
| Kathedrale als Voraussetzung für Kaiser | ja (14 Teile à 9.000 T lt. C64-Wiki; 10 à 8.000 lt. Rombach) | ja (14 Teile à 9.000 T) | ✅ | — |
| Palast/Kathedrale wachsen **grafisch** Stück für Stück | ja | Fortschrittsbalken + Kartenkacheln; kein detailliertes Gebäudebild | ⚠️ | P3 |

## 7. Beförderungen & Sieg

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| 8 Beförderungen: Herr → Baron → Landgraf → Markgraf → Fürst → Herzog → Kurfürst → König → Kaiser | ja | ja | ✅ | — |
| Beförderung nur bei positivem Kontostand | ja | ja | ✅ | — |
| Höhere Titel verlangen Bevölkerung, Städte, Bauwerke | ja (exakte Werte nicht dokumentiert) | ja (kalibrierte Schwellen) | ⚠️ | P3 |
| Kaiser: Kathedrale + 100.000 Taler + 25.000 ha + **mind. 5 Städte** | ja | jetzt inkl. 5-Städte-Bedingung | ✅ (korrigiert) | — |
| Beförderungszeremonie mit Musik | ja (SID-Fanfaren, Krönungsmusik) | Zeremonie-Bildschirm, ohne Musik | ⚠️ | P3 |

## 8. Krieg & Diplomatie

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Krieg ab Baron | ja | ja | ✅ | — |
| Einheiten: Infanterie, Kavallerie, Artillerie, Miliz (aus Märkten) | ja | ja | ✅ | — |
| **Diplomatie-Phase:** andere Spieler entscheiden über Unterstützung des Angreifers/Verteidigers, Durchmarschrecht oder Neutralität; Unterstützer verleihen ihre Truppen | ja | fehlt komplett — Krieg ist reines 1-gegen-1 | ❌ | **P1** |
| Nur **angrenzende** Reiche direkt angreifbar (sonst Durchmarschrecht nötig) | ja | fehlt (jeder kann jeden angreifen) | ❌ | P2 |
| Interaktive Schlacht: Truppen mit Fadenkreuz platzieren, Simulation mit sichtbaren Verlusten | ja | Sofortauflösung per Kampfwert + Zufall | ❌ | P2 |
| Stehendes Heer mit laufenden Kosten, Armeekosten steigen mit Rang | ja | Truppen sind Einmal-Söldner pro Feldzug | ❌ | P2 |
| Kriegsfolgen: Landgewinn/Tribut | ja | ja (15 % Landraub bzw. 20 % Tribut) | ⚠️ (Originalwerte unbekannt) | P3 |

## 9. Zeit, Leben & Tod

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Todesjahr zufällig ca. 1760–1768 | ja | ja (Original-Modus; Kurzspiel-Modus zusätzlich) | ✅ | — |
| ~90-Sekunden-Zeitfaktor pro Zug, Überziehen verkürzt das Leben | ja | ja (Timer sichtbar, Überzeit altert den Regenten) | ⚠️ (genaue Original-Formel unbekannt) | P3 |
| Tod beendet die Partie des Spielers | ja | ja (+ Schlusswertung aller Spieler) | ✅ | — |

## 10. Präsentation & Bedienung

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Landkarte mit Gebäuden, Städten, Vermögen, Volksstimmung | ja | ja (Kachelkarte + Statuskarten) | ✅ | — |
| SID-Musik (Fanfaren, Krönung) & Soundeffekte | ja | fehlt komplett | ❌ | P2 |
| Joystick-Menüsteuerung | ja | Maus/Touch (zeitgemäß ersetzt) | ⚠️ gewollt | — |
| Tastatur-Schnellbedienung | teilweise | fehlt (nur Maus/Touch) | ❌ | P3 |
| Retro-Textmodus-Optik | ja | bewusst durch moderne Oberfläche ersetzt (Nutzerentscheidung) | ⚠️ gewollt | — |

## 11. Priorisierte Umsetzungs-Roadmap

**P1 — spielentscheidend, als Nächstes umsetzen:**
Kriegs-Diplomatie (Unterstützung/Neutralität/Truppenverleih der Mitspieler).

**P2 — deutlicher Authentizitäts-Gewinn:**
Zwischenbilanz als eigene Phase nach dem Handel · stehendes Heer mit Unterhalt und
rangabhängigen Kosten · Adjazenz/Durchmarschrecht · interaktivere Schlachtdarstellung ·
Autosave bei Ereignissen · Bebauung konkurriert direkt mit Anbaufläche · Soundkulisse
(Web Audio: Fanfare, Krönung, Schlacht).

**P3 — Feinschliff:**
Saison-/Wettermodell für Ernten · grafisch wachsender Palast/Dom · Tastaturbedienung ·
Feinkalibrierung aller Formeln an Original-Verhalten (sofern durch Vergleichsspiele auf
Emulator ermittelbar) · Zeremonien-Ausbau.

**Bereits im Zuge dieser Analyse geschlossen:**
bis zu 9 Spieler · Starttitel „Herr/Dame" · 10 % Provision auch auf Landverkäufe ·
Einkommensteuer bis 99 % · Kaiser-Bedingung „mindestens 5 Städte" ·
Spielstand-Export/-Import (Datei) + Browser-Schnellspeicher.
