const axios = require("axios");
const https = require("https");
const FormData = require("form-data");

const sizeOptions = [
    "1216x832", "1152x896", "1344x768", "1563x640",
    "832x1216", "896x1152", "768x1344", "640x1536", "1024x1024"
];

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
            `${this.baseUrl}/zoner-ai/txt2img`,
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

module.exports = async (req, res) => {
    try {
        const prompt = req.query.p;
        const size = req.query.size || "1024x1024";

        if (!prompt) {
            return res.status(400).send("❌ use ?p=cat");
        }

        const zonerai = new Zonerai();

        console.log("Generating:", prompt);

        const finalSize = sizeOptions.includes(size) ? size : "1024x1024";

        const buffer = await zonerai.text2img(prompt, finalSize);

        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err) {
        console.log(err.message);
        res.status(500).send("IMAGE ERROR");
    }
};
