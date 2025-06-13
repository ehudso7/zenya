/**
 * Domain verification utilities to ensure the application
 * only runs on authorized domains (zenyaai.com)
 */

const AUTHORIZED_DOMAINS = [
  'zenyaai.com',
  'www.zenyaai.com',
  // Allow all Vercel preview deployments
  /.*\.vercel\.app$/,
  // Legacy Vercel domains
  /.*\.now\.sh$/,
  // Vercel's internal domains
  /.*\.vercel\.sh$/,
];

// Development domains (only allowed in development mode)
const DEV_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
];

export function isAuthorizedDomain(hostname: string | null): boolean {
  if (!hostname) return false;

  // Strip port number if present
  const domain = hostname.split(':')[0];

  // Always allow development domains (localhost, 127.0.0.1, etc)
  if (DEV_DOMAINS.includes(domain)) {
    return true;
  }

  // Check against authorized domains
  const isAuthorized = AUTHORIZED_DOMAINS.some(authorized => {
    if (typeof authorized === 'string') {
      return domain === authorized;
    }
    // Regex pattern matching for preview deployments
    return authorized.test(domain);
  });

  return isAuthorized;
}

export function getDomainError(): string {
  return `This application is only authorized to run on zenyaai.com or Vercel preview deployments. 
          If you believe this is an error, please contact support@zenyaai.com`;
}

export function getAuthorizedOrigins(): string[] {
  const origins = [
    'https://zenyaai.com',
    'https://www.zenyaai.com',
    // Always include localhost origins for development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000'
  ];

  return origins;
}

// Verify build-time domain configuration
export function verifyBuildConfiguration(): void {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (process.env.NODE_ENV === 'production' && appUrl) {
    try {
      const url = new URL(appUrl);
      if (!isAuthorizedDomain(url.hostname)) {
        throw new Error(
          `Invalid NEXT_PUBLIC_APP_URL: ${appUrl}. ` +
          `Production builds must use https://zenyaai.com`
        );
      }
    } catch (_error) {
      if (_error instanceof Error) {
        throw _error;
      }
      throw new Error(`Invalid NEXT_PUBLIC_APP_URL format: ${appUrl}`);
    }
  }
}