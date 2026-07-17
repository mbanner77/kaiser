# GAP-Analyse: Kaiser-Neuimplementierung vs. Original (C64, 1984)

Stand: Juli 2026 · Bezugsversion: `kaiser.html` (moderne UI, Ausbaustufe 3)

> **Update Ausbaustufe 3:** Alle in dieser Analyse identifizierten Lücken sind
> umgesetzt (Status in den Tabellen aktualisiert). Wo das Original nicht exakt
> dokumentiert ist oder Joystick-Bedienung zeitgemäß ersetzt wurde, ist die
> Umsetzung als „interpretiert" gekennzeichnet.

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
| Phase 2: **Zwischenbilanz** direkt nach dem Handel (Geburten, Sterbefälle, Zu-/Abwanderung, Einnahmen/Ausgaben) | ja, eigene Phase mitten in der Runde | eigene Zwischenbilanz-Phase nach dem Handel; Bevölkerungsereignisse (Pest, Siedler) erscheinen dort | ✅ | erledigt |
| Phase 3: Steuern & Justiz | ja | ja | ✅ | — |
| Phase 4: Landkarte | ja | ja (kombiniert mit Bauphase) | ✅ | — |
| Phase 5: Aktionen (Bauen, Krieg) | ja | ja | ✅ | — |
| „Ende des Zuges"-Menü mit Speicheroption | ja (F1) | Export/Import als Datei; automatischer Schnellspeicher nach jedem Zug, jeder Schlacht und jedem Jahresabschluss | ✅ | erledigt |

## 2. Spieler & Partie

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Mehrspieler-Hotseat | bis zu **9** Spieler | bis zu 9 Spieler | ✅ (mit moderner UI nachgezogen) | — |
| Anrede/Geschlecht je Spieler (Titel-Formen) | ja | ja | ✅ | — |
| Starttitel „Herr/Dame" vor Baron | ja | ja (vorher „Bürger", korrigiert) | ✅ | — |
| Spielstand speichern/laden | ja (Diskette, F1; Autosave bei bestimmten Ereignissen) | Datei-Export/-Import (JSON); Browser-Schnellspeicher; Autosave nach Zug, Schlacht und Jahresabschluss | ✅ | erledigt |
| Startwerte 15.000 Taler / 10.000 ha | ja | ja (zzgl. 400 Fuder Korn, 2.500 Untertanen als kalibrierte Annahme — Originalwerte nicht dokumentiert) | ⚠️ | P3 |

## 3. Wirtschaft & Handel

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Kornpreis-Spanne 20–430 Taler | ja | ja (mittelwert-reversiver Zufallspfad mit Preisspitzen) | ✅ | — |
| Landpreis-Spanne 16–70 Taler/ha | ja | ja | ✅ | — |
| 10 % Provision auf **alle** Verkäufe | ja (Korn **und** Land) | jetzt auf Korn- und Landverkäufe | ✅ (korrigiert) | — |
| Land-/Kornspekulation als Einnahmequelle | ja, zentral | ja | ✅ | — |
| Ernteertrag wetterabhängig | ja | gewichtetes Wettermodell mit 6 Lagen (Dürre bis Prachtjahr), sichtbar in der Jahresbilanz | ✅ | erledigt |
| Zielkonflikt „Bebauung frisst Ackerland" | ja („wer zubaut, produziert kein Getreide") | Gebäude, Palast und Dom verringern die Anbaufläche direkt; Anbaufläche wird im Status und auf der Karte ausgewiesen | ✅ | erledigt |

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
| Palast/Kathedrale wachsen **grafisch** Stück für Stück | ja | SVG-Monumente wachsen Teil für Teil (inkl. Dach/Turmkreuz bei Vollendung) | ✅ | erledigt |

## 7. Beförderungen & Sieg

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| 8 Beförderungen: Herr → Baron → Landgraf → Markgraf → Fürst → Herzog → Kurfürst → König → Kaiser | ja | ja | ✅ | — |
| Beförderung nur bei positivem Kontostand | ja | ja | ✅ | — |
| Höhere Titel verlangen Bevölkerung, Städte, Bauwerke | ja (exakte Werte nicht dokumentiert) | ja (kalibrierte Schwellen) | ⚠️ | P3 |
| Kaiser: Kathedrale + 100.000 Taler + 25.000 ha + **mind. 5 Städte** | ja | jetzt inkl. 5-Städte-Bedingung | ✅ (korrigiert) | — |
| Beförderungszeremonie mit Musik | ja (SID-Fanfaren, Krönungsmusik) | Zeremonie mit Konfetti-Animation und eigener Web-Audio-Fanfare; Krönung mit erweiterter Melodie | ✅ | erledigt |

## 8. Krieg & Diplomatie

