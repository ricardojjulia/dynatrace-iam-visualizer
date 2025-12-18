import axios from 'axios';

const DEFAULT_SPEC_URL = process.env.DYNATRACE_SPEC_URL || 'https://api.dynatrace.com/spec-json';
const CACHE_TTL_MS = 5 * 60 * 1000; // cache for 5 minutes

let cachedSpec: unknown | null = null;
let cachedAt = 0;

async function loadSpec(specUrl: string): Promise<unknown> {
  const response = await axios.get(specUrl, { timeout: 15000 });
  return response.data;
}

export async function fetchDynatraceSpec(options?: {
  forceRefresh?: boolean;
  specUrl?: string;
}): Promise<unknown> {
  const specUrl = options?.specUrl || DEFAULT_SPEC_URL;
  const forceRefresh = options?.forceRefresh || false;
  const now = Date.now();

  if (!forceRefresh && cachedSpec && now - cachedAt < CACHE_TTL_MS) {
    return cachedSpec;
  }

  const spec = await loadSpec(specUrl);
  cachedSpec = spec;
  cachedAt = now;
  return spec;
}
