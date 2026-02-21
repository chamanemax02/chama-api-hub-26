const express = require("express");
const axios = require("axios");
const https = require("https");
const crypto = require("crypto");
const FormData = require("form-data");
const router = express.Router();

const sizeOptions = [
    "1216x832", "1152x896", "1344x768", "1563x640",
    "832x1216", "896x1152", "768x1344", "640x1536", "1024x1024"
];

// Reusable AI Provider Using Pollinations (Very stable & free)
class AIProvider {
    async chat(userInput, model = "openai") {
        try {
            // Pollinations text endpoint supports multiple models but defaults to openai (gpt-4o like)
            const response = await axios.post('https://text.pollinations.ai/', {
                messages: [{ role: "user", content: userInput }],
                model: model,
                seed: Math.floor(Math.random() * 1000000)
            }, { timeout: 30000 });

            return {
                status: true,
                creator: "Chama Ofc",
                model: model,
                result: response.data.trim()
            };
        } catch (error) {
            console.error("AI Chat Error:", error.message);
            return { status: false, creator: "Chama Ofc", error: "AI service temporarily busy. Please try again." };
        }
    }

    async generateImage(prompt, aspect_ratio = "1:1") {
        try {
            // We return a set of URLs from Pollinations (it's direct URL generation)
            const seed = Math.floor(Math.random() * 999999);
            let width = 1024, height = 1024;

            if (aspect_ratio === "16:9") { width = 1280; height = 720; }
            if (aspect_ratio === "9:16") { width = 720; height = 1280; }

            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

            return {
                status: true,
                creator: "Chama Ofc",
                model: 'pollinations',
                images: [imageUrl]
            };
        } catch (error) {
            console.error("AI Image Error:", error.message);
            return { status: false, error: "Failed to generate image URL" };
        }
    }
}

class Zonerai {
    constructor() {
        this.baseUrl = "https://api.zonerai.com";
        this.headers = {
            "Origin": "https://zonerai.com",
            "Referer": "https://zonerai.com/",
            "User-Agent": "Mozilla/5.0",
            "X-Client-Platform": "web"
        };
    }

    async text2img(prompt, size = "1024x1024", upscale = 0) {
        if (!prompt) throw new Error("Prompt required");

        const formData = new FormData();
        formData.append("Prompt", prompt);
        formData.append("Size", size);
        formData.append("Upscale", upscale);
        formData.append("Language", "eng_Latn");
        formData.append("Batch_Index", 0);

        const { data } = await axios.post(
            `https://api.zonerai.com/zoner-ai/txt2img`,
            formData,
            {
                headers: {
                    ...this.headers,
                    ...formData.getHeaders()
                },
                responseType: "arraybuffer",
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }
        );

        return data;
    }
}

const ai = new AIProvider();

// --- New Providers ---


class NoteGPT_V3 {
    async chat(userInput, model = "gpt-4.1-mini") {
        const targetApi = 'https://notegpt.io/api/v2/chat/stream';
        const randomId = crypto.randomUUID();
        const payload = {
            message: userInput,
            language: "auto",
            model: model,
            tone: "default",
            length: "moderate",
            chat_mode: "standard",
            conversation_id: randomId,
            image_urls: []
        };
        try {
            const response = await axios.post(targetApi, payload, {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Origin': 'https://notegpt.io',
                    'Referer': 'https://notegpt.io/',
                },
                responseType: 'text'
            });
            const rawData = response.data;
            const lines = rawData.split('\n');
            let fullText = "";
            lines.forEach(line => {
                if (line.startsWith('data: ')) {
                    const jsonPart = line.replace('data: ', '').trim();
                    try {
                        const parsed = JSON.parse(jsonPart);
                        if (parsed.text) fullText += parsed.text;
                    } catch (e) { }
                }
            });
            return {
                status: true,
                creator: "Chama Ofc",
                conversation_id: randomId,
                result: fullText.trim()
            };
        } catch (error) {
            return { status: false, creator: "Chama Ofc", error: error.message };
        }
    }
}

