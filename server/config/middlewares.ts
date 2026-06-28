import type { Core } from '@strapi/strapi';

function parseList(raw: string): string[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function parsePatterns(raw: string): RegExp[] {
  return parseList(raw).map((p) => new RegExp(p));
}

/**
 * Returns true if the request origin should be allowed through CORS.
 *
 * Rules (production):
 * - No Origin header → allow (server-to-server / non-browser requests never need CORS)
 * - Exact match in allowedOrigins → allow
 * - Matches any previewPattern → allow
 * - Everything else → reject
 *
 * In development callers use origin:'*' directly and do not call this function.
 */
export function isAllowedCorsOrigin(
  origin: string | undefined,
  allowedOrigins: string[],
  previewPatterns: RegExp[],
): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (previewPatterns.some((p) => p.test(origin))) return true;
  return false;
}

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  const isProduction = env('NODE_ENV') === 'production';
  const awsBucketUrl = env('AWS_BUCKET_URL', '');

  // Merge CLIENT_URL (legacy single-origin) and CLIENT_URLS (multi-origin list).
  const allowedOrigins = [
    ...parseList(env('CLIENT_URL', '')),
    ...parseList(env('CLIENT_URLS', '')),
  ];
  const previewPatterns = parsePatterns(env('VERCEL_PREVIEW_ORIGIN_PATTERNS', ''));

  if (isProduction) {
    console.log(
      `[cors] Production: ${allowedOrigins.length} exact origin(s), ${previewPatterns.length} preview pattern(s)`,
    );
    if (allowedOrigins.length > 0) {
      console.log(`[cors] Allowed origins: ${allowedOrigins.join(', ')}`);
    }
    if (previewPatterns.length > 0) {
      console.log(`[cors] Preview patterns: ${previewPatterns.map((p) => p.source).join(', ')}`);
    }
    if (allowedOrigins.length === 0 && previewPatterns.length === 0) {
      console.warn('[cors] WARNING: No CLIENT_URL, CLIENT_URLS, or VERCEL_PREVIEW_ORIGIN_PATTERNS set — all browser origins will be rejected');
    }
  }

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
        // Production: function-based origin check supports both exact origins and regex
        // patterns for Vercel preview URLs. Dev uses '*' to avoid blocking local tools.
        origin: isProduction
          ? (ctx: any) => {
              const requestOrigin: string = ctx.get('Origin');
              return isAllowedCorsOrigin(requestOrigin || undefined, allowedOrigins, previewPatterns)
                ? requestOrigin
                : '';
            }
          : '*',
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
