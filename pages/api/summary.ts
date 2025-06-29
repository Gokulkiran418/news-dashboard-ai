import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

type SummaryRequest = {
  description: string;
};

type SummaryResponse = {
  summary: string;
};

type ErrorResponse = {
  error: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummaryResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description } = req.body as SummaryRequest;

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters long' });
  }

  try {
    // Truncate to ~4000 chars to stay within gpt-4o input limits (128k tokens ~ 500k chars, but keep safe)
    const truncatedText = description.slice(0, 4000);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Summarize the provided text in 2-3 sentences, capturing the main points concisely. If the input is too short or vague, return a brief summary acknowledging the limited content.',
        },
        { role: 'user', content: truncatedText },
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    const summary = completion.choices[0].message.content || 'No summary generated';
    res.status(200).json({ summary });
  } catch (error: any) {
    console.error('Error generating summary:', error.message, error.stack);
    if (error.response?.status === 401) {
      res.status(500).json({ error: 'Invalid OpenAI API key' });
    } else {
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  }
}