import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { User, UserRole } from '../../types';

export const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { dispatch } = useStore();

  // Email passed from signup page via router state
  const email = (location.state as any)?.email || '';

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      showToast('No email found. Please signup again.', 'error');
      navigate('/signup');
    }
  }, [email, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showToast('Please enter the 6-digit OTP', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'OTP verification failed';
        showToast(errorMessage, 'error');
        return;
      }

      const { accessToken, refreshToken, user: apiUser } = data.data;

      // Persist tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Build the user object and log them in immediately after verification
      const user: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role as UserRole,
        phone: '',
        createdAt: new Date().toISOString(),
        profileComplete: false,
        resume: null,
        experience: [],
        education: [],
        skills: [],
        savedJobs: [],
        appliedJobs: [],
      };

      dispatch({ type: 'LOGIN', payload: user });
      showToast(`Welcome, ${user.name}! Your account is verified.`, 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand" onClick={() => navigate('/')}>
          <div className="auth-brand-logo">JM</div>
          <span className="auth-brand-text">JobMarket</span>
        </div>
        <div className="auth-left-content">
          <h1>One step away from <span>India's Industrial Job Network</span></h1>
          <p>
            We've generated a 6-digit OTP. Check the backend console and enter it below to verify your account.
          </p>
        </div>
        <div className="auth-float-shape"></div>
        <div className="auth-float-shape"></div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Verify Your Account</h2>
            <p className="auth-subtitle">
              Enter the 6-digit OTP for <strong>{email}</strong>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">OTP Code <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                autoFocus
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                The OTP is printed in the backend console (terminal running <code>npm run dev</code> in the <code>backend</code> folder).
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isLoading}
              style={{ background: 'var(--gradient-accent)' }}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="auth-switch">
            Wrong email? <Link to="/signup">Sign up again</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
