const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });

    // Send raw HTML to frontend - let Bedrock parse it
    res.json({ url, html: response.data });
  } catch (error) {
    res.json({ url: req.body.url, error: error.message });
  }
});

app.listen(3001, () => console.log('Scraper API running on port 3001'));