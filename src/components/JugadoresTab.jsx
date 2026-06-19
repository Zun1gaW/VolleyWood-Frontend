import React, { useState } from "react";
import { Search, Edit2, Trash2, Plus } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const POSICIONES = ["Punta", "Opuesto", "Central", "Armador"];

function LevelDots({ nivel }) {
  const rating = Number(nivel) || 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = rating >= i + 1;
          const partial = !filled && rating > i && rating < i + 1;
          return (
            <span
              key={i}
              className={`h-2 w-2 rounded-full inline-block mx-0.5 bg-[var(--c-accent)] ${
                filled
                  ? "opacity-100"
                  : partial
                    ? "opacity-40"
                    : "bg-[var(--c-border)] opacity-100"
              }`}
              style={
                !filled && !partial ? { background: "var(--c-border)" } : {}
              }
            />
          );
        })}
      </div>
      <span className="text-xs font-mono font-semibold text-[var(--c-text)]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function EstadoBadge({ activo }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
        activo
          ? "bg-[var(--c-success)]/10 text-[var(--c-success)]"
          : "bg-[var(--c-muted)]/10 text-[var(--c-muted)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${activo ? "bg-[var(--c-success)]" : "bg-[var(--c-muted)]"}`}
      />
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}

// ─── Card view (mobile) ───────────────────────────────────────────────────────

function JugadorCard({ jugador, prepararEdicion, handleEliminar }) {
  return (
    <div className="border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] p-4 space-y-3 shadow-sm">
      {/* Nombre + estado */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--c-text)] truncate">
            {jugador.nombre_completo || jugador.nombre}
          </p>
          {jugador.apodo && (
            <p className="text-xs text-[var(--c-muted)] italic mt-0.5">
              "{jugador.apodo}"
            </p>
          )}
        </div>
        <EstadoBadge activo={jugador.activo} />
      </div>

      {/* Posiciones + nivel */}
      <div className="flex flex-wrap items-center gap-2">
        {jugador.posicion_principal && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--c-surface2)] border border-[var(--c-border)] text-[var(--c-muted)]">
            {jugador.posicion_principal}
          </span>
        )}
        {jugador.posicion_secundaria && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--c-surface2)] border border-[var(--c-border)] text-[var(--c-muted)] opacity-70">
            {jugador.posicion_secundaria}
          </span>
        )}
        <div className="ml-auto">
          <LevelDots nivel={jugador.nivel} />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1 border-t border-[var(--c-border)]">
        <button
          onClick={() => prepararEdicion(jugador)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-accent)] hover:bg-[var(--c-accent)]/5 rounded-lg transition"
        >
          <Edit2 className="h-3.5 w-3.5" /> Editar
        </button>
        <button
          onClick={() => handleEliminar(jugador.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-danger)] hover:bg-[var(--c-danger)]/5 rounded-lg transition"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JugadoresTab({
  jugadores,
  loading,
  error,
  prepararEdicion,
  handleEliminar,
  onNuevoJugador,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroPosicion, setFiltroPosicion] = useState("");

  const jugadoresFiltrados = Array.isArray(jugadores)
    ? jugadores.filter((j) => {
        const nombre = (j.nombre_completo || j.nombre || "").toLowerCase();
        const posicion = j.posicion_principal || j.posicionPrincipal || "";
        return (
          nombre.includes(busqueda.toLowerCase()) &&
          (filtroPosicion === "" || posicion === filtroPosicion)
        );
      })
    : [];

  // ─── Estados vacíos / carga ───────────────────────────────────────────────

  const EmptyRow = ({ colSpan, children }) => (
    <tr>
      <td
        colSpan={colSpan}
        className="p-12 text-center text-[var(--c-muted)] text-xs"
      >
        {children}
      </td>
    </tr>
  );

  const emptyContent = loading ? (
    "Cargando jugadores..."
  ) : error ? (
    <span className="text-[var(--c-danger)] font-semibold">{error}</span>
  ) : jugadoresFiltrados.length === 0 ? (
    "No se encontraron jugadores."
  ) : null;

  return (
    <div className="space-y-4">
      {/* ── Barra de filtros ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--c-muted)]" />
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] transition"
          />
        </div>

        <select
          value={filtroPosicion}
          onChange={(e) => setFiltroPosicion(e.target.value)}
          className="py-2 px-3 text-xs bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] transition"
        >
          <option value="">Todas las posiciones</option>
          {POSICIONES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {(busqueda || filtroPosicion) && (
          <button
            onClick={() => {
              setBusqueda("");
              setFiltroPosicion("");
            }}
            className="text-xs text-[var(--c-muted)] hover:text-[var(--c-danger)] transition font-medium"
          >
            Limpiar
          </button>
        )}

        <span className="ml-auto text-[10px] text-[var(--c-muted)] font-mono">
          {jugadoresFiltrados.length} resultado
          {jugadoresFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Tabla — solo en md+ ── */}
      <div className="hidden md:block border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-[var(--c-surface2)] text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)]">
            <tr>
              <th className="p-3">Jugador</th>
              <th className="p-3">Pos. Principal</th>
              <th className="p-3 hidden lg:table-cell">Pos. Secundaria</th>
              <th className="p-3">Nivel</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--c-border)]">
            {emptyContent ? (
              <EmptyRow colSpan={6}>{emptyContent}</EmptyRow>
            ) : (
              jugadoresFiltrados.map((jugador) => (
                <tr
                  key={jugador.id}
                  className="hover:bg-[var(--c-surface2)]/50 transition"
                >
                  <td className="p-3 font-semibold text-[var(--c-text)]">
                    {jugador.nombre_completo || jugador.nombre}
                    {jugador.apodo && (
                      <div className="text-[11px] font-normal text-[var(--c-muted)] italic mt-0.5">
                        "{jugador.apodo}"
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-[var(--c-muted)]">
                    <span className="px-2 py-0.5 rounded bg-[var(--c-surface2)] border border-[var(--c-border)]">
                      {jugador.posicion_principal}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--c-muted)] hidden lg:table-cell">
                    {jugador.posicion_secundaria || "—"}
                  </td>
                  <td className="p-3">
                    <LevelDots nivel={jugador.nivel} />
                  </td>
                  <td className="p-3">
                    <EstadoBadge activo={jugador.activo} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => prepararEdicion(jugador)}
                        className="p-1 text-[var(--c-muted)] hover:text-[var(--c-accent)] transition"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(jugador.id)}
                        className="p-1 text-[var(--c-muted)] hover:text-[var(--c-danger)] transition"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
            Cargando jugadores...
          </p>
        )}
        {error && (
          <p className="text-xs text-[var(--c-danger)] font-semibold text-center py-8">
            {error}
          </p>
        )}
        {!loading && !error && jugadoresFiltrados.length === 0 && (
          <p className="text-xs text-[var(--c-muted)] text-center py-8">
            No se encontraron jugadores.
          </p>
        )}
        {!loading &&
          !error &&
          jugadoresFiltrados.map((jugador) => (
            <JugadorCard
              key={jugador.id}
              jugador={jugador}
              prepararEdicion={prepararEdicion}
              handleEliminar={handleEliminar}
            />
          ))}
      </div>

      {/* ── FAB mobile: agregar jugador ── */}
      {onNuevoJugador && (
        <button
          onClick={onNuevoJugador}
          className="md:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-[var(--c-accent)] text-white text-sm font-bold rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
          aria-label="Nuevo jugador"
        >
          <Plus className="h-4 w-4" />
          Nuevo jugador
        </button>
      )}
    </div>
  );
}
