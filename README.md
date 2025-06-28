# 🗞️ News App

A **Next.js 14** application that fetches and displays the latest news articles from the **newsdata.io API**, allows users to view detailed article pages with **AI-generated summaries and keywords** using **OpenAI's gpt-3.5-turbo**, and provides a responsive, dark/light mode interface styled with **Tailwind CSS**. The app includes a search bar, estimated reading time, and robust error handling, with API testing via **Postman**.

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

### Article Detail Page (`/article/[id]`)
- Displays article with link to full article (title, image, source, date, description).
- **AI-generated summary** and **keywords** using OpenAI `gpt-3.5-turbo`.
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

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS (`dark:` variants for theming)
- **State**: `useState`, `useEffect`, and `node-cache` (TTL caching)
- **APIs**: 
  - [newsdata.io](https://newsdata.io/) for latest news
  - [OpenAI gpt-3.5-turbo](https://platform.openai.com/) for summaries & keywords
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
- Uses getServerSideProps for SSR
- Dynamic routing via /article/[id]
- Clean API routes /api/news, /api/summary

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
- OpenAI API key (gpt-3.5-turbo)

### Installation

```bash
git clone <repository-url>
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
│   │   ├── news.ts
│   │   ├── summary.ts
│   ├── _app.tsx
│   ├── index.tsx
│   ├── article/[id].tsx
├── types/
│   ├── article.ts
│   ├── summary.ts
├── styles/
│   ├── globals.css
├── tailwind.config.js
├── postman_collection.json
├── README.md
```

## AI 

### OpenAI
- OpenAI gpt-3.5-turbo
- Article Summaries: ArticleSummary.tsx via /api/summary
- Keyword Extraction: ArticleKeywords.tsx on [id].tsx page

### Grok 3 
- Debugging (e.g., fixing 422 pagination issue)
- Tailwind responsive design
- Postman test planning & error handling suggestions

## Testing using Postman

### Postman_collections.json:
- API tested with Postman
- Caught & fixed:
  - Infinite loading bug (via isLoading reset)
  - Removed Duplicate articles using Map in /api/news.ts

## Step 1:
- Import postman_collections.json in postman (Name import as Eg: AI news dashboard)
- Set up Environment variables in postman
- Select the named import

### Select test cases
- GET /api/news
✅ Tests: 200 OK, 10 articles, nextPage

- Search News
GET /api/news?query=AI
✅ Tests: 200 OK, filtered articles

- Get Article by ID
GET https://newsdata.io/api/1/latest?apikey={{KEY}}&id={{article_id}}
✅ Tests: 200 OK, single article

- Get AI Summary
POST /api/summary
Body: { "description": "..." }
✅ Tests: 200 OK, JSON summary response

- Run and verify all responses

## UI/UX
- Tailwind CSS with dark/light mode support
- Mobile-first responsive layout
- ErrorMessage + PacmanLoader for better UX
- Framer-motion for animations

