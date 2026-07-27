import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import '../../admin/styles/admin.css';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const role = (currentUser.role || '').toLowerCase().trim();
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, 'admin');
      if (result.success) {
        showToast('Access Granted. Welcome to the Admin Control Panel.', 'success');
        navigate('/admin/dashboard');
      } else {
        showToast(result.error || 'Invalid credentials or access denied.', 'error');
      }
    } catch (err) {
      showToast('Login failed. Please check network connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: 'var(--bg-dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-form-container" style={{ width: '420px', background: 'var(--surface)', padding: '40px', borderRadius: '8px', boxShadow: 'var(--shadow-2xl)', border: '1px solid var(--border)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', background: 'var(--primary)', color: 'white', fontWeight: 'bold', width: '48px', height: '48px', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px', boxShadow: 'var(--shadow-glow)' }}>
            JM
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Admin Control Panel</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Authorized personnel access only</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px', fontWeight: '600' }}>Admin Email</label>
            <input
              type="email"
              className="form-input"
              style={{ background: 'var(--border-light)', padding: '10px 14px' }}
              placeholder="admin@csnjobmarket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ background: 'var(--border-light)', padding: '10px 14px', width: '100%' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px', background: 'var(--gradient-accent)' }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          🔒 This session is monitored and recorded for auditing purposes.
        </div>
      </div>
    </div>
  );
};
export default AdminLoginPage;
