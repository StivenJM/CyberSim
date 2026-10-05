// Configuración centralizada de la URL del backend.
// Usada tanto por el frontend (visual/) como por el ECS (ecs/).

export const getApiBaseUrl = (): string => {
  // Vite inyecta import.meta.env en el frontend
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl && backendUrl.trim() !== "") {
      return backendUrl;
    }
    if (import.meta.env.DEV) {
      return "/api";
    }
  }

  // Fallback: debe configurarse VITE_BACKEND_URL en producción
  return "/api";
};

export const API_BASE_URL = getApiBaseUrl();
