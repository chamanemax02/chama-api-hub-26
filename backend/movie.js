const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const CryptoJS = require('crypto-js');
const router = express.Router();

const baseInfo = {
    creator: "Chama Ofc",
    status: true,
    project: "Chama Ofc"
};

const COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://cinesubz.lk/"
};

// ================= SONIC SCRAPER LOGIC ================= //

const SonicCloud = {
    KEYS: { PROTO_KEY: 'OLiYs', DATA_KEY: 'ispsA' },
    decrypt: (data, key) => {
        try {
            const bytes = CryptoJS.AES.decrypt(data, key);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) { return null; }
    },
    hexToBytes: (hex) => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        return bytes;
    },
    decodeUrlField: (buffer) => {
        const bytes = new Uint8Array(buffer);
        let i = 0;
        while (i < bytes.length) {
            const tag = bytes[i++];
            const wireType = tag & 7;
            const fieldNumber = tag >> 3;
            if (fieldNumber === 4 && wireType === 2) {
                let length = 0, shift = 0;
                while (true) {
                    const b = bytes[i++];
                    length |= (b & 0x7f) << shift;
                    if (!(b & 0x80)) break;
                    shift += 7;
                }
                const stringBytes = bytes.slice(i, i + length);
                return Buffer.from(stringBytes).toString('utf8');
            } else {
                if (wireType === 0) while (bytes[i++] & 0x80);
                else if (wireType === 2) {
                    let length = 0, shift = 0;
                    while (true) {
                        const b = bytes[i++];
                        length |= (b & 0x7f) << shift;
                        if (!(b & 0x80)) break;
                        shift += 7;
                    }
                    i += length;
                } else if (wireType === 1) i += 8;
                else if (wireType === 5) i += 4;
                else break;
            }
        }
        return null;
    }
};

const SonicDirect = {
    HEADERS: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://sonic-cloud.online/', 'Accept': 'application/json, text/plain, */*' },
    getProviderName: (url) => {
        const low = url.toLowerCase();
        if (low.includes('drive.google')) return 'gdrive';
        if (low.includes('pixeldrain')) return 'pix';
        if (low.includes('t.me') || low.includes('telegram')) return 'telegram';
        if (low.includes('mega.nz')) return 'mega';
        if (low.includes('mediafire')) return 'mediafire';
        return 'unknown';
    },
    fetchDownloadData: async (moviePath) => {
        try {
            const id = moviePath.includes('/v/') ? moviePath.split('/v/')[1].split('?')[0] : moviePath;
            const apiUrl = `https://bot2.sonic-cloud.online/api/download-data/${id}`;
            const response = await axios.get(apiUrl, { headers: SonicDirect.HEADERS, timeout: 10000 });
            const raw = response.data, download = [];
            const links = raw.links || raw.download_links || raw.data?.links || [];
            if (Array.isArray(links)) {
                links.forEach(l => {
                    const url = l.url || l.link;
                    if (url) download.push({ name: SonicDirect.getProviderName(url), url: url });
                });
            } else if (raw.url) {
                download.push({ name: SonicDirect.getProviderName(raw.url), url: raw.url });
            }
            return { status: true, data: { title: raw.title || raw.name || 'Unknown Movie', size: raw.size || 'Unknown', download: download } };
        } catch (e) { return { status: false, error: e.message }; }
    }
};

/**
 * Scrapes movie details and video links from CineSubz.lk
 */
