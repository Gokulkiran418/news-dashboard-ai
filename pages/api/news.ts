import type { NextApiRequest, NextApiResponse } from 'next';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 });

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

  const { query, page } = req.query; // No default page value
  const sanitizedQuery = query ? (query as string).trim() : '';
  const cacheKey = sanitizedQuery ? `news_${sanitizedQuery}_${page || 'first'}` : `news_latest_${page || 'first'}`;

  const cachedData = cache.get<NewsResponse>(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  let url = `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}`;
  try {
    if (!process.env.NEWS_API_KEY) {
      throw new Error('News API key is missing');
    }

    if (sanitizedQuery) {
      if (sanitizedQuery.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }
      if (!/^[a-zA-Z0-9\s\-"'()]*$/.test(sanitizedQuery)) {
        throw new Error('Search query contains unsupported characters');
      }
      url += `&q=${encodeURIComponent(sanitizedQuery)}`;
    }

    if (page) {
      url += `&page=${encodeURIComponent(page as string)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      let errorMessage = `News API error: ${response.status} ${response.statusText}`;
      let details = 'No additional details available';
      try {
        const errorData = await response.json();
        if (response.status === 422) {
          errorMessage = `Invalid query: ${errorData.message || 'Unprocessable Entity'}`;
          details = errorData.message || 'Unprocessable Entity';
          if (errorData.message?.includes('next page')) {
            details = 'Invalid pagination parameter. Please use the nextPage value from the previous response.';
          }
        } else if (response.status === 401) {
          errorMessage = 'Invalid or expired API key';
          details = errorData.message || 'Authentication failed';
        }
      } catch {
        details = await response.text().catch(() => 'Failed to parse error response');
      }
      throw new Error(errorMessage);
    }

    const data: NewsResponse = await response.json();
    const uniqueArticles = Array.from(
      new Map(data.results.map((item) => [item.article_id, item])).values()
    ).slice(0, 10);

    if (uniqueArticles.length === 0) {
      throw new Error('No articles found after filtering duplicates');
    }

    const responseData = { results: uniqueArticles, nextPage: data.nextPage };
    cache.set(cacheKey, responseData);
    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Error fetching news:', error.message, {
      url,
      query: sanitizedQuery,
      page: page || 'none',
      response: error.response?.data || error.message,
    });
    return res.status(500).json({
      error: error.message || 'Failed to fetch news',
      details: error.message.includes('Invalid query') || error.message.includes('API key')
        ? error.message
        : 'No additional details available',
    });
  }
}