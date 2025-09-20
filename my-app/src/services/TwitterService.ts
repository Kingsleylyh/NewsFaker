import { config } from './config';

export interface TwitterPost {
  success: boolean;
  text: string;
  author: string;
  username: string;
  date?: string;
  url: string;
  error?: string;
}

export class TwitterService {
  constructor() {}

  async getPost(tweetUrl: string): Promise<TwitterPost> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/scrape-twitter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: tweetUrl })
      });
      
      const data: TwitterPost = await response.json();

      if (!response.ok) {
        // Handle HTTP errors from our API
        throw new Error(data.error || `Failed to fetch tweet (API error: ${response.status})`);
      }

      // The API returns success: true and the structured data
      return data;

    } catch (error) {
      console.error('Twitter service error:', error);
      return {
        success: false,
        text: '',
        author: '',
        username: '',
        url: tweetUrl,
        error: error instanceof Error ? error.message : 'Failed to fetch tweet due to a network error'
      };
    }
  }
}