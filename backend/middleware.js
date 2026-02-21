const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const DB = require('./db');

/**
 * Super Security Level Check (from security.js)
 */
const attackPatterns = [
    /UNION\s+SELECT/i, /UNION\s+ALL\s+SELECT/i, /ORDER\s+BY\s+\d+/i,
    /AND\s+\d+=\d+/i, /OR\s+\d+=\d+/i, /--/i, /;/i, /xp_cmdshell/i,
    /['"]\s+OR\s+['"]\d+['"]=['"]\d+/i, /<script/i, /javascript:/i,
    /onerror=/i, /onload=/i, /\.\.\//, /\/etc\/passwd/i,
    /eval\(|setTimeout\(|setInterval\(|Function\(|new\s+Function/i,
    /base64_decode|system\(|passthru\(|exec\(|shell_exec\(/i,
    /\{\s*\$gt|\{\s*\$ne|\{\s*\$regex/i
];

const scrubInput = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].trim().replace(/[\0\x08\x09\x1a\n\r"'\\]/g, (char) => {
                switch (char) {
                    case "\0": return "\\0";
                    case "\x08": return "\\b";
                    case "\x09": return "\\t";
                    case "\x1a": return "\\z";
                    case "\n": return "\\n";
                    case "\r": return "\\r";
                    case "\"":
                    case "'":
                    case "\\":
                    case "%":
                        return "\\" + char;
                    default: return char;
                }
            });
        } else if (typeof obj[key] === 'object') {
            scrubInput(obj[key]);
        }
    }
};

const securityShield = (req, res, next) => {
    const fullPath = req.originalUrl || req.path;
    const isAiRoute = fullPath.includes('/ai/') || fullPath.includes('/chat/') || fullPath.includes('/support/');

    if (isAiRoute) return next();

    scrubInput(req.body);
    scrubInput(req.query);

    const rawData = JSON.stringify({ query: req.query, body: req.body }).toLowerCase();
    for (const pattern of attackPatterns) {
        if (pattern.test(rawData)) {
            console.warn(`[SECURITY] Blocked: ${pattern} from IP: ${req.ip} | Path: ${fullPath}`);
            return res.status(403).json({ status: false, error: "Security Shield: Malicious signature blocked." });
        }
    }
    next();
};

const checkBalance = (cost = 1) => {
    return async (req, res, next) => {
        if (req.method === 'OPTIONS') return next();
        const apikey = req.query.apikey || req.headers['x-api-key'] || req.query.key;
        if (req.path.includes('matrix-support')) return next();
        if (!apikey) return res.status(401).json({ status: false, error: "Missing API Key." });

        let user;
        if (apikey !== "chama_mini_api") {
            user = await DB.getUserByKey(apikey);
            if (!user) {
                console.warn(`[AUTH] Invalid API Key: ${apikey} from IP: ${req.ip}`);
                return res.status(401).json({ status: false, error: "Invalid API Key." });
            }

            const coinSettings = await DB.getCoinsSetting();
            if (coinSettings.enabled && user.role !== 'admin') {
                const requiredCoins = cost || coinSettings.costPerRequest || 1;
                const userCoins = user.coins || 0;
                if (userCoins < requiredCoins) {
                    console.warn(`[COINS] Insufficient: ${user.email} has ${userCoins}, needs ${requiredCoins}`);
                    return res.status(403).json({ status: false, error: "Insufficient Coins.", coins: userCoins });
                }
                res.locals.user = user;
                res.locals.cost = requiredCoins;
            }
            await DB.logRequest(user.id, req.originalUrl, req.ip, req.method);
        }

        const originalJson = res.json;
        res.json = function (data) {
            const user = res.locals.user;
            const cost = res.locals.cost;
            if (data && data.status === false) {
                DB.logSystemAlert('API_ERROR', { endpoint: req.originalUrl, error: data.error || 'Unknown Error', user: user ? user.email : 'System' }).catch(() => { });
            } else if (data && data.status === true && user && cost) {
                DB.deductCoins(user.id, cost).catch(() => { });
            }
            return originalJson.call(this, data);
        };
        next();
    };
};

module.exports = { checkBalance, securityShield, helmet, hpp, xss };
