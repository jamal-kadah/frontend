import React, { createContext, useState, useEffect } from "react";
import { auth, provider, signInWithPopup, signOut } from "./firebaseConfig";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);
  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
