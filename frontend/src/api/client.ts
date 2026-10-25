const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  code?: string;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    status: number,
    code?: string,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let message = 'Error de servidor';
  let code: string | undefined;
  let retryAfterSeconds: number | undefined;

  try {
    const body = (await res.json()) as {
      error?: string;
      code?: string;
      retryAfterSeconds?: number;
    };
    message = body.error ?? message;
    code = body.code;
    retryAfterSeconds = body.retryAfterSeconds;
  } catch {
    // ignore non-JSON
  }

  return new ApiError(message, res.status, code, retryAfterSeconds);
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return res.json() as Promise<{ token: string }>;
}
