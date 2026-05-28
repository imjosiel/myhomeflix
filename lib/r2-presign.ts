// Generate presigned URLs for R2 upload and download
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME } from './r2';

export async function getUploadUrl(opts: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: opts.key,
    ContentType: opts.contentType,
  });

  const url = await getSignedUrl(r2Client, command, {
    expiresIn: opts.expiresInSeconds ?? 60 * 15, // 15 minutes default
  });

  return url;
}

export async function getDownloadUrl(opts: {
  key: string;
  expiresInSeconds?: number;
}) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: opts.key,
  });

  const url = await getSignedUrl(r2Client, command, {
    expiresIn: opts.expiresInSeconds ?? 60 * 60, // 1 hour default
  });

  return url;
}
