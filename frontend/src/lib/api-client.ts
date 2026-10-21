export type ApiClient = <T>(
  path: string,
  method?: string,
  body?: unknown,
  signal?: AbortSignal,
) => Promise<T>;
export function createApiClient(
  token = "",
  onUnauthorized?: () => void,
): ApiClient {
  return async <T>(
    path: string,
    method = "GET",
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> => {
    const response = await fetch("/api/v1" + path, {
      method,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      if (response.status === 401 && token) onUnauthorized?.();
      throw new Error(problem.title || `Request failed (${response.status})`);
    }
    return response.status === 204
      ? (undefined as T)
      : (response.json() as Promise<T>);
  };
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
