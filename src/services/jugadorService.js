// src/services/jugadorService.js
import api from "./api";

export const jugadorService = {
  // Obtener todos los jugadores
  getAll: async () => {
    const response = await api.get("/jugadores");
    return response.data.data;
  },

  // Crear un nuevo jugador
  create: async (jugadorData) => {
    const response = await api.post("/jugadores", jugadorData);
    return response.data.data;
  },

  // Actualizar un jugador existente
  update: async (id, jugadorData) => {
    const response = await api.put(`/jugadores/${id}`, jugadorData);
    return response.data;
  },

  // Eliminar un jugador
  delete: async (id) => {
    const response = await api.delete(`/jugadores/${id}`);
    return response.data;
  },
};
