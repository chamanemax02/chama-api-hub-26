require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, child, update } = require('firebase/database');
const crypto = require('crypto');

// Firebase Configuration via Environment Variables
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCxuAnL0Mds3HJpozjCXATNHLUe47ZyHo",
  authDomain: "api-site-chama.firebaseapp.com",
  databaseURL: "https://api-site-chama-default-rtdb.firebaseio.com",
  projectId: "api-site-chama",
  storageBucket: "api-site-chama.firebasestorage.app",
  messagingSenderId: "227223028806",
  appId: "1:227223028806:web:fce09f4dc0daa1e0a03647",
  measurementId: "G-BMFG8YVYMQ"
};
// Initialize Firebase with safety check
let db;
try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_')) {
        console.error("CRITICAL: FIREBASE_API_KEY is missing or invalid!");
    }
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
} catch (error) {
    console.error("Firebase Initialization Error:", error.message);
    // Provide a mock db or handle error gracefully in functions
}

// Generate API Key
const generateKey = () => {
    return 'chama_' + crypto.randomBytes(16).toString('hex');
};

const DB = {
    // Get user by API Key
    getUserByKey: async (apikey) => {
        return await DB.getUserByFastKey(apikey);
    },

    // Get user by ID (Firebase UID)
    getUserById: async (id) => {
        try {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `users/${id}`));
            if (!snapshot.exists()) return null;
            const userData = snapshot.val();
            return { ...userData, id: userData.id || userData.uid, uid: userData.uid || userData.id };
        } catch (e) {
            console.error("Firebase Read Error:", e);
            return null;
        }
    },

    // Create or Update user from Google/GitHub Data
    saveUser: async (userData) => {
        const { uid, email, displayName, photoURL, provider } = userData;
        const isAdmin = email === 'ransikachamindu43@gmail.com';

        try {
            const existing = await DB.getUserById(uid);

            if (existing) {
                const updated = {
                    ...existing,
                    displayName: displayName || existing.displayName,
                    photoURL: photoURL || existing.photoURL,
                    provider: provider || existing.provider || 'google',
                    role: isAdmin ? 'admin' : (existing.role || 'user'),
                    lastLogin: new Date().toISOString()
                };

                // Ensure they have an API key
                if (!updated.apikey) {
                    updated.apikey = generateKey();
                    await set(ref(db, `keys/${updated.apikey}`), uid);
                }

                await update(ref(db, `users/${uid}`), updated);
                return updated;
            }

            // Create New
            const apikey = generateKey();
            const newUser = {
                id: uid,
                uid,
                email,
                displayName,
                photoURL,
                provider: provider || 'google',
                apikey,
                role: isAdmin ? 'admin' : 'user',
                joined: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                totalRequests: 0,
                coins: 100, // Default coins for new users
                theme: 'dark'
            };

            await set(ref(db, `users/${uid}`), newUser);
            await set(ref(db, `keys/${apikey}`), uid);
            return newUser;
        } catch (e) {
            console.error("Firebase Save User Error:", e);
            return null;
        }
    },

    // Fast lookup by Key
    getUserByFastKey: async (apikey) => {
        try {
            const dbRef = ref(db);
            const keySnapshot = await get(child(dbRef, `keys/${apikey}`));
            if (!keySnapshot.exists()) return null;

            const uid = keySnapshot.val();
            const userSnapshot = await get(child(dbRef, `users/${uid}`));
            return userSnapshot.exists() ? userSnapshot.val() : null;
        } catch (e) {
            console.error("Firebase Fast Lookup Error:", e);
            return null;
        }
    },

    // Regenerate API Key
    regenerateKey: async (uid) => {
        try {
            const user = await DB.getUserById(uid);
            if (!user) return null;

            // Delete old key index
            if (user.apikey) {
                await set(ref(db, `keys/${user.apikey}`), null);
            }

            const newKey = generateKey();
            await update(ref(db, `users/${uid}`), { apikey: newKey });
            await set(ref(db, `keys/${newKey}`), uid);

            return newKey;
        } catch (e) {
            console.error("Key Regen Error:", e);
            return null;
        }
    },

    // Log Request
    logRequest: async (uid, endpoint, ip, method = 'GET') => {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                endpoint,
                ip,
                method,
                country: "Unknown"
            };

            const user = await DB.getUserById(uid);
            const logs = [logEntry, ...(user.logs || [])].slice(0, 50);

            await update(ref(db, `users/${uid}`), {
                logs,
                totalRequests: (user.totalRequests || 0) + 1
            });

            // Increment global stats
            const statsRef = ref(db, 'stats/global');
            const statsSnap = await get(statsRef);
            let globalCalls = 0;
            if (statsSnap.exists()) {
                globalCalls = statsSnap.val().totalCalls || 0;
            }
            await update(statsRef, { totalCalls: globalCalls + 1 });

            return true;
        } catch (e) {
            console.error("Log Request Error:", e);
            return false;
        }
    },

    // Track Visitor
    trackVisitor: async (ip) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const statsRef = ref(db, 'stats/visitors');
            const snap = await get(statsRef);

            let data = { total: 0, today: {} };
            if (snap.exists()) data = snap.val();

            data.total = (data.total || 0) + 1;
            data.today = data.today || {};
            data.today[today] = (data.today[today] || 0) + 1;

            await set(statsRef, data);
            return { today: data.today[today], total: data.total };
        } catch (e) {
            return { today: 0, total: 0 };
        }
    },

    // Update Profile
    updateProfile: async (uid, data) => {
        try {
            await update(ref(db, `users/${uid}`), data);
            return true;
        } catch (e) {
            return false;
        }
    },

    // Get Global Stats
    getGlobalStats: async () => {
        try {
            const statsSnap = await get(ref(db, 'stats/global'));
            const usersSnap = await get(ref(db, 'users'));
            const visitorsSnap = await get(ref(db, 'stats/visitors'));

            const totalCalls = statsSnap.exists() ? statsSnap.val().totalCalls : 0;
            let activeUsers = 0;

            if (usersSnap.exists()) {
                const users = usersSnap.val();
                const now = new Date();
                const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

                Object.values(users).forEach(user => {
                    if (user.lastLogin) {
                        const lastLogin = new Date(user.lastLogin);
                        if (lastLogin > oneDayAgo) activeUsers++;
                    }
                });
            }

            const visitors = visitorsSnap.exists() ? visitorsSnap.val() : { total: 5157, today: {} };
            const todayKey = new Date().toISOString().split('T')[0];
            const todayVisitors = visitors.today ? (visitors.today[todayKey] || 42) : 42;

            return { totalCalls, activeUsers, visitors: { total: visitors.total || 5157, today: todayVisitors } };
        } catch (e) {
            return { totalCalls: 0, activeUsers: 0, visitors: { total: 5157, today: 42 } };
        }
    },

    // Log System Alerts (Broken APIs, etc)
    logSystemAlert: async (type, data) => {
        try {
            const id = Date.now().toString();
            const alert = {
                id,
                type,
                ...data,
                timestamp: new Date().toISOString()
            };
            await set(ref(db, `system/alerts/${id}`), alert);
            return true;
        } catch (e) {
            return false;
        }
    },
    // Get System Alerts
    getSystemAlerts: async () => {
        try {
            const snap = await get(ref(db, 'system/alerts'));
            if (!snap.exists()) return [];
            return Object.values(snap.val()).reverse();
        } catch (e) {
            return [];
        }
    },

    // Get All Users (Admin Only)
    getAllUsers: async () => {
        try {
            const snap = await get(ref(db, 'users'));
            if (!snap.exists()) return [];
            return Object.values(snap.val());
        } catch (e) {
            return [];
        }
    },

    // Get All Logs Across All Users (Admin Only)
    getAllLogs: async () => {
        try {
            const usersSnap = await get(ref(db, 'users'));
            if (!usersSnap.exists()) return [];

            let allLogs = [];
            const users = usersSnap.val();
            Object.keys(users).forEach(uid => {
                const user = users[uid];
                if (user.logs) {
                    user.logs.forEach(log => {
                        allLogs.push({
                            ...log,
                            user: user.displayName || user.email,
                            email: user.email
                        });
                    });
                }
            });

            // Sort by timestamp descending
            return allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 500);
        } catch (e) {
            return [];
        }
    },

    // -- News Management --
    saveNews: async (newsData) => {
        try {
            const id = Date.now().toString();
            const news = {
                id,
                ...newsData,
                timestamp: new Date().toISOString()
            };
            await set(ref(db, `system/news/${id}`), news);
            return news;
        } catch (e) {
            return null;
        }
    },

    getNews: async () => {
        try {
            const snap = await get(ref(db, 'system/news'));
            if (!snap.exists()) return [];
            return Object.values(snap.val()).sort((a, b) => b.id - a.id);
        } catch (e) {
            return [];
        }
    },

    deleteNews: async (id) => {
        try {
            await set(ref(db, `system/news/${id}`), null);
            return true;
        } catch (e) {
            return false;
        }
    },

    // -- Live Chat Management --
    sendChatMessage: async (chatData) => {
        try {
            const id = Date.now().toString();
            const message = {
                id,
                ...chatData,
                timestamp: new Date().toISOString()
            };
            await set(ref(db, `system/chat/${id}`), message);
            return message;
        } catch (e) {
            return null;
        }
    },

    getChatMessages: async () => {
        try {
            const snap = await get(ref(db, 'system/chat'));
            if (!snap.exists()) return [];
            const data = snap.val();
            return Object.keys(data).map(key => ({
                ...data[key],
                id: key
            })).sort((a, b) => a.id - b.id).slice(-100);
        } catch (e) {
            return [];
        }
    },

    deleteChatMessage: async (id) => {
        try {
            await set(ref(db, `system/chat/${id}`), null);
            return true;
        } catch (e) {
            return false;
        }
    },

    editChatMessage: async (id, text) => {
        try {
            await set(ref(db, `system/chat/${id}/text`), text);
            return true;
        } catch (e) {
            return false;
        }
    },

    // -- Category Management --
    updateCategoryStatus: async (category, status) => {
        try {
            await set(ref(db, `system/categories/${category}`), {
                status, // 'on' or 'off'
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (e) {
            console.error("Category Update Error:", e);
            return false;
        }
    },

    getCategoryStatuses: async () => {
        try {
            const snap = await get(ref(db, 'system/categories'));
            if (!snap.exists()) return {};
            return snap.val();
        } catch (e) {
            return {};
        }
    },

    // -- Coin System Management --
    addCoins: async (uid, amount) => {
        try {
            const user = await DB.getUserById(uid);
            if (!user) return false;
            const newBalance = (user.coins || 0) + parseInt(amount);
            await update(ref(db, `users/${uid}`), { coins: newBalance });
            return true;
        } catch (e) {
            console.error("Add Coins Error:", e);
            return false;
        }
    },

    deductCoins: async (uid, amount) => {
        try {
            const user = await DB.getUserById(uid);
            if (!user) return false;
            const currentBalance = user.coins || 0;
            if (currentBalance < amount) return false;

            const newBalance = currentBalance - amount;
            await update(ref(db, `users/${uid}`), { coins: newBalance });
            return true;
        } catch (e) {
            console.error("Deduct Coins Error:", e);
            return false;
        }
    },

    setCoins: async (uid, balance) => {
        try {
            await update(ref(db, `users/${uid}`), { coins: parseInt(balance) });
            return true;
        } catch (e) {
            console.error("Set Coins Error:", e);
            return false;
        }
    },

    updateCoinsSetting: async (enabled, costPerRequest) => {
        try {
            await set(ref(db, 'system/settings/coins'), {
                enabled,
                costPerRequest: parseInt(costPerRequest),
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (e) {
            console.error("Update Coins Setting Error:", e);
            return false;
        }
    },

    getCoinsSetting: async () => {
        try {
            const snap = await get(ref(db, 'system/settings/coins'));
            if (!snap.exists()) return { enabled: false, costPerRequest: 1 };
            return snap.val();
        } catch (e) {
            return { enabled: false, costPerRequest: 1 };
        }
    }
};

module.exports = DB;
