// index.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { securityShield, helmet, hpp, xss } = require("./backend/middleware");

const app = express();

// DEBUG: Log all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url} (OriginalUrl: ${req.originalUrl})`);
  next();
});

// DEBUG: Test route
app.get("/api/debug", (req, res) => {
  res.json({ status: true, message: "Debug route is working!" });
});

// 1. Security
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://*.google.com"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://*.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com", "https://*.google.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.google.com"],
      imgSrc: ["'self'", "data:", "https://*", "http:*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://*", "http:*"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://*.google.com"],
      frameAncestors: ["'self'"],
      workerSrc: ["'self'", "blob:"]
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "no-referrer-when-downgrade" }
}));

// 2. Core Middlewares
app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(xss());
app.use(hpp());
app.use(securityShield);

// 3. Import Middlewares & Routes
const { checkBalance } = require("./backend/middleware");
const systemRouter = require("./backend/system");
const movieRouter = require("./backend/movie");
const searchRouter = require("./backend/search");
const mediaRouter = require("./backend/media");
const aiRouter = require("./backend/ai");
const imageRouter = require("./backend/image");
const aiImgHandler = require("./backend/aiimg");
const animeRouter = require("./backend/anime");
const toolsRouter = require("./backend/tools");
const newsRouter = require("./backend/news");
const academicRouter = require("./backend/academic");
const stickerRouter = require("./backend/sticker");
const adultRouter = require("./backend/media"); // adult is merged into media

// Root /api info (Moved up to take precedence)
app.get("/api", (req, res) => {
  res.json({
    status: true,
    creator: "Chama Ofc",
    project: "Chama API Hub",
    version: "2.0.0",
    info: "Consolidated Backend API"
  });
});

// 4. Routes Registration
app.use("/api/news", newsRouter);
app.use("/api/auth", systemRouter);
app.use("/api/system", systemRouter); // Keep a backup mounting point
app.use("/api", systemRouter); // Maintain backward compatibility for non-auth system routes
app.use("/api/academic", checkBalance(1), academicRouter);
app.use("/api/sticker", checkBalance(1), stickerRouter);
app.use("/api/movie", checkBalance(1), movieRouter);
app.use("/api/movie_v2", checkBalance(1), movieRouter);
app.use("/api/search", checkBalance(1), searchRouter);
app.use("/api/apk", checkBalance(1), searchRouter);
app.use("/api/lyrics", checkBalance(1), searchRouter);
app.use("/api/pastpapers", checkBalance(1), searchRouter);
app.use("/api/media", checkBalance(1), mediaRouter);
app.use("/api/download", checkBalance(1), mediaRouter);
// Expose all media routes directly under /api (e.g. /api/spotify, /api/facebook)
app.use("/api", checkBalance(1), mediaRouter);

app.use("/api/ai", checkBalance(1), aiRouter);
app.use("/api/image", checkBalance(1), imageRouter);
app.use("/api/ephoto", checkBalance(1), imageRouter);
app.use("/api/anime", checkBalance(1), animeRouter);
app.use("/api/adult", checkBalance(1), mediaRouter);
app.use("/api/tools", checkBalance(1), toolsRouter);
app.get("/api/ai/image/zoner", checkBalance(1), aiImgHandler);

// Root /api info


app.get("/api/health", (req, res) => {
  res.json({ status: true, message: "Server is ALIVE", timestamp: new Date().toISOString() });
});

// Serve Frontend Static Files
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// SPA Catch-all
// SPA Catch-all & API 404
app.all('*', (req, res) => {
  // If it's a backend API route that wasn't matched above, return 404 JSON
  // Only match /api or /api/... but NOT /apis...
  const isBackend = req.path === '/api' || (req.path.startsWith('/api/') && !req.path.startsWith('/apis'));

  if (isBackend) {
    console.log(`[DEBUG] Backend 404: ${req.method} ${req.url}`);
    return res.status(404).json({ status: false, error: "Backend API Route not found" });
  }

  // Serve Frontend SPA
  const indexPath = path.join(publicPath, "index.html");
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Only log if not found (reduce noise)
    if (req.method === 'GET') {
      console.error(`Frontend directory: ${publicPath}`);
      console.error(`Index not found at: ${indexPath}`);
    }
    res.status(404).send(`Frontend not found. Please run 'npm run build' locally. (Path: ${indexPath})`);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("UNCAUGHT ERROR:", err);
  res.status(500).json({
    status: false,
    error: "Internal Server Error",
    msg: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server (Only when NOT on Vercel, Netlify, or Cloudflare Workers)
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL && !process.env.NETLIFY && typeof addEventListener === 'undefined') {
  app.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
  });
}

// Export for Vercel/Node
module.exports = app;

// Export for Cloudflare Workers (ES Module format)
export default {
  async fetch(request, env, ctx) {
    // Note: To run full Express on CF Workers, you usually need a wrapper.
    // This export satisfies the Wrangler build requirement.
    return app(request, env, ctx);
  },
};
