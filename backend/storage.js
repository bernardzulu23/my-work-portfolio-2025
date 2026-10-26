const { S3Client, PutObjectCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const BUCKET = 'media';

function storageConfigured() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_ENDPOINT_URL_S3
  );
}

function getS3() {
  return new S3Client({
    forcePathStyle: true,
    region: process.env.AWS_REGION || 'eu-central-1'
  });
}

function publicObjectUrl(key) {
  const endpoint = String(process.env.AWS_ENDPOINT_URL_S3 || '').replace(/\/$/, '');
  return `${endpoint}/${BUCKET}/${encodeURI(key)}`;
}

async function ensureCors() {
  const origins = String(process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  await getS3().send(new PutBucketCorsCommand({
    Bucket: BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'HEAD'],
          AllowedOrigins: origins.length ? origins : ['http://localhost:4200'],
          ExposeHeaders: ['ETag', 'Location'],
          MaxAgeSeconds: 3600
        }
      ]
    }
  }));
}

async function putHealthObject() {
  if (!storageConfigured()) {
    const error = new Error('File uploads are not configured');
    error.status = 503;
    throw error;
  }

  await ensureCors();
  const key = 'health/neon-status.txt';
  const body = `ok ${new Date().toISOString()}`;
  await getS3().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: 'text/plain'
  }));

  return { key, publicUrl: publicObjectUrl(key) };
}

async function createUploadUrl(key, contentType) {
  if (!storageConfigured()) {
    const error = new Error('File uploads are not configured');
    error.status = 503;
    throw error;
  }

  const uploadUrl = await getSignedUrl(
    getS3(),
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType
    }),
    { expiresIn: 3600 }
  );

  return {
    uploadUrl,
    publicUrl: publicObjectUrl(key),
    key
  };
}

module.exports = {
  BUCKET,
  storageConfigured,
  createUploadUrl,
  publicObjectUrl,
  putHealthObject
};
