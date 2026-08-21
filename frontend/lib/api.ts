/**
 * lib/api.ts — thin fetch wrapper around the YieldSense FastAPI backend.
 * Token storage uses an in-memory + localStorage pattern; swap for
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: "Farmer" | "Admin";
}

export interface FarmPayload {
  farm_name: string;
  latitude: number;
  longitude: number;
  soil_ph?: number;
  soil_n?: number;
  soil_p?: number;
  soil_k?: number;
}

export interface FarmResponse extends FarmPayload {
  id: number;
  user_id: number;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("ys_token") : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export const api = {
  register: (email: string, password: string, role: "Farmer" | "Admin" = "Farmer") =>
    request<TokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  createFarm: (payload: FarmPayload) =>
    request<FarmResponse>("/api/v1/farms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listFarms: () => request<FarmResponse[]>("/api/v1/farms"),

  runAnalysis: (farmId: number, crop: string) =>
    request<any>(`/api/v1/analysis/${farmId}/analyze?crop=${encodeURIComponent(crop)}`, {
      method: "POST",
    }),

  getLatestAnalysis: (farmId: number) =>
    request<any>(`/api/v1/analysis/${farmId}/latest`),
    
  getHistory: (farmId: number) =>
    request<any>(`/api/v1/analysis/${farmId}/history`),
};

export function storeSession(token: TokenResponse) {
  localStorage.setItem("ys_token", token.access_token);
  localStorage.setItem("ys_role", token.role);
}

export function clearSession() {
  localStorage.removeItem("ys_token");
  localStorage.removeItem("ys_role");
}
