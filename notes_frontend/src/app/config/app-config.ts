import { InjectionToken, Provider, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

/**
 * AppConfig model for cross-app configuration.
 * Values are sourced from environment variables on the server and sensible
 * fallbacks on the browser.
 */
export interface AppConfig {
  apiBase: string;
  backendUrl: string;
  frontendUrl: string;
  wsUrl: string;
  nodeEnv: string;
  enableSourceMaps: boolean;
  port: number;
  trustProxy: boolean;
  logLevel: string;
  healthcheckPath: string;
  featureFlags: Record<string, boolean>;
  experimentsEnabled: boolean;
}

/**
 * Injection token for the application configuration.
 */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/**
 * Read configuration from process.env on the server.
 */
function readServerEnv(): Partial<AppConfig> {
  // Use bracket access to satisfy TypeScript for process.env on ESM builds.
  const env = (globalThis as any)?.process?.env ?? {};
  return {
    apiBase: env['NG_APP_API_BASE'] || env['NG_APP_BACKEND_URL'],
    backendUrl: env['NG_APP_BACKEND_URL'],
    frontendUrl: env['NG_APP_FRONTEND_URL'],
    wsUrl: env['NG_APP_WS_URL'],
    nodeEnv: env['NG_APP_NODE_ENV'],
    enableSourceMaps: parseBool(env['NG_APP_ENABLE_SOURCE_MAPS']),
    port: parseIntSafe(env['NG_APP_PORT'], 3000),
    trustProxy: parseBool(env['NG_APP_TRUST_PROXY']),
    logLevel: env['NG_APP_LOG_LEVEL'],
    healthcheckPath: env['NG_APP_HEALTHCHECK_PATH'],
    featureFlags: parseFlags(env['NG_APP_FEATURE_FLAGS']),
    experimentsEnabled: parseBool(env['NG_APP_EXPERIMENTS_ENABLED']),
  } as Partial<AppConfig>;
}

/**
 * Provide sane defaults for the browser runtime. These can be adjusted
 * later to read from injected global constants if needed.
 */
function browserDefaults(): AppConfig {
  const origin =
    isBrowser() && globalThis.location ? globalThis.location.origin : '';
  return {
    apiBase: '/api',
    backendUrl: origin,
    frontendUrl: origin,
    wsUrl: (origin.startsWith('https:') ? 'wss://' : 'ws://') + (isBrowser() ? globalThis.location.host : 'localhost:3000'),
    nodeEnv: 'production',
    enableSourceMaps: false,
    port: 3000,
    trustProxy: false,
    logLevel: 'info',
    healthcheckPath: '/healthz',
    featureFlags: {},
    experimentsEnabled: false,
  };
}

/**
 * Factory that produces the AppConfig based on the current platform.
 * Preference for apiBase is NG_APP_API_BASE or NG_APP_BACKEND_URL.
 */
// PUBLIC_INTERFACE
export function appConfigFactory(): AppConfig {
  /** This is a public factory that returns the AppConfig instance. */
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    const env = readServerEnv();
    // Construct with precedence and fallbacks
    const base = browserDefaults();
    return {
      ...base,
      ...env,
      apiBase: (env.apiBase || env.backendUrl || base.apiBase) as string,
      backendUrl: (env.backendUrl || env.apiBase || base.backendUrl) as string,
      frontendUrl: (env.frontendUrl || base.frontendUrl) as string,
      wsUrl: (env.wsUrl || base.wsUrl) as string,
      nodeEnv: (env.nodeEnv || base.nodeEnv) as string,
      enableSourceMaps: typeof env.enableSourceMaps === 'boolean' ? env.enableSourceMaps : base.enableSourceMaps,
      port: typeof env.port === 'number' ? env.port : base.port,
      trustProxy: typeof env.trustProxy === 'boolean' ? env.trustProxy : base.trustProxy,
      logLevel: (env.logLevel || base.logLevel) as string,
      healthcheckPath: (env.healthcheckPath || base.healthcheckPath) as string,
      featureFlags: env.featureFlags ?? base.featureFlags,
      experimentsEnabled: typeof env.experimentsEnabled === 'boolean' ? env.experimentsEnabled : base.experimentsEnabled,
    };
  }

  // Browser
  const base = browserDefaults();
  return {
    ...base,
    apiBase: base.apiBase || base.backendUrl,
  };
}

/**
 * Provider for APP_CONFIG using the appConfigFactory.
 */
export const provideAppConfig: Provider = {
  provide: APP_CONFIG,
  useFactory: appConfigFactory,
};

/**
 * Safe check for browser.
 */
function isBrowser(): boolean {
  try {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Utilities
 */
function parseBool(v: any): boolean | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).toLowerCase().trim();
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  return undefined;
}

function parseIntSafe(v: any, fallback: number): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? fallback : n;
}

function parseFlags(v: any): Record<string, boolean> | undefined {
  if (!v) return undefined;
  // Expected format: "a=true,b=false,c"
  const out: Record<string, boolean> = {};
  const parts = String(v).split(',').map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const [keyRaw, valRaw] = p.split('=');
    const key = (keyRaw || '').trim();
    if (!key) continue;
    const bool = valRaw === undefined ? true : !!parseBool(valRaw);
    out[key] = bool;
  }
  return out;
}
