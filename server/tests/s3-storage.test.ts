import { Readable } from 'node:stream';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createS3Storage } from '../src/lib/storage.js';

const BUCKET = 'test-bucket';
const PREFIX = 'bookswap/uploads/';

const client = new S3Client({ region: 'eu-north-1' });
const s3 = mockClient(client);
const storage = createS3Storage({ client, bucket: BUCKET, keyPrefix: PREFIX });

beforeEach(() => s3.reset());

describe('S3 storage', () => {
  it('uploads files under the key prefix with an immutable cache policy', async () => {
    s3.on(PutObjectCommand).resolves({});

    await storage.save('cover.webp', Buffer.from('image'), 'image/webp');

    expect(s3.commandCalls(PutObjectCommand)[0].args[0].input).toMatchObject({
      Bucket: BUCKET,
      Key: `${PREFIX}cover.webp`,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    });
  });

  it('never leaves the key prefix, even for path-like names', async () => {
    s3.on(DeleteObjectCommand).resolves({});

    await storage.remove('../../other/secret.txt');

    expect(s3.commandCalls(DeleteObjectCommand)[0].args[0].input).toEqual({
      Bucket: BUCKET,
      Key: `${PREFIX}secret.txt`,
    });
  });

  it('clears only objects under the prefix, across result pages', async () => {
    s3.on(ListObjectsV2Command)
      .resolvesOnce({ Contents: [{ Key: `${PREFIX}a.webp` }], NextContinuationToken: 'next' })
      .resolvesOnce({ Contents: [{ Key: `${PREFIX}b.webp` }] });
    s3.on(DeleteObjectsCommand).resolves({});

    const removed = await storage.clear();

    expect(removed).toBe(2);
    for (const call of s3.commandCalls(ListObjectsV2Command)) {
      expect(call.args[0].input.Prefix).toBe(PREFIX);
    }
    expect(s3.commandCalls(DeleteObjectsCommand).map((call) => call.args[0].input.Delete)).toEqual([
      { Objects: [{ Key: `${PREFIX}a.webp` }], Quiet: true },
      { Objects: [{ Key: `${PREFIX}b.webp` }], Quiet: true },
    ]);
  });

  describe('serving files', () => {
    const app = express().use('/uploads', storage.serve);

    it('streams the object with its content type', async () => {
      s3.on(GetObjectCommand, { Bucket: BUCKET, Key: `${PREFIX}cover.webp` }).resolves({
        Body: Readable.from([Buffer.from('image-bytes')]) as never,
        ContentType: 'image/webp',
      });

      const res = await request(app).get('/uploads/cover.webp');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/webp');
      expect(res.headers['cache-control']).toContain('immutable');
      expect(res.body.toString()).toBe('image-bytes');
    });

    it('responds with 404 for missing objects', async () => {
      s3.on(GetObjectCommand).rejects(new NoSuchKey({ message: 'Not found', $metadata: {} }));

      const res = await request(app).get('/uploads/missing.webp');

      expect(res.status).toBe(404);
    });
  });
});
