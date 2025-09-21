export interface TwitterPost {
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
      // Use backend scraper for Twitter posts
      const response = await fetch('http://localhost:3001/api/scrape-twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tweetUrl })
      });
      
      return await response.json();
    } catch (error) {
      return { 
        text: '', 
        author: '', 
        username: '', 
        url: tweetUrl, 
        error: error instanceof Error ? error.message : 'Failed to fetch tweet' 
      };
    }
  }
}
