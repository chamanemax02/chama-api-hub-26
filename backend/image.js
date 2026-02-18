const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const router = express.Router();

const baseInfo = { creator: "Chama Ofc" };
const STYLES = {
    "glitch": "https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html",
    "write": "https://en.ephoto360.com/write-text-on-wet-glass-online-589.html",
    "summer": "https://en.ephoto360.com/create-a-summer-text-effect-online-674.html",
    "neon": "https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html",
    "pixel": "https://en.ephoto360.com/create-pixel-glitch-text-effect-online-759.html",
    "matrix": "https://en.ephoto360.com/matrix-text-effect-online-864.html",
    "thunder": "https://en.ephoto360.com/create-thunder-text-effect-online-881.html",
    "gold": "https://en.ephoto360.com/create-gold-text-effect-online-760.html",
    "horror": "https://en.ephoto360.com/create-horror-text-effect-online-729.html",
    "fire": "https://en.ephoto360.com/create-fire-text-effect-online-726.html",
    "water": "https://en.ephoto360.com/create-water-text-effect-online-725.html",
    "graffiti": "https://en.ephoto360.com/create-graffiti-text-effect-online-724.html",
    "naruto": "https://en.ephoto360.com/create-naruto-logo-online-free-710.html",
    "onepiece": "https://en.ephoto360.com/create-one-piece-logo-online-free-709.html",
    "dragonball": "https://en.ephoto360.com/create-dragon-ball-logo-online-free-708.html",
    "pornhub": "https://en.ephoto360.com/create-pornhub-logo-online-free-701.html"
};

async function scrapeEphoto(url, texts) {
    const domain = new URL(url).origin;
    try {
        const { data: page, headers } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(page), form = new FormData();
        $('form input').each((i, el) => {
            const n = $(el).attr('name'), v = $(el).val();
            if (n && v && !n.includes('text')) form.append(n, v);
        });
        if (Array.isArray(texts)) texts.forEach(t => form.append('text[]', t)); else form.append('text[]', texts);
        form.append('submit', 'GO');
        const { data: res } = await axios.post(`${domain}/effect/create-image`, form, { headers: { ...form.getHeaders(), "User-Agent": "Mozilla/5.0", "Referer": url } });
        if (res && res.success) return res.full_size_image || res.image;
        throw new Error("Scraper failed");
    } catch (e) { throw e; }
}

// AI Image Generation (Original image.js)
router.get("/generate", async (req, res) => {
    const { prompt, model = "nano" } = req.query;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });
    try {
        const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 10000)}&model=${model}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(response.data);
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

// Ephoto Effects
router.get("/effect/:style", async (req, res) => {
    const { style } = req.params;
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, error: "Missing text" });
    const target = STYLES[style];
    if (!target) return res.status(404).json({ status: false, error: "Style not found" });
    try {
        const img = await scrapeEphoto(target, text.split('|'));
        return res.json({ status: true, creator: baseInfo.creator, result: { url: img } });
    } catch (e) { return res.status(500).json({ status: false, error: e.message }); }
});

