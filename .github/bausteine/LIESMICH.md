# Gemeinsame Bausteine der Simulationen (Kast-Design 2026-11)

Diese Bausteine stecken heute in allen Simulationen der Klasse 12 und gelten für jede neue oder überarbeitete Simulation. Die Datei `musterseite.html` zeigt alles auf einer Seite. Vor jeder Arbeit an einer Simulation öffnen und daran messen.

| Datei | Was | Wie einbauen |
|---|---|---|
| `kast_design.css` + `kast_design.js` | Bediensystem: Rollen der Knöpfe, Werte in drei Stufen, Regler in Größenfarbe, Eingabelücken, Rückmeldungen, einklappbares Modell, Messgeräte (`KastMessgeraet`), Wertkarten aus Code (`KastWerte`) | `py einbau.py <datei.html>` setzt den Block vor `</head>` oder erneuert ihn |
| `regler_tippen.html` | Reglerwert antippen und als Zahl eintippen | Inhalt vor `</body>` einfügen |
| `zustand_merken.html` | „Zuletzt gewählt“ im Sitzungsspeicher des Tabs | Inhalt vor `</body>` einfügen |
| `messtabelle.js` | Messtabelle mit ×, Ausreißer (Zeile antippen), Rückgängig, Sichern/Wiederherstellen | ersetzt die Funktion `Messtabelle` in SimPlus |

Ändert sich ein Baustein, wird er hier geändert und mit `einbau.py` (bzw. Suchen und Ersetzen) in **alle** Dateien übertragen, nie nur in einer Datei angepasst.

## Bediensystem: Rollen statt Einzelstile

Jedes Bedienelement hat genau eine Rolle. Die Rolle bestimmt das Aussehen, nicht die einzelne Datei.

| Rolle | Aussehen | Markup |
|---|---|---|
| **Modus** | Segmentleiste über dem Kasten, hellblaue Schale, aktiver Modus blau gefüllt | `.modusleiste > button[data-modus]` |
| **Hauptaktion** (eine pro Kasten) | blau gefüllt, fett, Symbol und ein Wort; nur Symbol → runder Knopf (▶) | `button.haupt` |
| **Auswahl** (eins aus mehreren) | Segmente in einer grauen Schale, aktiv weiß mit blauem Rahmen | ≥ 2 Knöpfe mit `data-wert` oder `.aktiv` in `.knopfleiste`/`.knopfreihe`/`div.kn`, sonst nichts darin; der Baustein erkennt das selbst (`.k-wahl`) |
| **Schalter** (Anzeigen ein/aus) | Pille mit Leuchtpunkt, an = blau getönt | `label.chip > input[type=checkbox]` |
| **Gerät ein/aus** (Strom, Quelle) | bernstein wie eine Kontrollleuchte | `.schalter-an` |
| **Bewegung** (Tempo, Schritt) | dunkel wie ein Gerätegehäuse | `button.beweg` |
| **Werkzeug** (Zurücksetzen, Kopieren, Herunterladen, Papierkorb, Rückgängig) | kleine graue Symbole **unter dem Bild rechts**, nie im Bild | `.bildleiste > button.neben` |

Regeln:

- **Piktogramm, wo es reicht.** Ein kurzes Wort dazu, wenn das Symbol allein nicht eindeutig ist. Bedeutung immer in `title` und `aria-label`.
- **Nichts springt.** Aktive Knöpfe werden nicht fett und ändern ihre Breite nicht.
- **Gruppen** mit kleinem grauem Titel darüber (`.bgruppe > .btitel`).
- **Wenig Regler.** Nur Größen, die der Schüler wirklich verändern soll. Alles, was im Blatt vorkommt, muss einstellbar sein, aber nichts doppelt.

## Werte: drei Stufen

