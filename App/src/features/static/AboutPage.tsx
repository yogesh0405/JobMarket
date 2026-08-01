import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Hero Banner */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #344BFD 100%)', padding: '40px 16px', textAlign: 'center', color: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>About JobMarket</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
            India's most trusted industrial and factory job marketplace, connecting skilled professionals with top companies.
          </p>
        </div>
      </section>

      <section style={{ padding: '24px 12px', maxWidth: '960px', margin: '0 auto' }}>
        {/* FOUR STATS IN ONE SINGLE ROW */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '8px', 
          marginBottom: '28px' 
        }}>
          {/* Stat 1 */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #cbd5e1', 
            borderRadius: '6px', 
            padding: '12px 6px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>10M+</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '600', whiteSpace: 'nowrap' }}>Active Users</p>
          </div>

          {/* Stat 2 */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #cbd5e1', 
            borderRadius: '6px', 
            padding: '12px 6px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>500K+</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '600', whiteSpace: 'nowrap' }}>Jobs Posted</p>
          </div>

          {/* Stat 3 */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #cbd5e1', 
            borderRadius: '6px', 
            padding: '12px 6px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>2M+</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '600', whiteSpace: 'nowrap' }}>Successful Hires</p>
          </div>

          {/* Stat 4 */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #cbd5e1', 
            borderRadius: '6px', 
            padding: '12px 6px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>50K+</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '600', whiteSpace: 'nowrap' }}>Companies</p>
          </div>
        </div>

        {/* OUR MISSION */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>Our Mission</h2>
          <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: 1.6, margin: 0 }}>
            At JobMarket, we believe everyone deserves access to meaningful employment. Our platform bridges the gap between skilled workers and top organizations across India. We leverage AI-powered matching to make hiring fast, transparent, and direct for candidate and recruiter alike.
          </p>
        </div>

        {/* WHY CHOOSE JOBMARKET */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', letterSpacing: '-0.3px' }}>Why Choose JobMarket?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#344BFD" strokeWidth="2.2"><path d="M4.5 16.5c-1.5 1.26-2 3.43-2 3.43s2.17-.5 3.43-2C8.32 15.58 11.58 13 15 13c5.52 0 7-6.5 7-6.5s-6.5 1.48-6.5 7c0 3.42-2.58 6.68-4.96 9.04z" /><path d="M9 15l3-3" /></svg>,
                title: 'Smart Job Matching',
                desc: 'AI-powered recommendations that match your skills with suitable job opportunities.'
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#344BFD" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
                title: 'Verified Employers',
                desc: 'Every company on our platform goes through a rigorous identity verification process.'
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#344BFD" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
                title: 'Instant Applications',
                desc: 'Apply to jobs instantly with a single click using your saved profile and resume.'
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#344BFD" strokeWidth="2.2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
                title: 'Real-time Tracking',
                desc: 'Track your application progress, shortlist updates, and scheduled interview status in real-time.'
              }
            ].map(item => (
              <div key={item.title} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 3px 0' }}>{item.title}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default AboutPage;
