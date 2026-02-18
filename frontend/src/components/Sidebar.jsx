import { Home, Zap, User, LogOut, Info, Phone, Shield, MessageSquare, Activity } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

export function Sidebar({ handleLogout, user }) {
    const location = useLocation();

    const NavItem = ({ icon, label, to, matchPrefix }) => {
        const isActive = to ? location.pathname === to : false;
        const isMatched = matchPrefix ? location.pathname.startsWith(matchPrefix) : isActive;

        return (
            <NavLink
                to={to}
                className={() => `nav-item ${isMatched ? 'active' : ''}`}
            >
                {icon}
                <span>{label}</span>
            </NavLink>
        );
    };

    return (
        <aside className="sidebar">
            <div className="logo-section">
                <div className="logo-icon">
                    <img src="/logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="logo" />
                </div>
                <div>
                    <span className="logo-text">CHAMA HUB</span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, margin: 0 }}>PREMIUM HUB</p>
                </div>
            </div>

            <nav className="nav-menu">
                <NavItem icon={<Home size={20} />} label="Home" to="/" />
                <NavItem icon={<Activity size={20} />} label="Endpoints" to="/apis/all" matchPrefix="/apis/" />
                <NavItem icon={<MessageSquare size={20} />} label="Live Chat" to="/chat" />
                <NavItem icon={<User size={20} />} label="Terminal" to="/terminal" />
                {user?.role === 'admin' && <NavItem icon={<Shield size={20} />} label="Admin" to="/admin" />}
                <NavItem icon={<Info size={20} />} label="About" to="/about" />
                <NavItem icon={<Phone size={20} />} label="Contact" to="/contact" />
                <NavItem icon={<Shield size={20} />} label="Privacy Policy" to="/privacy" />

                <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="nav-item logout-btn" onClick={handleLogout} style={{ color: '#ef4444' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </div>
                </div>
            </nav>
        </aside>
    );
}