1. **Hauptwert:** die Größe, um die es geht. Betonte Wertkarte (`.wertkarte.betont`), groß, blauer Rahmen. Höchstens eine, selten zwei pro Kasten.
2. **Nebenwerte:** Zwischenergebnisse und eingestellte Werte. Normale Wertkarten; ganz Nebensächliches (R², Achsenabschnitt) als `.wertkarte.klein`.
3. **Hinweise:** klein und grau. Bedienhinweise („Ziehen Sie …“) bleiben sichtbar (`p.fussnote`). Modellannahmen, Maßstab, Vereinfachungen und Rechenwege stehen eingeklappt in `<details class="mehr"><summary>Modell</summary><div class="mehr-inhalt">…</div></details>`.

Wertkarten, die der Code füllt: `KastWerte.karten(element, [{titel, wert, betont, klein}], mehrHtml, mehrTitel, nachHtml)`. Der Zustand von „Mehr“ bleibt beim ständigen Neuzeichnen erhalten. Urteile nach einer Auswertung als `p.urteil.gut`, `p.urteil.schlecht` oder `p.urteil.neutral`.

Kein Wert steht doppelt (nicht zugleich im Messgerät, in einer Karte und im Text).

## Farben

- **Größen** wie im TikZ-Farbschema der Blätter: plus #E03030, minus #3050E0, *F* #BF0000, *E* #D46A00, *B* #00838F, *v* #2E8B3A, *p* #8D5524, *a* #C2185B, *I* #6A3D9A, Potential blau → violett → rot. Formelzeichen mit `i.gr.gB`, `.gI`, `.gE`, `.gF`, `.gv` usw.
- **Regler** übernehmen die Farbe ihrer Größe automatisch (erkannt am Namen: Flussdichte, Stromstärke, Feldstärke, Geschwindigkeit, Kraft) oder ausdrücklich mit `data-groesse="B"`. Spannung, Länge, Masse, Zeit bleiben im Bedienblau.
- **Bedienung** blau #0000BF, sonst neutral grau. Rückmeldung grün #2E7D32 / rot #C62828.

## Messgeräte

Alle Anzeigen in Bildern mit dem gemeinsamen Gerät, nie mehr eigene schwarze Kästen mit grüner Schrift:

```js
KastMessgeraet.digital(ctx, x, y, { text: "12,0", einheit: "kV", titel: "Spannung", groesse: 18, stellen: 4, farbe: "#E03030", buchsen: true, anker: "mitte" | "links" | "rechts", ohneGehaeuse: false, aus: false });
KastMessgeraet.waage(ctx, x, yTeller, { text: "312,47", einheit: "g", breite: 160, stellen: 6, titel: "Digitalwaage" });
```

Siebensegment-Ziffern auf grünlichem LCD, Gehäuse mit Schatten, farbiger Streifen in der Farbe der gemessenen Größe. `ohneGehaeuse` setzt nur die Anzeige in ein selbst gezeichnetes Gerät. Beide geben die Maße zurück, damit Leitungen an der Gehäusekante enden.

## Eingabelücken

`input[type=number]` oder `input.eingabe`, rechtsbündig, tabellarische Ziffern, Einheit dahinter als `span.einheit` (mit dem Feld in einem `nowrap`-Element). Nach dem Prüfen `.richtig` (grün) oder `.falsch` (rot).

## Aufbau eines Kastens (immer diese Reihenfolge)

1. Auftrag (`p.auftrag`): ein bis zwei Sätze, was zu tun ist
2. Bild (Canvas)
3. Werkzeugleiste direkt darunter rechts
4. Werte (Hauptwert zuerst)
5. Bedienung: Auswahl, Regler, Schalter
6. Hauptaktion
7. Bedienhinweis klein, dann „Modell“ eingeklappt

## Prüfen

Desktop 1100 px und Handy 375 px, jeder Modus, Tabellen gefüllt. Keine Fehler in der Konsole, kein waagrechtes Scrollen, nichts überdeckt sich. Bei Code-Aufräumarbeiten Vorher-nachher-Vergleich des Canvas bei festem Zufall und fester Zeit.
