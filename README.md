# 🗞️ News App

A **Next.js 14** application that fetches and displays the latest news from newsdata.io, lets users view detailed articles with **AI-generated summaries and keywords** via **OpenAI GPT-4o**, and supports dark/light mode with responsive UI using **Tailwind CSS**. Built with performance, persistence, and UX in mind—featuring state management via **Zustand, framer-motion animations, and robust caching.**

---

## ✨ Features

### Homepage (`/`)
- Lists **10 latest news articles** (title, image, source, date) from **newsdata.io**.
- **Search bar** to filter articles by query.
- **Loading state** with `PacmanLoader` and proper error/empty state handling.
- **Responsive grid layout** (1 column on mobile, 2 on tablet, 3 on desktop).
- **Pagination** with "Next Page" button using `nextPage` from API.
- **Dark/light mode** toggle with `localStorage` persistence.
- **Graceful Error Handling**
- **Framer-motion** for animations
- **Server-side searching** enabled to search articles from newsdata api
- SSR support using **getServerSideProps**
- Pagination with "Next Page" button powered by API’s nextPage token.
- **New** badge for newly fetched articles (persisted client-side with Zustand).

### Article Detail Page (`/article/[id]`)
- Displays article with link to full article (title, image, source, date, description).
- **AI-generated summary** and **keywords** using OpenAI `gpt-4o`.
- **Estimated reading time** via `reading-time`.
- Full-width responsive layout with dark/light support.

### API QA
- Postman collection tests:
  - News fetching
  - Search
  - Article details
  - AI summary generation

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Zustand** (Global persistent state: articles, nextPage, new highlights)
- **Styling**: Tailwind CSS (`dark:` variants for theming)
- **State**: `useState`, `useEffect`, and `node-cache` (TTL caching)
- **APIs**: 
  - [newsdata.io](https://newsdata.io/) for latest news
  - [OpenAI gpt-40](https://platform.openai.com/) for summaries & keywords
- **Optimization**:
  - `React.memo` for performance
  - `getServerSideProps` for SSR
- **UI/UX**:
  - Responsive layouts
  - Custom error/loading/empty states
  - Estimated reading time display

---
## React Optimizations
- Components wrapped in react memo
- Variables -  use memo
- SSR with getServerSideProps to fetch news on first load.
- Dynamic routing via /article/[id]
- Zustand persists article state to avoid refetching on route change.
- Clean API routes /api/news, /api/summary
- Deduplication logic ensures no repeated articles from API.

## API Usage
- newsdata.io: Latest headlines, search, pagination
- OpenAI: Summarization & keyword extraction

## ✅ Free Tier Compliance

- Limits to **10 articles per request**
- **200 API requests/day** (free tier)
- **600s TTL cache** using `node-cache` to reduce API load

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm
- newsdata.io API key
- OpenAI API key (gpt-4o)

### Installation

```bash
git clone https://github.com/Gokulkiran418/news-dashboard-ai
cd news-app
npm install
```
### Add Environment Variables
- NEWS_API_KEY=your_newsdata_io_api_key
- OPENAI_API_KEY=your_openai_api_key

```bash
npm run dev
```
- Visit http://localhost:3000

```
news-app/
├── components/
│   ├── ArticleCard.tsx
│   ├── ArticleDescription.tsx
│   ├── ArticleHeader.tsx
│   ├── ArticleKeywords.tsx
│   ├── ArticleLink.tsx
│   ├── ArticleSummary.tsx
│   ├── ErrorMessage.tsx
│   ├── SearchBar.tsx
├── pages/
│   ├── api/
│   │   ├── news.ts          // Fetch news + search
│   │   ├── summary.ts       // OpenAI summarizer
│   ├── article/
│   │   └── [id].tsx         // Article detail view
│   ├── index.tsx            // Homepage with Zustand + SSR
│   └── _app.tsx             // Global styles & theme
├── stores/
│   └── newsStore.ts         // Zustand store for articles
├── lib/
│   └── getBaseUrl.ts        // Base URL detection for SSR
├── styles/
│   └── globals.css
├── types/
│   ├── article.ts
│   ├── summary.ts
├── postman_collection.json
├── tailwind.config.js
└── README.md
```

## AI 

### OpenAI
- OpenAI gpt-4o
- Article Summaries: ArticleSummary.tsx via /api/summary
- Keyword Extraction: ArticleKeywords.tsx on [id].tsx page

### Grok 3 
- Debugging (e.g., fixing 422 pagination issue)
- Tailwind responsive design
- Postman test planning & error handling suggestions

### Caught & fixed errors:
  - Vercel url fetch error
  - Removed Duplicate articles using Map in /api/news.ts
    - Fixed error :- Same article but different publishers
  - Search results displayed wrong articles 
    - Display exact results along with extra articles
    - Now best match results are highlighted
  - Fixed article language error

# Postman
### Postman_collections.json (Check root folder for file):
- API routes tested with Postman
## Steps:
- Import postman_collections.json in postman (Name import as Eg: AI news dashboard)
- Set up Environment variables in postman
- Select the named import

### Select test cases in Postman UI
- **GET /api/news**
✅ Tests: 200 OK
- **Search News**
✅ Tests: 200 OK
- **Get Article by ID**
GET https://newsdata.io/api/1/latest?apikey={{KEY}}&id={{article_id}}
✅ Tests: 200 OK
- **Get AI Summary**
✅ Tests: 200 OK, JSON summary response

- Run and verify all responses

## UI/UX
- Tailwind CSS with dark/light mode support
- Mobile-first responsive layout
- ErrorMessage + PacmanLoader for better UX
- Framer-motion for animations

