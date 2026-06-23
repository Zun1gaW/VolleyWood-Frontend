import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Dices,
  Save,
  CheckSquare,
  Square,
  Settings,
  Calendar,
  PlusCircle,
  History,
  Eye,
  FileSpreadsheet,
  Trophy,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shuffle,
} from "lucide-react";
import { jornadasService } from "../services/jornadasService";
import * as XLSX from "xlsx";

// ─── Constants ─────────────────────────────────────────────────────────────────

const POSICIONES = ["Armador", "Opuesto", "Central", "Punta"];

const POS_COLOR = {
  Armador: {
    bg: "bg-blue-500/15",
    text: "text-blue-500",
    border: "border-blue-500/30",
  },
  Opuesto: {
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    border: "border-amber-500/30",
  },
  Central: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    border: "border-emerald-500/30",
  },
  Punta: {
    bg: "bg-rose-500/15",
    text: "text-rose-500",
    border: "border-rose-500/30",
  },
};

const POS_ABBR = {
  Armador: "ARM",
  Opuesto: "OPU",
  Central: "CEN",
  Punta: "PUN",
};

// ─── Scrollbar styles ──────────────────────────────────────────────────────────

const SCROLLBAR_STYLE_ID = "volleywood-scrollbar-styles";

function injectScrollbarStyles() {
  if (document.getElementById(SCROLLBAR_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SCROLLBAR_STYLE_ID;
  style.textContent = `
    .vw-scroll { scrollbar-width: thin; scrollbar-color: rgba(168,85,247,.35) transparent; }
    .vw-scroll::-webkit-scrollbar { width:4px; height:4px; }
    .vw-scroll::-webkit-scrollbar-track { background:transparent; border-radius:999px; }
    .vw-scroll::-webkit-scrollbar-thumb { background:rgba(168,85,247,.35); border-radius:999px; transition:background .2s; }
    .vw-scroll::-webkit-scrollbar-thumb:hover { background:rgba(168,85,247,.65); }
    .vw-scroll::-webkit-scrollbar-corner { background:transparent; }
    @keyframes vw-toast-in  { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes vw-toast-out { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(4px) scale(.97)} }
    .vw-toast-enter { animation:vw-toast-in  .22s ease forwards; }
    .vw-toast-exit  { animation:vw-toast-out .18s ease forwards; }
    @keyframes vw-slide-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    .vw-slide-in { animation:vw-slide-in .2s ease forwards; }
  `;
  document.head.appendChild(style);
}

// ─── Toast system ─────────────────────────────────────────────────────────────

const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon_color: "text-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500/10 border-red-500/30",
    icon_color: "text-red-500",
    text: "text-red-700 dark:text-red-300",
    bar: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10 border-amber-500/30",
    icon_color: "text-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-purple-500/10 border-purple-500/30",
    icon_color: "text-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    bar: "bg-purple-500",
  },
};

