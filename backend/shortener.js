const axios = require('axios');

// User's ShrinkMe.io API Token
const SHRINKME_TOKEN = "a7e4de26f784c749576b567e954248d4d6d0ea39";

/**
 * Shortens a URL using ShrinkMe.io to monetize clicks
 * @param {string} url - The long URL to shorten
 * @returns {Promise<string>} - The shortened URL or original on failure
 */
async function shortenUrl(url) {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return url;

    // Don't shorten already shortened links or local links
    if (url.includes('shrinkme.io') || url.includes('localhost') || url.includes('127.0.0.1')) return url;

    try {
        const { data } = await axios.get(`https://shrinkme.io/api?api=${SHRINKME_TOKEN}&url=${encodeURIComponent(url)}&format=text`, {
            timeout: 5000
        });

        if (data && data.startsWith('http')) {
            console.log(`[Shortener] Shortened: ${url} -> ${data}`);
            return data;
        }
        return url;
    } catch (e) {
        console.error("[Shortener] Error:", e.message);
        return url;
    }
}

module.exports = { shortenUrl };
