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

  // ➤ 1) Nach Rückleitung: Capture aufrufen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const orderId = localStorage.getItem("paypal_orderId");
    if (sessionId && orderId) {
      fetch("https://backend-o16g.onrender.com/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProAccess(true);
            localStorage.removeItem("paypal_orderId");
            localStorage.removeItem("paypal_sessionId");
          } else {
            console.error("Capture-Fehler:", data.error);
          }
        })
        .catch((err) => console.error("Capture-Request fehlgeschlagen:", err));
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handlePosChange = (i, field, val) => {
    const ps = [...positions];
    ps[i][field] = field === "beschreibung" ? val : parseFloat(val);
    setPositions(ps);
  };
  const addPosition = () =>
    setPositions([...positions, { beschreibung: "", menge: 1, preis: 0 }]);
  const calcSum = () => {
    const netto = positions.reduce((sum, p) => sum + p.menge * p.preis, 0);
    const mwst = netto * 0.19;
    return { netto, mwst, brutto: netto + mwst };
  };

  // ➤ 2) Checkout starten
  const handlePayPalCheckout = async () => {
    try {
      const res = await fetch(
        "https://backend-o16g.onrender.com/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const { url, orderId, sessionId } = await res.json();
      console.log("▶️ Checkout session:", { url, orderId, sessionId });
      localStorage.setItem("paypal_orderId", orderId);
      localStorage.setItem("paypal_sessionId", sessionId);
      window.location.href = url;
    } catch (e) {
      console.error("Checkout-Fehler:", e);
      alert("Checkout konnte nicht gestartet werden.");
    }
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
      const ges = p.menge * p.preis;
      doc.text(String(i + 1), 20, y);
      doc.text(p.beschreibung, 35, y);
      doc.text(String(p.menge), 110, y);
      doc.text(`${p.preis.toFixed(2)} €`, 140, y);
      doc.text(`${ges.toFixed(2)} €`, 170, y);
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
        "Kostenlose Version. Bitte kaufen Sie Pro über PayPal.",
        20,
        y + 30
      );
    }
    doc.save(`Rechnung_${form.rechnungsnummer}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Rechnung erstellen
      </h1>
      {/* Firmen/Kunde */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label>Firma</label>
          <input
            name="firma"
            value={form.firma}
            onChange={handleChange}
            className="input"
          />
          <label className="mt-2">Adresse</label>
          <input
            name="adresse"
            value={form.adresse}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label>Kunde</label>
          <input
            name="kunde"
            value={form.kunde}
            onChange={handleChange}
            className="input"
          />
          <label className="mt-2">Kundenadresse</label>
          <input
            name="kundenadresse"
            value={form.kundenadresse}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>
      {/* Datum/Nummer */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label>Datum</label>
          <input
            type="date"
            name="datum"
            value={form.datum}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label>Rechnungsnummer</label>
          <input
            name="rechnungsnummer"
            value={form.rechnungsnummer}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>
      {/* Positionen */}
      <h2 className="text-xl font-semibold mt-6">Positionen</h2>
      {positions.map((p, i) => (
        <div key={i} className="grid grid-cols-3 gap-4 mt-2">
          <input
            placeholder="Beschreibung"
            value={p.beschreibung}
            onChange={(e) => handlePosChange(i, "beschreibung", e.target.value)}
            className="input"
          />
          <input
            type="number"
            placeholder="Menge"
            value={p.menge}
            onChange={(e) => handlePosChange(i, "menge", e.target.value)}
            className="input"
          />
          <input
            type="number"
            placeholder="Preis (€)"
            value={p.preis}
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

      {/* Kauf-Button */}
      {!proAccess && (
        <div className="text-center mt-6">
          <button
            onClick={handlePayPalCheckout}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
          >
            💳 Pro-Version kaufen – 4,99 €
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
