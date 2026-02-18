const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

/**
 * Google Search Scraper (Classic Web View)
 */
async function googleSearch(query) {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&udm=14&gl=us&hl=en`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            },
            timeout: 10000
        });
        const $ = cheerio.load(data), results = [];
        $('.g, .MjjYud').each((i, el) => {
            const title = $(el).find('h3').first().text().trim();
            const link = $(el).find('a').first().attr('href');
            const snippet = $(el).find('div[style*="-webkit-line-clamp"]').text().trim() || $(el).find('.VwiC3b').text().trim();
            if (title && link && link.startsWith('http')) results.push({ title, link, snippet: snippet || "No description available." });
        });
        if (results.length === 0) {
            $('a > h3').each((i, el) => {
                const title = $(el).text(), link = $(el).parent().attr('href');
                if (title && link && link.startsWith('http')) results.push({ title, link, snippet: "Click to view details." });
            });
        }
        return { status: true, total: results.length, result: results.slice(0, 15) };
    } catch (e) { return { status: false, error: e.message }; }
}


const baseInfo = {
    status: true,
    creator: "Chama Ofc",
    project: "Chama Ofc",
    version: "1.0.0"
};

/**
 * Wallpaper 1 (4kwallpapers.com)
 * GET /wallpaper?q=TERM
 */
router.get("/wallpaper", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://4kwallpapers.com/search/${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const result = [];
        $("img[src*='/thumbs/']").each((i, el) => {
            const alt = $(el).attr("alt") || $(el).attr("title") || "";
            const src = $(el).attr("src");
            result.push({
                image: src.startsWith("http") ? src : `https://4kwallpapers.com${src}`,
                title: alt.split(",").slice(0, 3).join(",").trim(),
                keywords: alt
            });
        });
        return res.json({ ...baseInfo, result });
    } catch (e) {
        console.error(`Error in ${req.baseUrl}${req.path}:`, e.message);
        return res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * Wallpaper 2 (wallpaperscraft.com)
 * GET /wallpaper2?q=TERM
 */
router.get("/wallpaper2", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://wallpaperscraft.com/search/?query=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const result = [];
        $(".wallpapers__image").each((i, el) => {
            const src = $(el).attr("src");
            if (src) result.push(src);
        });
        return res.json({ ...baseInfo, result });
    } catch (e) {
        console.error(`Error in ${req.baseUrl}${req.path}:`, e.message);
        return res.status(500).json({ status: false, error: e.message });
    }
});


/**
 * Wallpaper 3 (MyLiveWallpapers)
 * GET /wallpaper3?q=TERM
 */
router.get("/wallpaper3", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://mylivewallpapers.com/?s=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const links = [];
        $('article a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && !links.includes(href)) links.push(href);
        });

        const result = [];
        for (const link of links.slice(0, 5)) {
            try {
                const { data: pData } = await axios.get(link, {
                    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
                });
                const $p = cheerio.load(pData);
                const title = $p('h1').text().trim();
                const live = $p('a.get-wallpaper').attr('href') || $p('source[type="video/mp4"]').attr('src');
                const thumb = $p('video').attr('poster') || $p('.entry-content img').first().attr('src');

                if (live) {
                    result.push({
                        title,
                        hd_wallpaper: thumb,
                        live_wallpaper: live,
                        size: "HD"
                    });
                }
            } catch (e) { }
        }
        return res.json({ ...baseInfo, result });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * Paper Hub (paperhub.lk)
 * GET /paperhub?q=TERM
 */
router.get("/paperhub", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const searchUrl = `https://paperhub.lk/?s=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const results = [];
        const articles = $("article, .post").slice(0, 10).get();

        for (const el of articles) {
            const title = $(el).find("h2 a, h1 a, .entry-title a").first().text().trim();
            const link = $(el).find("a").first().attr("href");
            const image = $(el).find("img").first().attr("src");

            if (title && link) {
                // Return search results directly. Detail fetching can be done if needed, 
                // but usually search is enough to show list.
                results.push({ title, link, image });
            }
        }
        return res.json({
            status: true,
            creator: "Chama Ofc",
            results
        });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});

/**
 * Image Search (Unsplash)
 * GET /img?q=TERM
 */
router.get("/img", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://unsplash.com/s/photos/${encodeURIComponent(q)}`, { timeout: 10000 });
        const $ = cheerio.load(data);
        const results = [];
        // Unsplash structure changes often, look for images in figure or specific containers
        $("figure img, img[data-testid='photo-image']").each((i, el) => {
            const src = $(el).attr("src");
            const alt = $(el).attr("alt");
            if (src && src.startsWith('http') && !results.includes(src)) {
                results.push(src);
            }
        });
        return res.json({ status: true, creator: "Chama Ofc", result: results.slice(0, 20) });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * Pixabay Search (Fallback to Pexels/Bing if 403)
 * GET /pixabay?q=TERM
 */
