import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapeResult {
  title?: string;
  content?: string;
  links?: string[];
  error?: string;
}

export class WebScraper {
  async scrape(url: string): Promise<ScrapeResult> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      return {
        title: $('title').text().trim(),
        content: $('body').text().trim().substring(0, 1000),
        links: $('a[href]').map((_, el) => $(el).attr('href')).get().slice(0, 10)
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Scraping failed' };
    }
  }
}