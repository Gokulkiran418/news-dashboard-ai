// lib/getBaseUrl.ts
export function getBaseUrl(req?: { headers: { host?: string } }) {
  // Client-side, just use relative URLs
  if (typeof window !== "undefined") {
    return "";
  }
  // Server-side: detect host (Vercel sets VERCEL env var)
  const host = req?.headers?.host || process.env.NEXT_PUBLIC_SITE_URL;
  const protocol = process.env.VERCEL ? "https" : "http";
  if (!host) {
    throw new Error("Unable to determine host for getBaseUrl()");
  }
  return `${protocol}://${host}`;
}
