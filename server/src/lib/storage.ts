import path from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

const CACHE_CONTROL = 'public, max-age=31536000, immutable';

export interface FileStorage {
  save(filename: string, data: Buffer, contentType: string): Promise<void>;
  remove(filename: string): Promise<void>;
  clear(): Promise<number>;
  serve: RequestHandler;
}

interface S3StorageOptions {
  client: S3Client;
  bucket: string;
  keyPrefix: string;
}

export function createS3Storage({ client, bucket, keyPrefix }: S3StorageOptions): FileStorage {
  const toKey = (filename: string) => `${keyPrefix}${path.posix.basename(filename)}`;

  return {
    async save(filename, data, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: toKey(filename),
          Body: data,
          ContentType: contentType,
          CacheControl: CACHE_CONTROL,
        }),
      );
    },

    async remove(filename) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: toKey(filename) }));
    },

    async clear() {
      let removed = 0;
      let continuationToken: string | undefined;

      do {
        const page = await client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: keyPrefix,
            ContinuationToken: continuationToken,
          }),
        );
        const objects = (page.Contents ?? []).flatMap(({ Key }) => (Key ? [{ Key }] : []));

        if (objects.length > 0) {
          await client.send(
            new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects, Quiet: true } }),
          );
          removed += objects.length;
        }
        continuationToken = page.NextContinuationToken;
      } while (continuationToken);

      return removed;
    },

    async serve(req, res, next) {
      try {
        const object = await client.send(
          new GetObjectCommand({ Bucket: bucket, Key: toKey(req.path) }),
        );
        res.set({
          'Content-Type': object.ContentType ?? 'application/octet-stream',
          'Cache-Control': CACHE_CONTROL,
          ...(object.ContentLength !== undefined && {
            'Content-Length': String(object.ContentLength),
          }),
          ...(object.ETag && { ETag: object.ETag }),
        });
        await pipeline(object.Body as Readable, res);
      } catch (error) {
        if (error instanceof NoSuchKey) {
          next();
          return;
        }
        throw error;
      }
    },
  };
}

const credentials =
  env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
    ? { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY }
    : undefined;

export const storage = createS3Storage({
  client: new S3Client({ region: env.S3_REGION, credentials }),
  bucket: env.S3_BUCKET,
  keyPrefix: env.S3_KEY_PREFIX,
});
