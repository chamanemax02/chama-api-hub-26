const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

async function searchAnime(query) {
    try {
        const url = `https://animexin.dev/?s=${query}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data), results = [];
        $('article.bs').each((i, el) => {
            results.push({
                title: $(el).find('.tt h2').text().trim(),
                link: $(el).find('a').attr('href'),
                image: $(el).find('img').attr('src')
            });
        });
        return { status: true, result: results };
    } catch (err) { return { status: false, msg: err.message }; }
}

async function getEpisodes(animeUrl) {
    try {
        const { data } = await axios.get(animeUrl);
        const $ = cheerio.load(data), episodes = [];
        $('.eplister ul li').each((i, el) => {
            episodes.push({
                episode: $(el).find('.epl-num').text().trim(),
                link: $(el).find('a').attr('href')
            });
        });
        return { status: true, result: episodes };
    } catch (err) { return { status: false, msg: err.message }; }
}

async function getDownloadLinks(episodeUrl) {
    try {
        const { data } = await axios.get(episodeUrl);
        const $ = cheerio.load(data), downloads = [];
        $('.soraddlx').each((i, el) => {
            const type = $(el).find('.sorattlx h3').text().trim(), links = [];
            $(el).find('.soraurlx a').each((j, a) => {
                links.push({ server: $(a).text().trim(), url: $(a).attr('href') });
            });
            if (links.length > 0) downloads.push({ type, links });
        });
        return { status: true, result: downloads };
    } catch (err) { return { status: false, msg: err.message }; }
}


const baseInfo = {
    status: true,
    creator: "Chama Ofc",
    project: "Chama Ofc"
};

/**
 * Animexin Search
 * GET /search?q=QUERY
 */
router.get("/search", async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const result = await searchAnime(q);
        res.json({ ...baseInfo, ...result });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * Animexin Episodes
 * GET /episodes?url=ANIME_URL
 */
router.get("/episodes", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await getEpisodes(url);
        res.json({ ...baseInfo, ...result });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * Animexin Download Links
 * GET /download?url=EPISODE_URL
 */
router.get("/download", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await getDownloadLinks(url);
        res.json({ ...baseInfo, ...result });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

module.exports = router;
