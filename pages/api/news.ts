// pages/api/news.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';
import { parseISO } from 'date-fns';

const cache = new NodeCache({ stdTTL: 600 });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, page } = req.query;
  const cleanQ =
    typeof query === 'string' && query.trim().length >= 2
      ? query.trim()
      : '';
  const encodedQ = encodeURIComponent(cleanQ);

  const cacheKey = cleanQ
    ? `news_search_${encodedQ}_${page ?? '1'}`
    : `news_latest_${page ?? '1'}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing NEWS_API_KEY' });
  }

  const baseUrl = new URL('https://newsdata.io/api/1/latest');
  baseUrl.searchParams.set('apikey', apiKey);
  baseUrl.searchParams.set('language', 'en');
  if (cleanQ) {
    baseUrl.searchParams.set('q', cleanQ);
  }
  if (typeof page === 'string') {
    baseUrl.searchParams.set('page', page);
  }

  async function fetchJson(url: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new Error(`News API ${response.status}: ${text}`);
      }
      return response.json();
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  try {
    const data = await fetchJson(baseUrl.toString());

    if (!Array.isArray(data.results) || data.results.length === 0) {
      return res.status(404).json({ error: 'No articles found' });
    }

    // Sort by publish date descending
    let results = (data.results as any[])
      .filter((item) => item.title && item.pubDate && item.link)
      .sort((a, b) => parseISO(b.pubDate).getTime() - parseISO(a.pubDate).getTime());

    // STRICTER keyword filter (for search)
    if (cleanQ) {
      const searchTerms = cleanQ.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter((item) => {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();
        return searchTerms.every((term) => text.includes(term));
      });
    }

    // Deduplication (applies always)
    const seen = new Set<string>();
    const unique = results.filter((item) => {
      const key = item.article_id || item.link;
      return seen.has(key) ? false : seen.add(key);
    });

    const normalize = (t: string) =>
      t
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);

    const jaccard = (a: string[], b: string[]) => {
      const sa = new Set(a), sb = new Set(b);
      const inter = [...sa].filter((x) => sb.has(x)).length;
      const uni = new Set([...sa, ...sb]).size;
      return uni === 0 ? 0 : inter / uni;
    };

    const finalResults: any[] = [];
    for (const item of unique) {
      const toks = normalize(item.title);
      if (!finalResults.some((e) => jaccard(toks, normalize(e.title)) >= 0.75)) {
        finalResults.push(item);
      }
    }

    const result = {
      results: finalResults,
      nextPage: data.nextPage ?? null,
    };

    cache.set(cacheKey, result);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('News fetch error:', err);
    return res.status(500).json({ error: err.message || 'Fetch failed' });
  }
}
