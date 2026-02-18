import React, { useState, useEffect } from 'react';
import { Activity, Users, Battery, Globe, Eye, Zap } from 'lucide-react';
import axios from 'axios';

export function StatsGrid() {
    const [stats, setStats] = useState({ totalCalls: 0, activeUsers: 0 });
    const [ip, setIp] = useState('Detecting...');
    const [battery, setBattery] = useState({ level: 100, charging: true });
    const [visitors, setVisitors] = useState({ today: 42, total: 5157 });

    useEffect(() => {
        fetchStats();
        fetchIp();
        initBattery();
        trackVisitor();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const trackVisitor = async () => {
        try {
            const res = await axios.get('/api/auth/track-visitor');
            if (res.data.status) {
                setVisitors(res.data.stats);
            }
        } catch (e) { }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/auth/admin/stats');
            if (res.data.status) {
                setStats(res.data.stats);
                if (res.data.stats.visitors) {
                    setVisitors(res.data.stats.visitors);
                }
            }
        } catch (e) { }
    };

    const fetchIp = async () => {
        try {
            const res = await axios.get('https://api.ipify.org?format=json');
            setIp(res.data.ip);
        } catch (e) {
            setIp('0.0.0.0');
        }
    };

    const initBattery = () => {
        if (navigator.getBattery) {
            navigator.getBattery().then(bat => {
                const update = () => {
                    setBattery({
                        level: Math.floor(bat.level * 100),
                        charging: bat.charging
                    });
                };
                update();
                bat.addEventListener('levelchange', update);
                bat.addEventListener('chargingchange', update);
            });
        }
    };

    const StatCard = ({ icon: Icon, label, value, sub, color }) => (
        <div className="stat-card glass" style={{ borderColor: `${color}33` }}>
            <div className="stat-header">
                <div className="stat-icon-box" style={{ background: `${color}11`, color: color }}>
                    <Icon size={24} />
                </div>
                <div>
                    <div className="stat-label" style={{ color: color }}>{label}</div>
                    <div className="stat-value">{value}</div>
                </div>
            </div>
            <div className="stat-footer">
                <Activity size={12} /> {sub}
            </div>
        </div>
    );

    return (
        <div className="stats-grid animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
        }}>
            <StatCard icon={Zap} label="TOTAL API CALLS" value={stats.totalCalls.toLocaleString()} sub="+12% from last week" color="#d946ef" />
            <StatCard icon={Users} label="ACTIVE USERS" value={stats.activeUsers.toLocaleString()} sub="+5 new today" color="#3b82f6" />
            <StatCard icon={Battery} label="BATTERY STATUS" value={`${battery.level}%`} sub={battery.charging ? "Charging" : "On Battery"} color="#10b981" />
            <StatCard icon={Globe} label="IP ADDRESS" value={ip} sub="Secure Connection" color="#f59e0b" />
            <StatCard icon={Eye} label="TODAY VISITORS" value={visitors.today} sub="Updated just now" color="#06b6d4" />
            <StatCard icon={Users} label="TOTAL VISITORS" value={visitors.total.toLocaleString()} sub="All-time record" color="#8b5cf6" />
        </div>
    );
}