router.get("/pixabay", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        // Trying Pexels as it is very similar and easier to scrape
        const { data } = await axios.get(`https://www.pexels.com/search/${encodeURIComponent(q)}/`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            }
        });
        const $ = cheerio.load(data);
        const results = [];

        $("article, .MediaCard_card__G_h_P").each((i, el) => {
            const img = $(el).find("img");
            const src = img.attr("src") || img.attr("data-src");
            const title = img.attr("alt") || "Pexels Image";
            if (src) {
                results.push({ image: src, title });
            }
        });

        // Fallback: If Pexels fails, try Unsplash again or just return error
        if (results.length === 0) {
            // Try a generic search on freeimages or similar
        }

        return res.json({ status: true, creator: "Chama Ofc", source: "Pexels (Pixabay Mirror)", result: results.slice(0, 30) });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});


/**
 * Google Search (Pro Web)
 * GET /google?q=TERM
 */
router.get("/google", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });

    try {
        // 1. Try our direct Google Scraper
        const results = await googleSearch(q);

        if (results.status && results.result.length > 0) {
            return res.json({
                status: true,
                creator: baseInfo.creator,
                method: "Google Professional Scraper",
                ...results
            });
        }

        // 2. Fallback to DuckDuckGo Lite if primary fails
        console.log(`[Search] Google direct failed. Falling back to DDG Lite...`);
        const { data } = await axios.get(`https://duckduckgo.com/lite/?q=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 8000
        });
        const $ = cheerio.load(data);
        const fb_results = [];

        $('.result-link').each((i, el) => {
            const title = $(el).text().trim();
            const link = $(el).attr('href');
            const description = $(el).closest('tr').next().find('.result-snippet').text().trim();

            if (title && link) {
                fb_results.push({
                    title,
                    link: link.startsWith('//') ? `https:${link}` : link,
                    snippet: description
                });
            }
        });

        return res.json({
            status: true,
            creator: baseInfo.creator,
            method: "Search Fallback (DDG)",
            total: fb_results.length,
            result: fb_results.slice(0, 15)
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: "Search signal lost.", details: e.message });
    }
});

/**
 * Google Image Search
 * GET /google/image?q=TERM
 */
router.get("/google/image", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        // Scraper logic for Google Images can be complex due to dynamic loading and obscure class names.
        // We will try extracting from the script tags where Google embeds JSON data.
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=isch&gl=us&hl=en`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const results = [];

        // Method 1: regex for standard image data blocks
        // This pattern looks for [url, height, width] arrays in the script content
        const pattern = /\["(http[^"]+?)",(\d+),(\d+)\]/g;

        // We iterate over all script tags content
        $('script').each((i, el) => {
            const content = $(el).html();
            if (!content) return;

            let match;
            while ((match = pattern.exec(content)) !== null) {
                const url = match[1];
                // Filter out small thumbnails or google's own assets if possible, 
                // but usually these are the result images.
                // We exclude some common garbage.
                if (!url.includes('gstatic') && !url.includes('google.com')) {
                    // We try to decode unicode escapes
                    const cleanUrl = JSON.parse(`"${url}"`);
                    // Push object structure instead of string
                    results.push({
                        title: `Google Image ${results.length + 1}`,
                        image: cleanUrl
                    });
                }
            }
        });

        // Fallback or additional method if pattern fails (Google updates frequently)
        // Try scraping 'img' tags directly (usually low res thumbnails but better than nothing)
        if (results.length === 0) {
            $('img').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && src.startsWith('http') && !src.includes('favicon')) {
                    results.push({
                        title: `Google Image ${results.length + 1}`,
                        image: src
                    });
                }
            });
        }

        return res.json({
            status: true,
            creator: baseInfo.creator,
            total: results.length,
            result: results.slice(0, 30) // Return top 30
        });

    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * APK Search Fallback helper
 */
