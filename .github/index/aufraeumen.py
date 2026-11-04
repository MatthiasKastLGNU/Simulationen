# -*- coding: utf-8 -*-
"""Auslaufende Simulationen markieren, anzeigen und nach Ablauf löschen.

Eine auslaufende Simulation trägt im <head> die Zeile
    <meta name="kast-auslauf" content="JJJJ-MM-TT">
Sie fehlt dann in der Übersicht, bleibt aber unter ihrer Adresse erreichbar, damit
QR-Codes auf alten Arbeitsblättern weiter funktionieren. Ab dem Datum wird sie gelöscht.

Aufrufe im Wurzelordner des Repos:
    python .github/index/aufraeumen.py                     Liste aller auslaufenden Dateien
    python .github/index/aufraeumen.py markieren DATEI...  Auslauf in zwei Jahren eintragen
    python .github/index/aufraeumen.py loeschen            Abgelaufene löschen (macht der Workflow)
"""
import datetime, glob, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from erzeugen import AUSLAUF, auslaufdatum

JAHRE = 2


def auslaufend():
    for pfad in sorted(glob.glob("Klasse_*/*.html")):
        pfad = pfad.replace("\\", "/")
        if pfad.endswith("/index.html"):
            continue
        d = auslaufdatum(open(pfad, encoding="utf-8", errors="replace").read())
        if d:
            yield pfad, d


def markieren(pfade, heute):
    try:
        ziel = heute.replace(year=heute.year + JAHRE)
    except ValueError:  # 29. Februar
        ziel = heute.replace(year=heute.year + JAHRE, day=28)
    zeile = f'<meta name="kast-auslauf" content="{ziel.isoformat()}">'
    for pfad in pfade:
        text = open(pfad, encoding="utf-8").read()
        if AUSLAUF.search(text):
            print("schon markiert:", pfad, auslaufdatum(text))
            continue
        neu, n = re.subn(r'(<meta\s+charset="[^"]*"\s*/?>)', r"\1\n" + zeile, text, count=1, flags=re.I)
        if not n:
            neu, n = re.subn(r"(<head[^>]*>)", r"\1\n" + zeile, text, count=1, flags=re.I)
        if not n:
            sys.exit(f"kein <head> gefunden: {pfad}")
        open(pfad, "w", encoding="utf-8", newline="").write(neu)
        print("markiert:", pfad, "löschen ab", ziel.isoformat())


def main():
    heute = datetime.date.today()
    befehl = sys.argv[1] if len(sys.argv) > 1 else "liste"
    if befehl == "markieren":
        markieren(sys.argv[2:], heute)
    elif befehl == "loeschen":
        weg = [p for p, d in auslaufend() if d <= heute.isoformat()]
        for p in weg:
            os.remove(p)
            print("gelöscht:", p)
        print(f"{len(weg)} abgelaufene Simulation(en) gelöscht")
    else:
        for p, d in auslaufend():
            print(d, "abgelaufen" if d <= heute.isoformat() else "", p)


if __name__ == "__main__":
    main()