async function fetchCinesubzDetails(url) {
    try {
        const { data } = await axios.get(url, { headers: COMMON_HEADERS, timeout: 15000 });
        const $ = cheerio.load(data);
        const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
        const description = $('meta[property="og:description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';
        let videoUrl = null;
        const iframeSrc = $('.metaframe, iframe.metaframe').attr('src');
        if (iframeSrc) {
            try {
                const parsedUrl = new URL(iframeSrc);
                const source = parsedUrl.searchParams.get('source');
                if (source) videoUrl = decodeURIComponent(source);
                else videoUrl = iframeSrc;
            } catch (e) { videoUrl = iframeSrc; }
        }

        if (!videoUrl) videoUrl = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:url"]').attr('content') || $('meta[name="twitter:player:stream"]').attr('content');
        if (!videoUrl) videoUrl = $('#splash-play').attr('href');

        const imdb = $('.data-imdb').first().text().trim() || 'N/A';
        const year = $('.year').first().text().trim() || 'N/A';
        const gallery = [];
        $('.gallery img, #gallery img').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src) gallery.push(src);
        });
        const cast = [];
        $('.zt-cast-card, .person').each((i, el) => {
            const name = $(el).find('.zt-cast-name, .name a').text().trim();
            const role = $(el).find('.zt-cast-role, .caracter').text().trim();
            const photo = $(el).find('.zt-cast-image img, img').attr('src') || $(el).find('img').attr('data-src') || "";
            if (name) cast.push({ name, role, photo });
        });
        const downloadOptions = [];
        if (videoUrl) {
            const isDirect = videoUrl.includes('.mp4') || videoUrl.includes('csplayer2.space');
            downloadOptions.push({ quality: isDirect ? "Direct MP4" : "Direct/Stream", size: "High Speed", url: videoUrl });
        }

        $('.zt-links-list .zt-link, .links-table tbody tr').each((i, el) => {
            const row = $(el);
            const quality = row.find('.zt-link-quality, .quality').text().trim() || "N/A";
            const size = row.find('.zt-link-size, td:nth-child(3)').text().trim() || "N/A";
            const link = row.find('a').attr('href');
            if (link && link !== "#") downloadOptions.push({ quality, size, url: link });
        });
        return {
            status: true,
            title, description, image, videoUrl, year, imdb, gallery, cast,
            downloadOptions: downloadOptions.length > 0 ? [{ server: "direct", serverTitle: "Download Links", links: downloadOptions }] : [],
            sourceUrl: url
        };
    } catch (e) { return { status: false, error: e.message }; }
}

/**
 * Scrapes movie details and video links from Sinhalasub.lk
 */
async function fetchSinhalasubDetails(url) {
    try {
        const { data } = await axios.get(url, { headers: { ...COMMON_HEADERS, Referer: "https://sinhalasub.lk/" }, timeout: 15000 });
        const $ = cheerio.load(data);
        const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
        const description = $('meta[property="og:description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';
        let videoUrl = null;
        const iframeSrc = $('.metaframe, iframe.metaframe').attr('src');
        if (iframeSrc) {
            videoUrl = iframeSrc;
            try {
                const parsedUrl = new URL(iframeSrc);
                const source = parsedUrl.searchParams.get('source');
                if (source) videoUrl = decodeURIComponent(source);
            } catch (e) { }
        }
        if (!videoUrl) videoUrl = $('#splash-play').attr('href');
        const imdb = $('.zt_rating_vgs').first().text().trim() || $('.data-imdb').first().text().trim() || 'N/A';
        const year = $('.year').first().text().trim() || 'N/A';
        const gallery = [];
        $('.gallery img, #gallery img, .content-gall img').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
            if (src && !gallery.includes(src)) gallery.push(src);
        });
        const cast = [];
        $('.zt-cast-card, .person, .cast-item').each((i, el) => {
            const name = $(el).find('.zt-cast-name, .name a, .name').text().trim();
            const role = $(el).find('.zt-cast-role, .caracter, .role').text().trim();
            const photo = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || "";
            if (name) cast.push({ name, role, photo });
        });
        const downloadOptions = [];
        $('.zt-links-list .zt-link, .links-table tbody tr, .download-link').each((i, el) => {
            const row = $(el);
            const quality = row.find('.zt-link-quality, .quality, .item-quality').text().trim() || "N/A";
            const size = row.find('.zt-link-size, td:nth-child(3), .size').text().trim() || "N/A";
            const link = row.find('a').attr('href');
            if (link && link !== "#" && link.startsWith('http')) downloadOptions.push({ quality, size, url: link });
        });
        return {
            status: true,
            title, description, image, videoUrl, year, imdb, gallery, cast,
            downloadOptions: downloadOptions.length > 0 ? [{ server: "direct", serverTitle: "Download Links", links: downloadOptions }] : [],
            sourceUrl: url
        };
    } catch (e) { return { status: false, error: e.message }; }
}

