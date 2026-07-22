import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Message sent! We'll get back to you soon.", 'success');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <>
      <section style={{ background: 'var(--gradient-hero)', padding: 'var(--space-20) 0', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontSize: 'var(--fs-4xl)', marginBottom: 'var(--space-4)' }}>Contact Us</h1>
          <p style={{ fontSize: 'var(--fs-lg)', color: 'rgba(255,255,255,0.7)' }}>We'd love to hear from you. Reach out to us anytime.</p>
        </div>
      </section>

      <section style={{ padding: 'var(--space-16) 0' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="grid grid-2" style={{ gap: 'var(--space-12)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-6)' }}>Get in Touch</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div className="stat-icon primary" style={{ width: 48, height: 48, flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ marginBottom: 2 }}>Email</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>support@jobmarket.com</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div className="stat-icon accent" style={{ width: 48, height: 48, flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ marginBottom: 2 }}>Phone</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>+91 98765 43210</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div className="stat-icon success" style={{ width: 48, height: 48, flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ marginBottom: 2 }}>Address</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                      123 Innovation Drive, Koramangala<br/>Bangalore, Karnataka 560034
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <form className="card" style={{ padding: 'var(--space-8)' }} onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="How can we help?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Tell us more..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-full">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default ContactPage;
