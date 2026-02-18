
const express = require("express");
const router = express.Router();
const { SOURCES, fetchNews } = require("./newsScraper");

const baseInfo = {
    status: true,
    creator: "Chama Ofc",
    project: "Chama Ofc",
    version: "2.0.0"
};

/**
 * Get all available news sources
 */
router.get("/sources", (req, res) => {
    const list = Object.keys(SOURCES)
        .filter(key => typeof SOURCES[key] === 'object') // Filter out aliases
        .map(key => ({
            id: key,
            name: SOURCES[key].name,
            type: SOURCES[key].type,
            url: SOURCES[key].url
        }));
    res.json({ ...baseInfo, count: list.length, sources: list });
});

/**
 * Combined news feed from top sources
 */
router.get("/all", async (req, res) => {
    // Get all valid source keys dynamically (excluding aliases)
    const mainSources = Object.keys(SOURCES).filter(key => typeof SOURCES[key] === 'object');
    const results = [];

    const promises = mainSources.map(async (key) => {
        try {
            const items = await fetchNews(key);
            return items.slice(0, 4); // Take 4 from each to keep response size reasonable
        } catch (e) {
            console.error(`[News All] Error fetching ${key}:`, e.message);
            return [];
        }
    });

    const resolveResults = await Promise.all(promises);
    resolveResults.forEach(items => results.push(...items));

    // Shuffle results slightly for variety
    results.sort(() => Math.random() - 0.5);

    res.json({
        ...baseInfo,
        count: results.length,
        result: results
    });
});

/**
 * Fetch news from a specific source
 */
router.get("/:source", async (req, res) => {
    const sourceKey = req.params.source.toLowerCase();

    if (!SOURCES[sourceKey]) {
        return res.status(404).json({
            status: false,
            error: "Invalid news source. Access /api/news/sources for a valid list.",
            available_sources: Object.keys(SOURCES).slice(0, 10)
        });
    }

    try {
        const articles = await fetchNews(sourceKey);
        res.json({
            ...baseInfo,
            source: SOURCES[sourceKey].name,
            result: articles
        });
    } catch (e) {
        res.status(500).json({
            status: false,
            error: e.message,
            result: []
        });
    }
});

module.exports = router;
