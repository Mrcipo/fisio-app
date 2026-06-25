const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const ERROR_TRANSLATIONS: Record<string, string> = {
  "Patient not found": "Paciente no encontrado",
  "Session not found": "Sesión no encontrada",
  "Initial assessment not found": "Anamnesis inicial no encontrada",
  Unauthorized: "No autorizado",
  "Invalid credentials": "Credenciales inválidas",
  "Email already in use": "El email ya está en uso",
};

function translateError(message: string): string {
  return ERROR_TRANSLATIONS[message] ?? message;
}

export async function apiClient<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const { headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const rawMessage = errorBody?.error?.message ?? "Request failed";

    throw new Error(translateError(rawMessage));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function fetchBlob(path: string, options: RequestInit = {}) {
  const { headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      ...headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message ?? "Request failed";

    throw new Error(message);
  }

  return response.blob();
}

type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export async function login(input: { email: string; password: string }): Promise<AuthUser> {
  const response = await apiClient<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.user;
}

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthUser> {
  const response = await apiClient<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.user;
}

export async function logout(): Promise<void> {
  await apiClient("/auth/logout", { method: "POST" });
}
