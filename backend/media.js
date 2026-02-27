const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const crypto = require("crypto");
const qs = require("qs");
const { shortenUrl } = require("./shortener");
const router = express.Router();


const baseInfo = {
    status: true,
    creator: "Chama Ofc",
    project: "Chama Ofc",
    version: "1.0.0"
};

// --- Utility Functions ---

function ranHash() {
    return crypto.randomBytes(16).toString('hex');
}

function xorEncrypt(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) ^ 1);
    }
    return result;
}

function encUrl(url) {
    const charCodes = [];
    for (let i = 0; i < url.length; i++) {
        charCodes.push(url.charCodeAt(i));
    }
    return charCodes.reverse().join(',');
}

const getRandomHeaders = () => {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return {
        'Content-Type': 'application/json',
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
    };
};

const Y2MATE_API_KEY = "dfcb6d76f2f6a9894gjkege8a4ab232222";
const Y2MATE_BASE = "https://p.savenow.to";

/**
 * URL Expander (follows redirects)
 */
async function expandUrl(url) {
    try {
        const resp = await axios.head(url, {
            maxRedirects: 10,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return resp.request.res.responseUrl || url;
    } catch (e) {
        // Fallback to GET if HEAD is blocked
        try {
            const resp = await axios.get(url, {
                maxRedirects: 10,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            return resp.request.res.responseUrl || url;
        } catch (e2) {
            return url;
        }
    }
}

/**
 * Helper to fetch and poll Y2Mate/Loader.to API
 */
async function fetchY2Mate(url, format) {
    try {
        const { data: initData } = await axios.get(`${Y2MATE_BASE}/ajax/download.php`, {
            params: { format: format, url: url, api: Y2MATE_API_KEY },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://y2mate.yt/'
            }
        });
        if (!initData.success || !initData.id) throw new Error(initData.text || "Failed to initialize conversion");
        const id = initData.id;
        let dLink = null, attempts = 0;
        const maxAttempts = 30;
        while (!dLink && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
            const { data: progData } = await axios.get(`${Y2MATE_BASE}/api/progress`, {
                params: { id },
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (progData.success === 1 || progData.progress === 1000 || progData.download_url) dLink = progData.download_url;
            else if (progData.success === -1) throw new Error("Conversion failed on server");
        }
        if (!dLink) throw new Error("Conversion timed out");
        return { title: initData.title || "YouTube Media", thumb: initData.info?.image || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, download_url: dLink };
    } catch (e) { throw new Error(`Y2Mate Error: ${e.message}`); }
}

// --- Scraper Logic ---

async function fgetFacebook(videoUrl) {
    try {
        const targetUrl = "https://fget.io/process";
        const headers = { "Content-Type": "application/x-www-form-urlencoded", "Accept": "*/*", "User-Agent": "Mozilla/5.0", "Origin": "https://fget.io", "Referer": "https://fget.io/", "HX-Request": "true" };
        const data = qs.stringify({ id: videoUrl, locale: "en" });
        const response = await axios.post(targetUrl, data, { headers });
        const $ = cheerio.load(response.data);
        const hdLink = $(".download-result.hd").attr("href"), sdLink = $(".download-result.sd").attr("href");
        const title = $(".text-gray-700").first().text().trim() || "Facebook Video", thumb = $(".download-result img").attr("src");
        if (hdLink || sdLink) return { status: true, result: { title, cover: thumb, hd: hdLink || null, sd: sdLink || null } };
        return { status: false, msg: "Links not found" };
    } catch (err) { return { status: false, msg: err.message }; }
}

async function expertsphpFacebook(videoUrl) {
    try {
        const response = await axios.post('https://www.expertsphp.com/facebook-video-downloader.php', `url=${encodeURIComponent(videoUrl)}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0', 'Origin': 'https://www.expertsphp.com' }
        });
        const $ = cheerio.load(response.data);
        let dlLink = $('table.table-condensed tbody tr td a').first().attr('href');
        if (!dlLink || dlLink.includes('facebook-video-downloader.php')) {
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && (href.includes('fbcdn.net') || href.includes('video.fblu'))) { dlLink = href; return false; }
            });
        }
        if (dlLink && !dlLink.includes('facebook-video-downloader.php')) return { status: true, dl_link: dlLink };
        return { status: false, msg: "Download link not found" };
    } catch (e) { return { status: false, msg: e.message }; }
}

async function expertsphpTwitter(link) {
    try {
        const { data } = await axios.post('https://www.expertsphp.com/twitter-video-downloader.php', qs.stringify({ url: link }), {
            headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const videoUrl = $('table.table-condensed tbody tr td video').attr('src') || $('table.table-condensed tbody tr td a[download]').attr('href') || $('a[href*=".mp4"]').attr('href');
        if (!videoUrl) throw new Error('Video not found');
        return { status: true, video: videoUrl };
    } catch (e) { return { status: false, message: e.message }; }
}

async function expertsphpInstagram(link) {
    try {
        const { data } = await axios.post('https://www.expertsphp.com/instagram-reels-downloader.php', qs.stringify({ url: link }), {
            headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const videoUrl = $('table.table-condensed tbody tr td video source').attr('src') || $('table.table-condensed tbody tr td video').attr('src') || $('table.table-condensed tbody tr td a[download]').attr('href');
        if (!videoUrl) throw new Error("Instagram video not found");
        return { status: true, video: videoUrl };
    } catch (err) { return { status: false, message: err.message }; }
}

async function solutionexistFacebook(url) {
    try {
        const headers = {
            'content-type': 'application/x-www-form-urlencoded',
            'origin': 'https://download.solutionexist.com',
            'referer': 'https://download.solutionexist.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };
        const response = await axios.post('https://download.solutionexist.com/', `uvd_video_url=${encodeURIComponent(url)}`, { headers });
        const $ = cheerio.load(response.data), result = { status: false, sd: null, hd: null };
        $('.uvd-download-item').each((i, el) => {
            const link = $(el).find('a.uvd-download-btn').attr('href'), tt = $(el).find('span').text().toLowerCase();
            if (link) {
                result.status = true;
                if (tt.includes('hd')) result.hd = link;
                else if (tt.includes('sd')) result.sd = link;
            }
        });
        return result;
    } catch (e) { return { status: false, error: e.message }; }
}

async function tiktokV2(url) {
    try {
        const headers = { 'content-type': 'application/x-www-form-urlencoded', 'origin': 'https://download.solutionexist.com', 'referer': 'https://download.solutionexist.com/tiktok-video-downloader/', 'user-agent': 'Mozilla/5.0' };
        const response = await axios.post('https://download.solutionexist.com/tiktok-video-downloader/', `uvd_video_url=${encodeURIComponent(url)}`, { headers });
        const $ = cheerio.load(response.data), result = { status: false, hd: null, sd: null, audio: null };
        $('.uvd-download-item').each((i, el) => {
            const link = $(el).find('a.uvd-download-btn').attr('href'), tx = $(el).find('span').text().toLowerCase();
            if (link) {
                result.status = true;
                if (tx.includes('audio')) result.audio = link;
                else if (tx.includes('hd')) result.hd = link;
                else if (tx.includes('watermark') || tx.includes('sd')) result.sd = link;
            }
        });
        return result;
    } catch (e) { return { status: false, error: e.message }; }
}

async function igdl(url) {
    try {
        const encUrl = (text) => {
            const key = Buffer.from('qwertyuioplkjhgf', 'utf-8');
            const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
            let encrypted = cipher.update(text, 'utf-8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted;
        };
        const config = { method: 'get', url: 'https://api.videodropper.app/allinone', headers: { 'accept': '*/*', 'referer': 'https://fastvideosave.net/', 'user-agent': 'Mozilla/5.0', 'url': encUrl(url) } };
        const response = await axios(config);
        return { status: true, result: response.data };
    } catch (error) { return { status: false, msg: error.message }; }
}

async function snapinsta(url) {
    try {
        const params = new URLSearchParams({ url, action: 'post', lang: 'en' });
        const { data } = await axios.post('https://snapinsta.app/action.php', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': 'https://snapinsta.app', 'Referer': 'https://snapinsta.app/', 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        const $ = cheerio.load(data), results = [];
        $('.download-items').each((i, el) => {
            const downloadBtn = $(el).find('.download-items__btn a').attr('href'), thumb = $(el).find('.download-items__thumb img').attr('src');
            if (downloadBtn) results.push({ type: downloadBtn.includes('.jpg') ? 'image' : 'video', url: downloadBtn, thumbnail: thumb || '' });
        });
        return results;
    } catch (e) { return []; }
}

async function savefrom(url) {
    try {
        const { data } = await axios.post('https://worker.sf-api.com/service/extractInfo', { url }, {
            headers: { 'Content-Type': 'application/json', 'Origin': 'https://en.savefrom.net', 'Referer': 'https://en.savefrom.net/', 'User-Agent': 'Mozilla/5.0' },
            timeout: 12000
        });
        if (data && (data.url || data.links)) {
            const items = data.url || data.links;
            return items.map(item => ({ type: item.ext === 'jpg' || item.ext === 'webp' ? 'image' : 'video', url: item.url, thumbnail: data.thumb || '', quality: item.subname || item.quality || 'HD' }));
        }
    } catch (e) { }
    try {
        const { data } = await axios.post("https://snapsave.app/action.php?lang=en", `url=${encodeURIComponent(url)}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0', 'Origin': 'https://snapsave.app', 'Referer': 'https://snapsave.app/' }
        });
        let decodedHTML = data;
        if (data.includes('eval(function')) {
            const patched = data.replace('eval(function', 'return (function');
            decodedHTML = (new Function(patched))();
        }
        const $ = cheerio.load(decodedHTML), results = [];
        $('.download-items').each((i, el) => {
            const thumb = $(el).find('.download-items__thumb img').attr('src'), downloadBtn = $(el).find('.download-items__btn a').attr('href');
            if (downloadBtn) results.push({ type: downloadBtn.includes('.jpg') ? 'image' : 'video', url: downloadBtn, thumbnail: thumb || '', quality: 'HD' });
        });
        if (results.length === 0) {
            $('.table tbody tr').each((i, el) => {
                const quality = $(el).find('.video-quality').text().trim(), link = $(el).find('a.download-link').attr('href');
                if (link) results.push({ type: 'video', url: link, quality });
            });
        }
        if (results.length > 0) return results;
    } catch (e) { }
    return [];
}

async function fastdl(url) {
    try {
        const params = new URLSearchParams({ q: url, t: 'media', lang: 'en' });
        const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': 'https://fastdl.app', 'Referer': 'https://fastdl.app/', 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 };
        let data;
        try { data = (await axios.post('https://v3.fastdl.app/api/ajaxSearch', params, config)).data; }
        catch (e) { data = (await axios.post('https://fastdl.app/api/ajaxSearch', params, config)).data; }
        if (data && data.status === 'ok' && data.data) {
            const $ = cheerio.load(data.data), results = [];
            $('.download-items').each((i, el) => {
                const thumb = $(el).find('.download-items__thumb img').attr('src'), downloadBtn = $(el).find('.download-items__btn a').attr('href');
                if (downloadBtn) results.push({ type: downloadBtn?.includes('.jpg') ? 'image' : 'video', url: downloadBtn, thumbnail: thumb || '' });
            });
            if (results.length > 0) return { status: true, result: results };
        }
        if (data && data.result) return { status: true, result: data.result.map(item => ({ type: item.type || 'video', url: item.url, thumbnail: item.thumbnail || '' })) };
        throw new Error("FastDL result invalid");
    } catch (e) { throw e; }
}

async function spotifyDownload(query) {
    try {
        const searchRes = await axios.get(`https://spotdown.org/api/song-details?url=${encodeURIComponent(query)}`);
        const song = searchRes.data?.songs?.[0];
        if (!song) return { status: false, msg: "No song found" };
        const scrapeRes = await axios.post(`https://sssspotify.com/api/download/get-url`, { url: song.url }, { headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" } });
        let dlUrl = scrapeRes.data?.originalVideoUrl;
        if (!dlUrl) return { status: false, msg: "Download link not found" };
        if (dlUrl.startsWith("/")) dlUrl = "https://sssspotify.com" + dlUrl;
        return { status: true, result: { title: song.title, artist: song.artist, thumbnail: song.thumbnail, download: dlUrl } };
    } catch (err) { return { status: false, msg: err.message }; }
}

async function mediafireDl(url) {
    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.mediafire.com/" } });
        const $ = cheerio.load(data);
        const downloadUrl = $("#downloadButton").attr("href") || null, fileName = $(".dl-btn-label").attr("title") || null, fileSize = $("#downloadButton").text().match(/\((.*?)\)/)?.[1] || null;
        if (!downloadUrl) return { status: false, msg: "Download link not found" };
        return { status: true, result: { title: fileName?.trim() || "Unknown file", size: fileSize, download: downloadUrl } };
    } catch (e) { return { status: false, error: e.message }; }
}

async function fetchSsYoutubeMp3(youtubeUrl) {
    try {
        const videoId = youtubeUrl.split('be/')[1]?.split('?')[0] || youtubeUrl.split('v=')[1]?.split('&')[0];
        if (!videoId) throw new Error("Video ID not found");

        const ajaxUrl = 'https://ssyoutube.online/wp-admin/admin-ajax.php';

        const step1Payload = new URLSearchParams();
        step1Payload.append('action', 'get_mp3_yt_option');
        step1Payload.append('videoId', videoId);

        const response1 = await axios.post(ajaxUrl, step1Payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!response1.data.success || !response1.data.data.link) {
            throw new Error("Link not found");
        }

        const rawMp3Link = response1.data.data.link;
        const videoTitle = response1.data.data.title;

        const step2Payload = new URLSearchParams();
        step2Payload.append('action', 'mp3_yt_generic_proxy_ajax');
        step2Payload.append('targetUrl', rawMp3Link);

        const response2 = await axios.post(ajaxUrl, step2Payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response2.data.success && response2.data.data.proxiedUrl) {
            return {
                title: videoTitle,
                dl_link: response2.data.data.proxiedUrl
            };
        } else {
            throw new Error("Failed to proxy URL");
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Scraper: ytmp3.sc
 * Reverse-engineered from the site's frontend AJAX flow.
 * Uses their /api/convert endpoint with URL + format params.
 */
async function fetchYtmp3Sc(youtubeUrl, format = "mp3") {
    try {
        const videoId = youtubeUrl.split('be/')[1]?.split('?')[0] ||
            youtubeUrl.split('v=')[1]?.split('&')[0];
        if (!videoId) throw new Error("Video ID not found");

        // Step 1: Request conversion
        const { data: initData } = await axios.post('https://ytmp3.sc/api/convert', qs.stringify({
            id: videoId,
            format: format === "mp3" ? "mp3" : "mp4"
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'https://ytmp3.sc/',
                'Origin': 'https://ytmp3.sc',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
            },
            timeout: 12000
        });

        if (!initData || !initData.url) throw new Error('No download URL in response');

        return {
            title: initData.title || `YouTube-${videoId}`,
            download_url: initData.url,
            thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
    } catch (e) { throw new Error(`ytmp3.sc: ${e.message}`); }
}

/**
 * Scraper: ytmp3.gg
 * Uses their backend API endpoint pattern seen in devtools network analysis.
 */
async function fetchYtmp3Gg(youtubeUrl, format = "mp3") {
    try {
        const videoId = youtubeUrl.split('be/')[1]?.split('?')[0] ||
            youtubeUrl.split('v=')[1]?.split('&')[0];
        if (!videoId) throw new Error("Video ID not found");

        const endpoint = format === "mp3" ? "ytmp3" : "ytmp4";
        const { data } = await axios.get(`https://ytmp3.gg/api/${endpoint}`, {
            params: { id: videoId },
            headers: {
                'Referer': 'https://ytmp3.gg/',
                'Origin': 'https://ytmp3.gg',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
            },
            timeout: 12000
        });

        if (!data || !data.url) throw new Error('No URL in response');

        return {
            title: data.title || `YouTube-${videoId}`,
            download_url: data.url,
            thumb: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
    } catch (e) { throw new Error(`ytmp3.gg: ${e.message}`); }
}

/**
 * Scraper: yt1s Ajax-style (yt1s.is / yt1s.biz pattern)
 * Two-step: ajaxSearch -> ajaxConvert using video ID + k-value
 */
async function fetchYt1sAjax(youtubeUrl, format = "mp3") {
    try {
        const videoId = youtubeUrl.split('be/')[1]?.split('?')[0] ||
            youtubeUrl.split('v=')[1]?.split('&')[0];
        if (!videoId) throw new Error("Video ID not found");

        const baseHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36',
            'Referer': 'https://yt1s.is/',
            'Origin': 'https://yt1s.is'
        };

        // Step 1: Search/analyze
        const searchPayload = qs.stringify({
            q: youtubeUrl,
            vt: format === "mp3" ? "mp3" : "mp4"
        });
        const { data: searchData } = await axios.post(
            'https://yt1s.is/api/ajaxSearch/index',
            searchPayload,
            { headers: baseHeaders, timeout: 12000 }
        );

        if (!searchData || searchData.status !== 'ok') throw new Error('Search failed');

        const kval = format === "mp3"
            ? (searchData.links?.mp3?.mp3128?.k || Object.values(searchData.links?.mp3 || {})[0]?.k)
            : (searchData.links?.mp4?.["720"]?.k || Object.values(searchData.links?.mp4 || {})[0]?.k);

        if (!kval) throw new Error('k-value not found');

        // Step 2: Convert
        const convertPayload = qs.stringify({
            vid: searchData.vid || videoId,
            k: kval
        });
        const { data: convertData } = await axios.post(
            'https://yt1s.is/api/ajaxConvert/convert',
            convertPayload,
            { headers: baseHeaders, timeout: 20000 }
        );

        if (!convertData || convertData.status !== 'ok' || !convertData.dlink) {
            throw new Error('Conversion failed or no download link');
        }

        return {
            title: searchData.title || `YouTube-${videoId}`,
            download_url: convertData.dlink,
            thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
    } catch (e) { throw new Error(`yt1s: ${e.message}`); }
}

/**
 * Scraper: ytconvert.org (Resilient Node)
 * Supports both MP3 and MP4 with bitrate/quality.
 */
async function fetchYtConvert(youtubeUrl, format = "mp3", quality = "128k") {
    try {
        const headers = {
            "Content-Type": "application/json",
            "Origin": "https://ytmp3.gg",
            "Referer": "https://ytmp3.gg/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };

        const isVideo = format === "mp4";
        const payload = {
            url: youtubeUrl,
            os: "windows",
            output: {
                type: isVideo ? "video" : "audio",
                format: format,
                ...(isVideo && { quality: quality })
            },
            ...(!isVideo && { audio: { bitrate: quality.toString().includes('k') ? quality : quality + 'k' } })
        };

        let downloadResponse;
        try {
            downloadResponse = await axios.post("https://hub.ytconvert.org/api/download", payload, { headers });
        } catch (err) {
            downloadResponse = await axios.post("https://api.ytconvert.org/api/download", payload, { headers });
        }

        let statusUrl = downloadResponse.data.statusUrl;
        if (!statusUrl) throw new Error("No status URL returned");

        let finalData = null;
        let attempts = 0;
        const maxAttempts = 30;

        while (!finalData && attempts < maxAttempts) {
            const statusCheck = await axios.get(statusUrl, { headers });
            if (statusCheck.data.status === "completed" || statusCheck.data.status === "finished" || statusCheck.data.downloadUrl) {
                finalData = statusCheck.data;
            } else if (statusCheck.data.status === "failed") {
                throw new Error("Conversion failed");
            } else {
                attempts++;
                await new Promise(res => setTimeout(res, 2000));
            }
        }

        if (!finalData) throw new Error("Polling timeout");

        return {
            title: finalData.title || "YouTube Media",
            download_url: finalData.downloadUrl,
            thumb: `https://i.ytimg.com/vi/${youtubeUrl.split('v=')[1]?.split('&')[0] || youtubeUrl.split('be/')[1]?.split('?')[0]}/hqdefault.jpg`
        };
    } catch (err) {
        throw new Error(`YtConvert: ${err.message}`);
    }
}

/**
 * Scraper: ogmp3.pw / apiapi.lat
 */
async function fetchOgMp3(youtubeUrl, format = "mp3", quality = "128") {
    try {
        const fmt = format === "mp3" ? "0" : "1";
        let apiBase = "https://api3.apiapi.lat";
        if (fmt === "1") apiBase = "https://api5.apiapi.lat";
        else if (quality === "128") apiBase = "https://api.apiapi.lat";

        const headers = {
            "Content-Type": "application/json",
            "Origin": "https://ogmp3.pw",
            "Referer": "https://ogmp3.pw/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        };

        const encryptedData = xorEncrypt(youtubeUrl);
        const urlPathPart = encUrl(youtubeUrl);

        const initUrl = `${apiBase}/${ranHash()}/init/${urlPathPart}/${ranHash()}/`;
        const payload = {
            data: encryptedData,
            format: fmt,
            mp3Quality: quality.toString().replace('k', ''),
            mp4Quality: quality === "360" ? "360" : "720",
            referer: "https://ogmp3.pw/",
            userTimeZone: "-330"
        };

        const response = await axios.post(initUrl, payload, { headers });
        if (response.data && response.data.i) {
            const uniqueId = response.data.i;
            const downloadUrl = `${apiBase}/${ranHash()}/download/${uniqueId}/${ranHash()}/`;
            return {
                title: response.data.t || "YouTube Media",
                download_url: downloadUrl,
                thumb: `https://i.ytimg.com/vi/${youtubeUrl.split('v=')[1]?.split('&')[0] || youtubeUrl.split('be/')[1]?.split('?')[0]}/hqdefault.jpg`
            };
        } else {
            throw new Error("Server did not return a valid ID.");
        }
    } catch (err) {
        throw new Error(`OgMp3: ${err.message}`);
    }
}

async function fetchYouTubeResilient(url, format = "mp3", quality = "128") {
    const errors = [];

    // 1. Try YtConvert (New Primary)
    try {
        const res = await fetchYtConvert(url, format, quality);
        if (res && res.download_url) return res;
    } catch (e) { errors.push(e.message); }

    // 2. Try OgMp3 (New Secondary)
    try {
        const res = await fetchOgMp3(url, format, quality);
        if (res && res.download_url) return res;
    } catch (e) { errors.push(e.message); }

    // 3. Try SSYoutube (Robust Fallback)
    try {
        if (format === "mp3") {
            const res = await fetchSsYoutubeMp3(url);
            if (res && res.dl_link) return { title: res.title, download_url: res.dl_link, thumb: "" };
        }
    } catch (e) { errors.push(`SSYoutube: ${e.message}`); }

    // 4. Try ytmp3.sc (Fallback)
    try {
        const res = await fetchYtmp3Sc(url, format);
        if (res && res.download_url) return res;
    } catch (e) { errors.push(e.message); }

    // 5. Try ytmp3.gg (Fallback)
    try {
        const res = await fetchYtmp3Gg(url, format);
        if (res && res.download_url) return res;
    } catch (e) { errors.push(e.message); }

    // 6. Try yt1s Ajax Scraper (Fallback)
    try {
        const res = await fetchYt1sAjax(url, format);
        if (res && res.download_url) return res;
    } catch (e) { errors.push(e.message); }

    throw new Error(`All download nodes failed: ${errors.join(' | ')}`);
}

router.get("/mp3_v2", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    try {
        const result = await fetchYouTubeResilient(url, "mp3");
        const shortLink = await shortenUrl(result.download_url);
        return res.json({
            creator: baseInfo.creator,
            status: 200,
            success: true,
            result: {
                type: "audio",
                format: "mp3",
                quality: "128kbps",
                title: result.title,
                thumbnail: result.thumb,
                download_url: shortLink
            }
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/mp4_v2", async (req, res) => {
    const url = req.query.url;
    const quality = req.query.quality || "720";
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    try {
        const result = await fetchYouTubeResilient(url, "mp4", quality);
        const shortLink = await shortenUrl(result.download_url);
        return res.json({
            creator: baseInfo.creator,
            status: 200,
            success: true,
            result: {
                type: "video",
                format: "mp4",
                quality: quality,
                title: result.title,
                thumbnail: result.thumb,
                download_url: shortLink
            }
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});



// Facebook Multi-Provider (Resilient Auto Fallback)
router.get("/facebook", async (req, res) => {
    let url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    // Normalize and expand short links
    if (url.includes('facebook.com/share/') || url.includes('fb.watch') || url.includes('facebook.com/reel')) {
        url = await expandUrl(url);
    }

    try {
        // 1. Try fget.io (Primary)
        const fgetRes = await fgetFacebook(url);
        if (fgetRes.status) return res.json({ creator: baseInfo.creator, ...fgetRes });

        // 2. Try expertsphp (Secondary)
        const expRes = await expertsphpFacebook(url);
        if (expRes.status) return res.json({ creator: baseInfo.creator, result: expRes });

        // 3. Try solutionexist (Fallback)
        const solRes = await solutionexistFacebook(url);
        if (solRes.status) return res.json({ creator: baseInfo.creator, status: true, result: solRes });

        // 4. Try Snapsave / Savefrom Logic (Advanced)
        const sfResults = await savefrom(url);
        if (sfResults && sfResults.length > 0) {
            return res.json({
                creator: baseInfo.creator,
                status: true,
                result: sfResults.map(r => ({ quality: r.quality || 'HD', url: r.url }))
            });
        }

        throw new Error("All extraction nodes exhausted");
    } catch (e) {
        console.error("[FB DL Error]", e.message);
        return res.status(500).json({ status: false, error: "Facebook extraction failed", msg: e.message });
    }
});

// Facebook specific (fget)
router.get("/facebook2", async (req, res) => {
    let url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await fgetFacebook(url);
        return res.json({ creator: "Chama Ofc", ...result });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

// Facebook specific (expertsphp)
router.get("/facebook3", async (req, res) => {
    let url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await expertsphpFacebook(url);
        return res.json({ creator: "Chama Ofc", ...result });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/ytmp3", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    try {
        const result = await fetchYouTubeResilient(url, "mp3");
        const shortLink = await shortenUrl(result.download_url);
        return res.json({
            creator: baseInfo.creator,
            status: 200,
            success: true,
            result: {
                type: "audio",
                format: "mp3",
                quality: "128kbps",
                title: result.title,
                thumbnail: result.thumb,
                download_url: shortLink
            }
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
})

router.get("/ytmp4", async (req, res) => {
    const url = req.query.url;
    const quality = req.query.quality || "720";
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    try {
        const result = await fetchYouTubeResilient(url, "mp4", quality);
        const shortLink = await shortenUrl(result.download_url);
        return res.json({
            creator: baseInfo.creator,
            status: 200,
            success: true,
            result: {
                type: "video",
                format: "mp4",
                quality: quality,
                title: result.title,
                thumbnail: result.thumb,
                download_url: shortLink
            }
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
})

router.get("/tiktok", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    try {
        // 1. Try TikWM (Primary)
        const { data } = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (data && data.code === 0 && data.data) {
            const noWm = data.data.play ? `https://www.tikwm.com${data.data.play}` : null;
            const music = data.data.music ? `https://www.tikwm.com${data.data.music}` : null;

            return res.json({
                status: true,
                creator: baseInfo.creator,
                title: data.data.title || "TikTok Video",
                cover: data.data.cover ? `https://www.tikwm.com${data.data.cover}` : null,
                no_watermark: await shortenUrl(noWm),
                music: await shortenUrl(music),
                author: data.data.author?.nickname
            });
        }

        // 2. Try Tiklydown (Secondary Fallback)
        const tikly = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        if (tikly.data && tikly.data.video) {
            return res.json({
                status: true,
                creator: baseInfo.creator,
                title: tikly.data.title,
                cover: tikly.data.video.cover,
                no_watermark: tikly.data.video.noWatermark,
                music: tikly.data.music.play_url
            });
        }

        throw new Error("Failed to extract TikTok media from current nodes");
    } catch (e) {
        return res.status(500).json({ status: false, error: "TikTok extraction failed", msg: e.message });
    }
});

router.get("/tiktokv2", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await tiktokV2(url);
        if (result.status) {
            return res.json({
                status: true,
                creator: baseInfo.creator,
                result: result
            });
        }
        throw new Error(result.error || "Tiktok extraction failed");
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});


router.get("/instagram", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await igdl(url);
        if (result.status) return res.json({ creator: "Chama Ofc", ...result });
        throw new Error(result.msg || "IG extraction failed");
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/instagram2", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await snapinsta(url);
        if (result && result.length > 0) return res.json({ creator: "Chama Ofc", status: true, result });
        throw new Error("No results found");
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/instagram3", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await expertsphpInstagram(url);
        if (result.status) return res.json({ creator: "Chama Ofc", ...result });
        throw new Error(result.message || "Instagram extraction failed");
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/twitter", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await expertsphpTwitter(url);
        if (result.status) return res.json({ creator: baseInfo.creator, ...result });
        throw new Error(result.message || "Twitter extraction failed");
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/spotify", async (req, res) => {
    const q = req.query.q || req.query.url;
    if (!q) return res.status(400).json({ status: false, error: "Missing query or url" });
    try {
        const result = await spotifyDownload(q);
        if (result.status) return res.json({ creator: baseInfo.creator, ...result });

        // Fallback to a secondary node
        const fbReq = await axios.get(`https://api.vyturex.com/spotify?url=${encodeURIComponent(q)}`, { timeout: 10000 });
        if (fbReq.data && fbReq.data.result) {
            return res.json({ creator: baseInfo.creator, status: true, result: fbReq.data.result });
        }

        throw new Error(result.msg || "Spotify extraction failed");
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/mediafire", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const result = await mediafireDl(url);
        if (result.status) return res.json({ creator: baseInfo.creator, ...result });
        throw new Error(result.msg || "Mediafire extraction failed");
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/pixeldrain", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const id = url.split('/').pop();
        return res.json({
            status: true,
            creator: baseInfo.creator,
            title: "Pixeldrain File",
            download_url: `https://pixeldrain.com/api/file/${id}?download`
        });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/pinterest", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data } = await axios.get(`https://www.expertsphp.com/facebook-video-downloader.php`, {
            params: { url },
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(data);
        const dUrl = $('table.table-condensed a[download]').first().attr('href');
        if (!dUrl) throw new Error("NotFound");
        return res.json({ status: true, creator: baseInfo.creator, download_url: dUrl });
    } catch (e) { return res.status(500).json({ status: false, error: "Pinterest extraction error" }); }
});

router.get("/sinhanada", async (req, res) => {
    const q = (req.query.q || req.query.query || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://sinhanada.net/search.php?search=${encodeURIComponent(q)}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://sinhanada.net/"
            }
        });
        const $ = cheerio.load(data);
        const results = [];

        // Very robust selector: looks for ANY anchor containing /data/ inside something that looks like a result
        $('.listcat, .list-group-item, .content2').each((i, el) => {
            const anchor = $(el).find('a').filter((i, a) => {
                const href = $(a).attr('href') || '';
                return href.includes('/data/') || href.includes('.html');
            }).first();

            if (anchor.length > 0) {
                const link = anchor.attr('href');
                const title = anchor.text().trim() || $(el).text().trim();
                const thumb = $(el).find('img').attr('src');

                if (link && title) {
                    results.push({
                        title: title.replace(/\s+/g, ' ').trim(),
                        link: link.startsWith('http') ? link : (link.startsWith('/') ? `https://sinhanada.net${link}` : `https://sinhanada.net/${link}`),
                        thumb: thumb ? (thumb.startsWith('http') ? thumb : `https://sinhanada.net${thumb}`) : "https://sinhanada.net/wp-content/uploads/2019/10/sinhanada-logo-1.png"
                    });
                }
            }
        });

        // Final fallback: if results still empty, just find all /data/ links in the page
        if (results.length === 0) {
            $('a[href*="/data/"]').each((i, el) => {
                const link = $(el).attr('href');
                const title = $(el).text().trim();
                if (link && title && title.length > 5) {
                    results.push({
                        title: title.replace(/\s+/g, ' ').trim(),
                        link: link.startsWith('http') ? link : `https://sinhanada.net${link}`,
                        thumb: "https://sinhanada.net/wp-content/uploads/2019/10/sinhanada-logo-1.png"
                    });
                }
            });
        }

        return res.json({ status: true, creator: baseInfo.creator, results: results.slice(0, 30) });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/sinhanada/download", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Referer": "https://sinhanada.net/"
            },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const title = $('.titelh, h1, .title, .entry-title').first().text().trim() || $('title').text().trim();
        let dl = $('a[href$=".mp3"]').first().attr('href') ||
            $('audio source').attr('src') ||
            $('audio').attr('src') ||
            $('.btn-download').attr('href') ||
            $('a:contains("Download")').attr('href');

        if (!dl) {
            // Check for buttons with ?download or similar
            $('a').each((i, el) => {
                const href = $(el).attr('href') || '';
                if (href.includes('.mp3') || href.includes('?download') || href.includes('/download/')) {
                    dl = href;
                    return false;
                }
            });
        }

        if (!dl) {
            const match = data.match(/https?:\/\/[^\s"']+\.mp3(?:\?[^\s"']*)?/i);
            if (match) dl = match[0];
        }

        if (!dl) {
            if (url.includes('?download')) dl = url;
            else dl = url + "?download";
        }

        const finalDl = dl.startsWith('http') ? dl : (dl.startsWith('/') ? `https://sinhanada.net${dl}` : `https://sinhanada.net/${dl}`);

        return res.json({
            status: true,
            creator: baseInfo.creator,
            result: {
                title: title.split('|')[0].trim(),
                download_url: finalDl,
                thumb: "https://sinhanada.net/wp-content/uploads/2019/10/sinhanada-logo-1.png"
            }
        });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/slmixlk", async (req, res) => {
    const q = (req.query.q || req.query.query || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://www.slmix.lk/live-search.php?q=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const results = (data || []).map(song => ({
            title: song.name,
            nickname: song.nickname,
            link: `https://www.slmix.lk/${song.name.replace(/\s+/g, '-')}/${song.id}`,
            thumb: `https://www.slmix.lk/images/thumbnail/${song.ylink}.jpg`
        }));
        return res.json({ status: true, creator: baseInfo.creator, results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/slmixlk/download", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(data);

        // Extracting audio info
        const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
        const thumb = $('meta[property="og:image"]').attr('content');

        let download_url = $('#audio source').attr('src') ||
            $('a.btn-download').attr('href') ||
            $('a[href$=".mp3"]').attr('href');

        if (!download_url) {
            const match = data.match(/link\s*=\s*"([^"]+\.mp3)"/);
            if (match) download_url = match[1];
        }

        if (!download_url) return res.status(404).json({ status: false, error: "Download link not found on page" });

        return res.json({
            status: true,
            creator: baseInfo.creator,
            result: {
                title,
                thumb,
                download_url: download_url.startsWith('http') ? download_url : `https://www.slmix.lk${download_url}`
            }
        });

    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

// --- NEW MP3 SCRAPERS ---

/**
 * Sinduwa.lk Search
 */
router.get("/sinduwa", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://www.sinduwa.lk/?s=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(data);
        const results = [];
        $('.post-item, .item-post, article').each((i, el) => {
            const a = $(el).find('a').first();
            const link = a.attr('href');
            if (link && (link.includes('/show-') || link.includes('/show_dj_'))) {
                results.push({
                    title: a.text().trim() || $(el).find('.title').text().trim(),
                    link: link.startsWith('http') ? link : `https://www.sinduwa.lk${link}`,
                    thumb: $(el).find('img').attr('src')
                });
            }
        });
        return res.json({ status: true, creator: baseInfo.creator, results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/sinduwa/download", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        // Pattern: https://www.sinduwa.lk/show-10927-name
        const idMatch = url.match(/show(?:_dj)?-(\d+)/);
        if (!idMatch) throw new Error("Invalid Sinduwa URL");
        const id = idMatch[1];

        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);
        const title = $('h1').first().text().trim() || $('title').text().trim();

        return res.json({
            status: true,
            creator: baseInfo.creator,
            result: {
                title,
                download_url: `https://www.sinduwa.lk/get-mp3-file/${id}`
            }
        });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * Song.lk Search
 */
router.get("/songlk", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://song.lk/?s=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(data);
        const results = [];
        $('.song-item, .item, article').each((i, el) => {
            const a = $(el).find('a').first();
            const link = a.attr('href');
            if (link && link.includes('/song/')) {
                results.push({
                    title: a.text().trim() || $(el).find('h2').text().trim(),
                    link: link.startsWith('http') ? link : `https://song.lk${link}`,
                    thumb: $(el).find('img').attr('src')
                });
            }
        });
        return res.json({ status: true, creator: baseInfo.creator, results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/songlk/download", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);
        const title = $('h1').first().text().trim() || $('title').text().trim();
        let dl = $('a[href$=".mp3"]').first().attr('href') ||
            $('a.download-btn').attr('href') ||
            $('button[data-url]').attr('data-url');

        if (!dl) {
            const match = data.match(/https?:\/\/[^\s"']+\.mp3/i);
            if (match) dl = match[0];
        }

        return res.json({
            status: true,
            creator: baseInfo.creator,
            result: {
                title,
                download_url: dl ? (dl.startsWith('http') ? dl : `https://song.lk${dl}`) : url + "?download=true"
            }
        });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * Music.lk Search
 */
router.get("/musiclk", async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const { data } = await axios.get(`https://music.lk/search?q=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(data);
        const results = [];
        $('.search-result, .item').each((i, el) => {
            const a = $(el).find('a').first();
            const link = a.attr('href');
            if (link) {
                results.push({
                    title: a.text().trim() || $(el).find('.title').text().trim(),
                    link: link.startsWith('http') ? link : `https://music.lk${link}`,
                    thumb: $(el).find('img').attr('src')
                });
            }
        });
        return res.json({ status: true, creator: baseInfo.creator, results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/musiclk/download", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);
        const title = $('h1').first().text().trim() || $('title').text().trim();
        let dl = $('a[href$=".mp3"]').first().attr('href');

        return res.json({
            status: true,
            creator: baseInfo.creator,
            result: {
                title,
                download_url: dl ? (dl.startsWith('http') ? dl : `https://music.lk${dl}`) : url
            }
        });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * Top Trending Sinhala Songs (Consolidated)
 */
router.get("/songs/trending", async (req, res) => {
    try {
        const { data } = await axios.get(`https://sinhanada.net/`, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);
        const results = [];
        $('a[href*="/data/"]').each((i, el) => {
            const title = $(el).text().trim();
            const link = $(el).attr('href');
            if (title && title.length > 5 && results.length < 20) {
                results.push({
                    title,
                    link: link.startsWith('http') ? link : `https://sinhanada.net${link}`
                });
            }
        });
        return res.json({ status: true, creator: baseInfo.creator, results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

router.get("/usersdrive", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const filename = $('.filename').text().trim() || "File";
        const size = $('.filesize').text().trim() || "Unknown";
        return res.json({ status: true, creator: baseInfo.creator, filename, size, info: "Direct link requires manual click or browser session." });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * Universal Downloader (Legacy / download.js merge)
 * GET /?url=...
 */
router.get("/", async (req, res) => {
    try {
        const url = (req.query.url || "").trim();
        if (!url) return res.status(400).json({ status: false, error: "Missing url" });

        // Try providers in order
        const fget = await fgetFacebook(url);
        if (fget.status) return res.json({ creator: baseInfo.creator, ...fget });

        const exp = await expertsphpFacebook(url);
        if (exp.status) return res.json({ creator: baseInfo.creator, result: exp });

        const sol = await solutionexistFacebook(url);
        if (sol.status) return res.json({ creator: baseInfo.creator, status: true, result: sol });

        return res.status(404).json({ status: false, error: "No download links found for this URL" });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * XNXX Search
 */
router.get("/xnxx/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const url = `https://www.xnxx.com/search/${encodeURIComponent(q)}`;
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.xnxx.com/" } });
        const $ = cheerio.load(data), results = [];
        $(".mozaique .thumb-block").each((i, el) => {
            if (results.length >= 20) return;
            const a = $(el).find(".thumb-under a"), title = a.attr("title"), videoUrl = a.attr("href"), thumb = $(el).find(".thumb img").attr("data-src") || $(el).find(".thumb img").attr("src");
            if (title && videoUrl) results.push({ title, url: videoUrl.startsWith("http") ? videoUrl : `https://www.xnxx.com${videoUrl}`, thumb });
        });
        return res.json({ status: true, creator: baseInfo.creator, result: results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * XNXX Download
 */
router.get("/xnxx/download", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });
    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.xnxx.com/" } });
        const low = data.match(/html5player\.setVideoUrlLow\('([^']+)'\)/)?.[1], high = data.match(/html5player\.setVideoUrlHigh\('([^']+)'\)/)?.[1];
        if (!low && !high) return res.status(404).json({ status: false, error: "Could not find video sources" });
        return res.json({ status: true, creator: baseInfo.creator, result: { low, high } });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

/**
 * Pornhub Search
 */
router.get("/ph/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    try {
        const url = `https://www.pornhub.com/webmasters/search?search=${encodeURIComponent(q)}&thumbsize=medium`;
        const { data } = await axios.get(url, { timeout: 10000 });
        if (!data || !data.videos) return res.json({ status: true, creator: baseInfo.creator, result: [] });
        const results = data.videos.map(v => ({ title: v.title, url: v.url, thumb: v.default_thumb, duration: v.duration }));
        return res.json({ status: true, creator: baseInfo.creator, result: results });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

// --- OGMP3 (V3) Logic ---
// YouTube Resilient fallbacks handled by fetchYouTubeResilient

/**
 * Search and Download MP3 (Smart YouTube Match)
 */
router.get("/song/download", async (req, res) => {
    const q = req.query.q || req.query.query;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });

    try {
        // 1. Search YouTube for the best match
        const instances = [
            "https://invidious.privacydev.net",
            "https://yewtu.be",
            "https://iv.melmac.space"
        ];

        let videoId = null;
        let title = "";

        for (const instance of instances) {
            try {
                const searchRes = await axios.get(`${instance}/api/v1/search?q=${encodeURIComponent(q)}&filter=videos`, { timeout: 8000 });
                const items = Array.isArray(searchRes.data) ? searchRes.data : (searchRes.data.items || []);
                if (items.length > 0) {
                    videoId = items[0].videoId;
                    title = items[0].title;
                    break;
                }
            } catch (e) { continue; }
        }

        if (!videoId) {
            const ytSearch = await axios.get(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(q)}`, { timeout: 10000 });
            if (ytSearch.data && ytSearch.data.data && ytSearch.data.data.length > 0) {
                videoId = ytSearch.data.data[0].videoId || ytSearch.data.data[0].url.split('v=')[1];
                title = ytSearch.data.data[0].title;
            }
        }

        if (!videoId) throw new Error("No matching song found on YouTube");

        const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // 2. Use resilient extraction to get MP3
        const result = await fetchYouTubeResilient(ytUrl, "mp3");
        const shortLink = await shortenUrl(result.download_url);

        return res.json({
            creator: baseInfo.creator,
            status: 200,
            success: true,
            result: {
                type: "audio",
                format: "mp3",
                quality: "128kbps",
                title: result.title || title,
                thumbnail: result.thumb || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                download_url: shortLink
            }
        });

    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/mp3_v3", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    try {
        const result = await fetchYouTubeResilient(url, "mp3");
        const shortLink = await shortenUrl(result.download_url);
        return res.json({
            creator: baseInfo.creator,
            status: 200,
            success: true,
            result: {
                type: "audio",
                format: "mp3",
                quality: "128kbps",
                title: result.title,
                thumbnail: result.thumb,
                download_url: shortLink
            }
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

router.get("/mp4_v3", async (req, res) => {
    const url = req.query.url;
    const quality = req.query.quality || "720";
    if (!url) return res.status(400).json({ status: false, error: "Missing url" });

    try {
        const result = await fetchYouTubeResilient(url, "mp4", quality);
        const shortLink = await shortenUrl(result.download_url);
        return res.json({
            creator: baseInfo.creator,
            status: 200,
            success: true,
            result: {
                type: "video",
                format: "mp4",
                quality: quality,
                title: result.title,
                thumbnail: result.thumb,
                download_url: shortLink
            }
        });
    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

/**
 * APK Download (Aptoide)
 * GET /apkdownload?id=PACKAGE_NAME
 */
router.get("/apkdownload", async (req, res) => {
    const id = (req.query.id || "").trim();
    if (!id) return res.status(400).json({ success: false, error: "Missing package id" });
    try {
        const url = `https://ws75.aptoide.com/api/7/app/get?package_name=${encodeURIComponent(id)}`;
        const { data } = await axios.get(url, { timeout: 10000 });
        if (data.status === 'fail') {
            return res.status(404).json({ success: false, creator: "@Tharuzz-ofc", code: 404, error: "App not found" });
        }
        const app = data.nodes.meta.data;
        const file = data.nodes.file.data;
        let dlLink = file.path;
        // Ensure the link ends with .apk for consistency
        if (!dlLink.toLowerCase().endsWith('.apk')) {
            dlLink += dlLink.includes('?') ? '&file=.apk' : '?file=.apk';
        }

        const shortLink = await shortenUrl(dlLink);
        const result = {
            name: app.name,
            lastUpdate: app.updated,
            package: app.package,
            size: (file.filesize / (1024 * 1024)).toFixed(2) + " MB",
            image: app.icon,
            dl_link: shortLink
        };
        return res.json({
            success: true,
            creator: "@Tharuzz-ofc",
            code: 200,
            result
        });
    } catch (e) {
        console.error(`Error in /apkdownload:`, e.message);
        return res.status(500).json({ success: false, creator: "@Tharuzz-ofc", code: 500, error: "Aptoide API Error" });
    }
});

/**
 * =====================================================================
 * PROXY DOWNLOAD ROUTE
 * Opens the real CDN file URL server-side and streams it to the browser
 * with Content-Disposition: attachment → triggers direct file download
 * Usage: /api/proxy/download?url=<encoded_url>&filename=<file.mp3>
 * =====================================================================
 */
router.get("/proxy/download", async (req, res) => {
    const { url, filename } = req.query;
    if (!url) return res.status(400).json({ status: false, error: "Missing url parameter" });

    const safeFilename = filename || "download";

    try {
        const response = await axios({
            method: 'GET',
            url: decodeURIComponent(url),
            responseType: 'stream',
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
                'Referer': new URL(decodeURIComponent(url)).origin,
                'Accept': '*/*'
            },
            maxRedirects: 10
        });

        // Detect content type from response
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const contentLength = response.headers['content-length'];

        // Set headers to force browser download
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Type', contentType);
        if (contentLength) res.setHeader('Content-Length', contentLength);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');

        // Stream the file
        response.data.pipe(res);

        response.data.on('error', (err) => {
            console.error('[Proxy Download] Stream error:', err.message);
            if (!res.headersSent) res.status(500).json({ status: false, error: 'Stream failed' });
        });

    } catch (e) {
        console.error('[Proxy Download] Error:', e.message);
        return res.status(500).json({ status: false, error: 'Download proxy failed: ' + e.message });
    }
});

module.exports = router;