// Meta AI Image Generation
function generateRandomDOB() {
    const year = Math.floor(Math.random() * (2005 - 1970 + 1)) + 1970;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function getMetaToken() {
    const url = 'https://www.meta.ai/api/graphql/';
    const form = new FormData();
    form.append('av', '0');
    form.append('__user', '0');
    form.append('__a', '1');
    form.append('__req', 't');
    form.append('__hs', '20477.HYP:kadabra_pkg.2.1...0');
    form.append('dpr', '1');
    form.append('__ccg', 'GOOD');
    form.append('__rev', '1032408219');
    form.append('__s', '95uk9b:pk21np:5pp1x5');
    form.append('__hsi', '7598786093641174910');
    form.append('__dyn', '7xeUjG1mxu1syUqxemh0no6u5U4e2C1vzEdE98K360CEbo1nEhw2nVEtwMw6ywaq221FwpUO0n24oaEnxO0Bo7O2l0Fwqo31w9O1lwlE-U2zxe2GewbS361qw82dUlwhE5m1pwg8fU1ck9zo2NwkQ0Lo6-m362WE3Gwxyo6O2G3W1nwOwbWEb8uwm85K2G1Rwgo6218wkE3PwiE6S');
    form.append('__csr', 'gngZN5tGzh6KyqkyLRO4lFBGExlV9bLGy4Fk_qmECKEly9WQ7pEhwEwEwqEtzJ2t1S5U8801tPE4NcK06bobobUjw9Tw4Je6J0m4S4Q58b6610V2ci1ayci6E5J6VqAxG4Ejh1wBgG0Ro3Gzo1vXKi0TE0Au9U0mb8m9ho42azd09B05f2UKN0n6iw6ww7VIw1F86LTUOqn40toW3y1TwgE2YzoK5gI2WcDg0ufw4exC01GDK6Vo0-248qw5Ww20o1Z81JHBw1eN5gN5g0gJw-wNpoGUhg');
    form.append('__hsdp', 'gcYYGe83Gaw9ycgPAhHu8gwx7EIZAoHaaymfxeWyWx2cxa4A7WzF8dpQu5omK68hwww5Dw5UwdO7E29wfu8g0xbwLw9W2W0Q84m2a2C7k2q6o3TzU1sU7S');
    form.append('__hblp', '08Weyag4aEtAhHipA88hy8Cp3EjJzWx3WyRF6Bz8ix91yqEBGi3mt7xm5Gg-8x669Umxh0rE0Ai0T8uwuU11ox2U4-0EU2dwbq1DgdkfxGE7C1mwho8EaoXz45ubG4VoG0X8-0na1-wQwxwdy');
    form.append('__sjsp', 'gcYBiFi20WyE2oz4cUOu8gpovQ');
    form.append('__comet_req', '72');
    form.append('lsd', 'AdJzP_b_qoc');
    form.append('jazoest', '21052');
    form.append('__spin_r', '1032408219');
    form.append('__spin_b', 'trunk');
    form.append('__spin_t', '1769230257');
    form.append('__jssesw', '2');
    form.append('__crn', 'comet.kadabra.KadabraAssistantRoute');
    form.append('qpl_active_flow_ids', '947272388');
    form.append('fb_api_caller_class', 'RelayModern');
    form.append('fb_api_req_friendly_name', 'useKadabraAcceptTOSForTempUserMutation');
    form.append('server_timestamps', 'true');
    form.append('variables', JSON.stringify({
        "dob": generateRandomDOB(),
        "__relay_internal__pv__AbraQPDocUploadNuxTriggerNamerelayprovider": "meta_dot_ai_abra_web_doc_upload_nux_tour",
        "__relay_internal__pv__AbraSurfaceNuxIDrelayprovider": "12177"
    }));
    form.append('doc_id', '25102616396026783');
    form.append('fb_api_analytics_tags', '["qpl_active_flow_ids=947272388"]');

    const headers = {
        ...form.getHeaders(),
        'host': 'www.meta.ai',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'referer': 'https://www.meta.ai/',
        'x-fb-friendly-name': 'useKadabraAcceptTOSForTempUserMutation',
        'x-fb-lsd': 'AdJzP_b_qoc',
        'x-asbd-id': '359341',
        'origin': 'https://www.meta.ai',
        'cookie': 'datr=sU90afPSYelxqmSaKqer58Hc; wd=1366x643',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'priority': 'u=0'
    };

    const response = await axios.post(url, form, { headers });
    if (response.data && response.data.data && response.data.data.xab_abra_accept_terms_of_service) {
        return response.data.data.xab_abra_accept_terms_of_service.new_temp_user_auth.access_token;
    }
    throw new Error('Failed to get Meta AI token');
}

async function metaAIImage(text, accessToken) {
    const url = 'https://graph.meta.ai/graphql?locale=user';
    const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    const externalConversationId = generateUUID(), threadSessionId = generateUUID(), qplJoinId = Math.random().toString(16).substring(2, 19);

    async function sendMessage(message, isNewConversation, offlineThreadingId) {
        const variables = {
            message: { sensitive_string_value: message },
            externalConversationId, offlineThreadingId, threadSessionId, isNewConversation,
            suggestedPromptIndex: null, promptPrefix: null, entrypoint: "KADABRA__CHAT__UNIFIED_INPUT_BAR",
            attachments: [], attachmentsV2: [], activeMediaSets: [], activeCardVersions: [], activeArtifactVersion: null,
            userUploadEditModeInput: null, reelComposeInput: null, qplJoinId, sourceRemixPostId: null, gkPlannerOrReasoningEnabled: false,
            selectedModel: "BASIC_OPTION", conversationMode: null, selectedAgentType: "PLANNER", agentSettings: null,
            conversationStarterId: null, promptType: null, artifactRewriteOptions: null, imagineOperationRequest: null,
            imagineClientOptions: { orientation: "VERTICAL" }, spaceId: null, sparkSnapshotId: null, topicPageId: null,
            includeSpace: false, storybookId: null,
            messagePersistentInput: {
                attachment_size: null, attachment_type: null, bot_message_offline_threading_id: (BigInt(offlineThreadingId) + 1n).toString(),
                conversation_mode: null, external_conversation_id: externalConversationId, is_new_conversation: isNewConversation,
                meta_ai_entry_point: "KADABRA__CHAT__UNIFIED_INPUT_BAR", offline_threading_id: offlineThreadingId, prompt_id: null, prompt_session_id: threadSessionId
            },
            alakazam_enabled: true, skipInFlightMessageWithParams: null,
            __relay_internal__pv__KadabraSocialSearchEnabledrelayprovider: false,
            __relay_internal__pv__KadabraZeitgeistEnabledrelayprovider: false,
            __relay_internal__pv__alakazam_enabledrelayprovider: true,
            __relay_internal__pv__sp_kadabra_survey_invitationrelayprovider: true,
            __relay_internal__pv__enable_kadabra_partial_resultsrelayprovider: false,
            __relay_internal__pv__AbraArtifactsEnabledrelayprovider: false,
            __relay_internal__pv__KadabraMemoryEnabledrelayprovider: false,
            __relay_internal__pv__AbraPlannerEnabledrelayprovider: false,
            __relay_internal__pv__AbraWidgetsEnabledrelayprovider: false,
            __relay_internal__pv__KadabraDeepResearchEnabledrelayprovider: false,
            __relay_internal__pv__KadabraThinkHarderEnabledrelayprovider: false,
            __relay_internal__pv__KadabraVergeEnabledrelayprovider: false,
            __relay_internal__pv__KadabraSpacesEnabledrelayprovider: false,
            __relay_internal__pv__KadabraProductSearchEnabledrelayprovider: false,
            __relay_internal__pv__KadabraAreServiceEnabledrelayprovider: false,
            __relay_internal__pv__kadabra_render_reasoning_response_statesrelayprovider: true,
            __relay_internal__pv__kadabra_reasoning_cotrelayprovider: false,
            __relay_internal__pv__AbraSearchInlineReferencesEnabledrelayprovider: true,
            __relay_internal__pv__AbraComposedTextWidgetsrelayprovider: true,
            __relay_internal__pv__KadabraNewCitationsEnabledrelayprovider: true,
            __relay_internal__pv__WebPixelRatiorelayprovider: 1,
            __relay_internal__pv__KadabraVideoDeliveryRequestrelayprovider: { dash_manifest_requests: [{}], progressive_url_requests: [{ quality: "HD" }, { quality: "SD" }] },
            __relay_internal__pv__KadabraWidgetsRedesignEnabledrelayprovider: false,
            __relay_internal__pv__kadabra_enable_send_message_retryrelayprovider: true,
            __relay_internal__pv__KadabraEmailCalendarIntegrationrelayprovider: false,
            __relay_internal__pv__ClippyUIrelayprovider: false,
            __relay_internal__pv__kadabra_reels_connect_featuresrelayprovider: false,
            __relay_internal__pv__AbraBugNubrelayprovider: false,
            __relay_internal__pv__AbraRedteamingrelayprovider: false,
            __relay_internal__pv__AbraDebugDevOnlyrelayprovider: false,
            __relay_internal__pv__kadabra_enable_open_in_editor_message_actionrelayprovider: false,
            __relay_internal__pv__BloksDeviceContextrelayprovider: { pixel_ratio: 1 },
            __relay_internal__pv__AbraThreadsEnabledrelayprovider: false,
            __relay_internal__pv__kadabra_story_builder_enabledrelayprovider: false,
            __relay_internal__pv__kadabra_imagine_canvas_enable_dev_settingsrelayprovider: false,
            __relay_internal__pv__kadabra_create_media_deletionrelayprovider: false,
            __relay_internal__pv__kadabra_moodboardrelayprovider: false,
            __relay_internal__pv__AbraArtifactDragImagineFromConversationrelayprovider: false,
            __relay_internal__pv__kadabra_media_item_renderer_heightrelayprovider: 545,
            __relay_internal__pv__kadabra_media_item_renderer_widthrelayprovider: 620,
            __relay_internal__pv__AbraQPDocUploadNuxTriggerNamerelayprovider: "meta_dot_ai_abra_web_doc_upload_nux_tour",
            __relay_internal__pv__AbraSurfaceNuxIDrelayprovider: "12177",
            __relay_internal__pv__KadabraConversationRenamingrelayprovider: true,
            __relay_internal__pv__AbraIsLoggedOutrelayprovider: true,
            __relay_internal__pv__KadabraCanvasDisplayHeaderV2relayprovider: true,
            __relay_internal__pv__AbraArtifactEditorDebugModerelayprovider: false,
            __relay_internal__pv__AbraArtifactEditorDownloadHTMLEnabledrelayprovider: false,
            __relay_internal__pv__kadabra_create_row_hover_optionsrelayprovider: false,
            __relay_internal__pv__kadabra_media_info_pillsrelayprovider: true,
            __relay_internal__pv__KadabraConcordInternalProfileBadgeEnabledrelayprovider: false,
            __relay_internal__pv__KadabraSocialGraphrelayprovider: false
        };

        const form = new FormData();
        form.append('av', '0'); form.append('access_token', accessToken); form.append('__user', '0'); form.append('__a', '1'); form.append('__req', 'v');
        form.append('__hs', '20477.HYP:kadabra_pkg.2.1...0'); form.append('dpr', '1'); form.append('__ccg', 'GOOD'); form.append('__rev', '1032408219');
        form.append('__s', '95uk9b:pk21np:5pp1x5'); form.append('__hsi', '7598786093641174910');
        form.append('__dyn', '7xeUjG1mxu1syUqxemh0no6u5U4e2C1vzEdE98K360CEbo1nEhw2nVEtwMw6ywaq221FwpUO0n24oaEnxO0Bo7O2l0Fwqo31w9O1lwlE-U2zxe2GewbS361qw82dUlwhE5m1pwg8fU1ck9zo2NwkQ0Lo6-m362WE3Gwxyo6O2G3W1nwOwbWEb8uwm85K2G1Rwgo6218wkE3PwiE6S');
        form.append('__csr', 'gngZN5tGzh6KyqkyLRO4lFBGExlV9bLGy4Fk_qmECKEly9WQ7pEhwEwEwqEtzJ2t1S5U8801tPE4NcK06bobobUjw9Tw4Je6J0m4S4Q58b6610V2ci1ayci6E5J6VqAxG4Ejh1wBgG0Ro3Gzo1vXKi0TE0Au9U0mb8m9ho42azd09B05f2UKN0n6iw6ww7VIw1F86LTUOqn40toW3y1TwgE2YzoK5gI2WcDg0ufw4exC01GDK6Vo0-248qw5Ww20o1Z81JHBw1eN5gN5g0gJw-wNpoGUhg');
        form.append('__hsdp', 'gcYYGe83Gaw9ycgPAhHu8gwx7EIZAoHaaymfxeWyWx2cxa4A7WzF8dpQu5omK68hwww5Dw5UwdO7E29wfu8g0xbwLw9W2W0Q84m2a2C7k2q6o3TzU1sU7S');
        form.append('__hblp', '08Weyag4aEtAhHipA88hy8Cp3EjJzWx3WyRF6Bz8ix91yqEBGi3mt7xm5Gg-8x669Umxh0rE0Ai0T8uwuU11ox2U4-0EU2dwbq1DgdkfxGE7C1mwho8EaoXz45ubG4VoG0X8-0na1-wQwxwdy');
        form.append('__sjsp', 'gcYBiFi20WyE2oz4cUOu8gpovQ'); form.append('__comet_req', '72'); form.append('lsd', 'AdJzP_b_qoc'); form.append('jazoest', '21052');
        form.append('__spin_r', '1032408219'); form.append('__spin_b', 'trunk'); form.append('__spin_t', '1769230257'); form.append('__jssesw', '2'); form.append('__crn', 'comet.kadabra.KadabraAssistantRoute');
        form.append('fb_api_caller_class', 'RelayModern'); form.append('fb_api_req_friendly_name', 'useKadabraSendMessageMutation'); form.append('server_timestamps', 'true');
        form.append('variables', JSON.stringify(variables)); form.append('doc_id', '24895882500088854');

        const headers = {
            ...form.getHeaders(), 'host': 'graph.meta.ai', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept': '*/*', 'accept-language': 'en-US,en;q=0.9', 'referer': 'https://www.meta.ai/', 'origin': 'https://www.meta.ai',
            'cookie': 'datr=sU90afPSYelxqmSaKqer58Hc; wd=1366x643', 'sec-fetch-dest': 'empty', 'sec-fetch-mode': 'cors', 'sec-fetch-site': 'same-site'
        };

        return await axios.post(url, form, { headers, responseType: 'text' });
    }

    const offlineThreadingId = Math.floor(Math.random() * 9e18).toString();
    const response = await sendMessage(`imagine ${text}`, true, offlineThreadingId);
    const lines = response.data.split('\n').filter(l => l.trim());

    for (const line of lines) {
        try {
            const parsed = JSON.parse(line);
            const findUrl = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                if (obj.image_url) return obj.image_url;
                if (obj.uri && (obj.uri.includes('fna.fbcdn.net') || obj.uri.includes('scontent'))) return obj.uri;
                for (const key in obj) {
                    const result = findUrl(obj[key]);
                    if (result) return result;
                }
                return null;
            };
            const imgUrl = findUrl(parsed);
            if (imgUrl) return imgUrl;
        } catch (e) { }
    }
    throw new Error('Image not found in Meta AI response');
}

router.get("/meta-generate", async (req, res) => {
    const { prompt } = req.query;
    if (!prompt) return res.status(400).json({ status: false, error: "Missing prompt" });

    let step = "init";
    try {
        step = "getMetaToken";
        console.log("[DEBUG] Fetching Meta Token...");
        const token = await getMetaToken();
        console.log("[DEBUG] Token received.");

        step = "metaAIImage";
        console.log("[DEBUG] Requesting Image Generation...");
        const imageUrl = await metaAIImage(prompt, token);
        console.log("[DEBUG] Image URL found:", imageUrl);

        step = "downloadImage";
        console.log("[DEBUG] Downloading Image...");
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(response.data);
    } catch (e) {
        console.error(`[ERROR] Failed at step: ${step}`);
        console.error(`[ERROR] Message: ${e.message}`);
        if (e.response) {
            console.error(`[ERROR] Status: ${e.response.status}`);
            console.error(`[ERROR] Data:`, typeof e.response.data === 'string' ? e.response.data.substring(0, 500) : JSON.stringify(e.response.data).substring(0, 500));
        }
        return res.status(500).json({
            status: false,
            error: `Failed at ${step}: ${e.message}`,
            details: e.response ? e.response.data : null
        });
    }
});

module.exports = router;

