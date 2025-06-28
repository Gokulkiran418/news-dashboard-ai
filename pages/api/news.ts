import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cacheKey = 'news_articles';
  const cachedData = cache.get<NewsResponse>(cacheKey);

  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const response = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&language=en`
    );
    if (!response.ok) {
      throw new Error(`News API error: ${response.status} ${response.statusText}`);
    }
    const data: NewsResponse = await response.json();
    const slicedData = { results: data.results.slice(0, 10) };
    cache.set(cacheKey, slicedData);
    res.status(200).json(slicedData);
  } catch (error: any) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}