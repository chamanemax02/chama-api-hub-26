import { Phone, Mail, Globe, MessageCircle, Send, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

export function Contact() {
    const ContactCard = ({ icon, title, value, link, color }) => (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="api-card"
            style={{
                textDecoration: 'none',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1.5rem 2rem'
            }}
        >
            <div className="logo-icon" style={{ background: color, margin: 0, minWidth: '50px' }}>
                {icon}
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{title}</h3>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{value}</p>
            </div>
        </a>
    );

    return (
        <div className="animate-slide-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="hero-section" style={{ minHeight: 'auto', padding: '2rem 0', marginBottom: '3rem' }}>
                <div className="hero-text">
                    <h1 style={{ fontSize: '4.5rem' }}>GET IN TOUCH</h1>
                    <p>Have questions, suggestions, or just want to say hi? Connect with us through any of our official channels.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
                <ContactCard
                    icon={<MessageCircle size={24} />}
                    title="WhatsApp"
                    value="+94 78 3314 361"
                    link="https://wa.me/94783314361"
                    color="#25D366"
                />
                <ContactCard
                    icon={<Facebook size={24} />}
                    title="Facebook"
                    value="Chama Official"
                    link="https://www.facebook.com/profile.php?id=61565589215967"
                    color="#1877F2"
                />
                <ContactCard
                    icon={<Linkedin size={24} />}
                    title="LinkedIn"
                    value="LinkedIn Profile"
                    link="https://www.linkedin.com/in/chamindu-ransika-2008-chama"
                    color="#0A66C2"
                />
                <ContactCard
                    icon={<Mail size={24} />}
                    title="Email"
                    value="ransikachamindu43@gmail.com"
                    link="mailto:ransikachamindu43@gmail.com"
                    color="#4b5563"
                />
            </div>

            <div className="api-card" style={{ padding: '3rem' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: '#fff' }}>SEND A MESSAGE</h2>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="field-group">
                            <label>Name</label>
                            <input type="text" className="param-input" placeholder="Your Name" />
                        </div>
                        <div className="field-group">
                            <label>Email</label>
                            <input type="email" className="param-input" placeholder="Your Email" />
                        </div>
                    </div>
                    <div className="field-group">
                        <label>Message</label>
                        <textarea className="param-input" rows="5" placeholder="How can we help you?" style={{ resize: 'none' }}></textarea>
                    </div>
                    <button type="button" className="btn-send">
                        <Send size={20} />
                        Submit Request
                    </button>
                </form>
            </div>
        </div >
    );
}
