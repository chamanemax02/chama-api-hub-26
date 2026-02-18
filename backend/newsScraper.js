const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
};

const SOURCES = {
    // ================= SRI LANKA =================
    adaderana: {
        name: 'Ada Derana',
        url: 'https://sinhala.adaderana.lk/rsshotnews.php',
        type: 'rss',
        baseUrl: 'https://sinhala.adaderana.lk'
    },
    hiru: {
        name: 'Hiru News',
        url: 'https://www.hirunews.lk/',
        type: 'html',
        item: '.trending-section-t-img, .all-section-t-img, .card-v2, .card-v4',
        title: '.title, .latest-title, h1, h2, h3',
        link: 'a',
        image: 'img',
        desc: '.latest-title-p, p',
        baseUrl: 'https://www.hirunews.lk'
    },
    newsfirst: {
        name: 'NewsFirst',
        url: 'https://apienglish.newsfirst.lk/post/PostPagination/0/15',
        type: 'json',
        baseUrl: 'https://www.newsfirst.lk'
    },
    bbc: {
        name: 'BBC Sinhala',
        url: 'https://www.bbc.com/sinhala/index.xml',
        type: 'rss',
        baseUrl: 'https://www.bbc.com'
    },
    gossiplankanews: {
        name: 'Gossip Lanka',
        url: 'https://www.gossiplankanews.com/feeds/posts/default?alt=rss',
        type: 'rss',
        baseUrl: 'https://www.gossiplankanews.com'
    },
    lankadeepa: {
        name: 'Lankadeepa',
        url: 'https://www.lankadeepa.lk/rss/latest_news/1',
        type: 'rss',
        baseUrl: 'https://www.lankadeepa.lk'
    },
    dinamina: {
        name: 'Dinamina',
        url: 'https://news.google.com/rss/search?q=site:dinamina.lk&hl=si&gl=LK&ceid=LK:si',
        type: 'rss',
        baseUrl: 'https://www.dinamina.lk'
    },
    mawbima: {
        name: 'Mawbima',
        url: 'https://mawbima.lk/feed/',
        type: 'rss',
        baseUrl: 'https://mawbima.lk'
    },
    dailymirror: {
        name: 'Daily Mirror',
        url: 'https://www.dailymirror.lk/',
        type: 'html',
        item: '.latest_news_boxs, .big_lime_light_content',
        title: 'h3, .news_block a',
        link: 'a',
        image: 'img',
        desc: 'p',
        baseUrl: 'https://www.dailymirror.lk'
    },
    sundaytimes: {
        name: 'Sunday Times',
        url: 'https://www.sundaytimes.lk/',
        type: 'html',
        item: '.newsblock .col-md-6, .item, #featured_a_posts .item',
        title: '.posttitle a, h2 a',
        link: 'a',
        image: 'img.alignleft, img.featured_media',
        desc: 'p',
        baseUrl: 'https://www.sundaytimes.lk'
    },
    divaina: {
        name: 'Divaina',
        url: 'https://divaina.lk/feed/',
        type: 'rss',
        baseUrl: 'https://divaina.lk'
    },
    silumina: {
        name: 'Silumina',
        url: 'http://www.silumina.lk/feed/',
        type: 'rss',
        baseUrl: 'http://www.silumina.lk'
    },
    itnnews: {
        name: 'ITN News',
        url: 'https://www.itnnews.lk/',
        type: 'html',
        item: '.td-module-title a, .entry-title a, article h3 a, article h2 a',
        title: 'self',
        link: 'self',
        image: 'img',
        desc: 'p',
        baseUrl: 'https://www.itnnews.lk'
    },
    siyatha: {
        name: 'Siyatha News',
        url: 'https://siyathanews.lk/feed/',
        type: 'rss',
        baseUrl: 'https://siyathanews.lk'
    },
    nethnews: {
        name: 'Neth News',
        url: 'https://www.nethnews.lk/feed/',
        type: 'rss',
        baseUrl: 'https://www.nethnews.lk'
    },
    newslk: {
        name: 'News.lk',
        url: 'https://www.news.lk/news?format=feed&type=rss',
        type: 'rss',
        baseUrl: 'https://www.news.lk'
    },
    liveatsrilanka: {
        name: 'Live at Sri Lanka',
        url: 'https://liveatsrilanka.lk/feed/',
        type: 'rss',
        baseUrl: 'https://liveatsrilanka.lk'
    },

    // ================= TECH SRI LANKA =================
    androidwedakarayo: {
        name: 'Android Wedakarayo',
        url: 'https://androidwedakarayo.com/feed.xml',
        type: 'rss',
        baseUrl: 'https://androidwedakarayo.com'
    },
    techkatha: {
        name: 'TechKatha',
        url: 'https://www.techkatha.com/feed/',
        type: 'rss',
        baseUrl: 'https://www.techkatha.com'
    },
    roar_tech: {
        name: 'Roar Media',
        url: 'https://roar.media/sinhala/tech',
        type: 'html',
        item: 'article, .card, .post',
        title: 'h1, h2, h3, .title',
        link: 'a',
        image: 'img',
        desc: 'p, .excerpt',
        baseUrl: 'https://roar.media'
    },
    technews_lk: {
        name: 'Technews.lk',
        url: 'https://technews.lk/',
        type: 'html',
        item: 'article',
        title: 'h2 a, a.text-base',
        link: 'a',
        image: 'img',
        desc: 'p',
        baseUrl: 'https://technews.lk'
    },
    tecroom: {
        name: 'TecRoom',
        url: 'https://tecroom.lk/feed/',
        type: 'rss',
        baseUrl: 'https://tecroom.lk'
    },

    // ================= WORLD =================
    nhk: {
        name: 'NHK World News',
        url: 'https://www3.nhk.or.jp/rss/news/cat0.xml',
        type: 'rss',
        baseUrl: 'https://www3.nhk.or.jp'
    },
    japantoday: {
        name: 'Japan Today',
        url: 'https://japantoday.com/feed',
        type: 'rss',
        baseUrl: 'https://japantoday.com'
    },
    japantimes: {
        name: 'The Japan Times',
        url: 'https://www.japantimes.co.jp/feed/topstories',
        type: 'rss',
        baseUrl: 'https://www.japantimes.co.jp'
    },
    bbcworld: {
        name: 'BBC News World',
        url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
        type: 'rss',
        baseUrl: 'https://www.bbc.com'
    },
    cnn: {
        name: 'CNN World',
        url: 'http://rss.cnn.com/rss/cnn_world.rss',
        type: 'rss',
        baseUrl: 'https://edition.cnn.com'
    },
    nytimes: {
        name: 'NY Times World',
        url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        type: 'rss',
        baseUrl: 'https://www.nytimes.com'
    },
    foxnews: {
        name: 'Fox News World',
        url: 'http://feeds.foxnews.com/foxnews/world',
        type: 'rss',
        baseUrl: 'https://www.foxnews.com'
    },
    reuters: {
        name: 'Reuters World',
        url: 'https://news.google.com/rss/search?q=source:Reuters+World&hl=en-US&gl=US&ceid=US:en',
        type: 'rss',
        baseUrl: 'https://www.reuters.com'
    },
    aljazeera: {
        name: 'Al Jazeera',
        url: 'https://www.aljazeera.com/xml/rss/all.xml',
        type: 'rss',
        baseUrl: 'https://www.aljazeera.com'
    },
    techcrunch: {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        type: 'rss',
        baseUrl: 'https://techcrunch.com'
    },
    theverge: {
        name: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        type: 'rss',
        baseUrl: 'https://www.theverge.com'
    },
    wired: {
        name: 'Wired',
        url: 'https://www.wired.com/feed/rss',
        type: 'rss',
        baseUrl: 'https://www.wired.com'
    },
    gizmodo: {
        name: 'Gizmodo',
        url: 'https://gizmodo.com/rss',
        type: 'rss',
        baseUrl: 'https://gizmodo.com'
    },
    engadget: {
        name: 'Engadget',
        url: 'https://www.engadget.com/rss.xml',
        type: 'rss',
        baseUrl: 'https://www.engadget.com'
    },
    // Aliases
    gossiplanka: 'gossiplankanews',
    roar: 'roar_tech',
    'bbc_sinhala': 'bbc',
    'japan-today': 'japantoday',
    'bbc-world': 'bbcworld',
    'japan-times': 'japantimes',
    'ny-times': 'nytimes',
    'fox-news': 'foxnews',
    'the-verge': 'theverge',
    tech: 'techcrunch'
};

