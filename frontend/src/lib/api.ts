import type {
  ExplainResponse,
  LocationProfile,
  PlantSearchResponse,
  RecommendationsResponse,
} from "../types/recommendation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError("Could not reach the GreenGuide server. Check your connection.", 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error ?? "Something went wrong talking to the server.";
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function getRecommendations(
  lat: number,
  lon: number,
  limit = 20,
): Promise<RecommendationsResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    limit: String(limit),
  });
  return request<RecommendationsResponse>(`/api/recommendations?${params.toString()}`);
}

export async function searchPlants(query: string, limit = 20): Promise<PlantSearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return request<PlantSearchResponse>(`/api/plants/search?${params.toString()}`);
}

export async function explainPlant(
  plantId: number,
  location: LocationProfile,
  matchReasons: string[],
): Promise<ExplainResponse> {
  return request<ExplainResponse>(`/api/plants/${plantId}/explain`, {
    method: "POST",
    body: JSON.stringify({ location, match_reasons: matchReasons }),
  });
}
