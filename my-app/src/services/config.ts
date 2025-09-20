export const config = {
  // In a Next.js app, this public env var is injected at build time
  apiBaseUrl: process.env.NEXT_PUBLIC_SCRAPER_API_URL || 'http://localhost:3001',
};

export default config;