class AskAIFree {
    async chat(userInput) {
        const targetApi = 'https://askai.free/api/chat';
        const payload = {
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: userInput }
            ],
            modelName: "ChatGPT 4o",
            currentPagePath: "/chatgpt-4o"
        };
        try {
            const response = await axios.post(targetApi, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Origin': 'https://askai.free',
                    'Referer': 'https://askai.free/chatgpt-4o',
                    'Accept': 'application/json, text/plain, */*'
                }
            });
            if (response.data && response.data.response) {
                return {
                    status: true,
                    creator: "Chama Ofc",
                    result: response.data.response
                };
            }
            return { status: false, creator: "Chama Ofc", msg: "Invalid response from server" };
        } catch (error) {
            return {
                status: false,
                creator: "Chama Ofc",
                error: error.response ? `Status ${error.response.status}: ${error.message}` : error.message
            };
        }
    }
}

const nGPT = new NoteGPT_V3();
const askFree = new AskAIFree();

class BlackboxAI {
    async chat(userInput) {
        try {
            const response = await axios.post('https://www.blackbox.ai/api/chat', {
                messages: [{ role: "user", content: userInput }],
                id: crypto.randomUUID(),
                previewToken: null,
                userId: null,
                codeModelMode: true,
                agentMode: {},
                trendingAgentMode: {},
                isMicMode: false,
                isChromeExt: false,
                githubToken: null
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Origin': 'https://www.blackbox.ai',
                    'Referer': 'https://www.blackbox.ai/'
                },
                timeout: 30000
            });

            let result = response.data;
            if (typeof result === 'string') {
                // Handle potential stream-like response or unwanted chars
                result = result.replace(/\$?\$?line\d+\$?\$?/g, '').trim();
            }

            return {
                status: true,
                creator: "Chama Ofc",
                result: result
            };
        } catch (error) {
            return { status: false, creator: "Chama Ofc", error: error.message };
        }
    }
}

class PerplexityAI {
    async chat(userInput) {
        try {
            // Using a stable alternative for Perplexity as direct scraping is difficult
            // Pollinations with 'openai' (GPT-4o) is the best free stable alternative
            const response = await axios.post('https://text.pollinations.ai/', {
                messages: [{ role: "user", content: userInput }],
                model: "openai",
                seed: Math.floor(Math.random() * 1000000)
            }, { timeout: 30000 });

            return {
                status: true,
                creator: "Chama Ofc",
                site: "Perplexity (Stable Logic)",
                result: response.data.trim()
            };
        } catch (error) {
            return { status: false, creator: "Chama Ofc", error: error.message };
        }
    }
}

const blackbox = new BlackboxAI();
const perplexity = new PerplexityAI();

class DuckDuckGoAI {
    async chat(userInput) {
        try {
            // Using Pollinations with 'mistral' or 'openai' as a high-quality alternative for DDG
            const response = await axios.post('https://text.pollinations.ai/', {
                messages: [{ role: "user", content: userInput }],
                model: "mistral",
                seed: Math.floor(Math.random() * 1000000)
            }, { timeout: 30000 });

            return {
                status: true,
                creator: "Chama Ofc",
                site: "DuckDuckGo AI (Stable Logic)",
                result: response.data.trim()
            };
        } catch (error) {
            return { status: false, creator: "Chama Ofc", error: error.message };
        }
    }
}

const ddg = new DuckDuckGoAI();

class CrictosAI {
    async generate(prompt) {
        try {
            const response = await axios.post('https://image.crictos.my.id',
                { prompt: prompt },
                {
                    headers: {
                        'Authorization': 'Bearer nimesh2026',
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer',
                    timeout: 45000
                }
            );
            return response.data;
        } catch (error) {
            console.error("Crictos AI Error:", error.message);
            throw error;
        }
    }
}
const crictos = new CrictosAI();

// Debug Route
router.get("/test", (req, res) => {
    res.json({ status: true, message: "AI Router is REACHABLE" });
});

// NoteGPT V3 Routes
router.get("/notegpt-v3", async (req, res) => {
    const q = req.query.q || req.query.prompt;
    const model = req.query.model || "gpt-4.1-mini";
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    const result = await nGPT.chat(q, model);
    res.json(result);
});

// AskAI Free Route
router.get("/askai-free", async (req, res) => {
    const q = req.query.q || req.query.prompt;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    const result = await askFree.chat(q);
    res.json(result);
});

// Blackbox AI Route
router.get("/blackbox", async (req, res) => {
    const q = req.query.q || req.query.prompt;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    const result = await blackbox.chat(q);
    res.json(result);
});

// Perplexity AI Route
router.get("/perplexity", async (req, res) => {
    const q = req.query.q || req.query.prompt;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    const result = await perplexity.chat(q);
    res.json(result);
});

// DuckDuckGo AI Route
router.get("/ddg", async (req, res) => {
    const q = req.query.q || req.query.prompt;
    if (!q) return res.status(400).json({ status: false, error: "Missing query" });
    const result = await ddg.chat(q);
    res.json(result);
});
// -----------------

// General Chat
router.get("/chat", async (req, res) => {
    const prompt = req.query.prompt || req.query.q;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });
    const result = await ai.chat(prompt, "openai");
    res.json(result);
});

