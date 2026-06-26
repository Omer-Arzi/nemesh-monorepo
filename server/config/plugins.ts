import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  if (env('NODE_ENV') !== 'production') {
    // Development: use default local disk uploads (no S3).
    return {};
  }

  return {
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_ACCESS_SECRET'),
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET'),
            // ACL requires "Block public access" to be disabled on the bucket.
            // If you use a bucket policy for public read instead, remove this line.
            ACL: env('AWS_ACL', 'public-read'),
            signedUrlExpires: env.int('AWS_SIGNED_URL_EXPIRES', 15 * 60),
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