async function fetchNews(sourceKey) {
    let source = SOURCES[sourceKey.toLowerCase()];
    if (typeof source === 'string') {
        source = SOURCES[source]; // Follow alias
    }

    if (!source) throw new Error("Invalid news source");

    try {
        const headers = { ...COMMON_HEADERS };
        if (sourceKey.toLowerCase() === 'newsfirst') {
            headers['Origin'] = 'https://www.newsfirst.lk';
            headers['Referer'] = 'https://www.newsfirst.lk/';
        }

        const { data } = await axios.get(source.url, {
            headers,
            timeout: 30000,
            httpsAgent,
            validateStatus: () => true
        });

        if (!data) throw new Error(`Empty response from ${source.name}`);

        if (source.type === 'rss') {
            return parseRSS(data, source);
        } else if (source.type === 'json') {
            return parseJSON(data, source);
        } else {
            return parseHTML(data, source);
        }
    } catch (e) {
        console.error(`[Scraper] Error fetching ${sourceKey}:`, e.message);
        throw e;
    }
}

function parseJSON(data, source) {
    const articles = [];
    // NewsFirst specific format
    if (data.postResponseDto && Array.isArray(data.postResponseDto)) {
        data.postResponseDto.forEach(post => {
            const title = post.title?.rendered || post.short_title || "";
            const link = post.post_url;
            const image = post.images?.large_tile_image || post.images?.post_thumb || "";
            const desc = post.excerpt?.rendered || "";

            if (title && link) {
                articles.push({
                    title: title.replace(/&[^;]+;/g, ' ').trim(),
                    url: link.startsWith('http') ? link : source.baseUrl + (link.startsWith('/') ? '' : '/') + link,
                    image: image || `https://s2.googleusercontent.com/s2/favicons?domain=${source.baseUrl}&sz=128`,
                    desc: desc.replace(/<[^>]*>/g, '').substring(0, 200).trim() + (desc.length > 200 ? '...' : ''),
                    source: source.name
                });
            }
        });
    }
    return articles;
}

