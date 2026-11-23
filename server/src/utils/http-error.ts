export type FieldErrors = Record<string, string[]>;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(message: string) {
    return new HttpError(400, message);
  }

  static unauthorized(message = 'Authentication required') {
    return new HttpError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new HttpError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new HttpError(404, message);
  }

  static conflict(message: string, fieldErrors?: FieldErrors) {
    return new HttpError(409, message, fieldErrors);
  }
}
