import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapeResult {
  url: string;
  title?: string;
  content?: string;
  error?: string;
}

export class WebScraper {
  constructor() {}

  async scrape(url: string): Promise<ScrapeResult> {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const title = $('title').text().trim();
      const content = this.extractMainContent($);

      return { url, title, content };
    } catch (error) {
      return { url, error: error instanceof Error ? error.message : 'Scraping failed' };
    }
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try common article selectors first
    const selectors = ['article', '.post-content', '.entry-content', 'main', '.content'];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length && element.text().trim().length > 100) {
        return element.text().trim();
      }
    }
    
    // Fallback to body content
    return $('body').text().trim().substring(0, 3000);
  }


}