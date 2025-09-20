import { config } from './config';

export interface ScrapeResult {
  success: boolean;
  url: string;
  html?: string;
  contentType?: string;
  error?: string;
}

export class WebScraper {
  constructor() {}

  async scrape(url: string): Promise<ScrapeResult> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });
      
      const data: ScrapeResult = await response.json();

      if (!response.ok) {
        // Handle HTTP errors (4xx, 5xx) from our own API
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return data;

    } catch (error) {
      console.error('Scraper service error:', error);
      return {
        success: false,
        url,
        error: error instanceof Error ? error.message : 'An unknown network error occurred'
      };
    }
  }
}