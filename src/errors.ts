/**
 * Error thrown by the ClickUpClient
 */
export class ClickUpClientError extends Error {
  readonly name = 'ClickUpClientError';
  constructor(message: string) {
    super(message);
  }
}

/**
 * Returns true if the error is a ClickUpClientError.
 *
 * @param e the error to check
 */
export function isClickUpClientError(e?: unknown): e is ClickUpClientError {
  return e instanceof Error && e.name === 'ClickUpClientError';
}