| Funktion | Original | Neuimplementierung | Status | Priorität |
|---|---|---|---|---|
| Krieg ab Baron | ja | ja | ✅ | — |
| Einheiten: Infanterie, Kavallerie, Artillerie, Miliz (aus Märkten) | ja | ja | ✅ | — |
| **Diplomatie-Phase:** andere Spieler entscheiden über Unterstützung des Angreifers/Verteidigers, Durchmarschrecht oder Neutralität; Unterstützer verleihen ihre Truppen | ja | vor jeder Schlacht wird jeder übrige Regent am Gerät befragt (Angreifer/Verteidiger unterstützen, neutral, Durchmarsch gewähren/verweigern); Unterstützer schicken ihr stehendes Heer, die Miliz bleibt daheim; Verluste treffen auch Verbündete | ✅ | erledigt |
| Nur **angrenzende** Reiche direkt angreifbar (sonst Durchmarschrecht nötig) | ja | Sitzreihenfolge = Nachbarschaftskreis; Feldzüge gegen Nicht-Nachbarn brauchen Durchmarschrechte aller Reiche auf dem Weg, sonst bricht der Feldzug ab | ✅ | erledigt |
| Interaktive Schlacht: Truppen mit Fadenkreuz platzieren, Simulation mit sichtbaren Verlusten | ja (Joystick) | animierte Rundenschlacht: 6 Gefechte mit Live-Einheitenzählern, Kampfkraftbalken, Gefechtsprotokoll, Trommeln/Schlachtenlärm, überspringbar; Joystick-Platzierung bewusst zeitgemäß ersetzt | ✅ interpretiert | erledigt |
| Stehendes Heer mit laufenden Kosten, Armeekosten steigen mit Rang | ja | stehendes Heer (Infanterie/Kavallerie/Artillerie) mit jährlichem Sold, +10 % je Titelstufe; bei leerer Kasse desertieren Söldner; Heer auflösbar | ✅ | erledigt |
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
| SID-Musik (Fanfaren, Krönung) & Soundeffekte | ja | eigene Web-Audio-Klänge: Fanfare, Krönungsmelodie, Münzklang, Trommeln, Schlachtenlärm, Totenglocke; abschaltbar (🔊/🔇) | ✅ interpretiert | erledigt |
| Joystick-Menüsteuerung | ja | Maus/Touch (zeitgemäß ersetzt) | ⚠️ gewollt | — |
| Tastatur-Schnellbedienung | teilweise | Enter löst stets die Hauptaktion aus; Maus/Touch vollständig | ✅ | erledigt |
| Retro-Textmodus-Optik | ja | bewusst durch moderne Oberfläche ersetzt (Nutzerentscheidung) | ⚠️ gewollt | — |

## 11. Umsetzungsstand

**Ausbaustufe 2 (moderne UI):**
bis zu 9 Spieler · Starttitel „Herr/Dame" · 10 % Provision auch auf Landverkäufe ·
Einkommensteuer bis 99 % · Kaiser-Bedingung „mindestens 5 Städte" ·
Spielstand-Export/-Import (Datei) + Browser-Schnellspeicher.

**Ausbaustufe 3 (alle verbleibenden Gaps):**
Kriegs-Diplomatie mit Truppenverleih · Nachbarschaftskreis mit Durchmarschrecht ·
animierte Schlachten mit Gefechtsprotokoll · stehendes Heer mit rangabhängigem Sold
und Desertion · Zwischenbilanz als eigene Phase · Bebauung konkurriert mit
Anbaufläche · Wettermodell für die Ernte · Web-Audio-Soundkulisse (abschaltbar) ·
grafisch wachsende SVG-Monumente · Konfetti-Zeremonien · Tastatur (Enter) ·
Autosave nach Zug, Schlacht und Jahresabschluss.

**Verbleibende bewusste Abweichungen:**
Maus/Touch statt Joystick · moderne Oberfläche statt Textmodus (Nutzerentscheidung) ·
alle nicht dokumentierten Original-Formeln sind eigenständig kalibriert (eine exakte
Angleichung wäre nur durch Vergleichsspiele auf dem Emulator möglich).

**Ausbaustufe 4 (v2.3, über das Original hinaus):**
Baustoff-Wirtschaft (Holz/Stein, Forsthöfe, Steinbrüche) · Festungen mit
Belagerungsphase (Sturm/Beschuss/Aushungern) · Heiratspolitik mit Erbansprüchen ·
Handelsrouten mit Karawanen-Darstellung · Kampagnenmodus in vier Kapiteln ·
Statistik-Dashboard · asynchroner Online-Mehrspieler (Server speichert Partien,
Wiedereinstieg per Code + Name).

**Ausbaustufe 5 (v2.4):**
Festungswerke sichtbar im Schlachtbild (Breschen, Einschläge) · Ereignisketten mit
Spätfolgen · Reichstag mit gewichteten Abstimmungen und Bestechung · Partien-Browser,
Beobachtermodus und Partien-Merkliste · Mobile-Layout mit Touch-Zielen ·
Tutorial „Die Lehrjahre" · jahreszeitliches Klang-Ambiente · Partie-Replay im Zeitraffer.
