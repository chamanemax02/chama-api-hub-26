const axios = require('axios');

// User's ShrinkMe.io API Token
const SHRINKME_TOKEN = "a7e4de26f784c749576b567e954248d4d6d0ea39";

/**
 * Returns the URL as-is (Disaging shortening to provide direct links)
 * @param {string} url - The URL
 * @returns {Promise<string>} - The original URL
 */
async function shortenUrl(url) {
    // User requested to remove shorten links (ShrinkMe/shrinkme.click)
    return url;
}

module.exports = { shortenUrl };
