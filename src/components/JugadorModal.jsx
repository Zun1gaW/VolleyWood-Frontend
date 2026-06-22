import React from "react";
import { X } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const POSICIONES = ["Punta", "Opuesto", "Central", "Armador"];

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-xs bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] transition";

const selectClass =
  "w-full px-2 py-2 text-xs bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] transition";

// ─── Component ────────────────────────────────────────────────────────────────

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

  const nivelPrincipal = Number(formData.nivel) || 1;
  const nivelSecundario = Number(formData.nivel_secundario) || 1;

  // ─── Lógica de Control: Nivel Principal ─────────────────────────────────────
  const handleNivelChange = (raw) => {
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    const clamped = Math.min(5, Math.max(1, Math.round(val * 10) / 10));
    setFormData((prev) => ({ ...prev, nivel: clamped }));
  };

  const handleNivelInput = (raw) => {
    setFormData((prev) => ({ ...prev, nivel: raw }));
  };

  const handleNivelBlur = (raw) => {
    const val = parseFloat(raw);
    if (isNaN(val) || raw === "") {
      setFormData((prev) => ({ ...prev, nivel: 1 }));
    } else {
      handleNivelChange(raw);
    }
  };

  // ─── Lógica de Control: Nivel Secundario ───────────────────────────────────
  const handleNivelSecundarioChange = (raw) => {
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    const clamped = Math.min(5, Math.max(1, Math.round(val * 10) / 10));
    setFormData((prev) => ({ ...prev, nivel_secundario: clamped }));
  };

  const handleNivelSecundarioInput = (raw) => {
    setFormData((prev) => ({ ...prev, nivel_secundario: raw }));
  };

  const handleNivelSecundarioBlur = (raw) => {
    const val = parseFloat(raw);
    if (isNaN(val) || raw === "") {
      setFormData((prev) => ({ ...prev, nivel_secundario: 1 }));
    } else {
      handleNivelSecundarioChange(raw);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--c-border)] bg-[var(--c-surface2)]/50 shrink-0">
          <h3 className="font-display text-sm font-bold text-[var(--c-text)]">
            {isEditing ? "Editar jugador" : "Nuevo jugador"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--c-muted)] hover:bg-[var(--c-surface2)] hover:text-[var(--c-text)] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body (Con scroll interno por si se despliega el nivel secundario en pantallas chicas) */}
        <form
          onSubmit={onSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar"
        >
          <Field label="Nombre completo">
            <input
              type="text"
              required
              placeholder="Ej. Darlan Souza"
              value={formData.nombre_completo || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nombre_completo: e.target.value,
                }))
              }
              className={inputClass}
            />
          </Field>

          <Field label="Apodo / Nickname (opcional)">
            <input
              type="text"
              placeholder="Ej. El Tanque"
              value={formData.apodo || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, apodo: e.target.value }))
              }
              className={inputClass}
            />
          </Field>

          {/* Grid de Posiciones */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pos. principal">
              <select
                value={formData.posicion_principal || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    posicion_principal: e.target.value,
                  }))
                }
                className={selectClass}
              >
                <option value="" disabled>
                  Selecciona
                </option>
                {POSICIONES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Pos. secundaria">
              <select
                value={formData.posicion_secundaria || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    posicion_secundaria: val,
                    // Si se remueve la posición secundaria, limpiamos su nivel a "" automáticamente
                    nivel_secundario: val ? prev.nivel_secundario || 3.0 : "",
                  }));
                }}
                className={selectClass}
              >
                <option value="">Ninguna</option>
                {POSICIONES.map((p) => (
                  // Deshabilitamos del selector secundario el rol que ya está en el principal
                  <option
                    key={p}
                    value={p}
                    disabled={p === formData.posicion_principal}
                  >
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* ── SECCIÓN 1: Nivel de juego Principal ── */}
          <Field
            label={`Nivel de juego ${formData.posicion_principal ? `(${formData.posicion_principal})` : ""}`}
          >
            <div className="space-y-2 bg-[var(--c-surface2)]/30 border border-[var(--c-border)]/60 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={
                    isNaN(parseFloat(formData.nivel))
                      ? 1
                      : parseFloat(formData.nivel)
                  }
                  onChange={(e) => handleNivelChange(e.target.value)}
                  className="flex-1 h-1.5 bg-[var(--c-border)] rounded-lg appearance-none cursor-pointer accent-[var(--c-accent)]"
                />
                <div className="relative shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.nivel ?? 1}
                    onChange={(e) => handleNivelInput(e.target.value)}
                    onBlur={(e) => handleNivelBlur(e.target.value)}
                    className="w-16 text-center px-2 py-1.5 text-xs font-bold bg-[var(--c-accent)] text-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Escala visual 1–5 */}
              <div className="flex justify-between px-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, nivel: n }))
                    }
                    className={`text-[10px] font-bold w-7 h-7 rounded-full transition ${
                      Math.round(nivelPrincipal) === n
                        ? "bg-[var(--c-accent)] text-white"
                        : "text-[var(--c-muted)] hover:bg-[var(--c-surface2)] hover:text-[var(--c-text)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          {/* ── SECCIÓN 2: Nivel de juego Secundario (Renderizado Condicional) ── */}
          {formData.posicion_secundaria && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <Field label={`Nivel de juego (${formData.posicion_secundaria})`}>
                <div className="space-y-2 bg-[var(--c-surface2)]/30 border border-[var(--c-border)]/60 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.1"
                      value={
                        isNaN(parseFloat(formData.nivel_secundario))
                          ? 1
                          : parseFloat(formData.nivel_secundario)
                      }
                      onChange={(e) =>
                        handleNivelSecundarioChange(e.target.value)
                      }
                      className="flex-1 h-1.5 bg-[var(--c-border)] rounded-lg appearance-none cursor-pointer accent-[var(--c-accent)]"
                    />
                    <div className="relative shrink-0">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.nivel_secundario ?? ""}
                        onChange={(e) =>
                          handleNivelSecundarioInput(e.target.value)
                        }
                        onBlur={(e) =>
                          handleNivelSecundarioBlur(e.target.value)
                        }
                        className="w-16 text-center px-2 py-1.5 text-xs font-bold bg-[var(--c-accent)]/80 text-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* Escala visual 1–5 Secundaria */}
                  <div className="flex justify-between px-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            nivel_secundario: n,
                          }))
                        }
                        className={`text-[10px] font-bold w-7 h-7 rounded-full transition ${
                          Math.round(nivelSecundario) === n
                            ? "bg-[var(--c-accent)] text-white"
                            : "text-[var(--c-muted)] hover:bg-[var(--c-surface2)] hover:text-[var(--c-text)]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </Field>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--c-border)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface2)] transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[var(--c-accent)] text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-50"
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
