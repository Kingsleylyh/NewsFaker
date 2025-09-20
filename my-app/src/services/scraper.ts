export interface ScrapeResult {
  url: string;
  html?: string;
  error?: string;
}

export class WebScraper {
  constructor() {}

  async scrape(url: string): Promise<ScrapeResult> {
    try {
      const response = await fetch('http://localhost:3001/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      return await response.json();
    } catch (error) {
      return { url, error: error instanceof Error ? error.message : 'Scraping failed' };
    }
  }
}