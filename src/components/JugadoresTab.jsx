import React, { useState } from "react";
import { Search, Edit2, Trash2 } from "lucide-react";

export default function JugadoresTab({
  jugadores,
  loading,
  error,
  prepararEdicion,
  handleEliminar,
}) {
  // --- Estados locales exclusivos de la UI de Filtros ---
  const [busqueda, setBusqueda] = useState("");
  const [filtroPosicion, setFiltroPosicion] = useState("");

  // --- Lógica de Filtrado en Tiempo Real ---
  const jugadoresFiltrados = Array.isArray(jugadores)
    ? jugadores.filter((jugador) => {
        const nombreParaBuscar =
          jugador.nombre_completo || jugador.nombre || "";
        const coincideBusqueda = nombreParaBuscar
          .toLowerCase()
          .includes(busqueda.toLowerCase());

        const posicionActiva =
          jugador.posicion_principal || jugador.posicionPrincipal;
        const coincidePosicion =
          filtroPosicion === "" || posicionActiva === filtroPosicion;

        return coincideBusqueda && coincidePosicion;
      })
    : [];

  // --- Renderizador de Estrellas/Puntos de Nivel ---
  const renderLevelDots = (nivel) => {
    const maxDots = 5;
    const rating = Number(nivel) || 0;
    const dots = [];

    for (let i = 1; i <= maxDots; i++) {
      if (rating >= i) {
        dots.push(
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--c-accent)] inline-block mx-0.5"
          />,
        );
      } else if (rating > i - 1 && rating < i) {
        dots.push(
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--c-accent)] opacity-40 inline-block mx-0.5"
          />,
        );
      } else {
        dots.push(
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--c-border)] inline-block mx-0.5"
          />,
        );
      }
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">{dots}</div>
        <span className="text-xs font-mono font-semibold text-[var(--c-text)]">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div>
      {/* TOOLBAR FILTROS */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--c-muted)]" />
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
          />
        </div>

        <select
          value={filtroPosicion}
          onChange={(e) => setFiltroPosicion(e.target.value)}
          className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--c-text)] focus:outline-none"
        >
          <option value="">Todas las posiciones</option>
          <option value="Punta">Punta</option>
          <option value="Opuesto">Opuesto</option>
          <option value="Central">Central</option>
          <option value="Armador">Armador</option>
        </select>
      </div>

      {/* TABLA DINÁMICA */}
      <div className="border border-[var(--c-border)] rounded-lg bg-[var(--c-surface)] overflow-hidden">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-[var(--c-surface2)] text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)]">
            <tr>
              <th className="p-3">Jugador</th>
              <th className="p-3">Pos. Principal</th>
              <th className="p-3">Pos. Secundaria</th>
              <th className="p-3">Nivel</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--c-border)]">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-[var(--c-muted)]"
                >
                  Cargando jugadores...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-[var(--c-danger)] font-semibold"
                >
                  {error}
                </td>
              </tr>
            ) : jugadoresFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-[var(--c-muted)]"
                >
                  No se encontraron jugadores.
                </td>
              </tr>
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
                  <td className="p-3 text-[var(--c-muted)]">
                    {jugador.posicion_secundaria || "—"}
                  </td>
                  <td className="p-3">{renderLevelDots(jugador.nivel)}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        jugador.activo
                          ? "bg-[var(--c-success)]/10 text-[var(--c-success)]"
                          : "bg-[var(--c-muted)]/10 text-[var(--c-muted)]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${jugador.activo ? "bg-[var(--c-success)]" : "bg-[var(--c-muted)]"}`}
                      />
                      {jugador.activo ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => prepararEdicion(jugador)}
                        className="p-1 text-[var(--c-muted)] hover:text-[var(--c-accent)] transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(jugador.id)}
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
