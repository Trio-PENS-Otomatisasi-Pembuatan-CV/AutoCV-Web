export function resolveApiUrl(endpoint: string): string {
  const envBase =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) || "";
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (envBase) {
    const trimmedBase = envBase.replace(/\/+$/, "");
    if (trimmedBase.endsWith("/api")) {
      return `${trimmedBase}${cleanEndpoint.replace(/^\/api/, "")}`;
    }
    if (!cleanEndpoint.startsWith("/api/")) {
      return `${trimmedBase}/api${cleanEndpoint}`;
    }
    return `${trimmedBase}${cleanEndpoint}`;
  }

  if (!cleanEndpoint.startsWith("/api/")) {
    return `/api${cleanEndpoint}`;
  }
  return cleanEndpoint;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    const errorData = data as { detail?: string; message?: string } | undefined;
    super(
      errorData?.detail || errorData?.message || `HTTP ${status}: ${statusText}`
    );
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = resolveApiUrl(endpoint);

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      const text = await response.text();
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { message: text || `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}
