# -*- coding: utf-8 -*-
"""Alte Simulation durch eine Weiterleitung auf die neue (zusammengelegte) Simulation ersetzen.

Damit funktionieren QR-Codes alter Arbeitsblätter weiter und landen direkt im richtigen Modus.
Weiterleitungen tragen <meta name="kast-weiterleitung"> und erscheinen nicht in der Übersicht.

Aufruf im Wurzelordner des Repos:
    python .github/index/weiterleitung.py ALT.html NEU.html [ALT-PARAMETER->NEU-PARAMETER ...]

Beispiel:
    python .github/index/weiterleitung.py Klasse_12/A.1.4_eA2_Feld_auf_der_Achse.html \
        Klasse_12/A.1.4_eA2_Superposition.html "->?modus=achse" "?station=dreieck->?modus=dreieck"

Jede Zuordnung heißt "Parameter der alten Adresse->Parameter der neuen Adresse" (links leer: Aufruf
ohne Parameter). Nicht aufgeführte Parameter werden unverändert weitergereicht, der Anker (#…) immer.
"""
import html, json, os, re, sys


def stub(ziel, zuordnung, titel):
    standard = zuordnung.get("", "")
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="kast-weiterleitung" content="{html.escape(ziel)}">
<meta name="robots" content="noindex">
<title>{html.escape(titel)}</title>
<meta http-equiv="refresh" content="1; url={html.escape(ziel + standard)}">
<script>
(function () {{
	var zuordnung = {json.dumps(zuordnung, ensure_ascii=False)};
	var q = location.search;
	var neu = Object.prototype.hasOwnProperty.call(zuordnung, q) ? zuordnung[q] : q;
	location.replace({json.dumps(ziel)} + neu + location.hash);
}})();
</script>
</head>
<body style="font-family: system-ui, sans-serif; margin: 2rem;">
<p>Die Simulation ist umgezogen: <a href="{html.escape(ziel + standard)}">{html.escape(titel)}</a></p>
</body>
</html>
"""


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    alt, neu = sys.argv[1], sys.argv[2]
    if os.path.dirname(alt) != os.path.dirname(neu):
        sys.exit("Alt und neu müssen in derselben Klasse liegen.")
    if not os.path.exists(neu):
        sys.exit(f"Ziel fehlt: {neu}")
    zuordnung = {}
    for z in sys.argv[3:]:
        links, pfeil, rechts = z.partition("->")
        if not pfeil:
            sys.exit(f"Zuordnung ohne '->': {z}")
        zuordnung[links.strip()] = rechts.strip()
    m = re.search(r"<title>(.*?)</title>", open(neu, encoding="utf-8").read(), re.S)
    titel = html.unescape(m.group(1)).strip() if m else os.path.basename(neu)
    open(alt, "w", encoding="utf-8", newline="\n").write(stub(os.path.basename(neu), zuordnung, titel))
    print("Weiterleitung:", alt, "->", neu, zuordnung)


if __name__ == "__main__":
    main()
