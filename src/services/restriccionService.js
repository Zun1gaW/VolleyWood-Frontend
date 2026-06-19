// src/services/restriccionService.js
import api from "./api"; // 🔑 Importamos nuestra instancia centralizada de Axios

export const restriccionService = {
  getAll: async () => {
    const response = await api.get("/restricciones");
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post("/restricciones", data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/restricciones/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/restricciones/${id}`);
    return response.data;
  },
};
