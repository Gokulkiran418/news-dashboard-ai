import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';

// Initialize cache with a 10-minute TTL (time-to-live)
const cache = new NodeCache({ stdTTL: 600 });

// Define response types
type NewsResponse = {
  results: {
    article_id: string;
    title: string;
    image_url: string | null;
    source_id: string;
    pubDate: string;
    description: string | null;
    link: string;
  }[];
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsResponse | ErrorResponse>
) {
  // Restrict to GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;
  const cacheKey = query ? `news_${query}` : 'news_latest';

  // Check cache first
  const cachedData = cache.get<NewsResponse>(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    // Construct the newsdata.io API URL
    let url = `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}`;
    if (query) {
      url += `&q=${encodeURIComponent(query as string)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`News API error: ${response.status} ${response.statusText}`);
    }

    const data: NewsResponse = await response.json();
    // Limit to 10 articles per request (free tier compliance)
    const slicedData = { results: data.results.slice(0, 10) };

    // Cache the results
    cache.set(cacheKey, slicedData);
    return res.status(200).json(slicedData);
  } catch (error: any) {
    console.error('Error fetching news:', error.message);
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
}