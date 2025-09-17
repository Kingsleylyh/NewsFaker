import express from 'express';
import { WebScraper } from './scraper';

const app = express();
app.use(express.json());

const scraper = new WebScraper();

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const result = await scraper.scrape(url);
  res.json(result);
});

app.listen(3001, () => {
  console.log('Scraper API running on port 3001');
});