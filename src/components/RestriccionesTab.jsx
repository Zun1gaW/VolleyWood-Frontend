import React, { useState } from "react";
import { Search, Edit2, Trash2, ShieldAlert } from "lucide-react";

export default function RestriccionesTab({
  restricciones,
  loading,
  error,
  prepararEdicionRestriccion,
  handleEliminarRestriccion,
  onAbrirModalCrear,
}) {
  const [busqueda, setBusqueda] = useState("");

  // Filtramos las restricciones por el nombre del jugador afectado
  const restriccionesFiltradas = Array.isArray(restricciones)
    ? restricciones.filter((res) => {
        const nombreJugador = res.jugador_nombre || res.jugador || "";
        return nombreJugador.toLowerCase().includes(busqueda.toLowerCase());
      })
    : [];

  return (
    <div>
      {/* TOOLBAR FILTROS */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--c-muted)]" />
          <input
            type="text"
            placeholder="Buscar por jugador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
          />
        </div>

        <button
          onClick={onAbrirModalCrear}
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition"
        >
          + Nueva Restricción
        </button>
      </div>

      {/* TABLA DE RESTRICCIONES */}
      <div className="border border-[var(--c-border)] rounded-lg bg-[var(--c-surface)] overflow-hidden">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-[var(--c-surface2)] text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)]">
            <tr>
              <th className="p-3">Jugador A</th>
              <th className="p-3">Tipo de Restricción</th>
              <th className="p-3">Jugador B</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--c-border)]">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-12 text-center text-[var(--c-muted)]"
                >
                  Cargando restricciones...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-12 text-center text-[var(--c-danger)] font-semibold"
                >
                  {error}
                </td>
              </tr>
            ) : restriccionesFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-12 text-center text-[var(--c-muted)]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-[var(--c-muted)] opacity-60" />
                    <span>No hay restricciones activas en este momento.</span>
                  </div>
                </td>
              </tr>
            ) : (
              restriccionesFiltradas.map((restriccion) => (
                <tr
                  key={restriccion.id}
                  className="hover:bg-[var(--c-surface2)]/50 transition"
                >
                  {/* Jugador A */}
                  <td className="p-3 font-semibold text-[var(--c-text)]">
                    {restriccion.jugador_a_nombre ||
                      `Jugador #${restriccion.jugador_a_id}`}
                    {restriccion.jugador_a_apodo && (
                      <div className="text-[11px] font-normal text-[var(--c-muted)] italic mt-0.5">
                        "{restriccion.jugador_a_apodo}"
                      </div>
                    )}
                  </td>

                  {/* Tipo de Restricción basado en el nuevo ENUM */}
                  <td className="p-3">
                    {restriccion.tipo_restriccion === "Incompatible" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        🚫 Incompatible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        📌 Obligatorio
                      </span>
                    )}
                  </td>

                  {/* Jugador B (Colocamos al segundo jugador en la columna que antes era el detalle) */}
                  <td className="p-3 text-[var(--c-text)] font-semibold">
                    {restriccion.jugador_b_nombre ||
                      `Jugador #${restriccion.jugador_b_id}`}
                    {restriccion.jugador_b_apodo && (
                      <div className="text-[11px] font-normal text-[var(--c-muted)] italic mt-0.5">
                        "{restriccion.jugador_b_apodo}"
                      </div>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() =>
                          handleEliminarRestriccion(restriccion.id)
                        }
                        className="p-1 text-[var(--c-muted)] hover:text-[var(--c-danger)] transition"
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
    </div>
  );
}
