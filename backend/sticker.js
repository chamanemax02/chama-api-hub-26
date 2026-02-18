const express = require('express');
const axios = require('axios');
const router = express.Router();

async function scrapeFstiker(input) {
    let name = input.trim();
    if (name.includes('/addstickers/')) {
        name = name.split('/addstickers/')[1].split('?')[0];
    }

    try {
        const res = await axios.post('https://api.fstik.app/getStickerSetByName',
            {
                name: name,
                user_token: null
            },
            {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                    'origin': 'https://webapp.fstik.app',
                    'referer': 'https://webapp.fstik.app/',
                    'user-agent': 'NB Android/1.0.0'
                }
            }
        );

        const data = res.data;

        if (data.ok && data.result) {
            const set = data.result;

            const stickerLinks = set.stickers
                .map(s => {
                    const id = s.thumb?.file_id ?? s.thumb?.fileid;
                    return id ? `https://api.fstik.app/file/${id}/sticker.webp` : null;
                })
                .filter(url => url !== null);

            return {
                status: true,
                author: "Chama Ofc",
                info: {
                    title: set.title,
                    name: set.name,
                    is_animated: set.is_animated,
                    count: stickerLinks.length
                },
                result: stickerLinks
            };
        } else {
            return { status: false, error: "Sticker set not found or invalid URL." };
        }

    } catch (err) {
        return {
            status: false,
            error: err.message
        };
    }
}

router.get('/download', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({
            status: false,
            error: "Please provide a valid Telegram sticker URL (e.g. https://t.me/addstickers/BoysClub)"
        });
    }

    try {
        const result = await scrapeFstiker(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: false,
            error: "Internal Server Error"
        });
    }
});

module.exports = router;
