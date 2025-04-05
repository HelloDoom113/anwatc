import { Hono } from 'hono';
import type { AniwatchAPIVariables } from '../config/variables.js';
import { cache } from '../config/cache.js';
import { AnimeKaiScraper } from '../scrapers/animekai.js';

const animekaiRouter = new Hono<{ Variables: AniwatchAPIVariables }>();
const scraper = new AnimeKaiScraper();

// GET /api/v2/animekai/home?url=<homepage_url>
animekaiRouter.get('/home', async (c) => {
  const cacheConfig = c.get('CACHE_CONFIG');
  const url = c.req.query('url') || 'https://animekai.to/home';

  const html = await fetch(url).then((res) => res.text());

  const data = await cache.getOrSet(
    async () => scraper.getHomePage(html),
    cacheConfig.key,
    cacheConfig.duration
  );

  return c.json({ success: true, data }, { status: 200 });
});

// GET /api/v2/animekai/anime?url=<anime_page_url>
animekaiRouter.get('/anime', async (c) => {
  const cacheConfig = c.get('CACHE_CONFIG');
  const url = c.req.query('url');

  if (!url) {
    return c.json({ success: false, error: 'Missing anime URL' }, { status: 400 });
  }

  const html = await fetch(url).then((res) => res.text());

  const data = await cache.getOrSet(
    async () => scraper.getAnimeDetails(html),
    cacheConfig.key,
    cacheConfig.duration
  );

  return c.json({ success: true, data }, { status: 200 });
});

export { animekaiRouter };