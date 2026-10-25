import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

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

interface ErrorBody {
  error?: string;
  code?: string;
  retryAfterSeconds?: number;
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ErrorBody>;
    const status = axiosErr.response?.status ?? 500;
    const body = axiosErr.response?.data;
    return new ApiError(
      body?.error ?? axiosErr.message ?? 'Error de servidor',
      status,
      body?.code,
      body?.retryAfterSeconds,
    );
  }

  return new ApiError('Error de servidor', 500);
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<{ token: string }> {
  try {
    const { data } = await api.post<{ token: string }>('/login', {
      email,
      password,
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function fetchScore(
  rut: string,
  token: string,
): Promise<{ rut: string; score: number; fecha: string }> {
  try {
    const { data } = await api.get<{ rut: string; score: number; fecha: string }>(
      `/score/${encodeURIComponent(rut)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}
