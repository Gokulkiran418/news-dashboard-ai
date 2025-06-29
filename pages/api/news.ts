import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';
import { parseISO } from 'date-fns';

const cache = new NodeCache({ stdTTL: 600 });

type NewsItem = {
  article_id: string;
  title: string;
  image_url: string | null;
  source_id: string;
  pubDate: string;
  description: string | null;
  link: string;
};

type NewsResponse = {
  results: NewsItem[];
  nextPage?: string | null;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

// Normalize text into tokens
function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

// Jaccard similarity between two token sets
function jaccardSim(a: string[], b: string[]): number {
  const sa = new Set(a), sb = new Set(b);
  const inter = [...sa].filter(x => sb.has(x)).length;
  const uni = new Set([...sa, ...sb]).size;
  return uni === 0 ? 0 : inter / uni;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, page } = req.query;
  const q =
    typeof query === 'string' && query.trim().length >= 2
      ? encodeURIComponent(query.trim())
      : '';
  const cacheKey = q
    ? `news_${q}_${page ?? 'first'}`
    : `news_latest_${page ?? 'first'}`;

  // Serve from cache
  const cached = cache.get<NewsResponse>(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing NEWS_API_KEY' });
  }

  // Build URL
  let url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en`;
  if (q) url += `&q=${q}`;
  if (typeof page === 'string') url += `&page=${encodeURIComponent(page)}`;

  // Timeout setup
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      return res
        .status(response.status)
        .json({ error: `News API ${response.status}`, details: text });
    }

    const data = await response.json();
    if (!Array.isArray(data.results)) {
      throw new Error('Unexpected API response');
    }

    // 1) Sort by newest first
    const sorted: NewsItem[] = (data.results as NewsItem[])
      .filter(item => item.title && item.pubDate && item.link)
      .sort(
        (a, b) =>
          parseISO(b.pubDate).getTime() - parseISO(a.pubDate).getTime()
      );

    // 2) Exact dedupe by id/link
    const seenExact = new Set<string>();
    const filteredExact: NewsItem[] = [];
    for (const item of sorted) {
      const key =
        item.article_id && item.article_id !== 'null'
          ? item.article_id
          : item.link;
      if (!seenExact.has(key)) {
        seenExact.add(key);
        filteredExact.push(item);
      }
    }

    // 3) Fuzzy dedupe *only* within the same source
    const final: NewsItem[] = [];
    for (const item of filteredExact) {
      const tokens = normalizeTokens(item.title);
      const isDuplicate = final.some(existing => {
        return (
          existing.source_id === item.source_id &&
          jaccardSim(tokens, normalizeTokens(existing.title)) >= 0.75
        );
      });
      if (!isDuplicate) {
        final.push(item);
      }
    }

    if (final.length === 0) {
      return res.status(404).json({ error: 'No articles found' });
    }

    const result: NewsResponse = {
      results: final,              // now contains all de-duped articles
      nextPage: data.nextPage ?? null,
    };
    cache.set(cacheKey, result);
    return res.status(200).json(result);
  } catch (err: any) {
    clearTimeout(timeoutId);
    const msg =
      err.name === 'AbortError' ? 'Request timed out' : err.message || 'Fetch failed';
    return res.status(500).json({ error: msg });
  }
}
