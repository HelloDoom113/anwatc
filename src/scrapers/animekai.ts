import cheerio from 'cheerio';

export interface AnimeKaiFeatured {
  title: string;
  altTitle?: string;
  url: string;
  image: string;
  description: string;
  subCount?: number;
  dubCount?: number;
  type?: string;
  genres?: string[];
  year?: string;
  rating?: string;
}

export interface AnimeKaiHomePage {
  featured: AnimeKaiFeatured[];
  latestUpdates: AnimeKaiFeatured[];
  newReleases: AnimeKaiFeatured[];
  trending: AnimeKaiFeatured[];
  genres: { name: string; url: string }[];
  azList: { letter: string; url: string }[];
}

export interface AnimeKaiAnimeDetails {
  title: string;
  altTitle?: string;
  description: string;
  poster: string;
  rating?: string;
  subCount?: number;
  type?: string;
  genres: string[];
  country?: string;
  premiered?: string;
  score?: string;
  aired?: string;
  broadcast?: string;
  status?: string;
  episodes?: string;
  duration?: string;
  studios: string[];
  producers: string[];
  related: { title: string; url: string; image: string; relation?: string }[];
  recommendations: { title: string; url: string; image: string }[];
}

export class AnimeKaiScraper {
  async getHomePage(html: string): Promise<AnimeKaiHomePage> {
    const $ = cheerio.load(html);

    const featured: AnimeKaiFeatured[] = [];
    $('#featured .swiper-slide').each((_, el) => {
      const container = $(el).find('.container .detail');
      const title = container.find('.title').text().trim();
      const description = container.find('.desc').text().trim();
      const url = container.find('.watch-btn').attr('href') || '';
      const image = $(el).css('background-image')?.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') || '';

      const infoSpans = container.find('.info span');
      const subCount = parseInt(infoSpans.eq(0).text().trim()) || undefined;
      const dubCount = parseInt(infoSpans.eq(1).text().trim()) || undefined;
      const type = infoSpans.eq(2).text().trim();
      const genres = infoSpans.eq(3).text().split(',').map((g: string) => g.trim());

      const year = container.find('.mics div:contains("Release") span').text().trim();
      const rating = container.find('.mics div:contains("Rating") span').text().trim();

      featured.push({ title, description, url, image, subCount, dubCount, type, genres, year, rating });
    });

    const latestUpdates: AnimeKaiFeatured[] = [];
    $('#latest-updates .aitem').each((_, el) => {
      const title = $(el).find('.title').attr('title') || $(el).find('.title').text().trim();
      const url = $(el).find('a.poster').attr('href') || '';
      const image = $(el).find('img').attr('data-src') || '';
      latestUpdates.push({ title, url, image, description: '' });
    });

    const newReleases: AnimeKaiFeatured[] = [];
    $('.alist-group .swiper-slide').first().find('.aitem').each((_, el) => {
      const title = $(el).attr('title') || '';
      const url = $(el).attr('href') || '';
      const image = $(el).find('img').attr('data-src') || '';
      newReleases.push({ title, url, image, description: '' });
    });

    const trending: AnimeKaiFeatured[] = [];
    $('.top-anime .aitem').each((_, el) => {
      const title = $(el).find('.title').text().trim();
      const url = $(el).attr('href') || '';
      const image = $(el).css('background-image')?.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') || '';
      trending.push({ title, url, image, description: '' });
    });

    const genres: { name: string; url: string }[] = [];
    $('.nav-menu ul li a[href*="/genres/"]').each((_, el) => {
      genres.push({ name: $(el).text().trim(), url: $(el).attr('href') || '' });
    });

    const azList: { letter: string; url: string }[] = [];
    $('.azlist ul li a').each((_, el) => {
      azList.push({ letter: $(el).text().trim(), url: $(el).attr('href') || '' });
    });

    return { featured, latestUpdates, newReleases, trending, genres, azList };
  }

  async getAnimeDetails(html: string): Promise<AnimeKaiAnimeDetails> {
    const $ = cheerio.load(html);

    const container = $('.watch-section-wrap .entity-section');
    const title = container.find('.title').text().trim();
    const altTitle = container.find('.al-title').text().trim();
    const description = container.find('.desc').text().trim();
    const poster = container.find('.poster img').attr('src') || '';

    const infoSpans = container.find('.info span');
    const rating = infoSpans.eq(0).text().trim();
    const subCount = parseInt(infoSpans.eq(1).text().trim()) || undefined;
    const type = infoSpans.eq(2).text().trim();

    const genres: string[] = [];
    container.find('div:contains("Genres:") a').each((_, el) => {
      genres.push($(el).text().trim());
    });

    const country = container.find('div:contains("Country:") a').text().trim();
    const premiered = container.find('div:contains("Premiered:") span').text().trim();
    const score = container.find('div:contains("Scores:") span').first().text().trim();
    const aired = container.find('div:contains("Date aired:") span').text().trim();
    const broadcast = container.find('div:contains("Broadcast:") span').text().trim();
    const status = container.find('div:contains("Status:") span').text().trim();
    const episodes = container.find('div:contains("Episodes:") span').text().trim();
    const duration = container.find('div:contains("Duration:") span').text().trim();

    const studios: string[] = [];
    container.find('div:contains("Studios:") a').each((_, el) => {
      studios.push($(el).text().trim());
    });

    const producers: string[] = [];
    container.find('div:contains("Producers:") a').each((_, el) => {
      producers.push($(el).text().trim());
    });

    const related: { title: string; url: string; image: string; relation?: string }[] = [];
    $('#related-anime .aitem').each((_, el) => {
      const title = $(el).find('.title').text().trim();
      const url = $(el).attr('href') || '';
      const image = $(el).css('background-image')?.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') || '';
      const relation = $(el).find('.info b.text-muted').text().trim() || undefined;
      related.push({ title, url, image, relation });
    });

    const recommendations: { title: string; url: string; image: string }[] = [];
    $('.sidebar-section:contains("Recommended") .aitem').each((_, el) => {
      const title = $(el).find('.title').text().trim();
      const url = $(el).attr('href') || '';
      const image = $(el).css('background-image')?.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') || '';
      recommendations.push({ title, url, image });
    });

    return {
      title,
      altTitle,
      description,
      poster,
      rating,
      subCount,
      type,
      genres,
      country,
      premiered,
      score,
      aired,
      broadcast,
      status,
      episodes,
      duration,
      studios,
      producers,
      related,
      recommendations,
    };
  }
}