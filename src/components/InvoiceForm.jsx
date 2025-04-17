import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

export default function InvoiceForm() {
  const [form, setForm] = useState({
    firma: "Beispiel GmbH",
    adresse: "Musterstraße 1, 12345 Musterstadt",
    kunde: "Max Mustermann",
    kundenadresse: "Kundenstraße 2, 12345 Kundencity",
    datum: new Date().toISOString().split("T")[0],
    rechnungsnummer: "RG-1001",
  });
  const [positions, setPositions] = useState([
    { beschreibung: "", menge: 1, preis: 0 },
  ]);
  const [proAccess, setProAccess] = useState(false);

  // Prüft nach Rückleitung von PayPal, ob Pro-Zugang gekauft wurde
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      fetch(
        `https://rechnung-backend.onrender.com/paypal/validate?session_id=${sessionId}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setProAccess(true);
          }
        });
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePosChange = (i, field, value) => {
    const newPos = [...positions];
    newPos[i][field] = field === "beschreibung" ? value : parseFloat(value);
    setPositions(newPos);
  };

  const addPosition = () =>
    setPositions([...positions, { beschreibung: "", menge: 1, preis: 0 }]);

  const calcSum = () => {
    const netto = positions.reduce((sum, p) => sum + p.menge * p.preis, 0);
    const mwst = netto * 0.19;
    return { netto, mwst, brutto: netto + mwst };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(form.firma, 20, 20);
    doc.text(form.adresse, 20, 26);
    doc.text(form.kunde, 20, 40);
    doc.text(form.kundenadresse, 20, 46);
    doc.setFontSize(14);
    doc.text("Rechnung", 20, 70);
    doc.setFontSize(12);
    doc.text(`Rechnungsnummer: ${form.rechnungsnummer}`, 20, 80);
    doc.text(`Datum: ${form.datum}`, 20, 86);

    let y = 100;
    doc.text("Pos", 20, y);
    doc.text("Beschreibung", 35, y);
    doc.text("Menge", 110, y);
    doc.text("Einzelpreis", 140, y);
    doc.text("Gesamt", 170, y);
    y += 10;

    positions.forEach((p, i) => {
      const gesamt = p.menge * p.preis;
      doc.text(String(i + 1), 20, y);
      doc.text(p.beschreibung, 35, y);
      doc.text(String(p.menge), 110, y);
      doc.text(`${p.preis.toFixed(2)} €`, 140, y);
      doc.text(`${gesamt.toFixed(2)} €`, 170, y);
      y += 10;
    });

    const { netto, mwst, brutto } = calcSum();
    y += 5;
    doc.text(`Zwischensumme: ${netto.toFixed(2)} €`, 140, y);
    doc.text(`MwSt (19%): ${mwst.toFixed(2)} €`, 140, y + 6);
    doc.text(`Gesamtsumme: ${brutto.toFixed(2)} €`, 140, y + 12);

    if (!proAccess) {
      doc.setTextColor(200, 0, 0);
      doc.setFontSize(10);
      doc.text(
        "Dies ist eine kostenlose Version. Bitte kaufen Sie Pro über PayPal.",
        20,
        y + 30
      );
    }

    doc.save(`Rechnung_${form.rechnungsnummer}.pdf`);
  };

  // Bezahlung mit PayPal starten
  const handlePayPalCheckout = async () => {
    const res = await fetch(
      "https://rechnung-backend.onrender.com/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await res.json();
    window.location.href = data.url; // PayPal Weiterleitung
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Rechnung erstellen
      </h1>

      {/* Felder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block">Firma</label>
          <input
            type="text"
            name="firma"
            value={form.firma}
            onChange={handleChange}
            className="input"
          />
          <label className="block mt-2">Adresse</label>
          <input
            type="text"
            name="adresse"
            value={form.adresse}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="block">Kunde</label>
          <input
            type="text"
            name="kunde"
            value={form.kunde}
            onChange={handleChange}
            className="input"
          />
          <label className="block mt-2">Kundenadresse</label>
          <input
            type="text"
            name="kundenadresse"
            value={form.kundenadresse}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      {/* Datum & Rechnungsnummer */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block">Datum</label>
          <input
            type="date"
            name="datum"
            value={form.datum}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="block">Rechnungsnummer</label>
          <input
            type="text"
            name="rechnungsnummer"
            value={form.rechnungsnummer}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      {/* Positionen */}
      <h2 className="text-xl font-semibold mt-6">Positionen</h2>
      {positions.map((pos, i) => (
        <div key={i} className="grid grid-cols-3 gap-4 mt-2">
          <input
            placeholder="Beschreibung"
            value={pos.beschreibung}
            onChange={(e) => handlePosChange(i, "beschreibung", e.target.value)}
            className="input"
          />
          <input
            type="number"
            placeholder="Menge"
            value={pos.menge}
            onChange={(e) => handlePosChange(i, "menge", e.target.value)}
            className="input"
          />
          <input
            type="number"
            placeholder="Preis (€)"
            value={pos.preis}
            onChange={(e) => handlePosChange(i, "preis", e.target.value)}
            className="input"
          />
        </div>
      ))}
      <button
        onClick={addPosition}
        className="bg-gray-200 mt-3 px-3 py-1 rounded"
      >
        + Neue Position
      </button>

      {/* Bezahlbutton */}
      {!proAccess && (
        <div className="text-center mt-6">
          <button
            onClick={handlePayPalCheckout}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
          >
            💳 Pro-Version kaufen – 4,99 €
          </button>
        </div>
      )}

      {/* PDF-Button */}
      <div className="text-center mt-8">
        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          📄 PDF generieren
        </button>
      </div>
    </div>
  );
}
