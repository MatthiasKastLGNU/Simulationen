# -*- coding: utf-8 -*-
"""Übersichtsseiten des Repos Simulationen erzeugen (läuft als GitHub Action bei jedem Push).

Aufruf im Wurzelordner des Repos:  python .github/index/erzeugen.py
Liest Klasse_<nn>/*.html (Titel aus <title>), Kapitelnamen aus .github/index/kapitel.json
und das Layout aus .github/index/vorlage.html; schreibt index.html und Klasse_<nn>/index.html.

Quelle dieser Datei: Documents/0_Einstellungen/Skript/simulationen_index/ (dort bearbeiten,
dann simulationen_index.py ausführen, das lädt sie hoch).
"""
import glob, html, json, os, re

HIER = os.path.dirname(os.path.abspath(__file__))


def titel_aus(text, fallback):
    m = re.search(r"<title>(.*?)</title>", text or "", re.S | re.I)
    t = html.unescape(m.group(1)).strip() if m else fallback
    t = re.sub(r"\s*[–—-]\s*Simulation\s*$", "", t)
    t = re.sub(r"^[A-Z]\.\d+(\.\d+)?\s+", "", t)
    return " ".join(t.split())


def simulationen():
    sims = []
    for pfad in sorted(glob.glob("Klasse_*/*.html")):
        pfad = pfad.replace("\\", "/")
        m = re.match(r"^Klasse_(\d+)/([^/]+)\.html$", pfad)
        if not m or m.group(2) == "index":
            continue
        klasse, datei = m.groups()
        n = re.match(r"^([A-Z])\.(\d+)\.(\d+)(?:_(gA|eA\d*))?_(.+)$", datei)
        text = open(pfad, encoding="utf-8", errors="replace").read()
        sims.append({
            "k": klasse,
            "pfad": pfad,
            "titel": titel_aus(text, (n.group(5) if n else datei).replace("_", " ")),
            "kap": n.group(1) if n else "",
            "abs": f"{n.group(1)}.{n.group(2)}" if n else "",
            "ab": f"{n.group(1)}.{n.group(2)}.{n.group(3)}" if n else "",
            "niveau": (n.group(4) or "") if n else "",
        })
    return sims


def seite(vorlage, daten, start, praefix):
    return (vorlage.replace("/*DATEN*/null", json.dumps(daten, ensure_ascii=False, separators=(",", ":")))
                   .replace("/*START*/''", json.dumps(start))
                   .replace("/*PRAEFIX*/''", json.dumps(praefix))
                   .replace("@@CSS@@", praefix + "libertinus.css"))


def schreiben(pfad, inhalt):
    alt = open(pfad, encoding="utf-8").read() if os.path.exists(pfad) else None
    if alt != inhalt:
        os.makedirs(os.path.dirname(pfad) or ".", exist_ok=True)
        open(pfad, "w", encoding="utf-8", newline="\n").write(inhalt)
        print("geändert:", pfad)


def main():
    sims = simulationen()
    kapitel = json.load(open(os.path.join(HIER, "kapitel.json"), encoding="utf-8"))
    vorlage = open(os.path.join(HIER, "vorlage.html"), encoding="utf-8").read()
    klassen = sorted({s["k"] for s in sims}, key=int)
    daten = {"klassen": {k: kapitel.get(k, {}) for k in klassen}, "sims": sims}
    schreiben("index.html", seite(vorlage, daten, "", ""))
    for k in klassen:
        schreiben(f"Klasse_{k}/index.html", seite(vorlage, daten, k, "../"))
    # Übersicht einer Klasse, die keine Simulationen mehr hat, entfernen
    for alt in glob.glob("Klasse_*/index.html"):
        if re.match(r"Klasse_(\d+)", alt).group(1) not in klassen:
            os.remove(alt)
            print("entfernt:", alt)
    print(f"{len(sims)} Simulationen, Klassen {', '.join(klassen)}")


if __name__ == "__main__":
    main()