let _toastId = 0;

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const v = TOAST_VARIANTS[toast.type] || TOAST_VARIANTS.info;
  const Icon = v.icon;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 180);
  }, [toast.id, onRemove]);

  useEffect(() => {
    const t = setTimeout(dismiss, toast.duration ?? 5000);
    return () => clearTimeout(t);
  }, [dismiss, toast.duration]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm max-w-sm w-full overflow-hidden ${v.bg} ${exiting ? "vw-toast-exit" : "vw-toast-enter"}`}
    >
      <div
        className={`absolute bottom-0 left-0 h-[2px] ${v.bar} opacity-40`}
        style={{
          animation: `vw-toast-out ${toast.duration ?? 5000}ms linear forwards`,
          width: "100%",
        }}
      />
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${v.icon_color}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-xs font-bold leading-tight ${v.text}`}>
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className={`text-xs leading-snug mt-0.5 ${v.text} opacity-90`}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={dismiss}
        className={`shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition ${v.text}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((type, title, message, duration) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);
  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );
  const notify = {
    success: (title, message, duration) =>
      toast("success", title, message, duration),
    error: (title, message, duration) =>
      toast("error", title, message, duration),
    warning: (title, message, duration) =>
      toast("warning", title, message, duration),
    info: (title, message, duration) => toast("info", title, message, duration),
  };
  return { toasts, removeToast, notify };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, accent = false, children, action }) {
  return (
    <div className="border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--c-border)] bg-[var(--c-surface2)]/50">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              className={`h-4 w-4 ${accent ? "text-purple-500" : "text-[var(--c-muted)]"}`}
            />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
            {title}
          </span>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${active ? "bg-purple-500 text-white shadow-sm" : "text-[var(--c-muted)] hover:bg-[var(--c-surface2)] hover:text-[var(--c-text)]"}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/** Badge de posición coloreado */
function PosBadge({ pos, small = false }) {
  const c = POS_COLOR[pos] || {
    bg: "bg-gray-500/10",
    text: "text-gray-500",
    border: "border-gray-500/20",
  };
  return (
    <span
      className={`inline-flex items-center font-bold border rounded ${c.bg} ${c.text} ${c.border} ${small ? "text-[8px] px-1 py-0" : "text-[9px] px-1.5 py-0.5"}`}
    >
      {POS_ABBR[pos] || pos?.substring(0, 3).toUpperCase() || "?"}
    </span>
  );
}

/** Panel de advertencia de posiciones con resolución interactiva */
function PositionWarningPanel({ diagnostico, onResolve, onCancel }) {
  const [asignaciones, setAsignaciones] = useState(() => {
    const init = {};
    diagnostico.candidatos?.forEach((c) => {
      init[c.jugadorId] = c.posicionSugerida;
    });
    return init;
  });

  return (
    <div className="vw-slide-in border border-amber-500/40 rounded-xl bg-amber-500/5 overflow-hidden shadow-md">
      <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border-b border-amber-500/30">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
          Posiciones insuficientes
        </span>
      </div>
      <div className="p-4 space-y-3">
        {/* Resumen del déficit */}
        <div className="space-y-1">
          {diagnostico.deficit.map((d) => (
            <div key={d.pos} className="flex items-center gap-2 text-xs">
              <PosBadge pos={d.pos} />
              <span className="text-[var(--c-muted)]">
                Necesitas{" "}
                <span className="font-bold text-[var(--c-text)]">
                  {d.necesario}
                </span>
                , tienes{" "}
                <span className="font-bold text-amber-500">{d.disponible}</span>{" "}
                → faltan{" "}
                <span className="font-bold text-red-500">
                  {d.necesario - d.disponible}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Candidatos con posición secundaria */}
        {diagnostico.candidatos?.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)]">
              Jugadores con posición secundaria disponible — elige el rol para
              esta jornada:
            </p>
            <div className="space-y-1.5">
              {diagnostico.candidatos.map((c) => (
                <div
                  key={c.jugadorId}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--c-text)] truncate">
                      {c.nombre}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <PosBadge pos={c.posicionPrincipal} small />
                      <span className="text-[8px] text-[var(--c-muted)]">
                        ★{c.nivelPrincipal}
                      </span>
                      <span className="text-[8px] text-[var(--c-muted)] mx-0.5">
                        →
                      </span>
                      <PosBadge pos={c.posicionSecundaria} small />
                      <span className="text-[8px] text-[var(--c-muted)]">
                        ★{c.nivelSecundario}
                      </span>
                    </div>
                  </div>
                  <select
                    value={asignaciones[c.jugadorId] || c.posicionPrincipal}
                    onChange={(e) =>
                      setAsignaciones((prev) => ({
                        ...prev,
                        [c.jugadorId]: e.target.value,
                      }))
                    }
                    className="text-[10px] font-bold px-1.5 py-1 rounded bg-[var(--c-surface2)] border border-[var(--c-border)] text-[var(--c-text)] focus:outline-none focus:border-purple-500"
                  >
                    <option value={c.posicionPrincipal}>
                      {c.posicionPrincipal} (principal ★{c.nivelPrincipal})
                    </option>
                    <option value={c.posicionSecundaria}>
                      {c.posicionSecundaria} (secundaria ★{c.nivelSecundario})
                    </option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {diagnostico.sinSolucion && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
            <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              No hay suficientes jugadores con posición secundaria para cubrir
              el déficit. Ajusta la convocatoria o cambia la configuración de
              equipos.
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {!diagnostico.sinSolucion && (
            <button
              onClick={() => onResolve(asignaciones)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition"
            >
              <Shuffle className="h-3.5 w-3.5" /> Generar con estos roles
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--c-border)] text-[var(--c-muted)] hover:bg-[var(--c-surface2)] transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const calcularNivelEquipo = (jugadores) => {
  if (!jugadores?.length) return "0.0";
  return (
    jugadores.reduce(
      (acc, j) => acc + Number(j.nivel_efectivo || j.nivel || 0),
      0,
    ) / jugadores.length
  ).toFixed(1);
};

const calcularRanking = (fixtureActual, listaEquipos) => {
  if (!fixtureActual || !listaEquipos) return [];
  const stats = {};
  listaEquipos.forEach((eq) => {
    stats[eq.idTemp] = {
      id: eq.idTemp,
      nombre: eq.nombre,
      jugados: 0,
      ganados: 0,
      perdidos: 0,
      puntosFavor: 0,
      puntosContra: 0,
    };
  });
  fixtureActual.forEach((ronda) => {
    if (!ronda.partidos) return;
    ronda.partidos.forEach((partido) => {
      const s1 = partido.score_equipo1,
        s2 = partido.score_equipo2;
      if (s1 !== undefined && s2 !== undefined && s1 !== "" && s2 !== "") {
        const pts1 = Number(s1),
          pts2 = Number(s2);
        if (stats[partido.equipo1] && stats[partido.equipo2]) {
          stats[partido.equipo1].jugados += 1;
          stats[partido.equipo2].jugados += 1;
          stats[partido.equipo1].puntosFavor += pts1;
          stats[partido.equipo1].puntosContra += pts2;
          stats[partido.equipo2].puntosFavor += pts2;
          stats[partido.equipo2].puntosContra += pts1;
          if (pts1 > pts2) {
            stats[partido.equipo1].ganados += 1;
            stats[partido.equipo2].perdidos += 1;
          } else if (pts2 > pts1) {
            stats[partido.equipo2].ganados += 1;
            stats[partido.equipo1].perdidos += 1;
          }
        }
      }
    });
  });
  return Object.values(stats)
    .map((item) => ({
      ...item,
      diferencia: item.puntosFavor - item.puntosContra,
    }))
    .sort(
      (a, b) =>
        b.ganados - a.ganados ||
        b.diferencia - a.diferencia ||
        b.puntosFavor - a.puntosFavor,
    );
};

/**
 * Dado un jugador y un mapa de roles asignados para la jornada,
 * devuelve el jugador enriquecido con su posición efectiva y nivel efectivo.
 */
const enriquecerJugador = (j, rolesJornada = {}) => {
  const rolAsignado = rolesJornada[j.id];
  if (rolAsignado && rolAsignado !== j.posicion_principal) {
    return {
      ...j,
      posicion_efectiva: rolAsignado,
      nivel_efectivo: Number(j.nivel_secundario || j.nivel),
      usandoSecundaria: true,
    };
  }
  return {
    ...j,
    posicion_efectiva: j.posicion_principal,
    nivel_efectivo: Number(j.nivel),
    usandoSecundaria: false,
  };
};

/**
 * Analiza si la convocatoria cubre las posiciones requeridas.
 * Retorna { ok, deficit, candidatos, sinSolucion }
 */
const diagnosticarPosiciones = (presentes, cantEquipos, rolesJornada = {}) => {
  const necesario = {
    Armador: cantEquipos,
    Opuesto: cantEquipos,
    Central: cantEquipos * 2,
    Punta: cantEquipos * 2,
  };

  // Contar posiciones efectivas (usando rolesJornada)
  const conteo = { Armador: 0, Opuesto: 0, Central: 0, Punta: 0 };
  presentes.forEach((j) => {
    const enr = enriquecerJugador(j, rolesJornada);
    if (conteo[enr.posicion_efectiva] !== undefined)
      conteo[enr.posicion_efectiva]++;
  });

  const deficit = POSICIONES.filter((p) => conteo[p] < necesario[p]).map(
    (p) => ({ pos: p, necesario: necesario[p], disponible: conteo[p] }),
  );

  if (deficit.length === 0)
    return { ok: true, deficit: [], candidatos: [], sinSolucion: false };

  // Buscar jugadores que puedan cubrir el déficit con su posición secundaria
  // (sin haber sido ya asignados a su secundaria)
  const candidatos = presentes
    .filter((j) => {
      if (!j.posicion_secundaria || !j.nivel_secundario) return false;
      if (rolesJornada[j.id] === j.posicion_secundaria) return false; // ya asignado
      return deficit.some((d) => d.pos === j.posicion_secundaria);
    })
    .map((j) => ({
      jugadorId: j.id,
      nombre: j.nombre_completo,
      posicionPrincipal: j.posicion_principal,
      nivelPrincipal: Number(j.nivel).toFixed(1),
      posicionSecundaria: j.posicion_secundaria,
      nivelSecundario: Number(j.nivel_secundario).toFixed(1),
      posicionSugerida: j.posicion_secundaria,
    }));

  // Verificar si con los candidatos se puede cubrir el déficit
  const cobertura = { ...conteo };
  candidatos.forEach((c) => {
    cobertura[c.posicionSugerida] = (cobertura[c.posicionSugerida] || 0) + 1;
  });
  const sinSolucion = deficit.some(
    (d) => (cobertura[d.pos] || 0) < d.necesario,
  );

  return { ok: false, deficit, candidatos, sinSolucion };
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PartidosTab({
  jugadores,
  restricciones,
  onGuardarJornada,
}) {
  const { toasts, removeToast, notify } = useToast();

  const [subTab, setSubTab] = useState("nueva");
  const [historialJornadas, setHistorialJornadas] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [asistencia, setAsistencia] = useState([]);
  const [rolesJornada, setRolesJornada] = useState({}); // jugadorId → posicion efectiva
  const [searchQuery, setSearchQuery] = useState("");
  const [posFilter, setPosFilter] = useState("Todas");
  const [groupByPos, setGroupByPos] = useState(true);
  const [collapsedPos, setCollapsedPos] = useState({});

  const [config, setConfig] = useState({
    cantEquipos: 4,
    cantRondas: 3,
    cantLosas: 2,
  });

  const [resultado, setResultado] = useState(null); // { equipos, fixture }
  const [diagnostico, setDiagnostico] = useState(null); // panel de advertencia activo
  const [pendienteGenerar, setPendienteGenerar] = useState(false); // esperando resolución

  const equipos = resultado?.equipos ?? null;
  const fixture = resultado?.fixture ?? null;

  const [nombreJornada, setNombreJornada] = useState("");
  const [fechaJornada, setFechaJornada] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState(null);
  const [jugadorSeleccionadoCambio, setJugadorSeleccionadoCambio] =
    useState(null);

  const esConsulta = !!jornadaSeleccionada;
  const rankingData = calcularRanking(fixture, equipos);
  const jugadoresActivos = jugadores.filter((j) => j.activo);
  const totalRequerido = config.cantEquipos * 6;

  // ─── Init ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    injectScrollbarStyles();
  }, []);

  useEffect(() => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    setFechaJornada(`${yyyy}-${mm}-${dd}`);
    setNombreJornada(`Jornada - ${dd}/${mm}/${yyyy}`);
  }, []);

  useEffect(() => {
    if (!fechaJornada || esConsulta) return;
    const [yyyy, mm, dd] = fechaJornada.split("-");
    setNombreJornada(`Jornada - ${dd}/${mm}/${yyyy}`);
  }, [fechaJornada]);

  useEffect(() => {
    if (subTab === "historial") fetchHistorial();
  }, [subTab]);

  // ─── Convocatoria filtrada ───────────────────────────────────────────────────

  const jugadoresFiltrados = useMemo(() => {
    return jugadoresActivos.filter((j) => {
      const q = searchQuery.toLowerCase();
      const matchNombre =
        !q ||
        (j.nombre_completo || "").toLowerCase().includes(q) ||
        (j.apodo || "").toLowerCase().includes(q);
      const matchPos =
        posFilter === "Todas" ||
        j.posicion_principal === posFilter ||
        j.posicion_secundaria === posFilter;
      return matchNombre && matchPos;
    });
  }, [jugadoresActivos, searchQuery, posFilter]);

  const jugadoresPorPosicion = useMemo(() => {
    const grupos = {};
    POSICIONES.forEach((p) => {
      grupos[p] = [];
    });
    jugadoresFiltrados.forEach((j) => {
      const pos = j.posicion_principal;
      if (grupos[pos]) grupos[pos].push(j);
      else grupos[pos] = [j];
    });
    return grupos;
  }, [jugadoresFiltrados]);

  const toggleCollapsed = (pos) =>
    setCollapsedPos((prev) => ({ ...prev, [pos]: !prev[pos] }));

  // ─── Data ────────────────────────────────────────────────────────────────────

  const fetchHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const result = await jornadasService.getHistorial();
      if (result.status === "success") setHistorialJornadas(result.data);
    } catch {
      notify.error("Error", "No se pudo cargar el historial de jornadas.");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const limpiarResultado = () => {
    setResultado(null);
    setJugadorSeleccionadoCambio(null);
    setJornadaSeleccionada(null);
    setDiagnostico(null);
    setPendienteGenerar(false);
  };

  // ─── Asistencia ──────────────────────────────────────────────────────────────

  const toggleAsistencia = (id) => {
    setAsistencia((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
    setRolesJornada((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    limpiarResultado();
  };

  const seleccionarTodos = () => {
    setAsistencia(
      asistencia.length === jugadoresActivos.length
        ? []
        : jugadoresActivos.map((j) => j.id),
    );
    setRolesJornada({});
    limpiarResultado();
  };

  // Cambiar rol de un jugador en la convocatoria
  const cambiarRolJornada = (jugadorId, nuevaPos) => {
    setRolesJornada((prev) => ({ ...prev, [jugadorId]: nuevaPos }));
    limpiarResultado();
  };

  // ─── Fixture ─────────────────────────────────────────────────────────────────

  const generarFixturePartidos = (equiposActuales) => {
    if (!equiposActuales || equiposActuales.length < 2) return null;

    const ids = equiposActuales.map((e) => e.idTemp);
    const n = ids.length;
    const cantLosas = config.cantLosas || 2;
    const cantRondas = config.cantRondas || 3;
    const ptsPorRonda = [18, 21, 25];

    // ── Generar todos los enfrentamientos C(n,2) ──────────────────────
    // 4 equipos → 6 partidos, 5 → 10, 6 → 15
    const todosContraTodos = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        todosContraTodos.push({ equipo1: ids[i], equipo2: ids[j] });
      }
    }

    // ── Construir cada ronda con esos mismos enfrentamientos ───────────
    const rondas = [];

    for (let r = 0; r < cantRondas; r++) {
      // Mezclar orden de partidos en cada ronda para variedad
      const shuffled = [...todosContraTodos].sort(() => Math.random() - 0.5);

      // Distribuir partidos en turnos según cantLosas
      // Cada "turno" ocupa las losas disponibles en paralelo
      const partidos = shuffled.map((p, idx) => ({
        id_partido_temp: `${r + 1}-${idx}`,
        equipo1: p.equipo1,
        equipo2: p.equipo2,
        turno: Math.floor(idx / cantLosas) + 1, // turno dentro de la ronda
        losa: (idx % cantLosas) + 1,
        score_equipo1: "",
        score_equipo2: "",
      }));

      rondas.push({
        ronda: r + 1,
        puntos: ptsPorRonda[r % ptsPorRonda.length],
        partidos,
        equipoDescansa: null, // todos juegan en cada ronda
      });
    }

    return rondas;
  };

  /**
   * Intenta generar con los roles actuales.
   * Si hay déficit, muestra el panel de resolución.
   * Si rolesExtraMap viene definido, lo usa y fuerza la generación.
   */
  const generarTorneoCompleto = (rolesExtraMap = null) => {
    if (asistencia.length !== totalRequerido) {
      notify.warning(
        "Convocatoria incompleta",
        `Necesitas exactamente ${totalRequerido} jugadores. Tienes ${asistencia.length}.`,
      );
      return;
    }

    const rolesEfectivos = rolesExtraMap ?? rolesJornada;
    const asistenciaIdsNumeros = asistencia.map((id) => Number(id));
    const presentes = jugadores.filter((j) =>
      asistenciaIdsNumeros.includes(Number(j.id)),
    );

    // Enriquecer jugadores con roles efectivos
    const presentesEnriquecidos = presentes.map((j) =>
      enriquecerJugador(j, rolesEfectivos),
    );

    // Verificar posiciones
    const diag = diagnosticarPosiciones(
      presentes,
      config.cantEquipos,
      rolesEfectivos,
    );

    if (!diag.ok && !rolesExtraMap) {
      // Mostrar panel de resolución
      setDiagnostico(diag);
      setPendienteGenerar(true);
      return;
    }

    if (!diag.ok && rolesExtraMap) {
      // Se intentó resolver pero sigue sin poder
      notify.error(
        "Sin solución válida",
        "Aun con las posiciones secundarias no se pueden cubrir todos los equipos. Ajusta la convocatoria.",
      );
      return;
    }

    setDiagnostico(null);
    setPendienteGenerar(false);

    // Armar bolsas por posición efectiva
    const bolsas = { Armador: [], Opuesto: [], Central: [], Punta: [] };
    presentesEnriquecidos.forEach((j) => {
      if (bolsas[j.posicion_efectiva]) bolsas[j.posicion_efectiva].push(j);
    });

    const restriccionesActivas = restricciones.filter(
      (r) =>
        asistenciaIdsNumeros.includes(Number(r.jugador_a_id)) &&
        asistenciaIdsNumeros.includes(Number(r.jugador_b_id)),
    );

    let mejoresEquipos = null;
    let menorDesviacion = Infinity;

    for (let i = 0; i < 3000; i++) {
      const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
      const arm = shuffle(bolsas.Armador);
      const op = shuffle(bolsas.Opuesto);
      const cen = shuffle(bolsas.Central);
      const pun = shuffle(bolsas.Punta);

      const candidatos = Array.from({ length: config.cantEquipos }, (_, t) => ({
        idTemp: String.fromCharCode(65 + t),
        nombre: `Equipo ${String.fromCharCode(65 + t)}`,
        jugadores: [
          arm[t],
          op[t],
          cen[t * 2],
          cen[t * 2 + 1],
          pun[t * 2],
          pun[t * 2 + 1],
        ],
      }));

      let ok = true;
      for (const eq of candidatos) {
        const ids = eq.jugadores.map((j) => Number(j.id));
        for (const r of restriccionesActivas) {
          const a = Number(r.jugador_a_id),
            b = Number(r.jugador_b_id);
          const tipo = r.tipo_restriccion?.trim().toLowerCase();
          if (tipo === "incompatible" && ids.includes(a) && ids.includes(b)) {
            ok = false;
            break;
          }
          if (tipo === "obligatorio" && ids.includes(a) !== ids.includes(b)) {
            ok = false;
            break;
          }
        }
        if (!ok) break;
      }
      if (!ok) continue;

      const niveles = candidatos.map(
        (eq) =>
          eq.jugadores.reduce(
            (acc, j) => acc + Number(j.nivel_efectivo || j.nivel || 0),
            0,
          ) / eq.jugadores.length,
      );
      const media = niveles.reduce((a, n) => a + n, 0) / niveles.length;
      const varianza =
        niveles.reduce((a, n) => a + (n - media) ** 2, 0) / niveles.length;

      if (varianza < menorDesviacion) {
        menorDesviacion = varianza;
        mejoresEquipos = candidatos;
      }
    }

    if (!mejoresEquipos) {
      notify.error(
        "Sin solución válida",
        "No se encontró combinación que respete todas las restricciones activas.",
      );
      return;
    }

    const fixtureGenerado = generarFixturePartidos(mejoresEquipos);
    if (!fixtureGenerado) {
      notify.error("Error", "No se pudo estructurar el fixture.");
      return;
    }

    setResultado({ equipos: mejoresEquipos, fixture: fixtureGenerado });

    // Informar si se usaron posiciones secundarias
    const usandoSecundaria = presentesEnriquecidos.filter(
      (j) => j.usandoSecundaria,
    );
    if (usandoSecundaria.length > 0) {
      notify.info(
        "Posiciones secundarias activas",
        `${usandoSecundaria.map((j) => j.nombre_completo).join(", ")} jugarán en su posición secundaria.`,
        7000,
      );
    }
    notify.success(
      "¡Fixture generado!",
      "Los equipos y partidos están listos.",
    );
  };

  // Cuando el usuario resuelve el panel de advertencia
  const handleResolverDiagnostico = (asignaciones) => {
    // asignaciones: { jugadorId → posicionElegida }
    const nuevosRoles = { ...rolesJornada, ...asignaciones };
    setRolesJornada(nuevosRoles);
    setDiagnostico(null);
    generarTorneoCompleto(nuevosRoles);
  };

  // ─── Scores / Cambios ────────────────────────────────────────────────────────

  const handleScoreChange = (rondaIndex, partidoId, campo, valor) => {
    setResultado((prev) => ({
      ...prev,
      fixture: prev.fixture.map((r, ri) =>
        ri !== rondaIndex
          ? r
          : {
              ...r,
              partidos: r.partidos.map((p) =>
                p.id_partido_temp === partidoId ? { ...p, [campo]: valor } : p,
              ),
            },
      ),
    }));
  };

  const handlePuntosRondaChange = (rondaIndex, valor) => {
    const v = valor === "" ? "" : Number(valor);
    setResultado((prev) => ({
      ...prev,
      fixture: prev.fixture.map((r, ri) =>
        ri !== rondaIndex ? r : { ...r, puntos: v },
      ),
    }));
  };

  const handleCambioManual = (teamId, jugadorId) => {
    if (esConsulta) return;
    if (!jugadorSeleccionadoCambio) {
      setJugadorSeleccionadoCambio({ teamId, jugadorId });
      return;
    }
    if (jugadorSeleccionadoCambio.jugadorId === jugadorId) {
      setJugadorSeleccionadoCambio(null);
      return;
    }
    const copia = equipos.map((eq) => ({
      ...eq,
      jugadores: [...eq.jugadores],
    }));
    const eqA = copia.find(
      (e) => e.idTemp === jugadorSeleccionadoCambio.teamId,
    );
    const eqB = copia.find((e) => e.idTemp === teamId);
    const iA = eqA.jugadores.findIndex(
      (j) => j.id === jugadorSeleccionadoCambio.jugadorId,
    );
    const iB = eqB.jugadores.findIndex((j) => j.id === jugadorId);
    [eqA.jugadores[iA], eqB.jugadores[iB]] = [
      eqB.jugadores[iB],
      eqA.jugadores[iA],
    ];
    setResultado((prev) => ({ ...prev, equipos: copia }));
    setJugadorSeleccionadoCambio(null);
    notify.info("Cambio realizado", "Los jugadores han sido intercambiados.");
  };

  const handleNombreEquipoChange = (idTemp, nombre) => {
    if (esConsulta) return;
    setResultado((prev) => ({
      ...prev,
      equipos: prev.equipos.map((e) =>
        e.idTemp === idTemp ? { ...e, nombre } : e,
      ),
    }));
  };

  // ─── Persistencia ────────────────────────────────────────────────────────────

  const handleGuardarTodo = async () => {
    if (typeof onGuardarJornada !== "function") return;
    setGuardando(true);
    try {
      await onGuardarJornada({
        nombre: nombreJornada,
        fecha: fechaJornada,
        configuracion: config,
        equipos: equipos.map((e) => ({
          nombre: e.nombre,
          id_ref: e.idTemp,
          jugadores: e.jugadores.map((j) => j.id),
        })),
        fixture,
      });
      notify.success(
        "Jornada guardada",
        "El fixture y los equipos se registraron correctamente.",
      );
      limpiarResultado();
      setAsistencia([]);
      setRolesJornada({});
      const hoy = new Date();
      setFechaJornada(
        `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`,
      );
    } catch {
      notify.error(
        "Error al guardar",
        "No se pudo registrar la jornada. Intenta nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarScoresExistentes = async () => {
    if (!jornadaSeleccionada) return;
    setGuardando(true);
    try {
      const r = await jornadasService.updateScores(jornadaSeleccionada.id, {
        fixture,
      });
      if (r.status === "success")
        notify.success(
          "Marcadores actualizados",
          "Los resultados se guardaron.",
        );
      else
        notify.warning(
          "Sin confirmación",
          "El servidor no confirmó el resultado.",
        );
    } catch {
      notify.error("Error de conexión", "No se pudo guardar los marcadores.");
    } finally {
      setGuardando(false);
    }
  };

  const verDetalleJornada = async (resumen) => {
    try {
      const resp = await jornadasService.getDetalle(resumen.id);
      if (resp.status === "success" && resp.data) {
        const j = resp.data;
        setJornadaSeleccionada(j);
        setNombreJornada(j.nombre);
        if (j.fecha) setFechaJornada(j.fecha.split("T")[0]);
        setResultado({
          equipos: j.equipos.map((eq) => ({
            idTemp: eq.id_ref,
            nombre: eq.nombre,
            equipo_db_id: eq.equipo_db_id,
            jugadores: eq.jugadores,
          })),
          fixture: j.fixture,
        });
        setSubTab("nueva");
      } else {
        notify.error("Error al cargar", "No se pudo obtener el detalle.");
      }
    } catch {
      notify.error("Error de conexión", "Problema al consultar la jornada.");
    }
  };

  const exportarAExcel = () => {
    if (!equipos || !fixture) return;
    const wb = XLSX.utils.book_new();
    const datosEquipos = [];
    equipos.forEach((eq) => {
      datosEquipos.push([
        eq.nombre,
        `Nivel Promedio: ★${calcularNivelEquipo(eq.jugadores)}`,
      ]);
      datosEquipos.push(["Nombre", "Posición", "Nivel"]);
      eq.jugadores.forEach((j) =>
        datosEquipos.push([
          j.nombre_completo || j.nombre || "",
          j.posicion_efectiva || j.posicion_principal || "",
          j.nivel_efectivo || j.nivel || "",
        ]),
      );
      datosEquipos.push([]);
    });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(datosEquipos),
      "Equipos",
    );
    const datosPartidos = [
      ["Ronda", "Equipo 1", "Score E1", "", "Score E2", "Equipo 2", "Losa"],
    ];
    fixture.forEach((r) => {
      r.partidos.forEach((p) =>
        datosPartidos.push([
          `Ronda ${r.ronda}`,
          equipos.find((e) => e.idTemp === p.equipo1)?.nombre || p.equipo1,
          p.score_equipo1 ?? "",
          "-",
          p.score_equipo2 ?? "",
          equipos.find((e) => e.idTemp === p.equipo2)?.nombre || p.equipo2,
          `Losa ${p.losa}`,
        ]),
      );
    });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(datosPartidos),
      "Partidos",
    );
    XLSX.writeFile(wb, `${nombreJornada.replace(/\s+/g, "_")}.xlsx`);
    notify.success("Excel exportado", `Archivo "${nombreJornada}" descargado.`);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  // Contar convocados por posición para la barra de estado
  const conteoPorPos = useMemo(() => {
    const ids = asistencia.map((id) => Number(id));
    const pres = jugadores.filter((j) => ids.includes(Number(j.id)));
    const conteo = { Armador: 0, Opuesto: 0, Central: 0, Punta: 0 };
    pres.forEach((j) => {
      const rol = rolesJornada[j.id] || j.posicion_principal;
      if (conteo[rol] !== undefined) conteo[rol]++;
    });
    return conteo;
  }, [asistencia, jugadores, rolesJornada]);

  const necesarioPorPos = {
    Armador: config.cantEquipos,
    Opuesto: config.cantEquipos,
    Central: config.cantEquipos * 2,
    Punta: config.cantEquipos * 2,
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-4">
        {/* ── Barra de navegación ── */}
        <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-3">
          <div className="flex gap-2">
            <TabButton
              active={subTab === "nueva"}
              onClick={() => {
                setSubTab("nueva");
                if (!esConsulta) limpiarResultado();
              }}
              icon={PlusCircle}
              label={esConsulta ? "Jornada guardada" : "Nueva jornada"}
            />
            <TabButton
              active={subTab === "historial"}
              onClick={() => setSubTab("historial")}
              icon={History}
              label="Historial"
            />
          </div>
          {esConsulta && (
            <button
              onClick={limpiarResultado}
              className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:underline"
            >
              <X className="h-3.5 w-3.5" /> Salir de consulta
            </button>
          )}
        </div>

        {/* ══ PESTAÑA: NUEVA JORNADA ══ */}
        {subTab === "nueva" && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* ── Columna izquierda ── */}
            <div className="xl:col-span-1 space-y-4">
              {/* Configuración */}
              <SectionCard title="Configuración" icon={Settings} accent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      disabled={esConsulta}
                      value={fechaJornada}
                      onChange={(e) => setFechaJornada(e.target.value)}
                      className="w-full p-2 bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] text-xs font-semibold focus:outline-none focus:border-purple-500 disabled:opacity-60 text-center"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Equipos",
                        key: "cantEquipos",
                        options: [2, 3, 4, 5, 6, 7, 8, 9],
                      },
                      {
                        label: "Losas",
                        key: "cantLosas",
                        options: [1, 2, 3, 4],
                      },
                      {
                        label: "Rondas",
                        key: "cantRondas",
                        options: [1, 2, 3, 4, 5],
                      },
                    ].map(({ label, key, options }) => (
                      <div key={key}>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)] mb-1">
                          {label}
                        </label>
                        <select
                          disabled={esConsulta}
                          value={config[key]}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              [key]: Number(e.target.value),
                            })
                          }
                          className="w-full p-1.5 bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] text-xs font-semibold focus:outline-none focus:border-purple-500 disabled:opacity-60"
                        >
                          {options.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Convocatoria */}
              {!esConsulta && (
                <div className="border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--c-border)] bg-[var(--c-surface2)]/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
                        Convocatoria
                        <span
                          className={`ml-1.5 font-mono ${asistencia.length === totalRequerido ? "text-emerald-500" : "text-purple-500"}`}
                        >
                          {asistencia.length}/{totalRequerido}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={seleccionarTodos}
                      className="text-[10px] text-purple-500 font-semibold hover:underline"
                    >
                      {asistencia.length === jugadoresActivos.length
                        ? "Limpiar"
                        : "Todos"}
                    </button>
                  </div>

                  <div className="p-3 space-y-3">
                    {/* Barra de búsqueda */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--c-muted)]" />
                      <input
                        type="text"
                        placeholder="Buscar jugador..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg text-[var(--c-text)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--c-muted)]"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--c-muted)] hover:text-[var(--c-text)]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Filtros de posición */}
                    <div className="flex flex-wrap gap-1">
                      {["Todas", ...POSICIONES].map((p) => {
                        const c = p === "Todas" ? null : POS_COLOR[p];
                        const active = posFilter === p;
                        return (
                          <button
                            key={p}
                            onClick={() => setPosFilter(p)}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition ${
                              active
                                ? c
                                  ? `${c.bg} ${c.text} ${c.border}`
                                  : "bg-purple-500/15 text-purple-500 border-purple-500/30"
                                : "bg-[var(--c-surface2)] text-[var(--c-muted)] border-transparent hover:border-[var(--c-border)]"
                            }`}
                          >
                            {p === "Todas" ? "Todas" : POS_ABBR[p]}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setGroupByPos((v) => !v)}
                        title={
                          groupByPos ? "Vista plana" : "Agrupar por posición"
                        }
                        className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded border transition ${
                          groupByPos
                            ? "bg-purple-500/15 text-purple-500 border-purple-500/30"
                            : "bg-[var(--c-surface2)] text-[var(--c-muted)] border-transparent"
                        }`}
                      >
                        {groupByPos ? "Agrupado" : "Plano"}
                      </button>
                    </div>

                    {/* Mini-resumen de posiciones convocadas */}
                    <div className="grid grid-cols-4 gap-1">
                      {POSICIONES.map((p) => {
                        const actual = conteoPorPos[p];
                        const nec = necesarioPorPos[p];
                        const ok = actual >= nec;
                        const c = POS_COLOR[p];
                        return (
                          <div
                            key={p}
                            className={`flex flex-col items-center p-1 rounded border ${ok ? `${c.bg} ${c.border}` : "bg-red-500/5 border-red-500/20"}`}
                          >
                            <span
                              className={`text-[8px] font-bold ${ok ? c.text : "text-red-500"}`}
                            >
                              {POS_ABBR[p]}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold ${ok ? c.text : "text-red-500"}`}
                            >
                              {actual}
                              <span className="opacity-50">/{nec}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Lista de jugadores */}
                    <div className="vw-scroll space-y-2 max-h-[calc(100vh-560px)] min-h-[120px] overflow-y-auto pr-1">
                      {groupByPos
                        ? POSICIONES.map((pos) => {
                            const grupo = jugadoresPorPosicion[pos];
                            if (!grupo?.length) return null;
                            const c = POS_COLOR[pos];
                            const collapsed = collapsedPos[pos];
                            const selEnPos = grupo.filter((j) =>
                              asistencia.includes(j.id),
                            ).length;
                            return (
                              <div
                                key={pos}
                                className="overflow-hidden rounded-lg border border-[var(--c-border)]"
                              >
                                {/* Cabecera del grupo */}
                                <button
                                  onClick={() => toggleCollapsed(pos)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 ${c.bg} border-b border-[var(--c-border)] transition hover:opacity-90`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <PosBadge pos={pos} small />
                                    <span
                                      className={`text-[10px] font-bold ${c.text}`}
                                    >
                                      {pos}
                                    </span>
                                    <span
                                      className={`text-[8px] font-mono ${c.text} opacity-70`}
                                    >
                                      ({selEnPos}/{grupo.length})
                                    </span>
                                  </div>
                                  {collapsed ? (
                                    <ChevronDown
                                      className={`h-3 w-3 ${c.text}`}
                                    />
                                  ) : (
                                    <ChevronUp
                                      className={`h-3 w-3 ${c.text}`}
                                    />
                                  )}
                                </button>

                                {!collapsed && (
                                  <div className="divide-y divide-[var(--c-border)]/50">
                                    {grupo.map((j) => {
                                      const checked = asistencia.includes(j.id);
                                      const rolActual =
                                        rolesJornada[j.id] ||
                                        j.posicion_principal;
                                      const usandoSecundaria =
                                        rolActual !== j.posicion_principal;
                                      return (
                                        <div
                                          key={j.id}
                                          className={`flex items-center gap-1.5 px-2 py-1.5 transition ${checked ? "bg-purple-500/5" : "hover:bg-[var(--c-surface2)]/50"}`}
                                        >
                                          {/* Checkbox */}
                                          <button
                                            onClick={() =>
                                              toggleAsistencia(j.id)
                                            }
                                            className="shrink-0"
                                          >
                                            {checked ? (
                                              <CheckSquare className="h-3.5 w-3.5 text-purple-500" />
                                            ) : (
                                              <Square className="h-3.5 w-3.5 text-[var(--c-muted)]" />
                                            )}
                                          </button>

                                          {/* Nombre */}
                                          <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() =>
                                              toggleAsistencia(j.id)
                                            }
                                          >
                                            <p
                                              className={`text-xs font-medium truncate ${checked ? "text-[var(--c-text)]" : "text-[var(--c-muted)]"}`}
                                            >
                                              {j.nombre_completo}
                                            </p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <span className="text-[8px] font-mono text-[var(--c-muted)]">
                                                ★{Number(j.nivel).toFixed(1)}
                                              </span>
                                              {j.posicion_secundaria &&
                                                j.nivel_secundario && (
                                                  <>
                                                    <span className="text-[7px] text-[var(--c-muted)] opacity-50">
                                                      |
                                                    </span>
                                                    <PosBadge
                                                      pos={
                                                        j.posicion_secundaria
                                                      }
                                                      small
                                                    />
                                                    <span className="text-[8px] font-mono text-[var(--c-muted)] opacity-70">
                                                      ★
                                                      {Number(
                                                        j.nivel_secundario,
                                                      ).toFixed(1)}
                                                    </span>
                                                  </>
                                                )}
                                            </div>
                                          </div>

                                          {/* Selector de rol (solo si está convocado y tiene secundaria) */}
                                          {checked &&
                                            j.posicion_secundaria &&
                                            j.nivel_secundario && (
                                              <select
                                                value={rolActual}
                                                onChange={(e) =>
                                                  cambiarRolJornada(
                                                    j.id,
                                                    e.target.value,
                                                  )
                                                }
                                                className={`text-[8px] font-bold px-1 py-0.5 rounded border focus:outline-none focus:border-purple-500 shrink-0 ${
                                                  usandoSecundaria
                                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                                                    : "bg-[var(--c-surface2)] border-[var(--c-border)] text-[var(--c-muted)]"
                                                }`}
                                                title="Rol en esta jornada"
                                              >
                                                <option
                                                  value={j.posicion_principal}
                                                >
                                                  {
                                                    POS_ABBR[
                                                      j.posicion_principal
                                                    ]
                                                  }
                                                </option>
                                                <option
                                                  value={j.posicion_secundaria}
                                                >
                                                  {
                                                    POS_ABBR[
                                                      j.posicion_secundaria
                                                    ]
                                                  }{" "}
                                                  2°
                                                </option>
                                              </select>
                                            )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        : // Vista plana
                          jugadoresFiltrados.map((j) => {
                            const checked = asistencia.includes(j.id);
                            const rolActual =
                              rolesJornada[j.id] || j.posicion_principal;
                            const usandoSecundaria =
                              rolActual !== j.posicion_principal;
                            return (
                              <div
                                key={j.id}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${checked ? "bg-purple-500/5 border-purple-500/20" : "border-transparent hover:bg-[var(--c-surface2)]/50"}`}
                              >
                                <button
                                  onClick={() => toggleAsistencia(j.id)}
                                  className="shrink-0"
                                >
                                  {checked ? (
                                    <CheckSquare className="h-3.5 w-3.5 text-purple-500" />
                                  ) : (
                                    <Square className="h-3.5 w-3.5 text-[var(--c-muted)]" />
                                  )}
                                </button>
                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => toggleAsistencia(j.id)}
                                >
                                  <div className="flex items-center gap-1">
                                    <PosBadge
                                      pos={j.posicion_principal}
                                      small
                                    />
                                    <p
                                      className={`text-xs font-medium truncate ${checked ? "text-[var(--c-text)]" : "text-[var(--c-muted)]"}`}
                                    >
                                      {j.nombre_completo}
                                    </p>
                                  </div>
                                  <span className="text-[8px] font-mono text-[var(--c-muted)]">
                                    ★{Number(j.nivel).toFixed(1)}
                                  </span>
                                </div>
                                {checked &&
                                  j.posicion_secundaria &&
                                  j.nivel_secundario && (
                                    <select
                                      value={rolActual}
                                      onChange={(e) =>
                                        cambiarRolJornada(j.id, e.target.value)
                                      }
                                      className={`text-[8px] font-bold px-1 py-0.5 rounded border focus:outline-none focus:border-purple-500 shrink-0 ${usandoSecundaria ? "bg-amber-500/10 border-amber-500/30 text-amber-600" : "bg-[var(--c-surface2)] border-[var(--c-border)] text-[var(--c-muted)]"}`}
                                    >
                                      <option value={j.posicion_principal}>
                                        {POS_ABBR[j.posicion_principal]}
                                      </option>
                                      <option value={j.posicion_secundaria}>
                                        {POS_ABBR[j.posicion_secundaria]} 2°
                                      </option>
                                    </select>
                                  )}
                              </div>
                            );
                          })}

                      {jugadoresFiltrados.length === 0 && (
                        <p className="text-center text-[10px] text-[var(--c-muted)] py-4">
                          Sin resultados para "{searchQuery}"
                        </p>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="h-1 bg-[var(--c-surface2)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{
                            width: `${Math.min((asistencia.length / totalRequerido) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-[var(--c-muted)] mt-1 text-center">
                        {asistencia.length === totalRequerido
                          ? "¡Listo para generar!"
                          : `Faltan ${totalRequerido - asistencia.length} jugadores`}
                      </p>
                    </div>

                    {/* Panel de advertencia de posiciones */}
                    {diagnostico && (
                      <PositionWarningPanel
                        diagnostico={diagnostico}
                        onResolve={handleResolverDiagnostico}
                        onCancel={() => {
                          setDiagnostico(null);
                          setPendienteGenerar(false);
                        }}
                      />
                    )}

                    <button
                      onClick={() => generarTorneoCompleto()}
                      disabled={asistencia.length !== totalRequerido}
                      className="w-full mt-1 bg-purple-500 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-purple-600 transition"
                    >
                      <Dices className="h-4 w-4" /> Generar fixture
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Contenido principal ── */}
            {fixture && equipos ? (
              <>
                {/* Columna 2: Fixture */}
                <div className="xl:col-span-1 space-y-3">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-xs font-bold text-[var(--c-text)] truncate">
                      {nombreJornada}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={exportarAExcel}
                        title="Exportar a Excel"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </button>
                      <button
                        onClick={
                          esConsulta
                            ? handleGuardarScoresExistentes
                            : handleGuardarTodo
                        }
                        disabled={guardando}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {guardando
                          ? "Guardando..."
                          : esConsulta
                            ? "Actualizar"
                            : "Guardar"}
                      </button>
                    </div>
                  </div>

                  <div className="vw-scroll space-y-3 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
                    {fixture.map((rondaData, rondaIndex) => (
                      <div
                        key={rondaData.ronda}
                        className="border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] overflow-hidden shadow-sm"
                      >
                        <div className="flex items-center justify-between px-3 py-2 bg-[var(--c-surface2)] border-b border-[var(--c-border)]">
                          <span className="text-xs font-bold text-[var(--c-text)]">
                            Ronda {rondaData.ronda}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-[var(--c-muted)]">
                            <input
                              type="number"
                              min="1"
                              disabled={esConsulta}
                              value={rondaData.puntos ?? ""}
                              onChange={(e) =>
                                handlePuntosRondaChange(
                                  rondaIndex,
                                  e.target.value,
                                )
                              }
                              className="w-7 text-center bg-[var(--c-surface)] border border-[var(--c-border)] rounded text-xs font-bold text-[var(--c-text)] focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-60"
                            />
                            <span>pts</span>
                          </div>
                        </div>

                        {rondaData.equipoDescansa && (
                          <div className="px-3 py-2 bg-amber-500/5 border-b border-dashed border-[var(--c-border)] flex items-center gap-1.5 text-[11px] text-amber-500 font-medium">
                            <span className="animate-pulse">⏳</span>
                            <span>
                              Descansa:{" "}
                              <span className="font-bold underline decoration-amber-500/30">
                                {rondaData.equipoDescansa.nombre}
                              </span>
                            </span>
                          </div>
                        )}

                        <div className="divide-y divide-dashed divide-[var(--c-border)]">
                          {rondaData.partidos.map((partido, idx) => {
                            const n1 =
                              equipos.find((e) => e.idTemp === partido.equipo1)
                                ?.nombre || partido.equipo1;
                            const n2 =
                              equipos.find((e) => e.idTemp === partido.equipo2)
                                ?.nombre || partido.equipo2;
                            return (
                              <div
                                key={partido.id_partido_temp || idx}
                                className="p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">
                                    Losa {partido.losa}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="flex-1 text-xs font-semibold text-blue-500 truncate">
                                    {n1}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <input
                                      type="number"
                                      min="0"
                                      value={partido.score_equipo1 ?? ""}
                                      onChange={(e) =>
                                        handleScoreChange(
                                          rondaIndex,
                                          partido.id_partido_temp,
                                          "score_equipo1",
                                          e.target.value,
                                        )
                                      }
                                      className="w-9 text-center p-1 text-xs font-bold bg-[var(--c-surface2)] border border-[var(--c-border)] rounded text-[var(--c-text)] focus:border-purple-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                                      placeholder="0"
                                    />
                                    <span className="text-[var(--c-muted)] text-xs">
                                      :
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={partido.score_equipo2 ?? ""}
                                      onChange={(e) =>
                                        handleScoreChange(
                                          rondaIndex,
                                          partido.id_partido_temp,
                                          "score_equipo2",
                                          e.target.value,
                                        )
                                      }
                                      className="w-9 text-center p-1 text-xs font-bold bg-[var(--c-surface2)] border border-[var(--c-border)] rounded text-[var(--c-text)] focus:border-purple-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                                      placeholder="0"
                                    />
                                  </div>
                                  <span className="flex-1 text-xs font-semibold text-red-500 truncate text-right">
                                    {n2}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columnas 3-4: Ranking + Equipos */}
                <div className="vw-scroll xl:col-span-2 space-y-4 max-h-[calc(100vh-170px)] overflow-y-auto pr-1">
                  {rankingData.length > 0 && (
                    <div className="border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between px-4 py-3 bg-[var(--c-surface2)] border-b border-[var(--c-border)]">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
                            Posiciones
                          </span>
                        </div>
                        <span className="text-[9px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-bold font-mono">
                          En vivo
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs table-fixed">
                          <thead>
                            <tr className="bg-[var(--c-surface2)] text-[var(--c-muted)] text-[9px] font-mono uppercase border-b border-[var(--c-border)]">
                              <th className="py-2 px-2 w-8 text-center">#</th>
                              <th className="py-2 px-2 text-left">Equipo</th>
                              <th className="py-2 px-2 w-8 text-center">PJ</th>
                              <th className="py-2 px-2 w-8 text-center text-emerald-600">
                                PG
                              </th>
                              <th className="py-2 px-2 w-8 text-center text-red-500">
                                PP
                              </th>
                              <th className="py-2 px-2 w-10 text-center">PF</th>
                              <th className="py-2 px-2 w-10 text-center">PC</th>
                              <th className="py-2 px-2 w-10 text-center font-bold">
                                DP
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--c-border)] text-[var(--c-text)] font-medium">
                            {rankingData.map((row, i) => (
                              <tr
                                key={row.id}
                                className="hover:bg-[var(--c-surface2)]/40 transition-colors"
                              >
                                <td className="py-2 px-2 text-center font-mono">
                                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                                </td>
                                <td className="py-2 px-2 font-bold truncate">
                                  {row.nombre}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-[var(--c-muted)]">
                                  {row.jugados}
                                </td>
                                <td className="py-2 px-2 text-center font-mono font-bold text-emerald-600">
                                  {row.ganados}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-red-500">
                                  {row.perdidos}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-[var(--c-muted)]">
                                  {row.puntosFavor}
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-[var(--c-muted)]">
                                  {row.puntosContra}
                                </td>
                                <td
                                  className={`py-2 px-2 text-center font-mono font-bold ${row.diferencia > 0 ? "text-blue-500" : row.diferencia < 0 ? "text-red-500" : "text-[var(--c-muted)]"}`}
                                >
                                  {row.diferencia > 0
                                    ? `+${row.diferencia}`
                                    : row.diferencia}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {jugadorSeleccionadoCambio && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-700 font-medium">
                      Selecciona otro jugador para intercambiar. Haz clic en el
                      mismo para cancelar.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {equipos.map((eq) => (
                      <div
                        key={eq.idTemp}
                        className="border border-[var(--c-border)] rounded-xl bg-[var(--c-surface)] p-3 space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-2">
                          <input
                            type="text"
                            disabled={esConsulta}
                            value={eq.nombre}
                            onChange={(e) =>
                              handleNombreEquipoChange(
                                eq.idTemp,
                                e.target.value,
                              )
                            }
                            className="bg-transparent font-bold text-xs text-[var(--c-text)] focus:outline-none focus:border-b focus:border-purple-500 w-2/3 disabled:opacity-70"
                          />
                          <span className="text-[10px] font-mono text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded font-bold">
                            ★ {calcularNivelEquipo(eq.jugadores)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {eq.jugadores.map((j) => {
                            const seleccionado =
                              jugadorSeleccionadoCambio?.teamId === eq.idTemp &&
                              jugadorSeleccionadoCambio?.jugadorId === j.id;
                            const posEfectiva =
                              j.posicion_efectiva || j.posicion_principal;
                            const usandoSec = j.usandoSecundaria;
                            return (
                              <button
                                key={j.id}
                                disabled={esConsulta}
                                onClick={() =>
                                  handleCambioManual(eq.idTemp, j.id)
                                }
                                className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between text-xs transition border ${
                                  seleccionado
                                    ? "bg-purple-500 text-white border-purple-500"
                                    : "bg-[var(--c-surface2)]/40 border-transparent hover:bg-[var(--c-surface2)] disabled:cursor-default"
                                }`}
                              >
                                <span className="truncate font-medium">
                                  {j.nombre_completo || j.nombre}
                                </span>
                                <div className="flex items-center gap-1 text-[9px] font-mono shrink-0 ml-1">
                                  <span
                                    className={`uppercase px-1 rounded font-bold ${seleccionado ? "bg-white/20 text-white" : usandoSec ? "bg-amber-500/15 text-amber-500" : "bg-[var(--c-surface)] text-[var(--c-muted)]"}`}
                                  >
                                    {posEfectiva?.substring(0, 3)}
                                    {usandoSec && " 2°"}
                                  </span>
                                  <span
                                    className={
                                      seleccionado
                                        ? "text-white/80"
                                        : "opacity-70"
                                    }
                                  >
                                    ★
                                    {Number(
                                      j.nivel_efectivo || j.nivel,
                                    ).toFixed(1)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="xl:col-span-3 flex flex-col items-center justify-center p-12 text-center border border-dashed border-[var(--c-border)] rounded-2xl bg-[var(--c-surface)]/40 min-h-[400px]">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <h5 className="text-sm font-bold text-[var(--c-text)] mb-1">
                  Sin fixture generado
                </h5>
                <p className="text-xs text-[var(--c-muted)] max-w-xs">
                  Selecciona {totalRequerido} jugadores en el panel de
                  convocatoria y presiona "Generar fixture".
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══ PESTAÑA: HISTORIAL ══ */}
        {subTab === "historial" && (
          <SectionCard title="Historial de jornadas" icon={History}>
            {loadingHistorial ? (
              <p className="text-xs text-[var(--c-muted)] text-center py-8">
                Cargando historial...
              </p>
            ) : historialJornadas.length === 0 ? (
              <p className="text-xs text-[var(--c-muted)] text-center py-8">
                No hay jornadas registradas aún.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {historialJornadas.map((jornada) => (
                  <div
                    key={jornada.id}
                    className="border border-[var(--c-border)] rounded-xl bg-[var(--c-surface2)]/40 p-3 flex items-center justify-between hover:border-purple-500/40 transition group"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-bold text-[var(--c-text)] truncate">
                        {jornada.nombre}
                      </p>
                      <p className="text-[10px] text-[var(--c-muted)] flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {jornada.fecha
                          ? new Date(jornada.fecha).toLocaleDateString()
                          : "Sin fecha"}
                      </p>
                    </div>
                    <button
                      onClick={() => verDetalleJornada(jornada)}
                      className="ml-3 shrink-0 flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-lg transition"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </>
  );
}
