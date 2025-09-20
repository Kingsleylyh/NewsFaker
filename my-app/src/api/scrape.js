require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dns = require('dns').promises;
const { URL } = require('url');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.SCRAPER_API_PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL // Restrict CORS to your frontend in production
}));
app.use(express.json());

// Security Middleware: Validate URL and prevent SSRF
const validateUrl = async (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    
    // Ensure it's http or https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' });
    }

    // Optional: Allowlist specific domains for scraping in production
    // const allowedDomains = ['news.site.com', 'trusted-source.org'];
    // if (!allowedDomains.includes(parsedUrl.hostname)) {
    //   return res.status(403).json({ error: 'Scraping is not allowed for this domain.' });
    // }

    const hostname = parsedUrl.hostname;
    const addresses = await dns.resolve(hostname);

    // Check if the IP is private (internal network)
    const isPrivateIP = (addr) => {
      return addr === '127.0.0.1' ||
             addr === '0.0.0.0' ||
             addr === '::1' ||
             addr === 'localhost' ||
             addr.startsWith('10.') ||
             addr.startsWith('192.168.') ||
             (addr.startsWith('172.') && parseInt(addr.split('.')[1], 10) >= 16 && parseInt(addr.split('.')[1], 10) <= 31) ||
             addr.startsWith('169.254.'); // Link-local addresses
    };

    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return res.status(403).json({ error: 'Access to private/internal networks is forbidden.' });
      }
    }

    // Attach the validated, parsed URL to the request
    req.validatedUrl = url;
    next();

  } catch (error) {
    console.error('URL validation error:', error);
    return res.status(400).json({ error: 'Invalid or malformed URL provided.' });
  }
};

// Generic Scraper Route
app.post('/api/scrape', validateUrl, async (req, res) => {
  try {
    const url = req.validatedUrl;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });

    res.json({
      success: true,
      url: url,
      html: response.data,
      contentType: response.headers['content-type']
    });

  } catch (error) {
    console.error(`Scraping error for ${req.validatedUrl}:`, error.message);
    
    let errorMessage = 'Failed to fetch the URL';
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out';
    } else if (error.response) {
      // The server responded with a status code outside 2xx
      errorMessage = `Server responded with status: ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response received
      errorMessage = 'No response received from server';
    }

    res.status(500).json({
      success: false,
      url: req.validatedUrl,
      error: errorMessage
    });
  }
});

// Dedicated Twitter Scraper Route
app.post('/api/scrape-twitter', validateUrl, async (req, res) => {
  try {
    const url = req.validatedUrl;
    const nitterUrl = url.replace('twitter.com', 'nitter.net')
                         .replace('x.com', 'nitter.net')
                         .replace('www.', '');

    const response = await axios.get(nitterUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // IMPORTANT: Nitter's HTML structure changes frequently.
    // You will need to inspect the page and update these selectors.
    const tweetText = $('.tweet-content').text().trim() || '';
    const author = $('.fullname').first().text().trim() || '';
    const username = $('.username').first().text().trim() || ''; // includes @
    const date = $('.tweet-date a').first().attr('title') || $('.tweet-date').text().trim();

    // Check if we actually found a tweet or if it's a failed page load
    if (!tweetText && !author) {
      throw new Error('Could not find tweet data on the page. The Nitter selector may be outdated.');
    }

    res.json({
      success: true,
      url: url, // original URL
      text: tweetText,
      author: author,
      username: username,
      date: date
    });

  } catch (error) {
    console.error(`Twitter scraping error for ${req.validatedUrl}:`, error.message);
    res.status(500).json({
      success: false,
      url: req.validatedUrl,
      error: error.message // Sending specific error for Twitter is ok for debugging
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Scraper API is running' });
});

app.listen(PORT, () => console.log(`Scraper API running on port ${PORT}`));