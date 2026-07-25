// src/core/errors/AppError.ts

/** Categorías de error que la app maneja de forma explícita. */
export type AppErrorCode =
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'storage'
  | 'unknown';

/** Error de dominio/aplicación con un código clasificable por la UI. */
export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }

  static validation(message: string): AppError {
    return new AppError('validation', message);
  }

  static notFound(message: string): AppError {
    return new AppError('not_found', message);
  }

  static conflict(message: string): AppError {
    return new AppError('conflict', message);
  }

  /** Normaliza cualquier valor capturado en un AppError de storage. */
  static from(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new AppError('storage', message);
  }
}
