import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <>
      <section style={{ background: 'var(--gradient-hero)', padding: 'var(--space-20) 0', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontSize: 'var(--fs-4xl)', marginBottom: 'var(--space-4)' }}>About JobMarket</h1>
          <p style={{ fontSize: 'var(--fs-lg)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto' }}>
            India's most trusted job marketplace, connecting talented professionals with the best companies since 2020.
          </p>
        </div>
      </section>
      
      <section style={{ padding: 'var(--space-16) 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="grid grid-3" style={{ gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
            <div className="stat-card" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--space-8)' }}>
              <div className="stat-icon primary" style={{ marginBottom: 'var(--space-4)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 'var(--fs-2xl)' }}>10M+</h3>
              <p className="text-secondary text-sm">Active Users</p>
            </div>
            <div className="stat-card" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--space-8)' }}>
              <div className="stat-icon accent" style={{ marginBottom: 'var(--space-4)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 'var(--fs-2xl)' }}>500K+</h3>
              <p className="text-secondary text-sm">Jobs Posted</p>
            </div>
            <div className="stat-card" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--space-8)' }}>
              <div className="stat-icon success" style={{ marginBottom: 'var(--space-4)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 'var(--fs-2xl)' }}>2M+</h3>
              <p className="text-secondary text-sm">Successful Hires</p>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-12)' }}>
            <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-4)' }}>Our Mission</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>
              At JobMarket, we believe everyone deserves access to meaningful employment. Our platform bridges the gap between talented professionals and forward-thinking organizations across India. We leverage technology and human insight to create a seamless hiring experience for both job seekers and employers.
            </p>
          </div>

          <div style={{ marginBottom: 'var(--space-12)' }}>
            <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-4)' }}>Why Choose JobMarket?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { icon: '🚀', title: 'Smart Job Matching', desc: 'AI-powered recommendations that match your skills with the right opportunities.' },
                { icon: '🔒', title: 'Verified Companies', desc: 'Every employer on our platform goes through a rigorous verification process.' },
                { icon: '⚡', title: 'Instant Applications', desc: 'Apply to jobs with a single click using your saved profile and resume.' },
                { icon: '📊', title: 'Real-time Analytics', desc: 'Track your application status and profile views in real-time.' }
              ].map(item => (
                <div key={item.title} className="card" style={{ padding: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: 48, height: 48, background: 'var(--primary-50)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'var(--fs-base)', marginBottom: 2 }}>{item.title}</h3>
                      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default AboutPage;
