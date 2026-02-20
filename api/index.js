const app = require('../index.js');
const serverless = require('serverless-http');

const handler = serverless(app);

// Export for Netlify
module.exports.handler = handler;

// For Vercel/Local compatibility, we can assign the handler to the app object 
// or just export the app as the default if not on Netlify.
// But the safest for Netlify is to have exports.handler.
// Let's use a conditional or just export both correctly.

module.exports = app;
module.exports.handler = handler;
