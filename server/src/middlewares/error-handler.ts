import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { QueryFailedError } from 'typeorm';
import { z, ZodError } from 'zod';
import { UNIQUE_CONSTRAINTS, type UniqueConstraintName } from '../database/unique-constraints.js';
import { MAX_IMAGE_SIZE_MESSAGE } from '../lib/uploads.js';
import { HttpError } from '../utils/http-error.js';

const PG_UNIQUE_VIOLATION = '23505';

const BODY_PARSER_MESSAGES: Record<string, string> = {
  'entity.too.large': 'Request body is too large',
  'entity.parse.failed': 'Malformed JSON body',
};

interface ClientHttpError {
  status: number;
  message: string;
  type?: string;
}

function isClientHttpError(error: unknown): error is ClientHttpError {
  if (typeof error !== 'object' || error === null || !('status' in error)) return false;
  const { status } = error;
  return typeof status === 'number' && status >= 400 && status < 500;
}

function getUniqueViolation(error: unknown) {
  if (!(error instanceof QueryFailedError)) return undefined;

  const { code, constraint } = error.driverError as { code?: string; constraint?: string };
  if (code !== PG_UNIQUE_VIOLATION) return undefined;
  return UNIQUE_CONSTRAINTS[constraint as UniqueConstraintName];
}

export const notFoundHandler: RequestHandler = (req) => {
  throw HttpError.notFound(`Route ${req.method} ${req.originalUrl} not found`);
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const uniqueViolation = getUniqueViolation(error);

  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: z.flattenError(error).fieldErrors,
    });
  } else if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message, errors: error.fieldErrors });
  } else if (uniqueViolation) {
    const { message, field } = uniqueViolation;
    res.status(409).json({ message, errors: field && { [field]: [message] } });
  } else if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? MAX_IMAGE_SIZE_MESSAGE : error.message;
    res.status(400).json({ message });
  } else if (isClientHttpError(error)) {
    const message = (error.type && BODY_PARSER_MESSAGES[error.type]) ?? error.message;
    res.status(error.status).json({ message });
  } else {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
