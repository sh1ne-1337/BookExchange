import { env } from '../config/env.js';
import { storage } from '../lib/storage.js';

const removed = await storage.clear();

console.log(`Removed ${removed} uploaded file(s) from s3://${env.S3_BUCKET}/${env.S3_KEY_PREFIX}`);
