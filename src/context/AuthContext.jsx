import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedUser = localStorage.getItem("volleywood_user");
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const resData = await response.json();

      if (response.ok && resData.status === "success") {
        localStorage.setItem("volleywood_user", JSON.stringify(resData.data));
        setUser(resData.data);
        return { success: true };
      } else {
        return {
          success: false,
          message: resData.message || "Credenciales incorrectas",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "No se pudo conectar con el servidor de autenticación.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("volleywood_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar la autenticación fácilmente
export const useAuth = () => useContext(AuthContext);