async function getAptoideFallback(q) {
    try {
        const url = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(q)}&limit=20`;
        const { data } = await axios.get(url, { timeout: 10000 });
        return (data.datalist?.list || []).map(app => ({
            title: app.name + " (Mirror)",
            image: app.icon,
            size: (app.file?.filesize / 1024 / 1024).toFixed(2) + " MB",
            version: app.file?.vername,
            link: `https://${app.package}.en.aptoide.com/app`
        }));
    } catch (e) {
        return [];
    }
}

/**
 * APK Search (Aptoide - Very Stable)
 */
router.get("/apk", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const result = await getAptoideFallback(q);
        return res.json({ status: true, creator: baseInfo.creator, result });
    } catch (e) {
        return res.status(500).json({ status: false, error: "Aptoide API Error" });
    }
});

/**
 * APK Search (ModDroid)
 */
router.get("/an1/search", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://moddroid.co/?s=${encodeURIComponent(q)}`, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });
        const $ = cheerio.load(data), result = [];
        $('.post-item').each((i, el) => {
            const title = $(el).find('.entry-title a').text().trim();
            const link = $(el).find('.entry-title a').attr('href');
            const image = $(el).find('img').attr('src');
            if (title) result.push({ title, link, image });
        });

        if (result.length > 0) return res.json({ status: true, creator: baseInfo.creator, result });
        throw new Error("Empty results from source");
    } catch (e) {
        const fallback = await getAptoideFallback(q);
        return res.json({ status: true, creator: baseInfo.creator, source: "Aptoide (Fallback)", result: fallback });
    }
});

/**
 * APK Search (LiteAPKs)
 */
router.get("/happymod/search", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://liteapks.com/?s=${encodeURIComponent(q)}`, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const $ = cheerio.load(data), result = [];
        $('article').each((i, el) => {
            const title = $(el).find('.entry-title a').text().trim() || $(el).find('h2').text().trim();
            const link = $(el).find('a').attr('href');
            const image = $(el).find('img').attr('src');
            if (title) result.push({ title, link, image });
        });

        if (result.length > 0) return res.json({ status: true, creator: baseInfo.creator, result });
        throw new Error("Empty results from source");
    } catch (e) {
        const fallback = await getAptoideFallback(q);
        return res.json({ status: true, creator: baseInfo.creator, source: "Aptoide (Fallback)", result: fallback });
    }
});

/**
 * APK Search (APKHome)
 */
router.get("/apkpure/search", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://apkhome.io/?s=${encodeURIComponent(q)}`, {
            timeout: 10000,
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(data), result = [];
        $('.post').each((i, el) => {
            const title = $(el).find('h2 a').text().trim();
            const link = $(el).find('h2 a').attr('href');
            const image = $(el).find('img').attr('src');
            if (title) result.push({ title, link, image });
        });

        if (result.length > 0) return res.json({ status: true, creator: baseInfo.creator, result });
        throw new Error("Empty results from source");
    } catch (e) {
        const fallback = await getAptoideFallback(q);
        return res.json({ status: true, creator: baseInfo.creator, source: "Aptoide (Fallback)", result: fallback });
    }
});

/**
 * APK Search (APK Mirror via Google)
 */
router.get("/uptodown/search", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const searchRes = await googleSearch(`${q} site:apkmirror.com`);
        const result = (searchRes.result || []).map(r => ({
            title: r.title.replace(' - APKMirror', '').trim(),
            link: r.link,
            desc: r.snippet
        }));

        if (result && result.length > 0) return res.json({ status: true, creator: baseInfo.creator, result });
        throw new Error("Empty results from source");
    } catch (e) {
        const fallback = await getAptoideFallback(q);
        return res.json({ status: true, creator: baseInfo.creator, source: "Aptoide (Fallback)", result: fallback });
    }
});

/**
 * Lyrics Search (Combined)
 * GET /lyrics?q=TERM
 */
