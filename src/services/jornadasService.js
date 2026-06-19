// src/services/jornadasService.js
import api from "./api";

export const jornadasService = {
  /**
   * Obtiene el historial de todas las jornadas guardadas.
   */
  getHistorial: async () => {
    try {
      const response = await api.get("/jornadas");
      return response.data; // Retorna la estructura de datos que envíe tu backend
    } catch (error) {
      console.error("Error en jornadasService.getHistorial:", error);
      throw error;
    }
  },

  /**
   * Registra una nueva jornada completa con su configuración, equipos y fixture.
   * @param {Object} payloadData - Datos de la jornada mapeados para el backend
   */
  guardarJornada: async (payloadData) => {
    try {
      const response = await api.post("/jornadas", payloadData);
      return response.data;
    } catch (error) {
      console.error("Error en jornadasService.guardarJornada:", error);
      throw error;
    }
  },

  /**
   * Obtiene el detalle completo (estructurado con equipos y fixture) de una jornada específica
   */
  getDetalle: async (id) => {
    try {
      const response = await api.get(`/jornadas/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error en jornadasService.getDetalle para ID ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Actualiza los marcadores/scores de los partidos de una jornada específica.
   */
  updateScores: async (id, payload) => {
    try {
      const response = await api.put(`/jornadas/${id}/scores`, payload);
      return response.data;
    } catch (error) {
      console.error("Error en jornadasService.updateScores:", error);
      throw error;
    }
  },
};
