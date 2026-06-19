import React, { useState, useEffect, useCallback } from "react";
import { jugadorService } from "./services/jugadorService";
import { restriccionService } from "./services/restriccionService";
import { jornadasService } from "./services/jornadasService";

import Sidebar from "./components/Sidebar";
import KpiCard from "./components/KpiCard";
import JugadoresTab from "./components/JugadoresTab";
import JugadorModal from "./components/JugadorModal";
import RestriccionesTab from "./components/RestriccionesTab";
import RestriccionModal from "./components/RestriccionModal";
import PartidosTab from "./components/PartidosTab";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FORM_JUGADOR_DEFAULT = {
  nombre_completo: "",
  apodo: "",
  posicion_principal: "Punta",
  posicion_secundaria: "",
  nivel: 3,
  activo: true,
};

const FORM_RESTRICCION_DEFAULT = {
  jugador_a_id: "",
  jugador_b_id: "",
  tipo_restriccion: "Obligatorio",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initDarkMode() {
  return (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

function calcularStats(jugadores, restricciones) {
  const total = jugadores.length;
  const activos = jugadores.filter((j) => j.activo).length;
  const promedio =
    total > 0
      ? (
          jugadores.reduce((a, j) => a + Number(j.nivel || 0), 0) / total
        ).toFixed(1)
      : "0.0";
  const totalRestr = restricciones.filter((r) => r.activo ?? true).length;
  return { total, activos, promedio, totalRestr };
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function App() {
  // UI
  const [activeTab, setActiveTab] = useState("jugadores");
  const [darkMode, setDarkMode] = useState(initDarkMode);

  // Datos
  const [jugadores, setJugadores] = useState([]);
  const [restricciones, setRestricciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal jugador
  const [modalJugador, setModalJugador] = useState({
    open: false,
    editing: false,
    id: null,
  });
  const [formJugador, setFormJugador] = useState(FORM_JUGADOR_DEFAULT);

  // Modal restricción
  const [modalRestriccion, setModalRestriccion] = useState({
    open: false,
    editing: false,
    id: null,
  });
  const [formRestriccion, setFormRestriccion] = useState(
    FORM_RESTRICCION_DEFAULT,
  );

  // ─── Dark mode ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ─── Carga inicial ─────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([cargarJugadores(), cargarRestricciones()]);
  }, []);

  const cargarJugadores = async () => {
    try {
      setLoading(true);
      setJugadores(await jugadorService.getAll());
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const cargarRestricciones = async () => {
    try {
      setRestricciones(await restriccionService.getAll());
    } catch (err) {
      console.error("Error al cargar restricciones:", err);
    }
  };

  // ─── Jugadores ─────────────────────────────────────────────────────────────

  const abrirModalNuevoJugador = () => {
    setFormJugador(FORM_JUGADOR_DEFAULT);
    setModalJugador({ open: true, editing: false, id: null });
  };

  const prepararEdicion = (jugador) => {
    setFormJugador({
      nombre_completo: jugador.nombre_completo || jugador.nombre || "",
      apodo: jugador.apodo || "",
      posicion_principal: jugador.posicion_principal || "Punta",
      posicion_secundaria: jugador.posicion_secundaria || "",
      nivel: jugador.nivel || 3,
      activo: jugador.activo ?? true,
    });
    setModalJugador({ open: true, editing: true, id: jugador.id });
  };

  const cerrarModalJugador = () => {
    setModalJugador({ open: false, editing: false, id: null });
    setFormJugador(FORM_JUGADOR_DEFAULT);
  };

  const handleGuardarJugador = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalJugador.editing) {
        const res = await jugadorService.update(modalJugador.id, formJugador);
        setJugadores((prev) =>
          prev.map((j) =>
            j.id === modalJugador.id ? { ...j, ...(res.data || res) } : j,
          ),
        );
      } else {
        const nuevo = await jugadorService.create(formJugador);
        setJugadores((prev) => [...prev, nuevo]);
      }
      cerrarModalJugador();
    } catch {
      alert("Error al guardar en el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarJugador = async (id) => {
    if (!window.confirm("¿Eliminar este jugador?")) return;
    try {
      await jugadorService.delete(id);
      setJugadores((prev) => prev.filter((j) => j.id !== id));
    } catch {
      alert("Error al eliminar.");
    }
  };

  // ─── Restricciones ─────────────────────────────────────────────────────────

  const prepararEdicionRestriccion = (r) => {
    setFormRestriccion({
      jugador_a_id: r.jugador_a_id || r.jugador_id_a || "",
      jugador_b_id: r.jugador_b_id || r.jugador_id_b || "",
      tipo_restriccion: r.tipo_restriccion || "Obligatorio",
    });
    setModalRestriccion({ open: true, editing: true, id: r.id });
  };

  const cerrarModalRestriccion = () => {
    setModalRestriccion({ open: false, editing: false, id: null });
    setFormRestriccion(FORM_RESTRICCION_DEFAULT);
  };

  const handleGuardarRestriccion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        jugador_a_id: Number(formRestriccion.jugador_a_id),
        jugador_b_id: Number(formRestriccion.jugador_b_id),
        tipo_restriccion: formRestriccion.tipo_restriccion,
      };

      const nombre = (id) => {
        const j = jugadores.find((j) => j.id.toString() === id.toString());
        return j ? j.nombre_completo || j.nombre : "";
      };

      if (modalRestriccion.editing) {
        const res = await restriccionService.update(
          modalRestriccion.id,
          payload,
        );
        setRestricciones((prev) =>
          prev.map((r) =>
            r.id === modalRestriccion.id
              ? {
                  ...r,
                  ...(res.data || res),
                  tipo_restriccion: payload.tipo_restriccion,
                  jugador_a_nombre: nombre(formRestriccion.jugador_a_id),
                  jugador_b_nombre: nombre(formRestriccion.jugador_b_id),
                }
              : r,
          ),
        );
      } else {
        const nueva = await restriccionService.create(payload);
        const datos = nueva.data || nueva;
        setRestricciones((prev) => [
          ...prev.filter((r) => r.id !== datos.id),
          {
            ...datos,
            tipo_restriccion: payload.tipo_restriccion,
            jugador_a_nombre: nombre(formRestriccion.jugador_a_id),
            jugador_b_nombre: nombre(formRestriccion.jugador_b_id),
          },
        ]);
      }
      cerrarModalRestriccion();
    } catch (err) {
      alert("Error del servidor: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarRestriccion = async (id) => {
    if (!window.confirm("¿Eliminar esta restricción?")) return;
    try {
      await restriccionService.delete(id);
      setRestricciones((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("No se pudo eliminar la restricción.");
    }
  };

  // ─── Jornadas ──────────────────────────────────────────────────────────────

  const handleGuardarJornada = async (payload) => {
    const resp = await jornadasService.guardarJornada(payload);
    if (resp.status === "success" || resp.id || resp.data) {
      alert("¡Jornada guardada correctamente!");
    } else {
      alert("Jornada enviada, pero sin confirmación del servidor.");
    }
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const { total, activos, promedio, totalRestr } = calcularStats(
    jugadores,
    restricciones,
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const TABS = {
    jugadores: (
      <JugadoresTab
        jugadores={jugadores}
        loading={loading}
        error={error}
        prepararEdicion={prepararEdicion}
        handleEliminar={handleEliminarJugador}
        onNuevoJugador={abrirModalNuevoJugador}
      />
    ),
    restricciones: (
      <RestriccionesTab
        restricciones={restricciones}
        loading={false}
        error={null}
        prepararEdicionRestriccion={prepararEdicionRestriccion}
        handleEliminarRestriccion={handleEliminarRestriccion}
        onAbrirModalCrear={() =>
          setModalRestriccion({ open: true, editing: false, id: null })
        }
      />
    ),
    partidos: (
      <PartidosTab
        jugadores={jugadores}
        restricciones={restricciones}
        onGuardarJornada={handleGuardarJornada}
      />
    ),
  };

  return (
    <div className="flex min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* ── Sidebar ── */}
      <Sidebar
        totalJugadores={total}
        totalRestricciones={totalRestr}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* ── Contenido principal ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--c-border)] bg-[var(--c-surface)] px-8 shrink-0">
          <div>
            <span className="font-display text-lg font-bold tracking-wide text-[var(--c-text)]">
              VolleyWood
            </span>
            <span className="ml-2 text-xs text-[var(--c-muted)]">
              Panel de control
            </span>
          </div>
          {activeTab === "jugadores" && (
            <button
              onClick={abrirModalNuevoJugador}
              className="rounded-lg bg-[var(--c-accent)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition"
            >
              + Nuevo jugador
            </button>
          )}
          {activeTab === "restricciones" && (
            <button
              onClick={() =>
                setModalRestriccion({ open: true, editing: false, id: null })
              }
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition"
            >
              + Nueva restricción
            </button>
          )}
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Registrados" value={total} />
            <KpiCard
              title="Activos"
              value={activos}
              valueClass="text-[var(--c-success)]"
            />
            <KpiCard
              title="Nivel promedio"
              value={promedio}
              valueClass="text-amber-500"
            />
            <KpiCard
              title="Restricciones"
              value={totalRestr}
              valueClass="text-indigo-500"
            />
          </section>

          {/* Vista activa */}
          <section>{TABS[activeTab]}</section>
        </main>
      </div>

      {/* ── Modales ── */}
      <JugadorModal
        isOpen={modalJugador.open}
        onClose={cerrarModalJugador}
        onSubmit={handleGuardarJugador}
        isEditing={modalJugador.editing}
        formData={formJugador}
        setFormData={setFormJugador}
        submitting={submitting}
      />

      <RestriccionModal
        isOpen={modalRestriccion.open}
        onClose={cerrarModalRestriccion}
        onSubmit={handleGuardarRestriccion}
        isEditing={modalRestriccion.editing}
        formData={formRestriccion}
        setFormData={setFormRestriccion}
        submitting={submitting}
        jugadores={jugadores}
      />
    </div>
  );
}
