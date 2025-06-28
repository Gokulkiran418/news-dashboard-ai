export interface Article {
  article_id: string;
  title: string;
  image_url?: string | null;
  source_id: string;
  pubDate: string;
  description?: string | null;
  link: string;
}