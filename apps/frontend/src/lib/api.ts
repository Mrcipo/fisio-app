const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "fisioterapia_app_token";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiClient<TResponse>(
  path: string,
  options: ApiOptions = {},
): Promise<TResponse> {
  const { auth = true, headers, ...requestOptions } = options;
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message ?? "Request failed";

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function fetchHtml(path: string, options: ApiOptions = {}) {
  const { auth = true, headers, ...requestOptions } = options;
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message ?? "Request failed";

    throw new Error(message);
  }

  return response.text();
}

export async function fetchBlob(path: string, options: ApiOptions = {}) {
  const { auth = true, headers, ...requestOptions } = options;
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
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

type AuthResponse = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token: string;
};

export async function login(input: { email: string; password: string }) {
  const response = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input),
  });

  setToken(response.token);

  return response;
}

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const response = await apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input),
  });

  setToken(response.token);

  return response;
}
