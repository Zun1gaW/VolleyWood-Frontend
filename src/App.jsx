// src/App.jsx
import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import MainDashboard from "./MainDashbord";

function AppContent() {
  const { user } = useAuth(); // Aquí sí funciona porque está envuelto por AuthProvider

  if (!user) {
    return <Login />;
  }

  return <MainDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