const PROVIDERS = {
    "sinhalasub": { name: "Sinhalasub", domain: "sinhalasub.lk", searchUrl: "https://sinhalasub.lk/?s=", type: "dooplay" },
    "baiscope": { name: "Baiscope", domain: "baiscope.lk", searchUrl: "https://www.baiscope.lk/?s=", type: "custom_baiscope" },
    "cinesubz": { name: "CineSubz", domain: "cinesubz.lk", searchUrl: "https://cinesubz.lk/?s=", type: "dooplay" },
    "pirate": { name: "Pirate", domain: "piratelk.com", searchUrl: "https://piratelk.com/?s=", type: "wordpress_tie" },
    "zoom": { name: "Zoom", domain: "zoom.lk", searchUrl: "https://zoom.lk/?s=", type: "wordpress_tagdiv" },
    "srihub": { name: "Srihub", domain: "srihub.store", searchUrl: "https://srihub.store/?s=", type: "dooplay" },
    "moviesub": { name: "Moviesub", domain: "moviesub.is", searchUrl: "https://moviesub.is/?s=", type: "dooplay" },
    "dinka": { name: "Dinka", domain: "dinkamovieslk.app", searchUrl: "https://www.dinkamovieslk.app/search?q=", type: "blogger" },
    "subslk": { name: "Subslk", domain: "subzlk.com", searchUrl: "https://subzlk.com/?s=", type: "dooplay" },
    "sinhalasubhub": { name: "Sinhalasubhub", domain: "sinhalasubhub.lk", searchUrl: "https://sinhalasubhub.lk/?s=", type: "dooplay" }
};

const ALIASES = {
    "sinhalasubz": "sinhalasub",
    "cinesub": "cinesubz",
    "dinkamovies": "dinka",
    "subzlk": "subslk",
    "subhub": "sinhalasubhub"
};

