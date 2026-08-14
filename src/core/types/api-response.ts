export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId: string;
  timestamp: string;
}

export function successResponse<T>(data: T, meta?: Record<string, unknown>, requestId: string = "system"): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(code: string, message: string, details?: Record<string, unknown>, requestId: string = "system"): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    requestId,
    timestamp: new Date().toISOString(),
  };
}