function parseRSS(data, source) {
    const $ = cheerio.load(data, { xmlMode: true });
    const articles = [];

    $('item, entry').each((i, el) => {
        if (articles.length >= 25) return;

        const title = $(el).find('title').text().trim();
        let link = $(el).find('link').text().trim() || $(el).find('link').attr('href') || $(el).find('guid').text().trim();
        let desc = $(el).find('description, summary, content').text() || "";

        let image = $(el).find('media\\:content, content').attr('url') ||
            $(el).find('media\\:thumbnail').attr('url') ||
            $(el).find('enclosure').attr('url') ||
            $(el).find('image').text();

        if (!image) {
            const imgMatch = desc.match(/src=["']([^"']+)["']/);
            if (imgMatch) image = imgMatch[1];
        }

        if (!image) image = `https://s2.googleusercontent.com/s2/favicons?domain=${source.baseUrl}&sz=128`;

        const cleanDesc = desc.replace(/<[^>]*>/g, '').substring(0, 200).trim() + (desc.length > 200 ? '...' : '');

        if (title && link) {
            articles.push({
                title,
                url: link.startsWith('http') ? link : source.baseUrl + (link.startsWith('/') ? '' : '/') + link,
                image: image.startsWith('http') ? image : source.baseUrl + (image.startsWith('/') ? '' : '/') + image,
                desc: cleanDesc || "Read more at " + source.name,
                source: source.name
            });
        }
    });

    // Remove duplicates
    return articles.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
}

function parseHTML(data, source) {
    const $ = cheerio.load(data);
    const articles = [];

    $(source.item).each((i, el) => {
        if (articles.length >= 25) return;

        let title = $(el).find(source.title).first().text().trim() || $(el).text().split('\n')[0].trim();
        let link = $(el).find(source.link).first().attr('href') || $(el).attr('href') || $(el).closest('a').attr('href');
        let image = $(el).find(source.image).first().attr('src') || $(el).find('img').first().attr('src') || $(el).find(source.image).first().attr('data-src') || $(el).find(source.image).first().attr('data-original');
        let desc = $(el).find(source.desc).first().text().trim() || $(el).find('p').first().text().trim() || "";

        if (title && title.length > 5 && link) {
            if (!link.startsWith('http')) link = source.baseUrl + (link.startsWith('/') ? '' : '/') + link;
            if (image && !image.startsWith('http')) {
                if (image.startsWith('//')) {
                    image = 'https:' + image;
                } else {
                    image = source.baseUrl + (image.startsWith('/') ? '' : '/') + image;
                }
            }
            if (!image) image = `https://s2.googleusercontent.com/s2/favicons?domain=${source.baseUrl}&sz=128`;

            articles.push({
                title,
                url: link,
                image,
                desc: desc.substring(0, 200) || "Check latest news at " + source.name,
                source: source.name
            });
        }
    });

    // Deduplicate
    return articles.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
}

module.exports = { SOURCES, fetchNews };
