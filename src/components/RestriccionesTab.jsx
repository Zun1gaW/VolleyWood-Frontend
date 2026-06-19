import React, { useState } from "react";
import { Search, Trash2, ShieldAlert, Plus } from "lucide-react";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function TipoBadge({ tipo }) {
  return tipo === "Incompatible" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
      🚫 Incompatible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
      📌 Obligatorio
    </span>
  );
}

function NombreJugador({ nombre, id, apodo }) {
  return (
    <div>
      <span className="font-semibold text-[var(--c-text)]">
        {nombre || `Jugador #${id}`}
      </span>
      {apodo && (
        <div className="text-[11px] font-normal text-[var(--c-muted)] italic mt-0.5">
          "{apodo}"
        </div>
      )}
    </div>
  );
}

// ─── Card view (mobile) ───────────────────────────────────────────────────────

function RestriccionCard({ restriccion, handleEliminarRestriccion }) {
  return (
    <div className="border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] p-4 space-y-3 shadow-sm">
      {/* Tipo */}
      <TipoBadge tipo={restriccion.tipo_restriccion} />

      {/* Jugadores */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 p-2.5 rounded-lg bg-[var(--c-surface2)]/60 border border-[var(--c-border)]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
            Jugador A
          </p>
          <NombreJugador
            nombre={restriccion.jugador_a_nombre}
            id={restriccion.jugador_a_id}
            apodo={restriccion.jugador_a_apodo}
          />
        </div>

        <span className="text-[var(--c-muted)] text-xs shrink-0">↔</span>

        <div className="flex-1 min-w-0 p-2.5 rounded-lg bg-[var(--c-surface2)]/60 border border-[var(--c-border)]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
            Jugador B
          </p>
          <NombreJugador
            nombre={restriccion.jugador_b_nombre}
            id={restriccion.jugador_b_id}
            apodo={restriccion.jugador_b_apodo}
          />
        </div>
      </div>

      {/* Acción */}
      <div className="pt-1 border-t border-[var(--c-border)]">
        <button
          onClick={() => handleEliminarRestriccion(restriccion.id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-danger)] hover:bg-[var(--c-danger)]/5 rounded-lg transition"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar restricción
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RestriccionesTab({
  restricciones,
  loading,
  error,
  prepararEdicionRestriccion,
  handleEliminarRestriccion,
  onAbrirModalCrear,
}) {
  const [busqueda, setBusqueda] = useState("");

  const restriccionesFiltradas = Array.isArray(restricciones)
    ? restricciones.filter((r) => {
        const a = (r.jugador_a_nombre || "").toLowerCase();
        const b = (r.jugador_b_nombre || "").toLowerCase();
        const q = busqueda.toLowerCase();
        return a.includes(q) || b.includes(q);
      })
    : [];

  const isEmpty = !loading && !error && restriccionesFiltradas.length === 0;

  return (
    <div className="space-y-4">
      {/* ── Barra de filtros ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--c-muted)]" />
          <input
            type="text"
            placeholder="Buscar por jugador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="text-xs text-[var(--c-muted)] hover:text-[var(--c-danger)] transition font-medium"
          >
            Limpiar
          </button>
        )}

        <span className="text-[10px] text-[var(--c-muted)] font-mono">
          {restriccionesFiltradas.length} resultado
          {restriccionesFiltradas.length !== 1 ? "s" : ""}
        </span>

        {/* Botón desktop — visible en md+ */}
        <button
          onClick={onAbrirModalCrear}
          className="hidden md:inline-flex ml-auto items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition"
        >
          + Nueva restricción
        </button>
      </div>

      {/* ── Tabla — solo en md+ ── */}
      <div className="hidden md:block border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-[var(--c-surface2)] text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)]">
            <tr>
              <th className="p-3">Jugador A</th>
              <th className="p-3 text-center">Tipo</th>
              <th className="p-3">Jugador B</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--c-border)]">
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-12 text-center text-xs text-[var(--c-muted)]"
                >
                  Cargando restricciones...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-12 text-center text-xs text-[var(--c-danger)] font-semibold"
                >
                  {error}
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-12 text-center text-xs text-[var(--c-muted)]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <ShieldAlert className="h-5 w-5 opacity-40" />
                    No hay restricciones activas en este momento.
                  </div>
                </td>
              </tr>
            ) : (
              restriccionesFiltradas.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-[var(--c-surface2)]/50 transition"
                >
                  <td className="p-3">
                    <NombreJugador
                      nombre={r.jugador_a_nombre}
                      id={r.jugador_a_id}
                      apodo={r.jugador_a_apodo}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <TipoBadge tipo={r.tipo_restriccion} />
                  </td>
                  <td className="p-3">
                    <NombreJugador
                      nombre={r.jugador_b_nombre}
                      id={r.jugador_b_id}
                      apodo={r.jugador_b_apodo}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleEliminarRestriccion(r.id)}
                      className="p-1 text-[var(--c-muted)] hover:text-[var(--c-danger)] transition"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Cards — solo en mobile ── */}
      <div className="md:hidden space-y-3">
        {loading && (
          <p className="text-xs text-[var(--c-muted)] text-center py-8">
            Cargando restricciones...
          </p>
        )}
        {error && (
          <p className="text-xs text-[var(--c-danger)] font-semibold text-center py-8">
            {error}
          </p>
        )}
        {!loading && !error && isEmpty && (
          <div className="flex flex-col items-center gap-2 py-12 text-[var(--c-muted)]">
            <ShieldAlert className="h-6 w-6 opacity-40" />
            <p className="text-xs">No hay restricciones activas.</p>
          </div>
        )}
        {!loading &&
          !error &&
          restriccionesFiltradas.map((r) => (
            <RestriccionCard
              key={r.id}
              restriccion={r}
              handleEliminarRestriccion={handleEliminarRestriccion}
            />
          ))}
      </div>

      {/* ── FAB mobile ── */}
      <button
        onClick={onAbrirModalCrear}
        className="md:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-amber-500 text-white text-sm font-bold rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
        aria-label="Nueva restricción"
      >
        <Plus className="h-4 w-4" />
        Nueva restricción
      </button>
    </div>
  );
}
