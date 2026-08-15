const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const GRAPHQL_BASE_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API Request failed with status ${res.status}`);
    }
    const json = await res.json();
    return json.data ?? json;
  } catch (error) {
    console.warn(`[API Client] Live call to ${url} failed, fallback active:`, error);
    throw error;
  }
}

apiClient.get = <T>(endpoint: string, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "GET" });

apiClient.post = <T>(endpoint: string, body?: unknown, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined });

apiClient.put = <T>(endpoint: string, body?: unknown, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined });

apiClient.patch = <T>(endpoint: string, body?: unknown, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined });

apiClient.delete = <T>(endpoint: string, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "DELETE" });

/**
 * GraphQL API Client Helper
 */
export async function graphqlClient<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(GRAPHQL_BASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || "GraphQL Execution Error");
  }
  return json.data;
}
