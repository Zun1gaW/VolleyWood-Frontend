import React from "react";

export default function JugadorModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  setFormData,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-display text-base font-bold text-[var(--c-text)] mb-4">
          {isEditing ? "Editar Jugador" : "Registrar Nuevo Jugador"}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Darlan Souza"
              value={formData.nombre_completo}
              onChange={(e) =>
                setFormData({ ...formData, nombre_completo: e.target.value })
              }
              className="w-full px-3 py-2 text-xs bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
              Apodo / Nickname (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. El Tanque"
              value={formData.apodo}
              onChange={(e) =>
                setFormData({ ...formData, apodo: e.target.value })
              }
              className="w-full px-3 py-2 text-xs bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
                Posición Principal
              </label>
              <select
                value={formData.posicion_principal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    posicion_principal: e.target.value,
                  })
                }
                className="w-full bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg px-2 py-2 text-xs text-[var(--c-text)] focus:outline-none"
              >
                <option value="Punta">Punta</option>
                <option value="Opuesto">Opuesto</option>
                <option value="Central">Central</option>
                <option value="Armador">Armador</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
                Posición Secundaria
              </label>
              <select
                value={formData.posicion_secundaria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    posicion_secundaria: e.target.value,
                  })
                }
                className="w-full bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg px-2 py-2 text-xs text-[var(--c-text)] focus:outline-none"
              >
                <option value="">Ninguna</option>
                <option value="Punta">Punta</option>
                <option value="Opuesto">Opuesto</option>
                <option value="Central">Central</option>
                <option value="Armador">Armador</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)]">
                Nivel de Juego
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[var(--c-accent)] text-white rounded">
                {formData.nivel ? Number(formData.nivel).toFixed(1) : "1.0"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              required
              value={formData.nivel || 1}
              onChange={(e) =>
                setFormData({ ...formData, nivel: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-[var(--c-border)] rounded-lg appearance-none cursor-pointer accent-[var(--c-accent)]"
            />
          </div>

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
              className="px-4 py-2 rounded-lg bg-[var(--c-accent)] text-xs font-bold text-white shadow-sm hover:opacity-90 transition disabled:opacity-50"
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
