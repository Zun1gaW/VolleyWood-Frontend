import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, User } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const resultado = await login(username, password);
    if (!resultado.success) {
      setError(resultado.message);
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg)] px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* ── Logo ── */}
        <div className="text-center">
          <span className="text-5xl block mb-4">🏐</span>
          <h1 className="font-display text-3xl font-bold tracking-wider text-[var(--c-accent)] uppercase">
            VolleyWood
          </h1>
          <p className="mt-1.5 text-sm text-[var(--c-muted)]">
            Panel de control interno
          </p>
        </div>

        {/* ── Card ── */}
        <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl shadow-sm p-8 space-y-5">
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-xs font-medium text-red-500">
              {error}
            </div>
          )}

          {/* Campos */}
          <div className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-[var(--c-muted)] pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-sm text-[var(--c-text)] placeholder:text-[var(--c-muted)] focus:outline-none focus:border-[var(--c-accent)] transition"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-[var(--c-muted)] pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-sm text-[var(--c-text)] placeholder:text-[var(--c-muted)] focus:outline-none focus:border-[var(--c-accent)] transition"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={cargando}
            onClick={handleSubmit}
            className="w-full py-2.5 bg-[var(--c-accent)] text-white text-sm font-bold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]/40 disabled:opacity-40 transition"
          >
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
