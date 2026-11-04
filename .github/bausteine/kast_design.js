/* Kast-Design 2026-11: Rollen zuweisen, Reglerschiene füllen, einheitliches Messgerät */
(() => {
	document.documentElement.classList.add("kd");

	/* ---------------- Digitalmessgerät für Canvas-Bilder ----------------
	   KastMessgeraet.digital(ctx, x, y, {text, einheit, titel, groesse, farbe, aus, buchsen, anker})
	   (x, y) ist die Mitte (anker "mitte"), sonst "links"/"rechts" an der Gehäusekante.
	   Gibt {x, y, b, h} des Gehäuses zurück. */
	const SEG = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc",
		"7": "abc", "8": "abcdefg", "9": "abcfgd", "-": "g", "−": "g", " ": "", "E": "afged", "r": "eg", "o": "cdeg",
		"L": "fed", "A": "abcefg", "H": "bcefg", "P": "abefg", "U": "bcdef", "n": "ceg", "t": "fged", "F": "aefg", "C": "adef" };
	function segmente(ctx, x, y, h, zeichen, farbe, geist) {
		const w = h * 0.54, t = Math.max(1.5, h * 0.13), g = Math.max(0.6, t * 0.12), k = 0.1;
		const quer = yc => { const x0 = t / 2 + g, x1 = w - t / 2 - g;
			return [[x0, yc], [x0 + t / 2, yc - t / 2], [x1 - t / 2, yc - t / 2], [x1, yc], [x1 - t / 2, yc + t / 2], [x0 + t / 2, yc + t / 2]]; };
		const hoch = (xc, y0, y1) => { y0 += g; y1 -= g;
			return [[xc, y0], [xc + t / 2, y0 + t / 2], [xc + t / 2, y1 - t / 2], [xc, y1], [xc - t / 2, y1 - t / 2], [xc - t / 2, y0 + t / 2]]; };
		const o = t / 2, m = h / 2, u = h - t / 2, l = t / 2, r = w - t / 2;
		const S = { a: quer(o), g: quer(m), d: quer(u), f: hoch(l, o, m), b: hoch(r, o, m), e: hoch(l, m, u), c: hoch(r, m, u) };
		ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, -k, 1, k * h, 0);
		const male = (s, f) => { ctx.fillStyle = f; ctx.beginPath(); S[s].forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); };
		if (geist) for (const s of "abcdefg") male(s, geist);
		for (const s of (SEG[zeichen] || "")) male(s, farbe);
		ctx.restore();
		return w;
	}
	function rr(ctx, x, y, b, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, b, h, r); else ctx.rect(x, y, b, h); }
	const SCHRIFT = "'Libertinus Sans', 'Segoe UI', system-ui, sans-serif";
	function digital(ctx, x, y, o) {
		o = o || {};
		const h = o.groesse || 22, text = String(o.text == null ? "" : o.text).replace(/−/g, "-");
		const einheit = o.einheit || "", aus = !!o.aus;
		const pad = h * 0.32, w = h * 0.54, sp = h * 0.2, komma = h * 0.2;
		/* Zeichen zerlegen: Komma/Punkt hängt am vorigen Ziffernfeld */
		const z = []; for (const c of text) { if ((c === "," || c === ".") && z.length) z[z.length - 1].k = true; else z.push({ c, k: false }); }
		const stellen = Math.max(o.stellen || 0, z.length);
		while (z.length < stellen) z.unshift({ c: " ", k: false });
		const zifB = stellen * (w + sp) - sp + komma * 0.4;
		ctx.save();
		const fE = Math.round(h * 0.5);
		ctx.font = "600 " + fE + "px " + SCHRIFT;
		const eB = einheit ? ctx.measureText(einheit).width + pad * 0.7 : 0;
		const lB = zifB + eB + pad * 2 + h * 0.1, lH = h + pad * 2;
		const fT = Math.max(10, Math.round(h * 0.42));
		const nackt = !!o.ohneGehaeuse, rand = nackt ? 0 : h * 0.3, kopf = nackt ? 0 : o.titel ? Math.max(h * 0.62, fT * 1.45) : rand;
		let tB = 0; if (o.titel && !nackt) { ctx.font = fT + "px " + SCHRIFT; tB = ctx.measureText(o.titel).width + h * 0.5; }
		const gB = Math.max(lB + rand * 2, tB), gH = lH + kopf + rand + (o.buchsen && !nackt ? h * 0.75 : 0);
		let gx = x - gB / 2; if (o.anker === "links") gx = x; else if (o.anker === "rechts") gx = x - gB;
		const gy = o.oben ? y : y - (kopf + lH / 2);
		/* Gehäuse */
		if (!nackt) {
		ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = h * 0.35; ctx.shadowOffsetY = h * 0.08;
		const gg = ctx.createLinearGradient(0, gy, 0, gy + gH); gg.addColorStop(0, "#474D56"); gg.addColorStop(1, "#272B31");
		ctx.fillStyle = gg; rr(ctx, gx, gy, gB, gH, h * 0.32); ctx.fill();
		ctx.shadowColor = "transparent";
		ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 1; rr(ctx, gx + 0.5, gy + 0.5, gB - 1, gH - 1, h * 0.3); ctx.stroke();
		if (o.farbe) { ctx.fillStyle = o.farbe; rr(ctx, gx + h * 0.25, gy + gH - h * 0.13, gB - h * 0.5, h * 0.07, h * 0.04); ctx.fill(); }
		if (o.titel) {
			ctx.fillStyle = "#D9DEE5"; ctx.font = fT + "px " + SCHRIFT; ctx.textAlign = "left"; ctx.textBaseline = "middle";
			ctx.fillText(o.titel, gx + Math.max(rand, h * 0.25), gy + kopf * 0.55);
		}
		}
		/* Anzeige (reflektierendes LCD) */
		const lx = gx + (gB - lB) / 2, ly = gy + kopf;
		const lg = ctx.createLinearGradient(0, ly, 0, ly + lH);
		if (aus) { lg.addColorStop(0, "#9AA493"); lg.addColorStop(1, "#8C9685"); } else { lg.addColorStop(0, "#D3DEC3"); lg.addColorStop(1, "#BBC9A6"); }
		ctx.fillStyle = lg; rr(ctx, lx, ly, lB, lH, h * 0.14); ctx.fill();
		ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1; rr(ctx, lx + 0.5, ly + 0.5, lB - 1, lH - 1, h * 0.13); ctx.stroke();
		ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(lx + 2, ly + 2, lB - 4, lH * 0.18);
		const tinte = "#141C0E", geist = aus ? null : "rgba(20,28,14,0.06)";
		let cx = lx + pad;
		const cy = ly + pad;
		for (const e of z) {
			if (!aus) {
				if (SEG[e.c] !== undefined) segmente(ctx, cx, cy, h, e.c, tinte, geist);
				else { ctx.fillStyle = tinte; ctx.font = "bold " + Math.round(h) + "px " + SCHRIFT; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(e.c, cx, cy); }
				if (e.k) { ctx.fillStyle = tinte; ctx.beginPath(); ctx.arc(cx + w + sp * 0.35, cy + h - h * 0.07, h * 0.08, 0, 7); ctx.fill(); }
			}
			cx += w + sp;
		}
		if (einheit && !aus) {
			ctx.fillStyle = tinte; ctx.font = "600 " + fE + "px " + SCHRIFT; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
			ctx.fillText(einheit, lx + lB - pad * 0.8, cy + h - h * 0.02);
		}
		/* Buchsen */
		if (o.buchsen && !nackt) {
			const by = ly + lH + h * 0.48;
			for (const [bx, f] of [[gx + gB * 0.3, "#C62828"], [gx + gB * 0.7, "#1A1A1A"]]) {
				ctx.fillStyle = f; ctx.beginPath(); ctx.arc(bx, by, h * 0.2, 0, 7); ctx.fill();
				ctx.fillStyle = "#0B0B0B"; ctx.beginPath(); ctx.arc(bx, by, h * 0.08, 0, 7); ctx.fill();
			}
		}
		ctx.restore();
		return { x: gx, y: gy, b: gB, h: gH, lcd: { x: lx, y: ly, b: lB, h: lH } };
	}
	/* Digitalwaage: (x, y) = Mitte der Telleroberseite; {text, einheit, breite, titel, stellen} */
	function waage(ctx, x, y, o) {
		o = o || {};
		const b = o.breite || 140, th = Math.max(4, b * 0.045), tb = b * 0.62, hb = Math.max(26, b * 0.27), yk = y + th + Math.max(3, b * 0.03);
		ctx.save();
		/* Teller */
		const gt = ctx.createLinearGradient(0, y, 0, y + th);
		gt.addColorStop(0, "#F1F3F6"); gt.addColorStop(1, "#A9B0BA");
		ctx.fillStyle = gt; ctx.strokeStyle = "#7A828D"; ctx.lineWidth = 1;
		rr(ctx, x - tb / 2, y, tb, th, th / 2); ctx.fill(); ctx.stroke();
		ctx.fillStyle = "#8A929C"; ctx.fillRect(x - b * 0.05, y + th, b * 0.1, yk - y - th);
		/* Gehäuse */
		ctx.shadowColor = "rgba(0,0,0,0.22)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
		const gg = ctx.createLinearGradient(0, yk, 0, yk + hb);
		gg.addColorStop(0, "#F5F6F8"); gg.addColorStop(1, "#C6CCD4");
		ctx.fillStyle = gg; rr(ctx, x - b / 2, yk, b, hb, Math.min(8, hb * 0.25)); ctx.fill();
		ctx.shadowColor = "transparent"; ctx.strokeStyle = "#7A828D"; ctx.lineWidth = 1; rr(ctx, x - b / 2 + 0.5, yk + 0.5, b - 1, hb - 1, Math.min(8, hb * 0.25)); ctx.stroke();
		ctx.fillStyle = "#3C4148"; ctx.fillRect(x - b / 2 + 3, yk + hb - 3, b - 6, 1.2);
		const gr = Math.round(Math.min(hb * 0.42, b * 0.13));
		const m = digital(ctx, x - b * 0.06, yk + hb * 0.48, { text: o.text, einheit: o.einheit, groesse: gr, stellen: o.stellen, ohneGehaeuse: true, aus: o.aus });
		/* Tara-Taste */
		const tx = Math.min(x + b / 2 - hb * 0.32, m.x + m.b + (x + b / 2 - m.x - m.b) / 2);
		ctx.fillStyle = "#3C4148"; ctx.beginPath(); ctx.arc(tx, yk + hb * 0.48, Math.max(3.5, hb * 0.13), 0, 7); ctx.fill();
		ctx.fillStyle = "#E8EAED"; ctx.font = "bold " + Math.max(7, Math.round(hb * 0.15)) + "px " + SCHRIFT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
		ctx.fillText("T", tx, yk + hb * 0.49);
		if (o.titel) { ctx.fillStyle = "#555B63"; ctx.font = "12px " + SCHRIFT; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(o.titel, x, yk + hb + 5); }
		ctx.restore();
		return { x: x - b / 2, y: y, b: b, h: yk + hb - y, unten: yk + hb };
	}
	/* Zeigermessgerät: KastMessgeraet.analog(ctx, x, y, {wert, min, max, teile, fein, beschrift, einheit, titel, breite, farbe, unten, buchsen, anker, oben})
	   Skala von min bis max (bei min = −max Nullpunkt in der Mitte), teile Hauptstriche, fein Zwischenstriche je Teil,
	   beschrift(w) liefert die Zahl an einem Hauptstrich (Standard: Betrag, deutsch). unten: kleine Zeile unter der Skala (z. B. „Messbereich 30 mV“).
	   (x, y) ist die Mitte (anker "mitte"), sonst "links"/"rechts" an der Gehäusekante; oben: y ist die Oberkante. Gibt {x, y, b, h, buchsen} zurück. */
	function analog(ctx, x, y, o) {
		o = o || {};
		const b = o.breite || 150, min = o.min == null ? -1 : o.min, max = o.max == null ? 1 : o.max, sp = max - min || 1;
		const teile = o.teile || 4, fein = o.fein || 5;
		const fT = Math.max(10, Math.round(b * 0.075)), rand = b * 0.06;
		const kopf = o.titel ? Math.max(b * 0.13, fT * 1.6) : rand;
		const fB = b - 2 * rand, fH = b * 0.5;
		const fuss = (o.unten ? Math.max(b * 0.1, fT * 1.5) : rand) + (o.buchsen ? b * 0.14 : 0) + (o.farbe ? b * 0.03 : 0);
		const gH = kopf + fH + fuss;
		let gx = x - b / 2; if (o.anker === "links") gx = x; else if (o.anker === "rechts") gx = x - b;
		const gy = o.oben ? y : y - gH / 2;
		ctx.save();
		/* Gehäuse wie beim Digitalgerät */
		ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = b * 0.06; ctx.shadowOffsetY = b * 0.015;
		const gg = ctx.createLinearGradient(0, gy, 0, gy + gH); gg.addColorStop(0, "#474D56"); gg.addColorStop(1, "#272B31");
		ctx.fillStyle = gg; rr(ctx, gx, gy, b, gH, b * 0.06); ctx.fill();
		ctx.shadowColor = "transparent";
		ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 1; rr(ctx, gx + 0.5, gy + 0.5, b - 1, gH - 1, b * 0.055); ctx.stroke();
		if (o.titel) { ctx.fillStyle = "#D9DEE5"; ctx.font = fT + "px " + SCHRIFT; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(o.titel, gx + rand, gy + kopf * 0.52); }
		/* Skalenblatt */
		const fx = gx + rand, fy = gy + kopf;
		const fg = ctx.createLinearGradient(0, fy, 0, fy + fH); fg.addColorStop(0, "#FDFCF7"); fg.addColorStop(1, "#ECE8DC");
		ctx.fillStyle = fg; rr(ctx, fx, fy, fB, fH, b * 0.03); ctx.fill();
		ctx.strokeStyle = "rgba(0,0,0,0.4)"; rr(ctx, fx + 0.5, fy + 0.5, fB - 1, fH - 1, b * 0.028); ctx.stroke();
		const px = fx + fB / 2, py = fy + fH * 0.9, R = fH * 0.72, halb = 0.30 * Math.PI;
		const winkel = w => -Math.PI / 2 - halb + (w - min) / sp * 2 * halb;
		ctx.save(); rr(ctx, fx, fy, fB, fH, b * 0.03); ctx.clip();
		/* Spiegelband */
		ctx.strokeStyle = "rgba(150,160,175,0.35)"; ctx.lineWidth = R * 0.05;
		ctx.beginPath(); ctx.arc(px, py, R * 0.86, winkel(min), winkel(max)); ctx.stroke();
		/* Skalenbogen und Striche */
		ctx.strokeStyle = "#1E2228"; ctx.lineWidth = Math.max(1, b * 0.007);
		ctx.beginPath(); ctx.arc(px, py, R, winkel(min), winkel(max)); ctx.stroke();
		const n = teile * fein, deu = v => (Math.round(v * 1000) / 1000).toString().replace(".", ",");
		const beschrift = o.beschrift || (v => deu(Math.abs(v)));
		ctx.fillStyle = "#1E2228"; ctx.font = Math.max(9, Math.round(b * 0.068)) + "px " + SCHRIFT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
		for (let i = 0; i <= n; i++) {
			const v = min + sp * i / n, a = winkel(v), haupt = i % fein === 0, mitte = !haupt && fein % 2 === 0 && i % (fein / 2) === 0;
			const l = haupt ? R * 0.13 : mitte ? R * 0.09 : R * 0.055;
			ctx.lineWidth = haupt ? Math.max(1.2, b * 0.009) : Math.max(0.8, b * 0.005);
			ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * R, py + Math.sin(a) * R); ctx.lineTo(px + Math.cos(a) * (R - l), py + Math.sin(a) * (R - l)); ctx.stroke();
			if (haupt) ctx.fillText(beschrift(v), px + Math.cos(a) * R * 1.13, py + Math.sin(a) * R * 1.13);
		}
		/* Einheit rechts unten im Blatt: dort kommt der Zeiger nie hin */
		if (o.einheit) { ctx.font = "600 " + Math.max(10, Math.round(b * 0.085)) + "px " + SCHRIFT; ctx.fillText(o.einheit, px + R * 0.7, py - R * 0.12); }
		/* Zeiger mit Schatten */
		const wv = Math.max(min - sp * 0.04, Math.min(max + sp * 0.04, +o.wert || 0)), az = winkel(wv), lz = R * 1.02;
		ctx.lineCap = "round";
		ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = Math.max(1.6, b * 0.013);
		ctx.beginPath(); ctx.moveTo(px + 1.5, py + 2); ctx.lineTo(px + 1.5 + Math.cos(az) * lz, py + 2 + Math.sin(az) * lz); ctx.stroke();
		ctx.strokeStyle = "#C62828";
		ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(az) * lz, py + Math.sin(az) * lz); ctx.stroke();
		const kg = ctx.createRadialGradient(px - b * 0.01, py - b * 0.01, 0, px, py, b * 0.045);
		kg.addColorStop(0, "#6B7380"); kg.addColorStop(1, "#1E2228");
		ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(px, py, b * 0.04, 0, 7); ctx.fill();
		/* Glas */
		const glas = ctx.createLinearGradient(0, fy, 0, fy + fH * 0.45); glas.addColorStop(0, "rgba(255,255,255,0.5)"); glas.addColorStop(1, "rgba(255,255,255,0)");
		ctx.fillStyle = glas; ctx.fillRect(fx, fy, fB, fH * 0.45);
		ctx.restore();
		let yy = fy + fH;
		if (o.unten) { ctx.fillStyle = "#C9CFD8"; ctx.font = fT + "px " + SCHRIFT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.unten, gx + b / 2, yy + Math.max(b * 0.1, fT * 1.5) / 2); yy += Math.max(b * 0.1, fT * 1.5); } else yy += rand;
		const buchsen = [];
		if (o.buchsen) {
			const by = yy + b * 0.06;
			for (const [bx, f] of [[gx + b * 0.3, "#C62828"], [gx + b * 0.7, "#1A1A1A"]]) {
				ctx.fillStyle = f; ctx.beginPath(); ctx.arc(bx, by, b * 0.04, 0, 7); ctx.fill();
				ctx.fillStyle = "#0B0B0B"; ctx.beginPath(); ctx.arc(bx, by, b * 0.016, 0, 7); ctx.fill();
				buchsen.push([bx, by]);
			}
		}
		if (o.farbe) { ctx.fillStyle = o.farbe; rr(ctx, gx + b * 0.05, gy + gH - b * 0.035, b * 0.9, b * 0.014, b * 0.008); ctx.fill(); }
		ctx.restore();
		return { x: gx, y: gy, b: b, h: gH, buchsen };
	}
	window.KastMessgeraet = { digital, waage, analog };

	/* ---------------- Wertkarten aus Code ----------------
	   KastWerte.karten(el, [{titel, wert, betont, klein}], mehrHtml, mehrTitel)
	   Hauptwert betont, Nebenwerte normal; Zusatzinfos in einem einklappbaren „Mehr“,
	   dessen Zustand beim ständigen Neuzeichnen erhalten bleibt. */
	function karten(el, liste, mehr, mehrTitel, nach) {
		if (!el) return;
		el.classList.add("kd-werte");
		let reihe = el.querySelector(":scope > .wertkarten"), det = el.querySelector(":scope > details.mehr");
		if (!reihe) { el.innerHTML = ""; reihe = document.createElement("div"); reihe.className = "wertkarten"; el.appendChild(reihe); det = null; }
		const html = liste.filter(Boolean).map(k => '<div class="wertkarte' + (k.betont ? " betont" : "") + (k.klein ? " klein" : "") + '"><div class="wk-titel">' + k.titel + '</div><div class="wk-wert">' + k.wert + "</div></div>").join("");
		if (reihe.innerHTML !== html) reihe.innerHTML = html;
		let na = el.querySelector(":scope > .kd-nach");
		if (nach) { if (!na) { na = document.createElement("div"); na.className = "kd-nach"; reihe.after(na); } if (na.innerHTML !== nach) na.innerHTML = nach; }
		else if (na) na.remove();
		if (mehr) {
			if (!det) { det = document.createElement("details"); det.className = "mehr"; det.innerHTML = '<summary></summary><div class="mehr-inhalt"></div>'; el.appendChild(det); }
			const t = mehrTitel || "Details";
			if (det.firstChild.textContent !== t) det.firstChild.textContent = t;
			if (det.lastChild.innerHTML !== mehr) det.lastChild.innerHTML = mehr;
		} else if (det) det.remove();
	}
	window.KastWerte = { karten };

	/* ---------------- Rollen der Knöpfe ---------------- */
	const ROLLE = ["haupt", "neben", "symbol", "beweg", "pfeil", "zeile-weg"];
	const hatRolle = b => ROLLE.some(k => b.classList.contains(k));
	function rollen(wurzel) {
		/* data-schalter: Anzeige ein/aus, Zustand steht im Code als .aktiv/.an → aria-pressed daraus spiegeln (2026-11-04) */
		wurzel.querySelectorAll("button[data-schalter]").forEach(b => {
			const an = String(b.classList.contains("aktiv") || b.classList.contains("an"));
			if (b.getAttribute("aria-pressed") !== an) b.setAttribute("aria-pressed", an);
		});
		const behaelter = wurzel.querySelectorAll(".knopfleiste, .knopfreihe, div.kn, .ik-leiste");
		behaelter.forEach(k => {
			if (k.closest(".modusleiste, .bildleiste") || k.classList.contains("modusleiste") || k.classList.contains("bildleiste")) return;
			const kinder = Array.from(k.children);
			const bs = kinder.filter(e => e.tagName === "BUTTON" && !hatRolle(e));
			const fremd = kinder.filter(e => !(e.tagName === "BUTTON" && !hatRolle(e)) && !(e.tagName === "SPAN" && !e.textContent.trim()));
			const schalt = bs.filter(b => b.hasAttribute("aria-pressed"));
			const wahl = bs.length >= 2 && fremd.length === 0 && schalt.length === 0 && bs.some(b => b.classList.contains("aktiv") || b.dataset.wert !== undefined || b.dataset.modus !== undefined);
			k.classList.toggle("k-wahl", wahl);
			k.classList.toggle("k-schaltgruppe", schalt.length > 0 && schalt.length === bs.length);
			bs.forEach(b => { const s = b.hasAttribute("aria-pressed"); b.classList.toggle("k-schalt", s); b.classList.toggle("k-einzel", !wahl && !s); });
		});
		wurzel.querySelectorAll("button.wahl").forEach(b => {
			const k = b.parentElement;
			if (k && !k.classList.contains("k-wahl") && Array.from(k.children).every(e => e.tagName === "BUTTON" && e.classList.contains("wahl"))) k.classList.add("k-wahl");
		});
		wurzel.querySelectorAll("button.haupt").forEach(b => b.classList.toggle("k-rund", !b.textContent.trim() && b.querySelectorAll("svg").length === 1));
	}
	/* ---------------- Reglerfarbe nach Größe (TikZ-Farbschema) ----------------
	   Nur Größen mit eigener Farbe; Spannung, Länge, Masse, Zeit bleiben im Bedienblau. */
	const GROESSE = [
		[/flussdichte|magnetfeld|umlenkfeld|filter-magnetfeld|\bB\b/i, "B"],
		[/stromst[äa]rke|spulenstrom|\bI\b/i, "I"],
		[/feldst[äa]rke|\bE-feld/i, "E"],
		[/geschwindigkeit|str[öo]mung/i, "v"],
		[/kraft\b/i, "F"]];
	function reglerText(r) {
		const z = r.closest(".zeile"), lb = z && z.querySelector(":scope > label");
		const gr = r.closest(".bgruppe, div.gr, .regler");
		const t = gr && gr.querySelector(".btitel, .gtitel, .gt");
		return [lb && lb.textContent, t && t.textContent, r.getAttribute("aria-label")].filter(Boolean).join(" ");
	}
	function reglerFarbe(r) {
		if (r.dataset.kdFarbe) return;
		const txt = reglerText(r).replace(/\s+/g, " ");
		let g = r.dataset.groesse || null;
		if (g === "-") g = null;
		/* <html data-groessenfarben="aus">: Blätter dieser Stufe zeichnen noch nicht im TikZ-Farbschema → Regler bleiben blau */
		else if (!g && document.documentElement.dataset.groessenfarben !== "aus") for (const [re, k] of GROESSE) if (re.test(txt) && !/energie|spannung|winkel|richtung|zeit|abstand|l[äa]nge|masse|unsicherheit|leistung/i.test(txt.split(" ")[0])) { g = k; break; }
		r.dataset.kdFarbe = g || "-";
		if (!g) return;
		r.style.setProperty("--spur", "var(--f-" + g + ")");
		const z = r.closest(".zeile"), gr = r.closest(".bgruppe, div.gr, .regler");
		const ort = (z && z.querySelector(":scope > label")) || (gr && gr.querySelector(".btitel, .gtitel, .gt"));
		if (ort) ort.querySelectorAll("i.gr").forEach(i => { if (i.textContent.trim() === g) i.classList.add("g" + g); });
	}
	/* ---------------- Reglerschiene ---------------- */
	function schiene(r) {
		const a = +r.min || 0, b = r.max === "" ? 100 : +r.max, v = +r.value;
		const p = b > a ? (v - a) / (b - a) * 100 : 0;
		const s = p.toFixed(2) + "%"; if (r.style.getPropertyValue("--anteil") !== s) r.style.setProperty("--anteil", s);
	}
	const alleSchienen = () => document.querySelectorAll('input[type="range"]').forEach(r => { reglerFarbe(r); schiene(r); });
	function los() {
		rollen(document);
		alleSchienen();
		document.addEventListener("input", e => { if (e.target.type === "range") schiene(e.target); }, true);
		setInterval(alleSchienen, 400);
		let warte = null;
		new MutationObserver(ms => {
			if (ms.every(m => m.target.closest && m.target.closest("table"))) return;
			clearTimeout(warte); warte = setTimeout(() => { rollen(document); alleSchienen(); }, 30);
		}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "aria-pressed"] });
		const start = Date.now();
		new MutationObserver(ms => {
			if (Date.now() - start < 2000) return;
			for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.matches && n.matches("tr.messzeile")) {
				n.classList.add("neu"); setTimeout(() => n.classList.remove("neu"), 1300);
			}
		}).observe(document.body, { childList: true, subtree: true });
	}
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();