// Main Routes
router.get("/search", async (req, res) => {
    let { q, provider } = req.query;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    provider = provider?.toLowerCase();
    const actualKey = ALIASES[provider] || provider;
    const selectedKey = PROVIDERS[actualKey] ? actualKey : "sinhalasub";
    const sel = PROVIDERS[selectedKey];
    try {
        const { data } = await axios.get(`${sel.searchUrl}${encodeURIComponent(q)}`, { headers: COMMON_HEADERS, timeout: 15000 });
        const $ = cheerio.load(data), results = [];
        if (sel.type === "dooplay") {
            $('.result-item, .display-item').each((i, el) => {
                const a = $(el).find('.title a, .item-box a').first(), title = a.attr('title') || a.text().trim(), link = a.attr('href');
                const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src'), quality = $(el).find('.quality').text().trim() || "N/A", year = $(el).find('.qty, .year').text().trim() || "N/A";
                if (title && link) results.push({ title, link, image: img || "", quality, year, provider: selectedKey });
            });
        } else if (sel.type === "custom_baiscope") {
            $('.eael-grid-post').each((i, el) => {
                const a = $(el).find('.eael-entry-title a'), title = a.text().trim(), link = a.attr('href'), img = $(el).find('.eael-entry-thumbnail img').attr('src');
                if (title && link) results.push({ title, link, image: img || "", quality: "N/A", year: "N/A", provider: selectedKey });
            });
        } else if (sel.type === "wordpress_tie") {
            $('.item-list').each((i, el) => {
                const a = $(el).find('.post-box-title a'), title = a.text().trim(), link = a.attr('href'), img = $(el).find('.post-thumbnail img').attr('src') || $(el).find('img').attr('src');
                if (title && link) results.push({ title, link, image: img || "", quality: "N/A", year: "N/A", provider: selectedKey });
            });
        } else if (sel.type === "wordpress_tagdiv") {
            $('.td-module-container').each((i, el) => {
                const a = $(el).find('.td-module-title a'), title = a.text().trim(), link = a.attr('href'), img = $(el).find('.td-thumb-css').attr('src') || $(el).find('img').attr('src');
                if (title && link) results.push({ title, link, image: img || "", quality: "N/A", year: "N/A", provider: selectedKey });
            });
        } else if (sel.type === "blogger") {
            $('article.post').each((i, el) => {
                const a = $(el).find('.post-title a'), title = a.text().trim(), link = a.attr('href'), img = $(el).find('.item-thumbnail img').attr('src');
                if (title && link) results.push({ title, link, image: img || "", quality: "N/A", year: "N/A", provider: selectedKey });
            });
        }
        return res.json({ status: true, creator: baseInfo.creator, results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/details", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        let provider = "unknown";
        for (const [key, p] of Object.entries(PROVIDERS)) { if (url.includes(p.domain)) { provider = key; break; } }
        if (provider === "cinesubz") {
            const czRes = await fetchCinesubzDetails(url);
            return res.json({ creator: baseInfo.creator, status: 200, success: true, result: czRes });
        } else if (provider === "sinhalasub") {
            const ssRes = await fetchSinhalasubDetails(url);
            return res.json({ creator: baseInfo.creator, status: 200, success: true, result: ssRes });
        }
        // Generic fallback
        const { data } = await axios.get(url, { headers: COMMON_HEADERS, timeout: 15000 });
        const $ = cheerio.load(data), result = { title: $('h1').first().text().trim(), description: $('.description, .entry-content').first().text().trim(), sourceUrl: url };
        return res.json({ creator: baseInfo.creator, status: 200, success: true, result });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

// Sinhalasub Specific (Legacy/Direct)
router.get("/sinhalasub-search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://sinhalasub.lk/?s=${encodeURIComponent(q)}`, { headers: COMMON_HEADERS });
        const $ = cheerio.load(data), results = [];
        $('.result-item, .display-item, article').each((i, el) => {
            const a = $(el).find('a').first(), title = a.attr('title') || a.text().trim(), link = a.attr('href');
            let image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
            if (title && link) results.push({ title, link, image: image || "", provider: "sinhalasub" });
        });
        return res.json({ status: true, creator: "Chama Ofc", results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/sinhalasub-info", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data } = await axios.get(url, { headers: COMMON_HEADERS });
        const $ = cheerio.load(data), title = $('h1').first().text().trim(), links = {};
        $('.zt-links-list .zt-link, .download-link-list li').each((i, el) => {
            const btn = $(el).find('a'), quality = $(el).find('.quality').text().trim(), size = $(el).find('.size').text().trim(), href = btn.attr('href');
            if (href && href.startsWith('http')) {
                if (!links["Download"]) links["Download"] = [];
                links["Download"].push({ quality: quality || "N/A", size: size || "N/A", link: href });
            }
        });
        return res.json({ status: true, creator: "Chama Ofc", title, links });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/sinhalasub-download", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data, request } = await axios.get(url, { headers: { ...COMMON_HEADERS, Referer: 'https://sinhalasub.lk/' }, maxRedirects: 10, timeout: 15000 });
        let finalUrl = (request && request.res && request.res.responseUrl) ? request.res.responseUrl : url;
        const $ = cheerio.load(data);
        let foundLink = $('#awzxwoll').attr('href') || $('#splash-play').attr('href') || $('a.btn-download').attr('href');

        let target = foundLink || finalUrl;
        if (target) return res.redirect(target);
        return res.status(404).json({ status: false, error: "Link not found" });
    } catch (e) { return res.status(500).json({ success: false, error: e.message }); }
});

// V2 Scrapers (Sonic / Progressive Resolution)
function normalizeName(name, url) {
    const low = (name || "").toLowerCase() + " " + (url || "").toLowerCase();
    if (low.includes('google') || low.includes('gdrive')) return "gdrive";
    if (low.includes('telegram') || low.includes('t.me')) return "telegram";
    if (low.includes('pixeldrain') || low.includes('pix')) return "pix";
    if (low.includes('mega.nz')) return "mega";
    if (low.includes('mediafire')) return "mediafire";
    return name || "unknown";
}

async function resolveCineSubzLink(url, referer = 'https://cinesubz.lk/') {
    try {
        if (!url || !url.startsWith('http')) return [];
        if (url.includes('sonic-cloud')) {
            const result = await SonicDirect.fetchDownloadData(url);
            if (result.status) return result.data.download;
        }
        const { data, request } = await axios.get(url, { headers: { ...COMMON_HEADERS, 'Referer': referer }, timeout: 10000 });
        const finalUrl = (request && request.res && request.res.responseUrl) ? request.res.responseUrl : url;
        if (finalUrl.includes('drive.google') || finalUrl.includes('pixeldrain')) return [{ name: normalizeName('Direct', finalUrl), url: finalUrl }];
        const $ = cheerio.load(data), results = [];
        $('a.btn-download, .zt-link a').each((i, el) => {
            const link = $(el).attr('href');
            if (link && link.startsWith('http')) results.push({ name: normalizeName($(el).text(), link), url: link });
        });
        return results.length > 0 ? results : [{ name: normalizeName('Direct', finalUrl), url: finalUrl }];
    } catch (e) { return []; }
}

async function handleMovieDetails(url) {
    const { data } = await axios.get(url, { headers: COMMON_HEADERS, timeout: 20000 });
    const $ = cheerio.load(data), title = $('h1').first().text().trim(), download = [];

    const iframeSrc = $('.metaframe, iframe.metaframe').attr('src');
    if (iframeSrc) {
        try {
            const parsedUrl = new URL(iframeSrc);
            const source = parsedUrl.searchParams.get('source');
            if (source) {
                const decoded = decodeURIComponent(source);
                if (decoded.includes('.mp4') || decoded.includes('csplayer2.space'))
                    download.push({ name: 'Direct High-Speed (Player)', url: decoded });
                else
                    download.push({ name: 'Direct MP4 (Player)', url: decoded });
            }
        } catch (e) { }
    }

    const metaVideo = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:url"]').attr('content') || $('meta[name="twitter:player:stream"]').attr('content');
    if (metaVideo) download.push({ name: 'Direct Stream (Meta)', url: metaVideo });

    const splashLink = $('#splash-play').attr('href');
    if (splashLink) download.push({ name: 'Player/Stream', url: splashLink });

    const linkPromises = [];
    $('.zt-links-list .zt-link, .download-link').each((i, el) => {
        const l = $(el).find('a').attr('href');
        if (l && l.startsWith('http')) linkPromises.push(resolveCineSubzLink(l, url));
    });
    const resArr = await Promise.all(linkPromises);
    resArr.flat().forEach(item => { if (item.url) download.push(item); });

    return { title, image: $('meta[property="og:image"]').attr('content'), description: $('.entry-content').first().text().trim(), download };
}

router.get("/v2/details", async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) return res.status(400).json({ status: false, error: "Missing url" });
        const data = await handleMovieDetails(url);
        return res.json({ status: true, creator: baseInfo.creator, data });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/cinesubz-download", async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) return res.status(400).json({ status: false, error: "Missing url" });
        const details = await handleMovieDetails(url);

        const directHighSpeed = details.download.find(d => d.url && (d.url.includes('.mp4') || d.url.includes('csplayer2.space')));
        const sonic = details.download.find(d => d.url && d.url.includes('sonic-cloud'));
        const pixeldrain = details.download.find(d => d.url && d.url.includes('pixeldrain'));
        const gdrive = details.download.find(d => d.url && d.url.includes('drive.google'));

        const target = directHighSpeed || sonic || pixeldrain || gdrive || details.download[0];

        if (target && target.url) return res.redirect(target.url);
        return res.status(404).json({ status: false, error: "No suitable download links found for redirect" });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * Universal Download Resolver
 * Returns direct download link for a movie page
 */
router.get("/download", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    try {
        let provider = "unknown";
        for (const [key, p] of Object.entries(PROVIDERS)) {
            if (url.includes(p.domain)) {
                provider = key;
                break;
            }
        }

        let title = "Unknown Movie";
        let dl_link = null;

        if (provider === "cinesubz") {
            const details = await handleMovieDetails(url);
            title = details.title;
            const target = details.download.find(d => d.url && (d.url.includes('720p.mp4') || d.url.includes('1080p.mp4'))) ||
                details.download.find(d => d.url && d.url.includes('.mp4')) ||
                details.download.find(d => d.url && d.url.includes('csplayer2.space')) ||
                details.download[0];

            if (target) dl_link = target.url;
        } else if (provider === "sinhalasub" || provider === "sinhalasubhub") {
            const { data } = await axios.get(url, { headers: COMMON_HEADERS });
            const $ = cheerio.load(data);
            title = $('h1').first().text().trim();

            let playerSrc = $('.metaframe, iframe.metaframe').attr('src');
            if (playerSrc) {
                try {
                    const ps = new URL(playerSrc).searchParams.get('source');
                    if (ps) dl_link = decodeURIComponent(ps);
                    else if (playerSrc.includes('jwplayer')) dl_link = playerSrc;
                } catch (e) { }
            }

            if (!dl_link) {
                // Secondary check for direct buttons
                $('a').each((i, el) => {
                    const href = $(el).attr('href') || "";
                    if (href.includes('.mp4') || href.includes('pixeldrain.com/u/') || href.includes('drive.google.com/file')) {
                        dl_link = href;
                        return false;
                    }
                });
            }
        } else {
            const { data } = await axios.get(url, { headers: COMMON_HEADERS });
            const $ = cheerio.load(data);
            title = $('h1').first().text().trim();
            dl_link = $('a[href*=".mp4"], a[href*="pixeldrain"], a[href*="drive.google"]').first().attr('href');
        }

        if (dl_link) {
            if (dl_link.includes('pixeldrain.com/u/')) {
                dl_link = dl_link.replace('/u/', '/api/file/') + "?download";
            }
            return res.json({
                status: true,
                creator: baseInfo.creator,
                title,
                dl_link,
                info: "Add .mp4 extension when saving if file name is missing it."
            });
        }

        return res.status(404).json({ status: false, error: "Direct download link not found" });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

module.exports = router;
