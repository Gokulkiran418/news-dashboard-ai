// stores/newsStore.ts
import { Article } from '../types/article';
import { create } from 'zustand';

interface NewsState {
  articles: Article[];
  nextPage: string | null;
  newArticleIds: Set<string>;
  setArticles: (articles: Article[]) => void;
  setNextPage: (nextPage: string | null) => void;
  setNewArticleIds: (ids: Set<string>) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  articles: [],
  nextPage: null,
  newArticleIds: new Set(),
  setArticles: (articles: Article[]) => set({ articles }),
  setNextPage: (nextPage: string | null) => set({ nextPage }),
  setNewArticleIds: (ids: Set<string>) => set({ newArticleIds: ids }),
}));
