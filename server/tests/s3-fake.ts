import { Readable } from 'node:stream';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';

export const s3Objects = new Map<string, { body: Buffer; contentType?: string }>();

export function installS3Fake() {
  const s3 = mockClient(S3Client);

  s3.on(PutObjectCommand).callsFake(({ Key, Body, ContentType }) => {
    s3Objects.set(Key, { body: Buffer.from(Body), contentType: ContentType });
    return {};
  });

  s3.on(GetObjectCommand).callsFake(({ Key }) => {
    const object = s3Objects.get(Key);
    if (!object)
      throw new NoSuchKey({ message: 'The specified key does not exist.', $metadata: {} });
    return { Body: Readable.from([object.body]), ContentType: object.contentType };
  });

  s3.on(DeleteObjectCommand).callsFake(({ Key }) => {
    s3Objects.delete(Key);
    return {};
  });
}
