import type { NextApiRequest, NextApiResponse } from 'next';

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

  try {
    const response = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&language=en`
    );
    if (!response.ok) {
      throw new Error(`News API error: ${response.statusText}`);
    }
    const data: NewsResponse = await response.json();
    res.status(200).json({ results: data.results.slice(0, 10) });
  } catch (error: any) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}