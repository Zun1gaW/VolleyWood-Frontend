import React from "react";

export default function RestriccionModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  setFormData,
  submitting,
  jugadores,
}) {
  if (!isOpen) return null;

  // Filtrar la lista del Jugador B para que no se pueda seleccionar al mismo jugador en ambos lados
  const jugadoresDisponiblesB = jugadores.filter(
    (j) => j.id.toString() !== formData.jugador_a_id?.toString(),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-display text-base font-bold text-[var(--c-text)] mb-4">
          {isEditing
            ? "Editar Regla de Relación"
            : "Nueva Restricción entre Jugadores"}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Selector de Jugador A */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
              Jugador A
            </label>
            <select
              required
              value={formData.jugador_a_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, jugador_a_id: e.target.value })
              }
              className="w-full bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
            >
              <option value="">Selecciona al primer jugador...</option>
              {jugadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nombre_completo || j.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Jugador B */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
              Jugador B
            </label>
            <select
              required
              disabled={!formData.jugador_a_id} // Bloqueado hasta elegir el Jugador A
              value={formData.jugador_b_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, jugador_b_id: e.target.value })
              }
              className="w-full bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] disabled:opacity-50"
            >
              <option value="">Selecciona al segundo jugador...</option>
              {jugadoresDisponiblesB.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nombre_completo || j.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Restricción */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
              Tipo de Relación
            </label>
            <select
              value={formData.tipo_restriccion || "impedimento"}
              onChange={(e) =>
                setFormData({ ...formData, tipo_restriccion: e.target.value })
              }
              className="w-full bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
            >
              <option value="Incompatible">
                🚫 Incompatible (No juntar en el mismo equipo)
              </option>
              <option value="Obligatorio">
                📌 Obligatorio (Deben ir juntos siempre)
              </option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--c-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface2)] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-amber-500 text-xs font-bold text-white shadow-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting
                ? "Guardando..."
                : isEditing
                  ? "Actualizar"
                  : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
