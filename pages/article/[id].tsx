import { GetServerSideProps } from 'next';
import OpenAI from 'openai';
import readingTime from 'reading-time';
import { motion, Variants } from 'framer-motion';
import Navbar from '../../components/Navbar';
import ArticleHeader from '../../components/ArticleHeader';
import ArticleDescription from '../../components/ArticleDescription';
import ArticleKeywords from '../../components/ArticleKeywords';
import ArticleLink from '../../components/ArticleLink';
import ArticleSummary from '../../components/ArticleSummary';
import { Article } from '../../types/article';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { load } from 'cheerio';
import { useTheme } from 'next-themes';


const StarryBackground = dynamic(() => import('../../components/StarryBackground'), { ssr: false });

type ArticleDetailProps = {
  article: Article | null;
  error?: string;
  readingTime: string;
  keywords: string[];
  fullText?: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  


  try {
    const res = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&id=${encodeURIComponent(id)}`
    );

    if (!res.ok) throw new Error(`Failed to fetch article: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error('Article not found');

    const article = data.results[0];

    let fullText = article.description || '';
    try {
      const response = await axios.get(article.link, { timeout: 10000 });
      const $ = load(response.data);
      const articleContent = $('article, .post-content, .entry-content, .article-body, p')
        .not('script, style, nav, footer, aside')
        .text()
        .trim();
      fullText = articleContent || article.description || '';
    } catch (err: any) {
      console.error('Error fetching article content:', err.message);
    }

    const readingTimeStats = readingTime(fullText);
    const readingTimeText = readingTimeStats.text;

    let keywords: string[] = [];
    if (article.description && process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that extracts keywords from text. Return a list of 3-5 key phrases (1-3 words each) that summarize the main topics of the input text, separated by commas.',
          },
          {
            role: 'user',
            content: `Extract keywords from this text: "${article.description}"`,
          },
        ],
        max_tokens: 50,
      });

      const responseText = completion.choices[0]?.message.content || '';
      keywords = responseText.split(',').map((k) => k.trim()).slice(0, 5);
    }

    return {
      props: {
        article,
        readingTime: readingTimeText,
        keywords,
        fullText,
      },
    };
  } catch (error: any) {
    console.error('Error in getServerSideProps:', error.message);
    return {
      props: {
        article: null,
        error: error.message || 'Failed to load article',
        readingTime: '',
        keywords: [],
        fullText: '',
      },
    };
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function ArticleDetail({ article, error, readingTime, keywords, fullText }: ArticleDetailProps) {
  const isShortDescription = !article?.description || article.description.length < 50;
  const { resolvedTheme } = useTheme();
  return (
   <motion.div
  initial="hidden"
  animate="visible"
  variants={containerVariants}
  className="relative min-h-screen"
>
  <StarryBackground theme={resolvedTheme} />
  <Navbar />
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[80px]">
    <div className="max-w-5xl mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg shadow-lg p-6 sm:p-8">
          {error || !article ? (
            <>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6"
              >
                Article Not Found
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200 p-4 rounded-md mb-6"
              >
                <p>{error || 'Failed to load article. Please try another article.'}</p>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={sectionVariants}>
                <ArticleHeader
                  title={article.title}
                  image_url={article.image_url}
                  source_id={article.source_id}
                  pubDate={article.pubDate}
                />
              </motion.div>
              <motion.hr variants={sectionVariants} className="my-6 border-gray-200 dark:border-gray-700" />
              <motion.h2
                variants={sectionVariants}
                className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4"
              >
                AI-Generated Summary
              </motion.h2>
              <motion.div variants={sectionVariants}>
                <ArticleSummary
                  description={article.description}
                  fullText={fullText}
                  source_id={article.source_id}
                  link={article.link}
                />
              </motion.div>
              <motion.hr variants={sectionVariants} className="my-6 border-gray-200 dark:border-gray-700" />
              <motion.div variants={sectionVariants}>
                <ArticleKeywords keywords={keywords} readingTime={readingTime} />
              </motion.div>
              <motion.div variants={sectionVariants}>
                <ArticleLink link={article.link} source_id={article.source_id} />
              </motion.div>
              <motion.hr variants={sectionVariants} className="my-6 border-gray-200 dark:border-gray-700" />
              <motion.div variants={sectionVariants}>
                <ArticleDescription description={article.description} isShortDescription={isShortDescription} />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
