/**
 * @file functional.ts
 * @description Provides functional programming helpers such as the Result type,
 * map, and chain utilities to handle asynchronous operations and error management.
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess: true = true;
  readonly isFailure: false = false;

  constructor(public readonly value: T) {}
}

export class Failure<E> {
  readonly isSuccess: false = false;
  readonly isFailure: true = true;

  constructor(public readonly error: E) {}
}

/**
 * Wraps a function execution in a Result type.
 * @param fn - Function to execute.
 * @returns Success with the result or Failure with the error.
 */
export function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return new Success(fn());
  } catch (error) {
    return new Failure(error as Error);
  }
}

/**
 * Async version of tryCatch.
 * @param fn - Asynchronous function to execute.
 * @returns A promise that resolves to Success with the result or Failure with the error.
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const result = await fn();
    return new Success(result);
  } catch (error) {
    return new Failure(error as Error);
  }
}