router.get("/lyrics", async (req, res) => {
    const q = (req.query.q || req.query.title || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing title" });
    try {
        const { data } = await axios.get(`https://sinhalasonglyrics.com/?s=${encodeURIComponent(q)}`, { timeout: 10000 });
        const $ = cheerio.load(data), results = [];
        $('.post-item').each((i, el) => {
            const a = $(el).find('a').first(), title = a.text().trim(), link = a.attr('href');
            if (title && link) results.push({ title, link });
        });
        return res.json({ status: true, creator: baseInfo.creator, result: results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * Past Papers Search
 * GET /pastpapers?q=TERM
 */
router.get("/pastpapers", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://www.pastpapers.wiki/?s=${encodeURIComponent(q)}`, { timeout: 10000 });
        const $ = cheerio.load(data), results = [];
        $('.post-item, article').each((i, el) => {
            const a = $(el).find('a').first(), title = a.text().trim(), link = a.attr('href');
            if (title && link) results.push({ title, link });
        });
        return res.json({ status: true, creator: baseInfo.creator, result: results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * Pinterest Search
 * GET /pinterest?q=TERM
 */
router.get("/pinterest", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(q)}&data={"options":{"isPrefetch":false,"query":"${q}","scope":"pins","no_fetch_context_on_resource":false},"context":{}}`;
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "X-Requested-With": "XMLHttpRequest",
            }
        });

        if (data && data.resource_response && data.resource_response.data) {
            const pins = data.resource_response.data.results || [];
            const results = pins.map(p => ({
                title: p.title || p.description || 'No Title',
                image: p.images?.orig?.url || p.images?.['736x']?.url || p.images?.['474x']?.url,
                link: 'https://www.pinterest.com/pin/' + p.id
            })).filter(p => p.image);

            return res.json({
                status: true,
                creator: baseInfo.creator,
                total: results.length,
                result: results
            });
        }

        // Fallback to static scraping if resource API fails or returns empty
        const { data: htmlData } = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(htmlData);
        const results = [];
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.includes('736x')) {
                results.push({
                    title: $(el).attr('alt') || 'Pinterest Image',
                    image: src,
                    link: src
                });
            }
        });

        return res.json({
            status: true,
            creator: baseInfo.creator,
            total: results.length,
            result: results
        });

    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * TikTok Search
 */
router.get("/tiktok", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(q)}`);
        return res.json({
            creator: "Chama Ofc",
            status: true,
            result: data.data.videos || []
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: "TikTok search failed" });
    }
});

router.get("/youtube", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });

    // Updated and more reliable Invidious/Piped instances
    const instances = [
        "https://invidious.privacydev.net",
        "https://yewtu.be",
        "https://iv.melmac.space",
        "https://inv.nadeko.net",
        "https://inv.tux.pizza"
    ];

    for (const instance of instances) {
        try {
            // Try Invidious API v1
            const { data } = await axios.get(`${instance}/api/v1/search?q=${encodeURIComponent(q)}&filter=videos`, {
                timeout: 8000,
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            const items = Array.isArray(data) ? data : (data.items || []);
            if (!items.length) continue;

            const results = items.map(v => {
                const videoId = v.videoId || (v.url || "").split("v=")[1] || (v.url || "").split("/").pop();
                return {
                    type: "video",
                    videoId: videoId,
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    title: v.title,
                    description: v.shortDescription || v.description || "",
                    image: v.thumbnail || (v.thumbnails && v.thumbnails[0]?.url) || (v.videoThumbnails && v.videoThumbnails[0]?.url) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    thumbnail: v.thumbnail || (v.thumbnails && v.thumbnails[0]?.url) || (v.videoThumbnails && v.videoThumbnails[0]?.url) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    seconds: v.lengthSeconds || v.duration || 0,
                    timestamp: v.lengthText || v.durationString || "0:00",
                    ago: v.publishedText || v.uploadedDate || "Unknown",
                    views: v.viewCount || v.views || 0,
                    author: {
                        name: v.author || v.uploaderName || "Unknown",
                        url: v.authorUrl ? (v.authorUrl.startsWith('http') ? v.authorUrl : `https://www.youtube.com${v.authorUrl}`) : `https://www.youtube.com/@${v.author}`
                    }
                };
            });

            if (results.length > 0) {
                return res.json({
                    creator: "Chama Ofc",
                    status: true,
                    result: results
                });
            }
        } catch (e) {
            console.error(`YouTube Search failed for ${instance}:`, e.message);
            continue;
        }
    }
    return res.status(500).json({ status: false, error: "YouTube search failed on all available nodes. Please try again later." });
});

/**
 * NPM Search
 */
router.get("/npm", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=20`);
        const results = data.objects.map(o => ({
            title: `${o.package.name}@^${o.package.version}`,
            author: o.package.publisher.username,
            update: o.package.date,
            links: {
                homepage: o.package.links.homepage,
                repository: o.package.links.repository,
                bugs: o.package.links.bugs,
                npm: o.package.links.npm
            }
        }));

        return res.json({
            creator: "Chama Ofc",
            status: true,
            result: results
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: "NPM search failed" });
    }
});

module.exports = router;
