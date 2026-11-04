	/* Messtabelle: tbody fuellen (Kast 2026-11-04)
	   - × entfernt einen einzelnen Messwert
	   - Zeile antippen: als Ausreißer markieren (grau, Nummer in Klammern); zählt dann
	     nicht für Diagramm und Regression, erneutes Antippen nimmt ihn wieder auf
	   - Rückgängig-Knopf neben dem Papierkorb nimmt die letzte Änderung zurück
	   this.zeilen enthält immer nur die gültigen Messwerte. */
	function Messtabelle(tbodyId) {
		this.koerper = document.getElementById(tbodyId);
		this.zeilen = [];
		this.alle = [];
		this.verlauf = [];
		this.stil();
		(window.kastMesstabellen = window.kastMesstabellen || []).push(this);
		const box = this.koerper.closest(".tcb-body"), alleMuell = document.querySelectorAll('button[data-icon="muell"]');
		const muell = (box && box.querySelector('button[data-icon="muell"]')) || (alleMuell.length === 1 ? alleMuell[0] : null);
		if (muell) {
			const b = document.createElement("button");
			b.type = "button"; b.className = "neben"; b.disabled = true;
			b.className = "neben ik"; b.title = "Rückgängig: letzte Änderung der Tabelle zurücknehmen"; b.setAttribute("aria-label", b.title);
			b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>';
			b.addEventListener("click", () => this.rueckgaengig());
			muell.parentNode.insertBefore(b, muell);
			this.knopfZurueck = b;
		}
	}
	Messtabelle.prototype.stil = function () {
		if (document.getElementById("stil-messtabelle")) return;
		const st = document.createElement("style"); st.id = "stil-messtabelle";
		st.textContent = "td.weg { width: 1.8rem; padding: 0 0.1rem !important; border: none !important; text-align: center !important; }"
			+ "button.zeile-weg { min-width: 0; width: 1.6rem; height: 1.6rem; padding: 0; border: 1px solid #ccc; border-radius: 50%; background: #fff; color: #999; font-size: 1rem; line-height: 1; cursor: pointer; }"
			+ "button.zeile-weg:hover { color: #BF0000; border-color: #BF0000; }"
			+ "tr.messzeile { cursor: pointer; }"
			+ "tr.messzeile:hover td:not(.weg) { background: #F4F6FF; }"
			+ "tr.ausreisser td:not(.weg) { color: #A0A0A0; text-decoration: line-through; text-decoration-color: #C8C8C8; }"
			+ "@media print { td.weg { display: none; } }";
		document.head.appendChild(st);
	};
	Messtabelle.prototype.neu = function () {
		this.zeilen.length = 0;
		this.alle.forEach((a, k) => {
			a.tr.firstChild.textContent = a.aus ? "(" + (k + 1) + ")" : String(k + 1);
			a.tr.classList.toggle("ausreisser", a.aus);
			a.tr.title = a.aus ? "Ausreißer: zählt nicht. Antippen nimmt den Messwert wieder auf." : "Antippen: als Ausreißer markieren";
			if (!a.aus) this.zeilen.push(a.eintrag);
		});
		if (this.knopfZurueck) this.knopfZurueck.disabled = !this.verlauf.length;
	};
	Messtabelle.prototype.zeichne = function () {
		for (const f of ["aktualisiere", "zeichneDiagramm"]) if (typeof window[f] === "function") { window[f](); break; }
	};
	Messtabelle.prototype.hinzu = function (werte, roh) {
		const a = { eintrag: roh || werte, aus: false, tr: document.createElement("tr") };
		const tr = a.tr; tr.className = "messzeile";
		const nr = document.createElement("td"); tr.appendChild(nr);
		for (const w of werte) { const td = document.createElement("td"); td.innerHTML = w; tr.appendChild(td); }
		const weg = document.createElement("td"); weg.className = "weg";
		const b = document.createElement("button"); b.type = "button"; b.className = "zeile-weg"; b.textContent = "×";
		b.title = "Diesen Messwert entfernen"; b.setAttribute("aria-label", "Diesen Messwert entfernen");
		b.addEventListener("click", ev => {
			ev.stopPropagation();
			const i = this.alle.indexOf(a);
			if (i < 0) return;
			this.alle.splice(i, 1); tr.remove();
			this.verlauf.push({ art: "weg", a, i });
			this.neu(); this.zeichne();
		});
		weg.appendChild(b); tr.appendChild(weg);
		tr.addEventListener("click", () => {
			a.aus = !a.aus;
			this.verlauf.push({ art: "aus", a });
			this.neu(); this.zeichne();
		});
		this.koerper.appendChild(tr);
		this.alle.push(a);
		this.verlauf.push({ art: "hinzu", a });
		this.neu();
	};
	Messtabelle.prototype.rueckgaengig = function () {
		const v = this.verlauf.pop();
		if (!v) return;
		if (v.art === "hinzu") { const i = this.alle.indexOf(v.a); if (i >= 0) this.alle.splice(i, 1); v.a.tr.remove(); }
		else if (v.art === "weg") { this.koerper.insertBefore(v.a.tr, this.alle[v.i] ? this.alle[v.i].tr : null); this.alle.splice(v.i, 0, v.a); }
		else if (v.art === "aus") v.a.aus = !v.a.aus;
		this.neu(); this.zeichne();
	};
	/* für „Zuletzt gewählt“: Inhalt sichern und wiederherstellen */
	Messtabelle.prototype.sichern = function () {
		return this.alle.map(a => ({ w: Array.from(a.tr.children).slice(1, -1).map(td => [td.innerHTML, td.className]), r: a.eintrag, aus: a.aus }));
	};
	Messtabelle.prototype.wiederherstellen = function (liste) {
		this.leeren();
		for (const z of liste) {
			this.hinzu(z.w.map(x => x[0]), z.r);
			const a = this.alle[this.alle.length - 1];
			Array.from(a.tr.children).slice(1, -1).forEach((td, i) => { if (z.w[i] && z.w[i][1]) td.className = z.w[i][1]; });
			a.aus = !!z.aus;
		}
		this.verlauf = [];
		this.neu(); this.zeichne();
	};
	Messtabelle.prototype.leeren = function () { this.alle = []; this.verlauf = []; this.koerper.innerHTML = ""; this.neu(); };
