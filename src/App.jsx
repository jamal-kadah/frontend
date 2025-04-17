// src/App.jsx
import React, { useContext } from "react";
import { AuthContext, AuthProvider } from "./AuthContext";
import InvoiceForm from "./components/InvoiceForm";

function AppInner() {
  const { user, login, logout } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {!user ? (
        <div className="text-center mt-20">
          <h1 className="text-3xl mb-4">Bitte anmelden</h1>
          <button
            onClick={login}
            className="bg-red-500 text-white px-6 py-2 rounded"
          >
            Mit Google anmelden
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>Angemeldet als: {user.email}</div>
            <button onClick={logout} className="text-sm text-gray-600">
              Abmelden
            </button>
          </div>
          <InvoiceForm user={user} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