// Mocking NoteGPT endpoints with Pollinations for stability
router.get("/gpt5", async (req, res) => {
    const prompt = req.query.prompt || req.query.q;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });
    const result = await ai.chat(prompt, "openai"); // Using openai for gpt5 request
    res.json(result);
});

router.get("/gpt4o", async (req, res) => {
    const prompt = req.query.prompt || req.query.q;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });
    const result = await ai.chat(prompt, "openai");
    res.json(result);
});

router.get("/deepseek", async (req, res) => {
    const prompt = req.query.prompt || req.query.q;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });
    // Pollinations now supports deepseek
    const result = await ai.chat(prompt, "deepseek");
    res.json(result);
});

router.get("/deepseek-r1", async (req, res) => {
    const prompt = req.query.prompt || req.query.q;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });
    const result = await ai.chat(prompt, "deepseek-r1");
    res.json(result);
});

// Gemini using DXZ-AI (working verified)
router.get("/gemini", async (req, res) => {
    const prompt = req.query.prompt || req.query.q;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });

    try {
        const response = await axios.get('https://dxz-ai.vercel.app/api/gemini', {
            params: { text: prompt },
            headers: { "User-Agent": "Postify/1.0.0" },
            timeout: 20000
        });
        res.json({
            status: true,
            creator: "Chama Ofc",
            result: response.data.message || "No response"
        });
    } catch (err) {
        // Fallback to Pollinations if DXZ fails
        const fallback = await ai.chat(prompt, "openai");
        res.json(fallback);
    }
});

router.get("/gemini-v3", async (req, res) => {
    const prompt = req.query.prompt || req.query.q;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });

    try {
        const response = await axios.get('https://dxz-ai.vercel.app/api/gemini', {
            params: { text: prompt },
            headers: { "User-Agent": "Postify/1.0.0" },
            timeout: 20000
        });
        res.json({
            status: true,
            creator: "Chama Ofc",
            result: response.data.message || "No response",
            session: response.data.session
        });
    } catch (err) {
        const fallback = await ai.chat(prompt, "openai");
        res.json(fallback);
    }
});

// Image Generation
router.get("/image/banana", async (req, res) => {
    const prompt = req.query.prompt || req.query.p;
    const ratio = req.query.ratio || "1:1";
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });
    const result = await ai.generateImage(prompt, ratio);
    res.json(result);
});

router.get("/image/crictos", async (req, res) => {
    const prompt = req.query.prompt || req.query.q || req.query.p;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });

    try {
        const buffer = await crictos.generate(prompt);
        res.setHeader("Content-Type", "image/jpeg");
        res.send(buffer);
    } catch (e) {
        // Fallback to Pollinations
        const seed = Math.floor(Math.random() * 10000);
        res.redirect(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`);
    }
});

// Existing ZonerAI Image Gen
router.get("/generate", async (req, res) => {
    try {
        const prompt = req.query.prompt || req.query.p;
        const size = req.query.size || "1024x1024";

        if (!prompt) {
            return res.status(400).json({ status: false, error: "Missing prompt" });
        }

        const zoner = new Zonerai();
        const finalSize = sizeOptions.includes(size) ? size : "1024x1024";
        const buffer = await zoner.text2img(prompt, finalSize);

        res.setHeader("Content-Type", "image/png");
        res.send(buffer);
    } catch (err) {
        // Fallback: use Pollinations for Zoner search if it fails
        const seed = Math.floor(Math.random() * 10000);
        res.redirect(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`);
    }
});

module.exports = router;
