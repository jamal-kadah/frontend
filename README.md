
# Rechnung Pro App

## 🔧 Projekt starten

```bash
npm install
npm run dev
```

## 📦 Ordnerstruktur

- `src/` – React-Komponenten
- `public/index.html` – Einstiegspunkt
- `InvoiceForm.jsx` – Rechnungslogik mit PDF und PayPal

## 💳 PayPal Integration

- Testmodus via Backend-Endpoint `/create-checkout-session`
- Unlock nach Redirect `?paid=success`

## 📄 PDF: jsPDF mit Wasserzeichen (wenn nicht Pro)
