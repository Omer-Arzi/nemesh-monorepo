import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const isProduction = env('NODE_ENV') === 'production';

  if (!isProduction) {
    console.log(`[upload] provider: local (NODE_ENV="${env('NODE_ENV', '(not set)')}" — set NODE_ENV=production to activate S3)`);
    return {};
  }

  // Fail loud — never silently fall back to local disk in production.
  const accessKeyId     = env('AWS_ACCESS_KEY_ID', '');
  const secretAccessKey = env('AWS_ACCESS_SECRET', '');
  const region          = env('AWS_REGION', '');
  const bucket          = env('AWS_BUCKET', '');

  const missing: string[] = [];
  if (!accessKeyId)     missing.push('AWS_ACCESS_KEY_ID');
  if (!secretAccessKey) missing.push('AWS_ACCESS_SECRET');
  if (!region)          missing.push('AWS_REGION');
  if (!bucket)          missing.push('AWS_BUCKET');

  if (missing.length > 0) {
    throw new Error(
      `[upload] NODE_ENV=production but required S3 env vars are missing: ${missing.join(', ')}`
    );
  }

  const baseUrl = env('AWS_BUCKET_URL', '');
  const acl     = env('AWS_ACL', '');

  // Safe startup log — bucket/region/baseUrl only, no secrets.
  console.log(
    `[upload] provider: aws-s3` +
    ` | bucket: ${bucket}` +
    ` | region: ${region}` +
    (baseUrl ? ` | baseUrl: ${baseUrl}` : ' | baseUrl: (default S3 URL)')
  );

  return {
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          // baseUrl — if set, Strapi uses this as the root of all public media URLs
          // instead of the default https://<bucket>.s3.amazonaws.com path.
          ...(baseUrl ? { baseUrl } : {}),
          // s3Options is passed directly to the AWS SDK v3 S3Client constructor.
          // credentials and params must be nested here (Strapi v5 / AWS SDK v3 shape).
          s3Options: {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
            region,
            params: {
              Bucket: bucket,
              // ACL key must always be present to prevent the provider from defaulting
              // to public-read. Set AWS_ACL only if bucket ACLs are enabled; leave
              // unset (undefined) for buckets with ACLs disabled ("Bucket owner enforced").
              // undefined value → key exists in params (bypasses provider default) but
              // ACL header is not sent to S3.
              ACL: acl || undefined,
            },
          },
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};

export default config;
