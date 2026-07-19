/* ==========================================================================
   Sim-Kit: wiederverwendbare Bausteine fuer Physik-Simulationen (Kast)
   Vanilla JS, keine Abhaengigkeiten. Alle Funktionen unter window.SimKit.
   ========================================================================== */
"use strict";

window.SimKit = (function () {

	const SCHRIFT = "'Libertinus Sans', 'Segoe UI', system-ui, sans-serif";

	/* Zahl im deutschen Format (Komma), z. B. de(3.14159, 2) -> "3,14" */
	function de(zahl, stellen = 1) {
		return zahl.toFixed(stellen).replace(".", ",");
	}

	/* Canvas scharf auf Geraeteaufloesung skalieren.
	   verhaeltnis: Hoehe/Breite (Funktion von Breite erlaubt, z. B. fuer Mobil-Layout).
	   Gibt {W, H} in CSS-Pixeln zurueck. */
	function skaliereCanvas(canvas, ctx, verhaeltnis = 0.58) {
		const dpr = window.devicePixelRatio || 1;
		const W = canvas.clientWidth || canvas.parentElement.clientWidth || 740;
		const v = typeof verhaeltnis === "function" ? verhaeltnis(W) : verhaeltnis;
		const H = Math.round(W * v);
		canvas.style.height = H + "px";
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		return { W, H };
	}

	/* Schieberegler mit Wertanzeige verbinden.
	   bindeSlider("masse-a", "wert-masse-a", "g", v => zustand.m = v/1000, () => neuZeichnen()) */
	function bindeSlider(sliderId, anzeigeId, einheit, setzer, danach) {
		const el = document.getElementById(sliderId);
		const anzeige = document.getElementById(anzeigeId);
		const update = () => {
			setzer(parseFloat(el.value));
			if (anzeige) anzeige.textContent = el.value + "\u00A0" + einheit;
			if (danach) danach();
		};
		el.addEventListener("input", update);
		return update;
	}

	/* Knopfgruppe (genau einer aktiv) verbinden; Wert steht in data-wert.
	   bindeKnopfgruppe("tempo-knoepfe", w => zustand.tempo = +w) */
	function bindeKnopfgruppe(containerId, setzer, danach) {
		const c = document.getElementById(containerId);
		c.addEventListener("click", ev => {
			const b = ev.target.closest("button");
			if (!b) return;
			setzer(b.dataset.wert);
			c.querySelectorAll("button").forEach(x => x.classList.toggle("aktiv", x === b));
			if (danach) danach();
		});
	}

	/* Achsenkreuz mit Gitter und Beschriftung zeichnen.
	   o = {dx, dy, dw, dh, xMax, yMax, xSchritt, ySchritt, xLabel, xEinheit, yLabel, yEinheit}
	   Gibt Umrechner {xPix, yPix} von Daten- in Pixelkoordinaten zurueck. */
	function zeichneAchsen(ctx, o) {
		ctx.strokeStyle = "#111";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(o.dx, o.dy);
		ctx.lineTo(o.dx, o.dy + o.dh);
		ctx.lineTo(o.dx + o.dw, o.dy + o.dh);
		ctx.stroke();

		ctx.font = "12px " + SCHRIFT;
		ctx.fillStyle = "#111";
		ctx.strokeStyle = "#DDD";
		ctx.lineWidth = 1;
		for (let yw = 0; yw <= o.yMax + 1e-9; yw += o.ySchritt) {
			const py = o.dy + o.dh - (yw / o.yMax) * o.dh;
			if (yw > 0) {
				ctx.beginPath();
				ctx.moveTo(o.dx, py);
				ctx.lineTo(o.dx + o.dw, py);
				ctx.stroke();
			}
			ctx.textAlign = "right";
			ctx.fillText(String(Math.round(yw)), o.dx - 5, py + 4);
		}
		for (let xw = 0; xw <= o.xMax + 1e-9; xw += o.xSchritt) {
			const px = o.dx + (xw / o.xMax) * o.dw;
			if (xw > 0) {
				ctx.beginPath();
				ctx.moveTo(px, o.dy);
				ctx.lineTo(px, o.dy + o.dh);
				ctx.stroke();
			}
			ctx.textAlign = "center";
			ctx.fillText(String(Math.round(xw)), px, o.dy + o.dh + 16);
		}
		ctx.textAlign = "left";
		ctx.font = "italic 13px " + SCHRIFT;
		ctx.fillText(o.yLabel || "", o.dx - 30, o.dy + 6);
		ctx.font = "12px " + SCHRIFT;
		ctx.fillText(o.yEinheit ? "in " + o.yEinheit : "", o.dx - 38, o.dy + 21);
		ctx.font = "italic 13px " + SCHRIFT;
		ctx.fillText(o.xLabel || "", o.dx + o.dw - 8, o.dy + o.dh + 32);
		ctx.font = "12px " + SCHRIFT;
		ctx.fillText(o.xEinheit ? " in " + o.xEinheit : "", o.dx + o.dw - 4, o.dy + o.dh + 32);

		return {
			xPix: xw => o.dx + (xw / o.xMax) * o.dw,
			yPix: yw => o.dy + o.dh - (yw / o.yMax) * o.dh
		};
	}

	/* Funktionsgraph f(t) fuer t in [0, tEnde] zeichnen */
	function zeichneKurve(ctx, umrechner, f, tEnde, farbe, punkte = 240) {
		ctx.strokeStyle = farbe;
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		for (let i = 0; i <= punkte; i++) {
			const t = (i / punkte) * tEnde;
			const px = umrechner.xPix(t);
			const py = umrechner.yPix(f(t));
			if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
		}
		ctx.stroke();
	}

	/* Animationsschleife mit Echtzeit-dt und Zeitraffer.
	   starteSchleife(dt => { zustand.t += dt; zeichne(); return zustand.t < ende; }, () => zustand.tempo)
	   Rueckgabe von false beendet die Schleife. Liefert eine stopp()-Funktion. */
	function starteSchleife(schritt, tempo) {
		let letzter = null;
		let aktiv = true;
		function frame(zeit) {
			if (!aktiv) return;
			if (letzter === null) letzter = zeit;
			const dt = (zeit - letzter) / 1000 * (tempo ? tempo() : 1);
			letzter = zeit;
			if (schritt(dt) === false) { aktiv = false; return; }
			requestAnimationFrame(frame);
		}
		requestAnimationFrame(frame);
		return () => { aktiv = false; };
	}

	/* Neu zeichnen, sobald die eingebettete Schrift geladen ist */
	function nachFontLaden(zeichne) {
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => zeichne());
	}

	return { SCHRIFT, de, skaliereCanvas, bindeSlider, bindeKnopfgruppe, zeichneAchsen, zeichneKurve, starteSchleife, nachFontLaden };
})();
