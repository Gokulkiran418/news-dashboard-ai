// pages/api/news.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';

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
  nextPage?: string;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, page } = req.query;
  const q = typeof query === 'string' && query.trim().length >= 2
    ? encodeURIComponent(query.trim())
    : '';
  const cacheKey = q
    ? `news_${q}_${page ?? 'first'}`
    : `news_latest_${page ?? 'first'}`;

  // Return cached if available
  const cached = cache.get<NewsResponse>(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Build NewsData.io URL
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key missing' });
  }

  let url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en`;
  if (q) url += `&q=${q}`;
  if (typeof page === 'string') url += `&page=${encodeURIComponent(page)}`;

  // Fetch with 5 s timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!r.ok) {
      const errText = await r.text().catch(() => r.statusText);
      return res
        .status(r.status)
        .json({ error: `News API error ${r.status}`, details: errText });
    }

    const data = await r.json();
    if (!Array.isArray(data.results)) {
      throw new Error('Unexpected API response format');
    }

    // Deduplicate by article_id or link, up to 10 items
    const seen = new Set<string>();
    const unique: NewsItem[] = [];
    for (const item of data.results) {
      if (
        !item.title ||
        !item.source_id ||
        !item.pubDate ||
        !item.link
      ) {
        continue; // skip invalid entries
      }

      const key = item.article_id && item.article_id !== 'null'
        ? item.article_id
        : item.link;

      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      unique.push(item);

      if (unique.length >= 10) {
        break;
      }
    }

    if (unique.length === 0) {
      return res.status(404).json({ error: 'No articles found', details: '' });
    }

    const result: NewsResponse = {
      results: unique,
      nextPage: data.nextPage,
    };
    cache.set(cacheKey, result);
    return res.status(200).json(result);

  } catch (err: any) {
    clearTimeout(timeout);
    const message =
      err.name === 'AbortError'
        ? 'News API request timed out'
        : err.message || 'Failed to fetch news';
    return res.status(500).json({ error: message });
  }
}
