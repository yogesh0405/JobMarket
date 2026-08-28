import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserRole } from '../../types';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';
import { ShieldCheck, ArrowLeft, KeyRound, Eye, EyeOff, Check, Briefcase, User as UserIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import bannerImg from '../../assets/auth_group_banner.jpg';
import '../../styles/auth.css';

// Google G Logo SVG
const GoogleGLogo: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, loginWithGoogle, verify2FALogin, currentUser } = useAuth();
  const { showToast } = useToast();

  const roleParam = searchParams.get('role') as UserRole;
  const role: UserRole = (roleParam === 'candidate' || roleParam === 'employer') ? roleParam : 'candidate';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // 2FA Login Verification State
  const [is2FAMode, setIs2FAMode] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const result = await loginWithGoogle({ accessToken: tokenResponse.access_token }, role);
        if (result.success) {
          showToast(`Welcome back, ${result.user?.name || ''}!`, 'success');
          if (result.user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          showToast(result.error || 'Google Sign-In failed.', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Google Sign-In failed', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      showToast('Google Sign-In was cancelled or failed.', 'error');
    },
  });

  // Handle Google OAuth Direct Redirect Callback (#access_token=...)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      if (accessToken) {
        setIsLoading(true);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        loginWithGoogle({ accessToken }, role).then((result) => {
          setIsLoading(false);
          if (result.success) {
            showToast(`Welcome back, ${result.user?.name}!`, 'success');
            if (result.user?.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/dashboard');
            }
          } else {
            showToast(result.error || 'Google Login failed.', 'error');
          }
        });
      }
    }
  }, [loginWithGoogle, role, navigate, showToast]);

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, [role]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, role);

      if (result.require2FA) {
        setIs2FAMode(true);
        setMfaToken(result.mfaToken || '');
        setMfaEmail(result.email || email);
        showToast('Two-Factor Protection Active. OTP sent to your email address.', 'info');
        return;
      }

      if (result.success) {
        showToast(`Welcome back, ${result.user?.name}!`, 'success');
        if (result.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        showToast(result.error || 'Login failed. Please check your credentials.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorOtp || twoFactorOtp.trim().length < 4) {
      showToast('Please enter the valid 6-digit OTP code sent to your email.', 'error');
      return;
    }

    setIsVerifying2FA(true);
    try {
      const result = await verify2FALogin(mfaToken, twoFactorOtp.trim());
      if (result.success) {
        showToast(`2FA Verified! Welcome back, ${result.user?.name}!`, 'success');
        if (result.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        showToast(result.error || 'Invalid 2FA security code.', 'error');
      }
    } finally {
      setIsVerifying2FA(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-unified-card">
        {/* LEFT COLUMN: HERO IMAGE & BANNER */}
        <div className="auth-hero-panel">
          <div className="auth-hero-card">
            <img src={bannerImg} alt="Indian Workforce Team" className="auth-hero-img" />
            <div className="auth-hero-overlay">
              <h2 className="auth-hero-title">Work together. Grow with ease.</h2>
              <p className="auth-hero-desc">
                Connecting skilled talent with leading enterprises across India.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM */}
        <div className="auth-form-panel">
          {/* Back Navigation Button */}
          <button
            type="button"
            className="auth-back-btn"
            onClick={() => navigate('/')}
            title="Go back"
          >
            <ArrowLeft size={22} />
          </button>

          {is2FAMode ? (
            /* 2FA VERIFICATION STATE */
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', marginBottom: '14px' }}>
                <ShieldCheck size={16} />
                <span>TWO-FACTOR PROTECTION ACTIVE</span>
              </div>
              
              <h2 className="auth-heading" style={{ marginBottom: '6px' }}>Verify <span>2FA Security Code</span></h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                Two-Factor Authentication is enabled for your account. Please enter the 6-digit security code sent to <strong>{mfaEmail}</strong>.
              </p>

              <form onSubmit={handleVerify2FALogin}>
                <div className="auth-input-group">
                  <label className="auth-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <KeyRound size={15} style={{ color: '#2563EB' }} />
                    <span>6-Digit Security Code (OTP)</span>
                  </label>
                  <div className="auth-input-box">
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. 582910"
                      maxLength={6}
                      value={twoFactorOtp}
                      onChange={(e) => setTwoFactorOtp(e.target.value.replace(/\D/g, ''))}
                      style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '4px', textAlign: 'center' }}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn"
                  disabled={isVerifying2FA}
                >
                  {isVerifying2FA ? 'Authorizing Login...' : 'Verify & Log In'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => { setIs2FAMode(false); setTwoFactorOtp(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Email & Password Login</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STANDARD LOGIN FORM */
            <div>
              <h1 className="auth-heading">Welcome Back</h1>
              <div className="auth-subheading-row">
                <span>Don't have an account?</span>
                <Link to={`/signup?role=${role}`} className="auth-subheading-link">
                  Sign up
                </Link>
              </div>

              {/* Role Switcher Pill */}
              <div className="auth-role-tabs">
                <button
                  type="button"
                  className={`auth-role-tab ${role === 'candidate' ? 'active' : ''}`}
                  onClick={() => setSearchParams({ role: 'candidate' })}
                >
                  <UserIcon size={14} />
                  <span>Candidate</span>
                </button>
                <button
                  type="button"
                  className={`auth-role-tab ${role === 'employer' ? 'active' : ''}`}
                  onClick={() => setSearchParams({ role: 'employer' })}
                >
                  <Briefcase size={14} />
                  <span>Employer</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="auth-input-group">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-box">
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input with Forgot Password Link */}
                <div className="auth-input-group">
                  <div className="auth-label-row">
                    <label className="auth-label">Password</label>
                    <a
                      href="#"
                      className="auth-forgot-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotModalOpen(true);
                      }}
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="auth-input-box">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Primary CTA: Log In Button */}
                <button
                  type="submit"
                  className="auth-primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>

                {/* Remember Session Checkbox */}
                <div
                  className="auth-remember-row"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <div className={`auth-checkbox-box ${rememberMe ? 'checked' : ''}`}>
                    {rememberMe && <Check size={13} strokeWidth={3} />}
                  </div>
                  <span>Remember my session</span>
                </div>
              </form>

              {/* OR Divider */}
              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">OR</span>
                <div className="auth-divider-line" />
              </div>

              {/* Google Sign-In */}
              <div className="auth-google-container">
                <button
                  type="button"
                  className="auth-google-btn"
                  onClick={() => triggerGoogleLogin()}
                  disabled={isLoading}
                >
                  <GoogleGLogo size={18} />
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Email OTP Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
