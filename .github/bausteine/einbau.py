"""Kast-Design 2026-11 in Simulationen einbauen oder erneuern.

Aufruf:  py einbau.py <datei.html> [weitere.html ...]
Setzt den Block <style id="kast-design"> + <script id="kast-design-js"> direkt vor </head>
(fehlt </head>, dann vor <body>). Ein vorhandener Block wird ersetzt, sonst nichts verändert.
Die Dateien kast_design.css und kast_design.js müssen neben diesem Skript liegen.
"""
import os, re, sys
hier = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(hier, "kast_design.css"), encoding="utf-8").read()
js = open(os.path.join(hier, "kast_design.js"), encoding="utf-8").read()
block = '<style id="kast-design">\n' + css + '</style>\n<script id="kast-design-js">\n' + js + '</script>\n'
for pfad in sys.argv[1:]:
    s = open(pfad, encoding="utf-8").read()
    if 'name="kast-weiterleitung"' in s:
        print("Weiterleitung, übersprungen:", pfad); continue
    s = re.sub(r'<style id="kast-design">[\s\S]*?</script>\n', "", s)
    i = s.find("</head>")
    if i < 0: i = s.find("<body")
    if i < 0: print("kein </head> und kein <body>:", pfad); continue
    s = s[:i] + block + s[i:]
    open(pfad, "w", encoding="utf-8", newline="\n").write(s)
    print("eingebaut:", pfad)
