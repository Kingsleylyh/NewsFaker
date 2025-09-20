import axios from 'axios';
import * as cheerio from 'cheerio';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export interface ScrapeResult {
  url: string;
  title?: string;
  content?: string;
  summary?: string;
  keyPoints?: string[];
  sentiment?: string;
  error?: string;
}

export class WebScraper {
  private bedrock: BedrockRuntimeClient;

  constructor(region = 'us-east-1') {
    this.bedrock = new BedrockRuntimeClient({ region });
  }

  async scrape(url: string): Promise<ScrapeResult> {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const title = $('title').text().trim();
      const content = this.extractMainContent($);

      const analysis = await this.analyzeWithBedrock(content);

      return {
        url,
        title,
        content,
        ...analysis
      };
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

  private async analyzeWithBedrock(content: string) {
    try {
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Analyze this article/post content and provide:
1. A 2-sentence summary
2. 3-5 key points as bullet points
3. Overall sentiment (positive/negative/neutral)

Content: ${content.substring(0, 2000)}`
          }]
        })
      });

      const response = await this.bedrock.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      const analysis = result.content[0].text;

      return this.parseAnalysis(analysis);
    } catch (error) {
      return { summary: 'Analysis unavailable', keyPoints: [], sentiment: 'unknown' };
    }
  }

  private parseAnalysis(analysis: string) {
    const lines = analysis.split('\n').filter(line => line.trim());
    
    return {
      summary: lines.find(line => !line.startsWith('•') && !line.toLowerCase().includes('sentiment'))?.trim() || 'No summary',
      keyPoints: lines.filter(line => line.startsWith('•')).map(line => line.substring(1).trim()),
      sentiment: lines.find(line => line.toLowerCase().includes('sentiment'))?.split(':')[1]?.trim() || 'neutral'
    };
  }
}