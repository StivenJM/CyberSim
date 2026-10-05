import { API_BASE_URL } from "../../../common/utils/apiConfig";
import { useAsyncState } from "../../../common/hooks";

const API_URL = API_BASE_URL;

interface RegisterEstudianteData {
  primernombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  codigo_unico: number;
  correo_electronico: string;
  contrasenia: string;
  id_profesor?: number;
}

interface RegisterProfesorData {
  nombre_completo: string;
  correo_electronico: string;
  contrasenia: string;
  departamento?: string;
}

interface LoginData {
  correo_electronico: string;
  contrasenia: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    role: "estudiante" | "profesor";
    confirmado: boolean;
    user: {
      id: string;
      nombre_completo: string;
      correo_electronico: string;
      rol: string;
    };
  };
  error?: string;
}

/**
 * Usuario persistido en localStorage tras el login.
 * Combina los campos de `AuthResponse.data.user` con identificadores de rol
 * (`id_estudiante` o `id_profesor`) que inyecta el backend en el login.
 */
export interface StoredUser {
  id: string;
  nombre_completo: string;
  correo_electronico: string;
  rol: string;
  id_estudiante?: number;
  id_profesor?: number;
}

export type UserRole = "estudiante" | "profesor";

export interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  clearError: () => void;
  registerEstudiante: (data: RegisterEstudianteData) => Promise<AuthResponse | null>;
  registerProfesor: (data: RegisterProfesorData) => Promise<AuthResponse | null>;
  login: (data: LoginData) => Promise<AuthResponse | null>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isEmailConfirmed: () => boolean;
  getUser: () => StoredUser | null;
  getUserRole: () => UserRole | null;
  resendConfirmation: (correo_electronico: string) => Promise<{ success: boolean } | null>;
}

export const useAuth = (): UseAuthReturn => {
  const { loading, error, runAsync, setError } = useAsyncState();

  const clearError = () => setError(null);

  const registerEstudiante = (data: RegisterEstudianteData) =>
    runAsync(async () => {
      let response: Response;
      try {
        response = await fetch(`${API_URL}/auth/register/estudiante`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (err) {
        // Error de conexión: se decora con hint de dev para facilitar diagnóstico.
        const msg = err instanceof Error ? err.message : "Error de conexión";
        throw new Error(`${msg}. ¿Está el servidor backend corriendo en /auth?`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        throw new Error("Error del servidor: No se recibió una respuesta JSON válida.");
      }

      const result: AuthResponse = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al registrar estudiante");
      return result;
    });

  const registerProfesor = (data: RegisterProfesorData) =>
    runAsync(async () => {
      const response = await fetch(`${API_URL}/auth/register/profesor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al registrar profesor");
      return result;
    });

  const login = (data: LoginData) =>
    runAsync(async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al iniciar sesión");

      if (result.data?.token) {
        localStorage.setItem("authToken", result.data.token);
        localStorage.setItem("userRole", result.data.role);
        localStorage.setItem("emailConfirmado", String(result.data.confirmado));
        localStorage.setItem("user", JSON.stringify({
          ...result.data.user,
          correo_electronico: data.correo_electronico,
        }));
      }

      return result;
    });

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("emailConfirmado");
    localStorage.removeItem("user");
  };

  const isAuthenticated = (): boolean => !!localStorage.getItem("authToken");

  const isEmailConfirmed = (): boolean => localStorage.getItem("emailConfirmado") === "true";

  const resendConfirmation = (correo_electronico: string) =>
    runAsync(async () => {
      const response = await fetch(`${API_URL}/auth/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_electronico }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al reenviar correo de confirmación");
      return result;
    });

  const getUser = (): StoredUser | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? (JSON.parse(userStr) as StoredUser) : null;
  };

  const getUserRole = (): UserRole | null => {
    return localStorage.getItem("userRole") as UserRole | null;
  };

  return {
    loading,
    error,
    clearError,
    registerEstudiante,
    registerProfesor,
    login,
    logout,
    isAuthenticated,
    isEmailConfirmed,
    getUser,
    getUserRole,
    resendConfirmation,
  };
};
