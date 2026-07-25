// src/core/errors/result.ts
import { AppError } from './AppError';

/**
 * Tipo Result (Either): resultado explícito de una operación que puede fallar,
 * sin lanzar excepciones a través de las capas.
 */
export type Result<T, E = AppError> = Ok<T> | Err<E>;

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => !r.ok;

/**
 * Ejecuta un bloque async y envuelve el resultado en un Result, convirtiendo
 * cualquier excepción en un AppError. Punto único de captura de errores de storage.
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(AppError.from(error));
  }
}
