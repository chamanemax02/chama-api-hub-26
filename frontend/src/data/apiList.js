export const categories = ['All', 'Downloads', 'Education', 'Movies', 'Movie Old', 'AI Tools', 'News', 'Search', 'Utility', 'Adult'];

export const apiList = [
    // ==================== DOWNLOADS ====================
    {
        id: 'fb1',
        category: 'Downloads',
        name: "Facebook Video v1",
        desc: "High-speed Facebook downloader (FGet Engine)",
        endpoint: "/api/facebook2",
        params: [{ name: "url", label: "Video URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/facebook-new.png"
    },
    {
        id: 'fb2',
        category: 'Downloads',
        name: "Facebook Video v2",
        desc: "Premium Facebook downloader (ExpertsPHP Engine)",
        endpoint: "/api/facebook3",
        params: [{ name: "url", label: "Video URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png"
    },
    {
        id: 'ig1',
        category: 'Downloads',
        name: "Instagram Video v1",
        desc: "Download Instagram Reels & Posts (Premium Engine)",
        endpoint: "/api/instagram",
        params: [{ name: "url", label: "Post/Reel URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/instagram-new.png"
    },
    {
        id: 'ig2',
        category: 'Downloads',
        name: "Instagram Video v2",
        desc: "Fast Instagram downloader (SnapInsta Engine)",
        endpoint: "/api/instagram2",
        params: [{ name: "url", label: "Post/Reel URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/600px-Instagram_logo_2016.svg.png"
    },
    {
        id: 'ig3',
        category: 'Downloads',
        name: "Instagram Video v3",
        desc: "ExpertsPHP Engine for more stability",
        endpoint: "/api/instagram3",
        params: [{ name: "url", label: "Post/Reel URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://cdn-icons-png.flaticon.com/512/3955/3955024.png"
    },
    {
        id: 'twitter_dl',
        category: 'Downloads',
        name: "Twitter Video Pro",
        desc: "Download videos from Twitter/X (v2 Ultra)",
        endpoint: "/api/twitter",
        params: [{ name: "url", label: "Tweet URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/twitter--v1.png"
    },
    {
        id: 'tiktok',
        category: 'Downloads',
        name: "TikTok Video",
        desc: "No-watermark TikTok downloader",
        endpoint: "/api/tiktok",
        params: [{ name: "url", label: "Video URL" }],
        type: "GET",
        status: "working",
        icon: "https://img.icons8.com/color/512/tiktok.png"
    },
    {
        id: 'tiktok_v2',
        category: 'Downloads',
        name: "TikTok Video v2",
        desc: "Ultra-fast No-watermark TikTok downloader (SolutionExist Engine)",
        endpoint: "/api/tiktokv2",
        params: [{ name: "url", label: "Video URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/tiktok.png"
    },

    {
        id: 'ytmp3',
        category: 'Downloads',
        name: "YouTube MP3 v1",
        desc: "High-speed YT to MP3 (Provider 1)",
        endpoint: "/api/ytmp3",
        params: [{ name: "url", label: "Video URL" }],
        type: "GET",
        status: "working",
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'ytmp3_v2',
        category: 'Downloads',
        name: "YouTube MP3 v2",
        desc: "New High-speed YT to MP3 (SSYouTube Engine)",
        endpoint: "/api/mp3_v2",
        params: [{ name: "url", label: "Video URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'ytmp3_v3',
        category: 'Downloads',
        name: "YouTube MP3 v3",
        desc: "Ultra Fast YT to MP3 (OGMP3 Engine)",
        endpoint: "/api/mp3_v3",
        params: [{ name: "url", label: "Video URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'ytmp4',
        category: 'Downloads',
        name: "YouTube MP4 v1",
        desc: "Premium YT to MP4 (Provider 1)",
        endpoint: "/api/ytmp4",
        params: [
            { name: "url", label: "Video URL" },
            { name: "quality", label: "Quality (720, 1080...)", default: "720" }
        ],
        type: "GET",
        status: "working",
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'ytmp4_v3',
        category: 'Downloads',
        name: "YouTube MP4 v3",
        desc: "Ultra Fast YT to MP4 (OGMP3 Engine)",
        endpoint: "/api/mp4_v3",
        params: [
            { name: "url", label: "Video URL" },
            { name: "quality", label: "Quality (360, 720)", default: "720" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'ytmp3_sc',
        category: 'Downloads',
        name: "YouTube MP3 (ytmp3.sc)",
        desc: "Download YouTube audio via ytmp3.sc Engine — Fast & Clean",
        endpoint: "/api/ytmp3",
        params: [{ name: "url", label: "YouTube Video URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'ytmp4_sc',
        category: 'Downloads',
        name: "YouTube MP4 (ytmp3.sc)",
        desc: "Download YouTube video via ytmp3.sc Engine — HD Quality",
        endpoint: "/api/ytmp4",
        params: [
            { name: "url", label: "YouTube Video URL" },
            { name: "quality", label: "Quality (720, 1080)", default: "720" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'ytmp3_gg',
        category: 'Downloads',
        name: "YouTube MP3 (ytmp3.gg)",
        desc: "Download YouTube audio via ytmp3.gg Engine — Ultra Fast",
        endpoint: "/api/ytmp3",
        params: [{ name: "url", label: "YouTube Video URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'ytmp4_gg',
        category: 'Downloads',
        name: "YouTube MP4 (ytmp3.gg)",
        desc: "Download YouTube video via ytmp3.gg Engine",
        endpoint: "/api/ytmp4",
        params: [
            { name: "url", label: "YouTube Video URL" },
            { name: "quality", label: "Quality (720, 1080)", default: "720" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'yt1s_mp3',
        category: 'Downloads',
        name: "YouTube MP3 (yt1s Ajax)",
        desc: "High-quality YT to MP3 via yt1s.is Two-Step Ajax Engine (128kbps)",
        endpoint: "/api/ytmp3",
        params: [{ name: "url", label: "YouTube Video URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'yt1s_mp4',
        category: 'Downloads',
        name: "YouTube MP4 (yt1s Ajax)",
        desc: "High-quality YT to MP4 via yt1s.is Two-Step Ajax Engine (720p)",
        endpoint: "/api/ytmp4",
        params: [
            { name: "url", label: "YouTube Video URL" },
            { name: "quality", label: "Quality (720)", default: "720" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play.png"
    },
    {
        id: 'pinterest',
        category: 'Downloads',
        name: "Pinterest Video",
        desc: "Download Pinterest videos/images",
        endpoint: "/api/pinterest",
        params: [{ name: "url", label: "Pinterest URL" }],
        type: "GET",
        icon: "https://img.icons8.com/color/512/pinterest--v1.png"
    },
    {
        id: 'mediafire',
        category: 'Downloads',
        name: "MediaFire",
        desc: "Get direct download info",
        endpoint: "/api/mediafire",
        params: [{ name: "url", label: "MediaFire URL" }],
        type: "GET",
        icon: "https://img.icons8.com/color/512/mediafire.png"
    },
    {
        id: 'usersdrive',
        category: 'Downloads',
        name: "UsersDrive",
        desc: "Get UsersDrive file info",
        endpoint: "/api/usersdrive",
        params: [{ name: "url", label: "UsersDrive URL" }],
        type: "GET",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=usersdrive.com&sz=128"
    },
    {
        id: 'pixeldrain',
        category: 'Downloads',
        name: "Pixeldrain",
        desc: "Get Pixeldrain info",
        endpoint: "/api/pixeldrain",
        params: [{ name: "id", label: "File ID or URL" }],
        type: "GET",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=pixeldrain.com&sz=128"
    },
    {
        id: 'twitter_dl',
        category: 'Downloads',
        name: "Twitter Video",
        desc: "Download videos from X/Twitter (X.com)",
        endpoint: "/api/twitter",
        params: [{ name: "url", label: "Tweet URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/ios-filled/512/twitterx--v2.png"
    },
    {
        id: 'spotify_dl',
        category: 'Downloads',
        name: "Spotify",
        desc: "Download high-quality Spotify tracks via Search or URL",
        endpoint: "/api/spotify",
        params: [{ name: "q", label: "Song Name or URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/spotify--v1.png"
    },
    {
        id: 'gdrive_dl',
        category: 'Downloads',
        name: "GDrive Direct",
        desc: "Generate direct download links",
        endpoint: "/api/download/gdrive",
        params: [{ name: "url", label: "Google Drive URL" }],
        type: "GET",
        icon: "https://img.icons8.com/color/512/google-drive--v2.png"
    },
    {
        id: 'dl_sinhanada_mp3',
        category: 'Downloads',
        name: "DL: Sinhanada",
        desc: "Download from Sinhanada URL",
        endpoint: "/api/sinhanada/download",
        params: [{ name: "url", label: "Song Post URL" }],
        type: "GET",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=sinhanada.net&sz=128"
    },
    {
        id: 'dl_slmix_dj',
        category: 'Downloads',
        name: "DL: SLMix",
        desc: "Download from SLMix URL",
        endpoint: "/api/slmixlk/download",
        params: [{ name: "url", label: "Song Post URL" }],
        type: "GET",
        icon: "https://img.icons8.com/color/512/music-record.png"
    },
    {
        id: 'dl_pastpapers',
        category: 'Downloads',
        name: "DL: Past Papers",
        desc: "Get Download links from any URL",
        endpoint: "/api/download",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        icon: "https://img.icons8.com/color/512/pdf.png"
    },
    {
        id: 'dl_paperhub',
        category: 'Downloads',
        name: "DL: PaperHub",
        desc: "Get Download links for PaperHub.lk",
        endpoint: "/api/download",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        icon: "https://img.icons8.com/color/512/graduation-cap.png"
    },
    {
        id: 'pdf_ext',
        category: 'Downloads',
        name: "PDF Extractor",
        desc: "Extract PDF links from any URL",
        endpoint: "/api/download",
        params: [{ name: "url", label: "Post/Page URL" }],
        type: "GET",
        icon: "https://img.icons8.com/color/512/search-property.png"
    },
    // ==================== APK SEARCH & DOWNLOAD (v2 ULTRA) ====================
    {
        id: 'apk_search_v2',
        category: 'Downloads',
        name: "APK Search: Ultra v2",
        desc: "Find any Android app by name or package ID (@Tharuzz-ofc)",
        endpoint: "/api/search/apksearch",
        params: [{ name: "query", label: "Search Query" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://img.icons8.com/color/512/android-os.png"
    },
    {
        id: 'apk_download_v2',
        category: 'Downloads',
        name: "APK Download: Ultra v2",
        desc: "Get direct high-speed download links for any APK (@Tharuzz-ofc)",
        endpoint: "/api/download/apkdownload",
        params: [{ name: "id", label: "Package ID (e.g. com.whatsapp)" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://img.icons8.com/color/512/download-from-cloud.png"
    },
    {
        id: 'apk_search_global',
        category: 'Downloads',
        name: "APK: Search & Download",
        desc: "General purpose APK search and direct downloader",
        endpoint: "/api/search/apk",
        params: [{ name: "q", label: "App Name" }],
        type: "GET",
        status: "working",
        icon: "https://cdn-icons-png.flaticon.com/512/888/888841.png"
    },
    {
        id: 'apk_an1',
        category: 'Downloads',
        name: "APK: AN1 (MOD Search)",
        desc: "Search for premium MOD APKs from AN1.com",
        endpoint: "/api/apk/an1/search",
        params: [{ name: "q", label: "App Name" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=an1.com&sz=128"
    },
    {
        id: 'apk_happymod',
        category: 'Downloads',
        name: "APK: HappyMod (MOD Search)",
        desc: "Get working mods from HappyMod ecosystem",
        endpoint: "/api/apk/happymod/search",
        params: [{ name: "q", label: "App Name" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=happymod.com&sz=128"
    },
    {
        id: 'apk_apkpure',
        category: 'Downloads',
        name: "APK: APKPure Search",
        desc: "Official APK search via APKPure engine",
        endpoint: "/api/apk/apkpure/search",
        params: [{ name: "q", label: "App Name" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=apkpure.com&sz=128"
    },
    {
        id: 'apk_uptodown',
        category: 'Downloads',
        name: "APK: Uptodown Search",
        desc: "Secure APK search via Uptodown mirror",
        endpoint: "/api/apk/uptodown/search",
        params: [{ name: "q", label: "App Name" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=uptodown.com&sz=128"
    },

    // ==================== EDUCATION = : { new } ====================
    {
        id: 'edu_search',
        category: 'Education',
        name: "Education Search",
        desc: "Search school textbooks, past papers and materials",
        endpoint: "/api/academic/search",
        params: [{ name: "q", label: "Search Query (e.g. 'Science')" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://img.icons8.com/color/512/search-property.png"
    },
    {
        id: 'edu_notes',
        category: 'Education',
        name: "Short Notes SL",
        desc: "Search or browse Sri Lankan school short notes",
        endpoint: "/api/academic/notes",
        params: [{ name: "q", label: "Search Notes (Optional)" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://img.icons8.com/color/512/study.png"
    },
    {
        id: 'edu_dl',
        category: 'Education',
        name: "Edu Downloader",
        desc: "Extract PDF/Drive links from any Educational site",
        endpoint: "/api/academic/download",
        params: [{ name: "url", label: "Page URL (e.g. pastpapers.lk page)" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://img.icons8.com/color/512/pdf.png"
    },
    {
        id: 'edu_pastpapers',
        category: 'Education',
        name: "O/L Sinhala Past Papers",
        desc: "Get Sinhala medium O/L past papers from OLevelAPI",
        endpoint: "/api/academic/olevel/pastpapers",
        params: [],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=olevelapi.com&sz=128"
    },
    {
        id: 'edu_mcq',
        category: 'Education',
        name: "O/L MCQ Challenge",
        desc: "Interactive MCQ challenges for O/L students",
        endpoint: "/api/academic/myschool/mcq",
        params: [],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=myschool.lk&sz=128"
    },
    {
        id: 'edu_textbooks',
        category: 'Education',
        name: "School Textbooks",
        desc: "Official Govt Textbooks (Grade 1-13)",
        endpoint: "/api/academic/textbooks",
        params: [],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://img.icons8.com/color/512/book.png"
    },

    // ==================== MOVIES ====================
    // ==================== MOVIES (v2 ULTRA) ====================
    {
        id: 'movie_v2_cinesubz',
        category: 'Movies',
        name: "CineSubz: v2 (ULTRA)",
        desc: "Ultra high-speed movie scraper with direct links (Sonic Cloud Support)",
        endpoint: "/api/movie/cinesubz-download",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=cinesubz.lk&sz=128"
    },
    {
        id: 'movie_sinhalasub_direct_ultra',
        category: 'Movies',
        name: "Sinhala Sub: Direct DL (ULTRA)",
        desc: "Get direct 480p/720p/1080p download links from any Sinhala Sub movie page (Direct MP4)",
        endpoint: "/api/movie/download",
        params: [{ name: "url", label: "Movie Page URL (Cinesubz/Sinhalasub)" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://img.icons8.com/color/512/download-from-cloud.png"
    },
    {
        id: 'movie_cinesubz_search_ultra',
        category: 'Movies',
        name: "CineSubz: Ultra Search",
        desc: "High-speed search for CineSubz.lk",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Movie Title" }, { name: "provider", value: "cinesubz" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=cinesubz.lk&sz=128"
    },
    {
        id: 'movie_sinhalasub_v2_dl',
        category: 'Movies',
        name: "SinhalaSub: v2 (ULTRA DOWNLOAD)",
        desc: "Resolve Sinhalasub bypass links to direct high-speed download URLs",
        endpoint: "/api/movie/sinhalasub-download",
        params: [{ name: "url", label: "Link URL" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=sinhalasub.lk&sz=128"
    },
    {
        id: 'movie_sinhalasub_v2_search',
        category: 'Movies',
        name: "SinhalaSub: v2 (ULTRA SEARCH)",
        desc: "Ultra high-speed Sinhalasub searching engine with TMDB image support",
        endpoint: "/api/movie/sinhalasub-search",
        params: [{ name: "q", label: "Movie Title" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=sinhalasub.lk&sz=128"
    },
    {
        id: 'anime_animexin_search',
        category: 'Movies',
        name: "Animexin: Search",
        desc: "Search for high-quality anime and movies on Animexin",
        endpoint: "/api/anime/search",
        params: [{ name: "q", label: "Anime Title" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=animexin.dev&sz=128"
    },
    {
        id: 'anime_animexin_episodes',
        category: 'Movies',
        name: "Animexin: Episodes",
        desc: "Get all episodes for a specific anime series",
        endpoint: "/api/anime/episodes",
        params: [{ name: "url", label: "Anime Page URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://animexin.dev/wp-content/uploads/2021/04/cropped-animexin-logo-192x192.png"
    },
    {
        id: 'anime_animexin_dl',
        category: 'Movies',
        name: "Animexin: Download",
        desc: "Get direct download links for Animexin episodes",
        endpoint: "/api/anime/download",
        params: [{ name: "url", label: "Episode URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://animexin.dev/wp-content/uploads/2021/04/cropped-animexin-logo-192x192.png"
    },
    {
        id: 'movie_v2_search',
        category: 'Movie Old',
        name: "Cinema Search (Multi)",
        desc: "Search across 10+ providers (SinhalaSub, Cinesubz, Baiscope, Srihub...)",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search Query" }, { name: "provider", label: "Provider (sinhalasub, cinesubz, baiscope, srihub, pirate, zoom, moviesub, subslk, dinka)", default: "sinhalasub" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://cdn-icons-png.flaticon.com/512/4221/4221419.png"
    },
    {
        id: 'movie_baiscope_search_v2',
        category: 'Movie Old',
        name: "Baiscope: Search",
        desc: "Search for high-quality movie subtitles and links on Baiscope.lk",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Movie Title" }, { name: "provider", value: "baiscope" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=baiscope.lk&sz=128"
    },
    {
        id: 'movie_srihub_search_v2',
        category: 'Movie Old',
        name: "Srihub: Search",
        desc: "Search for Sinhala subbed movies on Srihub.store",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Movie Title" }, { name: "provider", value: "srihub" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://srihub.store/apple-touch-icon.png"
    },
    {
        id: 'movie_pirate_search_v2',
        category: 'Movie Old',
        name: "PirateLK: Search",
        desc: "Search for movies on Piratelk.com",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Movie Title" }, { name: "provider", value: "pirate" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=piratelk.com&sz=128"
    },
    {
        id: 'movie_zoom_search_v2',
        category: 'Movie Old',
        name: "ZoomLK: Search",
        desc: "Search for movies and subs on Zoom.lk",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Movie Title" }, { name: "provider", value: "zoom" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=zoom.lk&sz=128"
    },
    {
        id: 'movie_moviesub_search_v2',
        category: 'Movie Old',
        name: "Moviesub: Search",
        desc: "Search for subbed movies on Moviesub.is",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Movie Title" }, { name: "provider", value: "moviesub" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://moviesub.is/apple-touch-icon.png"
    },
    {
        id: 'movie_details_v2',
        category: 'Movie Old',
        name: "Movie Details (v2)",
        desc: "Get rich details and download links from any movie URL (V2 Engine)",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://cdn-icons-png.flaticon.com/512/3658/3658959.png"
    },
    {
        id: 'movie_cinesubz_pro',
        category: 'Movie Old',
        name: "CineSubz: PRO (ULTRA)",
        desc: "Specialized detail extractor for CineSubz.lk (Direct Links & Meta tags)",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "CineSubz Movie URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://cinesubz.lk/wp-content/uploads/2023/04/cropped-favicon-1-192x192.png"
    },
    {
        id: 'movie_sinhalasub_pro',
        category: 'Movie Old',
        name: "SinhalaSub: PRO (ULTRA)",
        desc: "Specialized detail extractor for Sinhalasub.lk (Direct Links & Meta tags)",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Sinhalasub Movie URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://v1.sinhalasub.lk/wp-content/uploads/2022/11/favicon.png"
    },
    {
        id: 'movie_sinhalasub_v2_info',
        category: 'Movie Old',
        name: "SinhalaSub: v2 (ULTRA INFO)",
        desc: "Get premium download links (UsersDrive, Pixeldrain) from Sinhalasub URL",
        endpoint: "/api/movie/sinhalasub-info",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        isNew: true,
        status: "working",
        icon: "https://v1.sinhalasub.lk/wp-content/uploads/2022/11/favicon.png"
    },
    {
        id: 'movie_subzlk_search_v2',
        category: 'Movie Old',
        name: "SubsLK: Search",
        desc: "Search for high-quality movie subtitles on Subzlk.com",
        endpoint: "/api/movie_v2/search",
        params: [{ name: "q", label: "Movie Title" }, { name: "provider", value: "subslk" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=subzlk.com&sz=128"
    },
    {
        id: 'movie_dinka_search_v2',
        category: 'Movie Old',
        name: "Dinka Movies: Search",
        desc: "Search for movies on DinkaMoviesLK",
        endpoint: "/api/movie_v2/search",
        params: [{ name: "q", label: "Movie Title" }, { name: "provider", value: "dinka" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=dinkamovieslk.app&sz=128"
    },

    // ==================== MOVIE OLD (STABLE) ====================
    // DL SECTION
    {
        id: 'dl_sinhalasub',
        category: 'Movie Old',
        name: "DL: SinhalaSub",
        desc: "Get Links from Sinhalasub URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://sinhalasub.lk/wp-content/uploads/2022/11/favicon.png"
    },
    {
        id: 'dl_baiscope',
        category: 'Movie Old',
        name: "DL: Baiscope",
        desc: "Get Links from Baiscope URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://www.baiscope.lk/wp-content/uploads/2019/06/favicon.png"
    },
    {
        id: 'dl_cinesubz',
        category: 'Movie Old',
        name: "DL: CineSubz",
        desc: "Get Links from CineSubz URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://cinesubz.lk/wp-content/uploads/2023/04/cropped-favicon-1-192x192.png"
    },
    {
        id: 'dl_pirate',
        category: 'Movie Old',
        name: "DL: Pirate",
        desc: "Get Links from PirateLK URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://piratelk.com/wp-content/uploads/2021/01/favicon.png"
    },
    {
        id: 'dl_zoom',
        category: 'Movie Old',
        name: "DL: Zoom",
        desc: "Get Links from Zoom URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://zoom.lk/wp-content/uploads/2021/08/cropped-favicon-1-180x180.png"
    },
    {
        id: 'dl_srihub',
        category: 'Movie Old',
        name: "DL: Srihub",
        desc: "Get Links from Srihub URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://srihub.store/apple-touch-icon.png"
    },
    {
        id: 'dl_moviesub',
        category: 'Movie Old',
        name: "DL: Moviesub",
        desc: "Get Links from Moviesub URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://moviesub.is/apple-touch-icon.png"
    },
    {
        id: 'dl_dinka',
        category: 'Movie Old',
        name: "DL: Dinka",
        desc: "Get Links from Dinka URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://www.dinkamovieslk.app/favicon.ico"
    },
    {
        id: 'dl_subslk',
        category: 'Movie Old',
        name: "DL: SubsLK",
        desc: "Get Links from SubsLK URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Page URL" }],
        type: "GET",
        status: "working",
        icon: "https://subzlk.com/wp-content/uploads/2020/07/cropped-Favicon-192x192.png"
    },
    {
        id: 'movie_details',
        category: 'Movie Old',
        name: "Movie Details",
        desc: "Get rich details from any movie URL",
        endpoint: "/api/movie/details",
        params: [{ name: "url", label: "Movie/Episode URL" }],
        type: "GET",
        status: "working",
        icon: "https://cdn-icons-png.flaticon.com/512/3658/3658959.png"
    },

    // SEARCH SECTION
    {
        id: 'movie_sinhalasub_search',
        category: 'Movie Old',
        name: "Movie: SinhalaSub",
        desc: "Search Sinhalasub.lk",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "sinhalasub" }],
        type: "GET",
        status: "working",
        icon: "https://sinhalasub.lk/wp-content/uploads/2022/11/favicon.png"
    },
    {
        id: 'movie_baiscope_search',
        category: 'Movie Old',
        name: "Movie: Baiscope",
        desc: "Search Baiscope.lk",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "baiscope" }],
        type: "GET",
        status: "working",
        icon: "https://www.baiscope.lk/wp-content/uploads/2019/06/favicon.png"
    },
    {
        id: 'movie_cinesubz_search',
        category: 'Movie Old',
        name: "Movie: CineSubz",
        desc: "Search Cinesubz.lk",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "cinesubz" }],
        type: "GET",
        status: "working",
        icon: "https://cinesubz.lk/wp-content/uploads/2023/04/cropped-favicon-1-192x192.png"
    },
    {
        id: 'movie_pirate_search',
        category: 'Movie Old',
        name: "Movie: Pirate",
        desc: "Search Piratelk.com",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "pirate" }],
        type: "GET",
        status: "working",
        icon: "https://piratelk.com/wp-content/uploads/2021/01/favicon.png"
    },
    {
        id: 'movie_zoom_search',
        category: 'Movie Old',
        name: "Movie: Zoom",
        desc: "Search Zoom.lk",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "zoom" }],
        type: "GET",
        status: "working",
        icon: "https://zoom.lk/wp-content/uploads/2021/08/cropped-favicon-1-180x180.png"
    },
    {
        id: 'movie_srihub_search',
        category: 'Movie Old',
        name: "Movie: Srihub",
        desc: "Search Srihub.store",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "srihub" }],
        type: "GET",
        status: "working",
        icon: "https://srihub.store/apple-touch-icon.png"
    },
    {
        id: 'movie_moviesub_search',
        category: 'Movie Old',
        name: "Movie: Moviesub",
        desc: "Search Moviesub.is",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "moviesub" }],
        type: "GET",
        status: "working",
        icon: "https://moviesub.is/apple-touch-icon.png"
    },
    {
        id: 'movie_dinka_search',
        category: 'Movie Old',
        name: "Movie: Dinka",
        desc: "Search Dinakamovieslk",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "dinka" }],
        type: "GET",
        status: "working",
        icon: "https://www.dinkamovieslk.app/favicon.ico"
    },
    {
        id: 'movie_subslk_search',
        category: 'Movie Old',
        name: "Movie: SubsLK",
        desc: "Search Subzlk.com",
        endpoint: "/api/movie/search",
        params: [{ name: "q", label: "Search query" }, { name: "provider", label: "Provider", value: "subslk" }],
        type: "GET",
        status: "working",
        icon: "https://subzlk.com/wp-content/uploads/2020/07/cropped-Favicon-192x192.png"
    },

    // ==================== AI TOOLS ====================
    {
        id: 'ai_image_gen_zoner',
        category: 'AI Tools',
        name: "AI Image Generator",
        desc: "Generate high-quality images from text (ZonerAI)",
        endpoint: "/api/ai/image/zoner",
        params: [
            { name: "p", label: "Image Prompt (e.g. 'cyberpunk cat')" },
            { name: "size", label: "Size (1024x1024)", default: "1024x1024" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/fluency/512/artificial-intelligence.png"
    },
    {
        id: 'ai_gpt5',
        category: 'AI Tools',
        name: "GPT-5 Mini",
        desc: "Latest GPT-5 light version (Fast & smart)",
        endpoint: "/api/ai/gpt5",
        params: [{ name: "q", label: "Ask anything..." }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/openai.png"
    },
    {
        id: 'ai_gpt4o',
        category: 'AI Tools',
        name: "GPT-4o Mini",
        desc: "High-speed AI for quick answers and suggestions",
        endpoint: "/api/ai/gpt4o",
        params: [{ name: "q", label: "Ask anything..." }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/openai.png"
    },
    {
        id: 'ai_deepseek_r1',
        category: 'AI Tools',
        name: "DeepSeek R1",
        desc: "Advanced reasoning model for deep thinking and coding",
        endpoint: "/api/ai/deepseek-r1",
        params: [{ name: "q", label: "Coding or complex task..." }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://avatars.githubusercontent.com/u/148332171?v=4"
    },
    {
        id: 'ai_deepseek_v3',
        category: 'AI Tools',
        name: "DeepSeek V3",
        desc: "Balanced AI for general chat and creative writing",
        endpoint: "/api/ai/deepseek",
        params: [{ name: "q", label: "General Chat..." }, { name: "v", label: "Version (3 or 3.2)", default: "3.2" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://avatars.githubusercontent.com/u/148332171?v=4"
    },
    {
        id: 'ai_gemini_flash',
        category: 'AI Tools',
        name: "Gemini Flash",
        desc: "Google's ultra-fast model for smart multitasking",
        endpoint: "/api/ai/gemini",
        params: [{ name: "q", label: "Ask Google's AI..." }, { name: "v", label: "Version (2.5 or 3)", default: "3" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/google-logo.png"
    },
    {
        id: 'ai_gemini_v3',
        category: 'AI Tools',
        name: "Gemini V3 Pro",
        desc: "Next-gen Gemini model with session/conversation support",
        endpoint: "/api/ai/gemini-v3",
        params: [
            { name: "q", label: "Ask anything..." }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/google-logo.png"
    },
    {
        id: 'ai_image_banana',
        category: 'AI Tools',
        name: "AI Image Gen (Banana)",
        desc: "Nano Banana Engine for unique AI artwork",
        endpoint: "/api/ai/image/banana",
        params: [
            { name: "p", label: "Image Prompt" },
            { name: "ratio", label: "Aspect Ratio (1:1, 16:9, 9:16)", default: "1:1" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/banana.png"
    },
    {
        id: 'ai_notegpt_v3',
        category: 'AI Tools',
        name: "NoteGPT V3",
        desc: "NoteGPT powered GPT-4.1 / DeepSeek model",
        endpoint: "/api/ai/notegpt-v3",
        params: [
            { name: "q", label: "Ask NoteGPT..." },
            { name: "model", label: "Model (gpt-4.1-mini, deepseek-chat)", default: "gpt-4.1-mini" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=notegpt.io&sz=128"
    },
    {
        id: 'ai_askai_free',
        category: 'AI Tools',
        name: "AskAI Free (GPT-4o)",
        desc: "Free access to ChatGPT 4o via AskAI.free",
        endpoint: "/api/ai/askai-free",
        params: [
            { name: "q", label: "Ask ChatGPT 4o..." }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=askai.free&sz=128"
    },
    {
        id: 'ai_image_crictos',
        category: 'AI Tools',
        name: "AI Image Gen (Crictos)",
        desc: "High-quality AI image generator (CRICTOS Engine)",
        endpoint: "/api/ai/image/crictos",
        params: [
            { name: "p", label: "Image Prompt (e.g. 'a futuristic city')" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        responseType: "image",
        icon: "https://img.icons8.com/color/512/sparkler.png"
    },
    {
        id: 'ai_blackbox',
        category: 'AI Tools',
        name: "Blackbox AI",
        desc: "Advanced coding and reasoning AI (Blackbox Engine)",
        endpoint: "/api/ai/blackbox",
        params: [
            { name: "q", label: "Ask Blackbox..." }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=blackbox.ai&sz=128"
    },
    {
        id: 'ai_perplexity',
        category: 'AI Tools',
        name: "Perplexity AI",
        desc: "Search-enhanced AI for up-to-date information",
        endpoint: "/api/ai/perplexity",
        params: [
            { name: "q", label: "Search with Perplexity..." }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=perplexity.ai&sz=128"
    },
    {
        id: 'ai_ddg',
        category: 'AI Tools',
        name: "DuckDuckGo AI",
        desc: "Privacy-focused AI chat (Powered by Llama/Mistral)",
        endpoint: "/api/ai/ddg",
        params: [
            { name: "q", label: "Ask DDG AI..." }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://s2.googleusercontent.com/s2/favicons?domain=duckduckgo.com&sz=128"
    },


    // ==================== NEWS ====================
    { id: 'news_adaderana', category: 'News', name: "News: AdaDerana", desc: "Latest AdaDerana Sinhala News", endpoint: "/api/news/adaderana", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=adaderana.lk&sz=128" },
    { id: 'news_hiru', category: 'News', name: "News: Hiru", desc: "Latest Hiru News", endpoint: "/api/news/hiru", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=hirunews.lk&sz=128" },
    { id: 'news_newsfirst', category: 'News', name: "News: NewsFirst", desc: "Latest NewsFirst Updates", endpoint: "/api/news/newsfirst", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=newsfirst.lk&sz=128" },
    { id: 'news_bbc', category: 'News', name: "News: BBC Sinhala", desc: "BBC Sinhala updates", endpoint: "/api/news/bbc", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=bbc.com&sz=128" },
    { id: 'news_gossiplanka', category: 'News', name: "News: GossipLanka", desc: "Gossip Lanka News", endpoint: "/api/news/gossiplankanews", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=gossiplankanews.com&sz=128" },
    { id: 'news_lankadeepa', category: 'News', name: "News: Lankadeepa", desc: "Lankadeepa Online", endpoint: "/api/news/lankadeepa", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=lankadeepa.lk&sz=128" },
    { id: 'news_dinamina', category: 'News', name: "News: Dinamina", desc: "Dinamina Feed", endpoint: "/api/news/dinamina", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=dinamina.lk&sz=128" },
    { id: 'news_mawbima', category: 'News', name: "News: Mawbima", desc: "Mawbima Feed", endpoint: "/api/news/mawbima", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=mawbima.lk&sz=128" },
    { id: 'news_dailymirror', category: 'News', name: "News: Daily Mirror", desc: "Daily Mirror Latest", endpoint: "/api/news/dailymirror", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=dailymirror.lk&sz=128" },
    { id: 'news_sundaytimes', category: 'News', name: "News: Sunday Times", desc: "Sunday Times Online", endpoint: "/api/news/sundaytimes", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=sundaytimes.lk&sz=128" },
    { id: 'news_divaina', category: 'News', name: "News: Divaina", desc: "Divaina Feed", endpoint: "/api/news/divaina", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=divaina.lk&sz=128" },
    { id: 'news_silumina', category: 'News', name: "News: Silumina", desc: "Silumina Newspaper", endpoint: "/api/news/silumina", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=silumina.lk&sz=128" },
    { id: 'news_all', category: 'News', name: "News: All-in-One", desc: "Aggregated news from top Sri Lankan sources", endpoint: "/api/news/all", params: [], type: "GET", isNew: true, icon: "https://cdn-icons-png.flaticon.com/512/2544/2544087.png" },
    { id: 'news_itn', category: 'News', name: "News: ITN News", desc: "ITN News Sri Lanka", endpoint: "/api/news/itnnews", params: [], type: "GET", isNew: true, icon: "https://s2.googleusercontent.com/s2/favicons?domain=itnnews.lk&sz=128" },
    { id: 'news_siyatha', category: 'News', name: "News: Siyatha", desc: "Siyatha News LK", endpoint: "/api/news/siyatha", params: [], type: "GET", isNew: true, icon: "https://s2.googleusercontent.com/s2/favicons?domain=siyathanews.lk&sz=128" },
    { id: 'news_neth', category: 'News', name: "News: Neth News", desc: "Neth News Sri Lanka", endpoint: "/api/news/nethnews", params: [], type: "GET", isNew: true, icon: "https://s2.googleusercontent.com/s2/favicons?domain=nethnews.lk&sz=128" },
    { id: 'news_newslk', category: 'News', name: "News: News.lk", desc: "Official Govt News Portal", endpoint: "/api/news/newslk", params: [], type: "GET", isNew: true, icon: "https://s2.googleusercontent.com/s2/favicons?domain=news.lk&sz=128" },
    { id: 'news_liveat', category: 'News', name: "News: Live @ SL", desc: "Live at Sri Lanka News", endpoint: "/api/news/liveatsrilanka", params: [], type: "GET", isNew: true, icon: "https://s2.googleusercontent.com/s2/favicons?domain=liveatsrilanka.lk&sz=128" },

    // ==================== TECH (SL) ====================
    { id: 'tech_androidwedakarayo', category: 'News', name: "Tech (SL): Android Wedakarayo", desc: "Sinhala Tech News", endpoint: "/api/news/androidwedakarayo", params: [], type: "GET", icon: "https://androidwedakarayo.com/wp-content/uploads/2020/05/cropped-site-icon-192x192.png" },
    { id: 'tech_techkatha', category: 'News', name: "Tech (SL): TechKatha", desc: "Sinhala Tech Community", endpoint: "/api/news/techkatha", params: [], type: "GET", icon: "https://www.techkatha.com/favicon.ico" },
    { id: 'tech_roar', category: 'News', name: "Tech (SL): Roar", desc: "Roar Tech Sinhala", endpoint: "/api/news/roar_tech", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=roar.media&sz=128" },
    { id: 'tech_technews_lk', category: 'News', name: "Tech (SL): Technews.lk", desc: "Latest LK Tech News", endpoint: "/api/news/technews_lk", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=technews.lk&sz=128" },
    { id: 'tech_tecroom', category: 'News', name: "Tech (SL): TecRoom", desc: "TecRoom Updates", endpoint: "/api/news/tecroom", params: [], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=tecroom.lk&sz=128" },

    { id: 'news_nhk', category: 'News', name: "News: NHK World", desc: "NHK News Japan", endpoint: "/api/news/nhk", params: [], type: "GET", icon: "https://www.nhk.or.jp/favicon.ico" },
    { id: 'news_japantoday', category: 'News', name: "News: Japan Today", desc: "Japan Today Feed", endpoint: "/api/news/japantoday", params: [], type: "GET", icon: "https://japantoday.com/favicon.ico" },
    { id: 'news_japantimes', category: 'News', name: "News: Japan Times", desc: "Japan Times World", endpoint: "/api/news/japantimes", params: [], type: "GET", icon: "https://www.japantimes.co.jp/favicon.ico" },
    { id: 'news_bbcworld', category: 'News', name: "News: BBC World", desc: "BBC News World Edition", endpoint: "/api/news/bbcworld", params: [], type: "GET", icon: "https://www.bbc.com/favicon.ico" },
    { id: 'news_cnn', category: 'News', name: "News: CNN World", desc: "CNN International News", endpoint: "/api/news/cnn", params: [], type: "GET", icon: "https://edition.cnn.com/favicon.ico" },
    { id: 'news_nytimes', category: 'News', name: "News: NY Times", desc: "New York Times World", endpoint: "/api/news/nytimes", params: [], type: "GET", icon: "https://www.nytimes.com/favicon.ico" },
    { id: 'news_foxnews', category: 'News', name: "News: Fox News", desc: "Fox News World", endpoint: "/api/news/foxnews", params: [], type: "GET", icon: "https://www.foxnews.com/favicon.ico" },
    { id: 'news_reuters', category: 'News', name: "News: Reuters", desc: "Reuters World News", endpoint: "/api/news/reuters", params: [], type: "GET", icon: "https://www.reuters.com/pf/resources/images/reuters/favicon/favicon.ico" },
    { id: 'news_aljazeera', category: 'News', name: "News: Al Jazeera", desc: "Al Jazeera English News", endpoint: "/api/news/aljazeera", params: [], type: "GET", icon: "https://www.aljazeera.com/favicon.ico" },

    // ==================== TECH NEWS ====================
    { id: 'news_techcrunch', category: 'News', name: "Tech: TechCrunch", desc: "Startup and Technology News", endpoint: "/api/news/techcrunch", params: [], type: "GET", icon: "https://techcrunch.com/favicon.ico" },
    { id: 'news_theverge', category: 'News', name: "Tech: The Verge", desc: "Technology, Science, Art", endpoint: "/api/news/theverge", params: [], type: "GET", icon: "https://www.theverge.com/favicon.ico" },
    { id: 'news_wired', category: 'News', name: "Tech: Wired", desc: "Future of Technology", endpoint: "/api/news/wired", params: [], type: "GET", icon: "https://www.wired.com/favicon.ico" },
    { id: 'news_gizmodo', category: 'News', name: "Tech: Gizmodo", desc: "Design, Tech, Science", endpoint: "/api/news/gizmodo", params: [], type: "GET", icon: "https://gizmodo.com/favicon.ico" },
    { id: 'news_engadget', category: 'News', name: "Tech: Engadget", desc: "Technology News & Reviews", endpoint: "/api/news/engadget", params: [], type: "GET", icon: "https://www.engadget.com/favicon.ico" },

    // ==================== SEARCH ====================
    { id: 'pastpapers', category: 'Search', name: "Past Papers Search", desc: "Search across multiple sources", endpoint: "/api/pastpapers", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/3306/3306631.png" },
    { id: 'paperhub', category: 'Search', name: "PaperHub Lookup", desc: "Search paperhub.lk", endpoint: "/api/search/paperhub", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=paperhub.lk&sz=128" },
    { id: 'wp_all', category: 'Search', name: "Wallpaper: 4K", desc: "Find 4K wallpapers", endpoint: "/api/search/wallpaper", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/3596/3596009.png" },
    { id: 'wp_2', category: 'Search', name: "Wallpaper: Craft", desc: "Find wallpapers from Craft", endpoint: "/api/search/wallpaper2", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=wallpaperscraft.com&sz=128" },
    { id: 'wp_3', category: 'Search', name: "Wallpaper: Live", desc: "Find live MP4 wallpapers", endpoint: "/api/search/wallpaper3", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=mylivewallpapers.com&sz=128" },
    { id: 'img_search', category: 'Search', name: "Image: Unsplash", desc: "High quality image search", endpoint: "/api/search/img", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://unsplash.com/favicon.ico" },
    { id: 'img_pixabay', category: 'Search', name: "Image: Pixabay", desc: "Search Pixabay library", endpoint: "/api/search/pixabay", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=pixabay.com&sz=128" },
    { id: 'apk_search', category: 'Search', name: "APK Search", desc: "Search and download APKs", endpoint: "/api/search/apk", params: [{ name: "q", label: "App Name" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/888/888841.png" },
    { id: 'pinterest_search', category: 'Search', name: "Pinterest Search", desc: "Search high-quality pins", endpoint: "/api/search/pinterest", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://img.icons8.com/color/512/pinterest--v1.png" },
    { id: 'google_search', category: 'Search', name: "Google Search", desc: "Search Google (V3 Fast)", endpoint: "/api/search/google", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/300/300221.png" },
    { id: 'google_image', category: 'Search', name: "Google Images", desc: "Search Google Images", endpoint: "/api/search/google/image", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" },
    { id: 'sinhanada', category: 'Search', name: "Sinhanada MP3", desc: "Search Sinhala MP3s", endpoint: "/api/sinhanada", params: [{ name: "q", label: "Song Title" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/9395/9395515.png" },
    { id: 'slmix', category: 'Search', name: "SLMix DJ", desc: "Search Sri Lankan DJ Remixes", endpoint: "/api/slmixlk", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/9395/9395679.png" },
    {
        id: 'tiktok_search',
        category: 'Search',
        name: "TikTok Search",
        desc: "Find trending TikTok videos",
        endpoint: "/api/search/tiktok",
        params: [{ name: "q", label: "Search Keyboard" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/tiktok.png"
    },
    {
        id: 'telegram_sticker',
        category: 'Downloaders',
        name: "Telegram Sticker DL",
        desc: "Download Sticker Packs from Telegram",
        endpoint: "/api/sticker/download",
        params: [{ name: "url", label: "Sticker Pack URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/512px-Telegram_logo.svg.png"
    },
    {
        id: 'google_search_pro',
        category: 'Search',
        name: "Google Search (Web)",
        desc: "Classic Google Search with live web results",
        endpoint: "/api/search/google",
        params: [{ name: "q", label: "Search Query" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/google-logo.png"
    },
    {
        id: 'youtube_search',
        category: 'Search',
        name: "YouTube Search",
        desc: "Search YouTube videos directly",
        endpoint: "/api/search/youtube",
        params: [{ name: "q", label: "Search Keyword" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://img.icons8.com/color/512/youtube-play--v1.png"
    },
    {
        id: 'npm_search_tool',
        category: 'Search',
        name: "NPM Search",
        desc: "Search packages on NPM registry",
        endpoint: "/api/search/npm",
        params: [{ name: "q", label: "Package Name" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://cdn-icons-png.flaticon.com/512/2103/2103533.png"
    },

    // ==================== UTILITY ====================
    { id: 'translate', category: 'Utility', name: "Translate", desc: "Multi-language translator", endpoint: "/api/tools/translate", params: [{ name: "text", label: "Text to Translate" }, { name: "lang", label: "Target Language (e.g. si)", default: "si" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/280/280821.png" },
    { id: 'shorturl', category: 'Utility', name: "Short URL", desc: "Create short links fast", endpoint: "/api/tools/shorturl", params: [{ name: "url", label: "Long URL" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/3596/3596009.png" },
    { id: 'qrcode', category: 'Utility', name: "QR Code", desc: "Generate custom QR codes", endpoint: "/api/tools/qrcode", params: [{ name: "text", label: "Text for QR Code" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/714/714390.png" },
    { id: 'fancy', category: 'Utility', name: "Fancy Text", desc: "Transform text into styles", endpoint: "/api/tools/fancy", params: [{ name: "text", label: "Text to Transform" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/461/461238.png" },
    { id: 'lyrics_finder', category: 'Utility', name: "Lyrics Finder", desc: "Search and download lyrics", endpoint: "/api/lyrics/get", params: [{ name: "title", label: "Song Title" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/12202/12202568.png" },
    { id: 'currency', category: 'Utility', name: "Currency", desc: "Real-time converter (e.g. USD to LKR)", endpoint: "/api/tools/currency", params: [{ name: "amount", label: "Amount", default: "1" }, { name: "from", label: "From (e.g. USD)", default: "USD" }, { name: "to", label: "To (e.g. LKR)", default: "LKR" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/2933/2933900.png" },
    { id: 'ip_info', category: 'Utility', name: "IP/Domain Info", desc: "Detailed geolocation data", endpoint: "/api/tools/ip", params: [{ name: "domain", label: "Domain (e.g. google.com)" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/124/124010.png" },
    { id: 'github', category: 'Utility', name: "GitHub User", desc: "Get GitHub user profile", endpoint: "/api/tools/github", params: [{ name: "username", label: "GitHub Username" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/25/25231.png" },
    { id: 'screenshot', category: 'Utility', name: "Web Screenshot", desc: "Take a screenshot of a website", endpoint: "/api/tools/screenshot", params: [{ name: "url", label: "Website URL" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/527/527960.png" },
    { id: 'tempmail_1sec', category: 'Utility', name: "Temp Mail (Default)", desc: "1secmail service", endpoint: "/api/tools/tempmail", params: [], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/561/561127.png" },
    { id: 'inbox_1sec', category: 'Utility', name: "Inbox (Default)", desc: "Check 1secmail inbox", endpoint: "/api/tools/tempmail/inbox", params: [{ name: "email", label: "Full Email Address" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/561/561124.png" },
    { id: 'tempmail_yomail', category: 'Utility', name: "Temp Mail (Yomail)", desc: "Yomail scraper service", endpoint: "/api/tools/tempmail/yomail", params: [], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/561/561127.png" },
    { id: 'inbox_yomail', category: 'Utility', name: "Inbox (Yomail)", desc: "Check Yomail inbox", endpoint: "/api/tools/tempmail/yomail/inbox", params: [{ name: "id", label: "Session ID" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/561/561124.png" },
    { id: 'ff_info', category: 'Utility', name: "Free Fire Info", desc: "Get FF Player Info by UID", endpoint: "/api/tools/freefire", params: [{ name: "uid", label: "Player UID" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/8244/8244464.png" },
    { id: 'cf_check', category: 'Utility', name: "Cloudflare Check", desc: "Check if site uses Cloudflare", endpoint: "/api/tools/cloudflare", params: [{ name: "url", label: "URL to Check" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/1042/1042300.png" },
    { id: 'savetext', category: 'Utility', name: "Save Text", desc: "Quickly save notes to pastebin", endpoint: "/api/tools/savetext", params: [{ name: "text", label: "Text to Save" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/2091/2091665.png" },
    { id: 'wa_channel', category: 'Utility', name: "WA Channel Info", desc: "Get WhatsApp Channel Details", endpoint: "/api/tools/wachannelinfo", params: [{ name: "url", label: "Channel URL" }], type: "GET", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1024px-WhatsApp.svg.png" },
    {
        id: 'tts_voxbox',
        category: 'Utility',
        name: "VoxBox TTS",
        desc: "Multi-model AI Text to Speech",
        endpoint: "/api/tools/text-to-speech",
        params: [
            { name: "text", label: "Text to Convert" },
            { name: "model", label: "Voice Model", default: "kendrick_lamar" }
        ],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://cdn-icons-png.flaticon.com/512/1000/1000782.png"
    },
    {
        id: 'tinyurl_tool',
        category: 'Utility',
        name: "TinyURL",
        desc: "Shorten links with TinyURL",
        endpoint: "/api/tools/tinyurl",
        params: [{ name: "url", label: "Target URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://cdn-icons-png.flaticon.com/512/3596/3596009.png"
    },
    {
        id: 'web2zip_tool',
        category: 'Utility',
        name: "Web2Zip",
        desc: "Download complete websites as ZIP",
        endpoint: "/api/tools/web2zip",
        params: [{ name: "url", label: "Website URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://cdn-icons-png.flaticon.com/512/3596/3596009.png"
    },
    {
        id: 'webcheck_tool',
        category: 'Utility',
        name: "WebCheck",
        desc: "Full Site SEO & Security Audit",
        endpoint: "/api/tools/webcheck",
        params: [{ name: "url", label: "Website URL" }],
        type: "GET",
        status: "working",
        isNew: true,
        icon: "https://cdn-icons-png.flaticon.com/512/1042/1042300.png"
    },
    { id: 'tts_tool', category: 'Utility', name: "Text to Speech", desc: "Convert text to MP3 audio", endpoint: "/api/tools/tts", params: [{ name: "text", label: "Text to Convert" }, { name: "lang", label: "Language (e.g. en, si)", default: "en" }], type: "GET", icon: "https://cdn-icons-png.flaticon.com/512/1000/1000782.png" },

    // ==================== ADULT (18+) ====================
    { id: 'xnxx_search', category: 'Adult', name: "XNXX Search", desc: "Search videos on XNXX", endpoint: "/api/adult/xnxx/search", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=xnxx.com&sz=128" },
    { id: 'xnxx_dl', category: 'Adult', name: "XNXX Download", desc: "Extract XNXX Download Links", endpoint: "/api/adult/xnxx/download", params: [{ name: "url", label: "XNXX Video URL" }], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=xnxx.com&sz=128" },
    { id: 'ph_search', category: 'Adult', name: "Pornhub Search", desc: "Search videos on Pornhub", endpoint: "/api/adult/ph/search", params: [{ name: "q", label: "Search Query" }], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=pornhub.com&sz=128" },
    { id: 'ph_dl', category: 'Adult', name: "Pornhub Download", desc: "Extract PH Download Links", endpoint: "/api/adult/ph/download", params: [{ name: "url", label: "PH Video URL" }], type: "GET", icon: "https://s2.googleusercontent.com/s2/favicons?domain=pornhub.com&sz=128" },
];
