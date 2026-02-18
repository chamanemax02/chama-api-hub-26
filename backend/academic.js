
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
};

/**
 * O-Level API Scraper
 */
router.get("/olevel/pastpapers", async (req, res) => {
    try {
        const url = 'https://www.olevelapi.com/category/sinhala-past-papers/';
        const { data } = await axios.get(url, { headers: COMMON_HEADERS });
        const $ = cheerio.load(data);
        const results = [];

        $('.post-item, article').each((i, el) => {
            if (results.length >= 20) return;
            const title = $(el).find('.post-title, h2, h3').text().trim();
            const link = $(el).find('a').attr('href');
            const image = $(el).find('img').attr('src');
            const desc = $(el).find('.post-excerpt, p').text().trim().substring(0, 150) + "...";

            if (title && link) {
                results.push({ title, url: link, image, desc });
            }
        });

        res.json({ status: true, creator: "Chama Ofc", result: results });
    } catch (e) {
        res.json({ status: false, error: e.message });
    }
});

/**
 * MySchool MCQ Challenge
 */
router.get("/myschool/mcq", async (req, res) => {
    try {
        const url = 'https://myschool.lk/ol-mcq-challenge';
        const { data } = await axios.get(url, { headers: COMMON_HEADERS });
        const $ = cheerio.load(data);
        const results = [];

        $('.quiz-card, .card').each((i, el) => {
            if (results.length >= 20) return;
            const title = $(el).find('.card-title, h5, h4').text().trim();
            let link = $(el).find('a').attr('href');
            const image = $(el).find('img').attr('src');

            if (title && link) {
                if (!link.startsWith('http')) link = 'https://myschool.lk' + link;
                results.push({ title, url: link, image, desc: "Take the O/L MCQ Challenge" });
            }
        });

        res.json({ status: true, creator: "Chama Ofc", result: results });
    } catch (e) {
        res.json({ status: false, error: e.message });
    }
});

/**
 * School Textbooks
 */
router.get("/textbooks", async (req, res) => {
    try {
        // Since edupub is hard to scrape directly efficiently without params, 
        // we provide links to common grades or a search link.
        const results = [
            { title: "Grade 11 Textbooks", url: "http://www.edupub.gov.lk/BooksDownload.php?grade=11", image: "https://img.icons8.com/color/512/book.png", desc: "Download Grade 11 Sinhala/English/Tamil medium textbooks" },
            { title: "Grade 10 Textbooks", url: "http://www.edupub.gov.lk/BooksDownload.php?grade=10", image: "https://img.icons8.com/color/512/book.png", desc: "Download Grade 10 Sinhala/English/Tamil medium textbooks" },
            { title: "Grade 9 Textbooks", url: "http://www.edupub.gov.lk/BooksDownload.php?grade=9", image: "https://img.icons8.com/color/512/book.png", desc: "Download Grade 9 textbooks" },
            { title: "Grade 6-13 All Textbooks", url: "http://www.edupub.gov.lk/BooksDownload.php", image: "https://img.icons8.com/color/512/book.png", desc: "Official Educational Publications Department" }
        ];
        res.json({ status: true, creator: "Chama Ofc", result: results });
    } catch (e) {
        res.json({ status: false, error: e.message });
    }
});


/**
 * Global Search for Educational Resources
 */
router.get("/search", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });

    try {
        // Search across multiple providers (OLevelAPI and PastPapers.wiki)
        const providers = [
            `https://www.olevelapi.com/?s=${encodeURIComponent(q)}`,
            `https://www.pastpapers.wiki/?s=${encodeURIComponent(q)}`
        ];

        const results = [];
        for (const url of providers) {
            try {
                const { data } = await axios.get(url, { headers: COMMON_HEADERS, timeout: 8000 });
                const $ = cheerio.load(data);

                $('.post-item, article, .post').each((i, el) => {
                    if (results.length >= 30) return;
                    const title = $(el).find('.post-title, h2, h3, .entry-title').first().text().trim();
                    const link = $(el).find('a').first().attr('href');
                    const image = $(el).find('img').first().attr('src') || "https://img.icons8.com/color/512/knowledge.png";
                    const source = url.includes('olevelapi') ? 'OLevelAPI' : 'PastPapers.wiki';

                    if (title && link) {
                        results.push({ title, url: link, image, source });
                    }
                });
            } catch (err) {
                console.error(`Search error for ${url}:`, err.message);
            }
        }

        res.json({ status: true, creator: "Chama Ofc", count: results.length, result: results });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * Educational Material Downloader (URL based)
 */
router.get("/download", async (req, res) => {
    const url = (req.query.url || "").trim();
    if (!url) return res.status(400).json({ status: false, error: "Missing target URL" });

    try {
        const { data } = await axios.get(url, { headers: COMMON_HEADERS, timeout: 10000 });
        const $ = cheerio.load(data);
        const results = [];

        // Specialized selectors for educational sites
        $('a[href$=".pdf"], a[href*="drive.google.com"], a[href*="mediafire.com"], .download-link, .wp-block-file__button').each((i, el) => {
            const title = $(el).text().trim() || $(el).attr('title') || "Download Link " + (results.length + 1);
            let link = $(el).attr('href');

            if (link && !link.startsWith('javascript')) {
                if (link.startsWith('/')) {
                    const baseUrl = new URL(url).origin;
                    link = baseUrl + link;
                }
                results.push({ title, url: link });
            }
        });

        // Clean up duplicates
        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

        res.json({
            status: true,
            creator: "Chama Ofc",
            title: $('title').first().text().trim() || "Educational Material",
            result: uniqueResults
        });
    } catch (e) {
        res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * Sri Lankan Short Notes Sites
 */
router.get("/notes", async (req, res) => {
    const q = (req.query.q || "").trim();

    // If query provided, search specifically in a notes site
    if (q) {
        try {
            const url = `https://shortnotes.lk/?s=${encodeURIComponent(q)}`;
            const { data } = await axios.get(url, { headers: COMMON_HEADERS });
            const $ = cheerio.load(data);
            const results = [];

            $('article, .post').each((i, el) => {
                const title = $(el).find('h2, .entry-title').text().trim();
                const link = $(el).find('a').attr('href');
                if (title && link) {
                    results.push({ title, url: link, source: "ShortNotes.lk" });
                }
            });
            return res.json({ status: true, creator: "Chama Ofc", result: results });
        } catch (e) {
            return res.status(500).json({ status: false, error: e.message });
        }
    }

    // Default: Curated list of SL Short Note resources
    const resources = [
        { title: "ShortNotes.lk - All Subjects", url: "https://shortnotes.lk", desc: "Largest collection of SL school notes" },
        { title: "Notes.lk - Digital Learning", url: "https://notes.lk", desc: "Comprehensive notes for O/L and A/L" },
        { title: "E-Thaksalawa - MOE", url: "http://www.e-thaksalawa.moe.gov.lk/", desc: "Official Govt Learning Portal" },
        { title: "Guru.lk", url: "https://www.guru.lk", desc: "Online learning for Sri Lankan students" },
        { title: "PastPapers.lk - Notes Section", url: "https://pastpapers.lk/category/notes/", desc: "Study materials and notes" }
    ];

    res.json({ status: true, creator: "Chama Ofc", result: resources });
});

module.exports = router;

