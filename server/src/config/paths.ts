import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

export const UPLOADS_PUBLIC_PATH = '/uploads';

export const EMAIL_TEMPLATES_DIR = path.join(PROJECT_ROOT, 'templates', 'emails');

export const API_PREFIX = '/api/v1';
