import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, Check, Copy, Mail, MessageSquare, ExternalLink, LogOut, Layout, Menu, X, Shield, Zap, Activity, ShoppingBag, AlertTriangle, User, Github } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { APICard } from './components/APICard';
import { APIModal } from './components/APIModal';
import { Profile } from './components/Profile';
import { apiList, categories } from './data/apiList';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { AdminPanel } from './components/AdminPanel';
import { LiveChat } from './components/LiveChat';
import { SupportChat } from './components/SupportChat';
import { NewsFeed } from './components/NewsFeed';
import { StatsGrid } from './components/StatsGrid';
import { Bot } from 'lucide-react';
import './App.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

console.log("--- CHAMA API HUB v1.1.0 LOADED ---");

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'DASHBOARD';
    if (path.startsWith('/apis/')) {
      const cat = path.split('/')[2]?.replace(/-/g, ' ').toUpperCase() || 'CATALOG';
      return `CHAMAAPI / ${cat}`;
    }
    return path.substring(1).toUpperCase().replace(/\//g, ' / ');
  };

  const getActiveTab = (pathname) => {
    if (pathname === '/' || pathname === '/home') return 'Home';
    if (pathname.startsWith('/apis/')) return 'API';
    if (pathname === '/chat') return 'Chat';
    if (pathname === '/terminal') return 'Profile';
    if (pathname === '/admin') return 'Admin';
    if (pathname === '/about') return 'About';
    if (pathname === '/contact') return 'Contact';
    return 'Home';
  };

  const activeTab = getActiveTab(location.pathname);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedApi, setSelectedApi] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [news, setNews] = useState([]);
  const [categoryStatuses, setCategoryStatuses] = useState({});

  const CLIENT_ID = "913109613888-8of14n9l2ekh0eu2rvnelltkabct88ph.apps.googleusercontent.com";
  const GITHUB_CLIENT_ID = "Ov23liaEm4ZLYQHLQfLk"; // Updated from screenshot

  const fetchNews = async () => {
    try {
      const res = await axios.get('/api/auth/news/list');
      if (res.data.status) setNews(res.data.news);
    } catch (e) {
      console.error("News fetch error:", e);
    }
  };

  const fetchCategoryStatuses = async () => {
    try {
      const res = await axios.get('/api/auth/categories/status');
      if (res.data.status) setCategoryStatuses(res.data.statuses);
    } catch (e) {
      console.error("Category fetch error:", e);
    }
  };

  const refreshUserData = async (uid) => {
    try {
      const res = await axios.get(`/api/auth/user-data?uid=${uid}`);
      if (res.data.status) {
        setUser(res.data.user);
        localStorage.setItem('chama_user_session', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error("User refresh error:", e);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchCategoryStatuses();
    /* global google */
    const loadGSI = () => {
      if (typeof google === 'undefined') {
        setTimeout(loadGSI, 100);
        return;
      }

      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        context: 'signin',
        ux_mode: 'popup'
      });

      const savedUser = localStorage.getItem('chama_user_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        refreshUserData(parsed.uid || parsed.id); // Sync with DB
        setLoading(false);
      } else {
        renderGoogleButton();
        setLoading(false);
      }
    };

    loadGSI();
  }, []);

  // Sync category from URL
  useEffect(() => {
    if (location.pathname.startsWith('/apis/')) {
      const catPath = location.pathname.split('/')[2]; // /apis/news -> news
      if (catPath) {
        const matched = categories.find(c =>
          c.toLowerCase().replace(/\s+/g, '-') === catPath.toLowerCase()
        );
        if (matched) setSelectedCategory(matched);
        else if (catPath === 'all') setSelectedCategory('All');
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user && !loading) {
      setTimeout(renderGoogleButton, 500);
    }
  }, [user, loading]);

  const renderGoogleButton = () => {
    const btnContainer = document.getElementById("googleBtn");
    if (btnContainer && typeof google !== 'undefined') {
      console.log("CHAMA: Rendering Google Button");
      google.accounts.id.renderButton(btnContainer, {
        theme: "filled_blue",
        size: "large",
        width: 320,
        shape: "pill"
      });
      // Also trigger One-tap as fallback
      google.accounts.id.prompt((notification) => {
        console.log("CHAMA: One-tap status:", notification.getMomentType());
      });
    }
  };

  const handleGoogleResponse = async (response) => {
    console.log("CHAMA: Google Response Received", response);
    try {
      setLoading(true);
      if (!response.credential) throw new Error("No credential returned");

      const decoded = jwtDecode(response.credential);
      console.log("CHAMA: Decoded User:", decoded.email);

      const res = await axios.post('/api/auth/google-sync', {
        uid: decoded.sub,
        email: decoded.email,
        displayName: decoded.name,
        photoURL: decoded.picture
      });

      if (res.data.status) {
        setUser(res.data.user);
        localStorage.setItem('chama_user_session', JSON.stringify(res.data.user));
        console.log("CHAMA: Login Success");
      }
    } catch (e) {
      console.error("CHAMA: Login Error", e);
      alert("Login Error: " + (e.message || "Failed to sync"));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = () => {
    const scope = "read:user user:email";
    const redirectUri = window.location.origin + '/home';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scope}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  // Handle GitHub Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code && !user) {
      const syncGithub = async () => {
        try {
          setLoading(true);
          // In a production app, the backend would exchange the code for a token.
          // For this hub, we'll implement a 'GitHub Sync' flow.
          // Since we need to get user info, we'll assume the backend handles the exchange.
          const res = await axios.post('/api/auth/github-oauth', { code });
          if (res.data.status) {
            setUser(res.data.user);
            localStorage.setItem('chama_user_session', JSON.stringify(res.data.user));
            // Clean URL
            window.history.replaceState({}, document.title, "/home");
          }
        } catch (e) {
          console.error("GitHub Login Error:", e);
        } finally {
          setLoading(false);
        }
      };
      syncGithub();
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chama_user_session');
    /* global google */
    if (typeof google !== 'undefined') {
      google.accounts.id.disableAutoSelect();
    }
    navigate('/');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090a12' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#05060b', padding: '2rem' }}>
        <div className="login-card animate-slide-up" style={{
          background: 'rgba(28, 30, 45, 0.4)',
          backdropFilter: 'blur(40px)',
          padding: '3rem 2.5rem',
          borderRadius: '40px',
          width: '100%',
          maxWidth: '430px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          zIndex: 10
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <img src="/logo.png" style={{ width: 100, height: 100, borderRadius: '30px', boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)', border: '2px solid rgba(139, 92, 246, 0.3)' }} alt="logo" />
          </div>
          <h2 style={{ color: 'white', marginBottom: '0.75rem', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', background: 'linear-gradient(to right, #fff, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CHAMA HUB</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 500 }}>The Ultimate API Matrix</p>

          <div className="login-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%', marginBottom: '2rem' }}>
            <div id="googleBtn" style={{ minHeight: '44px', display: 'flex', justifyContent: 'center', width: '100%' }}></div>

            <button
              onClick={loginWithGithub}
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '44px',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#1a1c2e',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#24292e';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#1a1c2e';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
              }}
              className="github-login-btn"
            >
              <Github size={20} />
              <span style={{ letterSpacing: '0.3px' }}>Continue with GitHub</span>
            </button>
          </div>

          <div className="login-features" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '1rem' }}>
            <div className="feat-item glass" style={{ padding: '15px', borderRadius: '20px', textAlign: 'center' }}>
              <MessageSquare size={24} color="#d946ef" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ color: 'white', fontSize: '0.85rem', margin: 0 }}>Global Chat</h4>
              <p style={{ color: '#6b7280', fontSize: '0.65rem' }}>Connect with users</p>
            </div>
            <div className="feat-item glass" style={{ padding: '15px', borderRadius: '20px', textAlign: 'center' }}>
              <Shield size={24} color="#3b82f6" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ color: 'white', fontSize: '0.85rem', margin: 0 }}>Admin Portal</h4>
              <p style={{ color: '#6b7280', fontSize: '0.65rem' }}>Management Panel</p>
            </div>
          </div>
        </div>

        {news.length > 0 && (
          <div className="login-news-preview glass animate-fade-in" style={{ marginTop: '2.5rem', maxWidth: '430px', width: '100%', padding: '1.5rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <Zap size={18} color="#d946ef" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Latest Broadcasts</h3>
            </div>
            <div className="news-item-mini" style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#e2e8f0', fontSize: '0.9rem' }}>{news[0].title}</h4>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {news[0].content}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
      <Sidebar user={user} handleLogout={handleLogout} />

      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="breadcrumbs hide-mobile">
              <span className="crumb-root">ChamaAPI</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">{activeTab}</span>
            </div>
          </div>

          <div className="header-actions">
            <div className="points-badge hide-mobile">{user.role?.toUpperCase()}</div>
            <div style={{ position: 'relative' }}>
              <div className="user-avatar" onClick={() => setShowUserMenu(!showUserMenu)} style={{ cursor: 'pointer' }}>
                <img src={user.photoURL} alt="user" />
              </div>

              {showUserMenu && (
                <div className="user-dropdown glass animate-fade-in">
                  <div className="dropdown-header">
                    <h4 className="dropdown-title">USER PROFILE</h4>
                  </div>
                  <div className="dropdown-body">
                    <div className="profile-info-mini">
                      <label>USERNAME</label>
                      <div className="info-box">{user.displayName}</div>
                    </div>
                    <div className="profile-info-mini">
                      <label>API KEY</label>
                      <div className="info-box key-box">
                        <span className="key-text">{user.apikey || 'No Key'}</span>
                        <button className="copy-btn-mini" onClick={() => {
                          navigator.clipboard.writeText(user.apikey);
                          alert("API Key copied to matrix!");
                        }}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="profile-info-mini">
                      <label>API LIMIT</label>
                      <div className="info-box">UNLIMITED REQUESTS</div>
                    </div>

                    <div className="dropdown-actions">
                      <button className="drop-btn profile" onClick={() => { navigate('/terminal'); setShowUserMenu(false); }}>
                        <User size={16} /> PROFILE
                      </button>
                      <button className="drop-btn shop">
                        <ShoppingBag size={16} /> SHOP
                      </button>
                      <button className="drop-btn logout" onClick={handleLogout}>
                        <LogOut size={16} /> LOGOUT
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-body">
          <Routes>
            <Route path="/" element={
              <div className="dashboard-home">
                <h1 className="cyber-title" style={{ fontSize: '3rem', marginBottom: '3rem' }}>CHAMA <span style={{ color: 'var(--primary)' }}>HUB</span> API <span style={{ fontSize: '0.9rem', opacity: 0.4, fontWeight: 400 }}>v1.2.1</span></h1>
                <StatsGrid />
                <Hero username={user.displayName} />
                <div style={{ marginTop: '4rem' }} id="news-section">
                  <NewsFeed news={news} />
                </div>
              </div>
            } />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/apis" element={<Navigate to="/apis/all" replace />} />
            <Route path="/apis/:cat" element={
              <div className="api-catalog">
                <div className="catalog-header">
                  <div>
                    <h2 style={{ margin: 0 }}>API Catalog</h2>
                    <p className="subtitle">Powerful tools at your fingertips.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="system-health-badge glass" style={{ padding: '8px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} color="#10b981" className="animate-pulse" />
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>ALL SYSTEMS NOMINAL</span>
                    </div>
                  </div>
                  <div className="category-tabs">
                    {categories.filter(cat => {
                      if (cat === 'All' || cat === 'Movie Old') return true;
                      return categoryStatuses[cat]?.status !== 'off';
                    }).map(cat => (
                      <button
                        key={cat}
                        className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(cat);
                          navigate(`/apis/${cat.toLowerCase().replace(/\s+/g, '-')}`);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="api-catalog-content">
                  {categories.filter(cat => {
                    if (cat === 'All') return false;
                    if (cat === 'Movie Old') return true;
                    return categoryStatuses[cat]?.status !== 'off';
                  }).map(cat => (
                    (() => {
                      const filteredApis = apiList.filter(api => api.category === cat);
                      if (selectedCategory !== 'All' && selectedCategory !== cat) return null;
                      if (filteredApis.length === 0) return null;
                      return (
                        <div key={cat} className="category-group">
                          <div className="category-header">
                            <Layout size={18} color="var(--primary)" />
                            <h2 style={{ margin: 0, fontSize: '1rem' }}>{cat.toUpperCase()}</h2>
                          </div>

                          {cat === 'Movies' && (
                            <div className="coming-soon-banner animate-pulse-green" style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '15px',
                              background: 'rgba(16, 185, 129, 0.1)',
                              borderColor: 'rgba(16, 185, 129, 0.4)'
                            }}>
                              <Zap size={24} color="#10b981" />
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 900, letterSpacing: '1px', color: '#10b981' }}>MOVIE v2 ULTRA IS LIVE</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Sonic Cloud & Ultra-speed bypass are now active. Enjoy premium downloads.</div>
                              </div>
                            </div>
                          )}

                          <div className="api-grid">
                            {filteredApis.map(api => (
                              <APICard key={api.id} api={api} onClick={() => setSelectedApi(api)} />
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  ))}
                </div>
              </div>
            } />
            <Route path="/endpoints" element={<Navigate to="/apis/all" replace />} />
            <Route path="/terminal" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/chat" element={<LiveChat user={user} />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel user={user} onRefreshCategories={fetchCategoryStatuses} /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {selectedApi && <APIModal selectedApi={selectedApi} user={user} onClose={() => setSelectedApi(null)} />}
      {sidebarOpen && <div className="mobile-overlay" onClick={toggleSidebar} />}
      {showSupport && <SupportChat user={user} onClose={() => setShowSupport(false)} />}

      <div className="floating-actions" style={{ position: 'fixed', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 100 }}>
        {location.pathname !== '/chat' && (
          <div className="floating-chat-bubble" style={{ position: 'relative', bottom: 'auto', right: 'auto' }} onClick={() => navigate('/chat')}>
            <MessageSquare size={24} />
            <div className="notification-dot"></div>
          </div>
        )}
        <div className="floating-ai-bubble" onClick={() => setShowSupport(!showSupport)} style={{
          width: '60px',
          height: '60px',
          background: 'var(--primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(217, 70, 239, 0.4)',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}>
          <Bot size={24} />
          <div style={{ position: 'absolute', top: '5px', right: '5px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #000' }}></div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function PrivacyPolicy() {
  return (
    <div className="glass" style={{ padding: '3rem', borderRadius: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="cyber-title" style={{ marginBottom: '2rem' }}>Privacy <span style={{ color: 'var(--primary)' }}>Policy</span></h1>
      <div style={{ color: '#9ca3af', lineHeight: '1.8' }}>
        <p>Your privacy is important to us. This policy explains how we handle your information.</p>
        <h3 style={{ color: 'white', marginTop: '1.5rem' }}>Data Collection</h3>
        <p>We only collect data necessary to provide our API services, such as your usage logs and basic account information.</p>
        <h3 style={{ color: 'white', marginTop: '1.5rem' }}>Usage</h3>
        <p>Your data is used solely for service improvements and security monitoring.</p>
        <h3 style={{ color: 'white', marginTop: '1.5rem' }}>Protection</h3>
        <p>We use industry-standard encryption to protect your account and API keys.</p>
      </div>
    </div>
  );
}

export default App;
