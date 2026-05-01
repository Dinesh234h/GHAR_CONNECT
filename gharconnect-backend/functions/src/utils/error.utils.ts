// utils/error.utils.ts
// Typed application error class for consistent error handling across all services.

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppError';
    // Maintain proper prototype chain in TS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function handleError(
  err: unknown,
  res: import('express').Response
): void {
  if (isAppError(err)) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  } else {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    });
  }
}
