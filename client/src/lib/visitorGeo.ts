// Detects the visitor's approximate geo location (country) from their IP
// address using a free public endpoint. The result is cached in
// sessionStorage so we only hit the network once per session.
//
// Return shape: { code: "QA", name: "قطر", flag: "🇶🇦" } or null on failure.

export type VisitorGeo = { code: string; name: string; flag: string };

const CACHE_KEY = "visitor_geo_v1";

const codeToFlag = (code: string): string => {
  if (!code || code.length !== 2) return "🏳️";
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
};

const codeToArabicName = (code: string, fallback?: string): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dn = new (Intl as any).DisplayNames(["ar"], { type: "region" });
    const n = dn.of(code.toUpperCase());
    if (n && typeof n === "string") return n;
  } catch { /* noop */ }
  return fallback || code.toUpperCase();
};

const readCache = (): VisitorGeo | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.code === "string") return parsed as VisitorGeo;
  } catch { /* noop */ }
  return null;
};

let inflight: Promise<VisitorGeo | null> | null = null;

export async function getVisitorGeo(): Promise<VisitorGeo | null> {
  const cached = readCache();
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const endpoints = [
      "https://ipwho.is/?fields=success,country_code,country",
      "https://ipapi.co/json/",
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const j = await res.json();
        // ipwho.is returns { success, country_code, country }
        // ipapi.co returns { country_code, country_name }
        const code: string | undefined =
          j?.country_code || j?.countryCode || j?.country;
        if (!code || typeof code !== "string" || code.length !== 2) continue;
        const geo: VisitorGeo = {
          code: code.toUpperCase(),
          name: codeToArabicName(code, j?.country || j?.country_name),
          flag: codeToFlag(code),
        };
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(geo)); } catch { /* noop */ }
        return geo;
      } catch { /* try next */ }
    }
    return null;
  })();

  const out = await inflight;
  inflight = null;
  return out;
}