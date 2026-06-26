import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  const isProduction = env('NODE_ENV') === 'production';
  const clientUrl = env('CLIENT_URL', '');
  const awsBucketUrl = env('AWS_BUCKET_URL', '');

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': [
              "'self'",
              'data:',
              'blob:',
              ...(awsBucketUrl ? [awsBucketUrl] : []),
            ],
            'media-src': [
              "'self'",
              'data:',
              'blob:',
              ...(awsBucketUrl ? [awsBucketUrl] : []),
            ],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        // Production: restrict to the deployed client URL (set CLIENT_URL env var).
        // Development: allow all origins (mirrors Strapi default).
        origin: isProduction && clientUrl ? [clientUrl] : '*',
        headers: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
