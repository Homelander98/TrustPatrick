import { BASE_URL } from './baseUrl';

type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

type ApiFailure = {
  success: false;
  message?: string;
  data?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  token?: string | null;
};

async function executeRequest<T>(
  url: string,
  options: { method: string; headers: Record<string, string>; body?: string }
): Promise<ApiResponse<T>> {
  const res = await fetch(url, options);

  const raw = await res.text();

  let json: unknown = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch (e) {
    if (!res.ok) {
      // For failed requests, return error message from body
      return {
        success: false,
        message: raw.slice(0, 300) || `Request failed (${res.status})`,
        data: null,
      };
    }
    // For successful responses with parse errors, throw to trigger retry
    throw e;
  }

  const trimmed = raw.trim();

  if (!res.ok) {
    const messageFromJson =
      json &&
      typeof json === 'object' &&
      'message' in (json as Record<string, unknown>) &&
      (json as Record<string, unknown>).message;

    const messageFromText = trimmed.length ? trimmed.slice(0, 300) : null;
    const message = messageFromJson ?? messageFromText ?? `Request failed (${res.status})`;

    return { success: false, message: String(message), data: json ?? trimmed ?? null };
  }

  // Response was OK but no JSON body - treat as success with empty data
  if (json === null) {
    return { success: true, data: {} as T };
  }

  // Some endpoints return a plain JSON object/array without { success, data } wrapper.
  // Normalize 2xx responses into our ApiResponse shape.
  if (
    json &&
    typeof json === 'object' &&
    'success' in (json as Record<string, unknown>) &&
    typeof (json as Record<string, unknown>).success === 'boolean'
  ) {
    return json as ApiResponse<T>;
  }

  return { success: true, data: json as T };
}

export async function apiRequest<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${options.path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const fetchOptions = {
    method: options.method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  // Try request with automatic retry on transient failures
  let lastError: unknown = null;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await executeRequest<T>(url, fetchOptions);
      
      // If we got a valid response (success or structured error), return it
      if (result.success || (result.message && result.message !== 'Invalid server response (expected JSON).')) {
        return result;
      }

      // If it's the JSON parsing error and we have retries left, try again
      if (result.message === 'Invalid server response (expected JSON).' && attempt < maxRetries) {
        lastError = result;
        await new Promise<void>(resolve => setTimeout(() => resolve(), 100 * (attempt + 1))); // Exponential backoff
        continue;
      }

      return result;
    } catch (error) {
      lastError = error;
      
      // On network/fetch errors, retry if we have attempts left
      if (attempt < maxRetries) {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 200 * (attempt + 1)));
        continue;
      }

      // Final attempt failed
      const message = error instanceof Error ? error.message : 'Network request failed';
      return { success: false, message, data: null };
    }
  }

  // Should never reach here, but TypeScript needs it
  return {
    success: false,
    message: lastError instanceof Error ? lastError.message : 'Request failed',
    data: null,
  };
}
