import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserRole } from '../../types';
import { ArrowLeft, Eye, EyeOff, Briefcase, User as UserIcon } from 'lucide-react';
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

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signup, verifyOtp, loginWithGoogle, currentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const roleParam = searchParams.get('role') as UserRole;
  const initialRole: UserRole = (roleParam === 'candidate' || roleParam === 'employer') ? roleParam : 'candidate';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || !phone) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (phone.length !== 10) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }

    if (role === 'candidate' && !email.toLowerCase().trim().endsWith('@gmail.com')) {
      showToast('Users must register using a @gmail.com email address.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const extraFields: any = {};
      if (role === 'employer') {
        extraFields.companyName = companyName;
        extraFields.gstNumber = gstNumber;
      } else if (role === 'candidate') {
        if (aadhaarNumber) {
          extraFields.aadhaarNumber = aadhaarNumber;
        }
      }

      const result = await signup({
        email,
        password,
        confirmPassword,
        name,
        role,
        phone,
        ...extraFields
      });
      if (result.success) {
        setPendingEmail(result.email || email);
        setOtp('');
        setOtpError(null);
        setTimer(120);
        setCanResend(false);
        setShowOtpModal(true);
        showToast('OTP sent! Please check your email.', 'success');
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimer(prev => {
            if (prev <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        showToast(result.error || 'Email address already registered', 'error');
      }
    } catch (err) {
      showToast('Signup failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    setTimer(120);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const extraFields: any = {};
      if (role === 'employer') { extraFields.companyName = companyName; extraFields.gstNumber = gstNumber; }
      else if (role === 'candidate' && aadhaarNumber) { extraFields.aadhaarNumber = aadhaarNumber; }
      const result = await signup({ email, password, confirmPassword, name, role, phone, ...extraFields });
      if (result.success) {
        setOtp('');
        setOtpError(null);
        startTimer();
        showToast('New OTP sent! Please check your email.', 'success');
      } else {
        setOtpError(result.error || 'Failed to resend OTP.');
      }
    } catch { setOtpError('Failed to resend OTP.'); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);
    try {
      const result = await verifyOtp(pendingEmail, otp);
      if (result.success) {
        showToast('Account verified successfully! Please log in.', 'success');
        setShowOtpModal(false);
        if (timerRef.current) clearInterval(timerRef.current);
        navigate('/login');
      } else {
        setOtpError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const result = await loginWithGoogle({ accessToken: tokenResponse.access_token }, role);
        if (result.success) {
          showToast(`Account ready! Welcome, ${result.user?.name || ''}!`, 'success');
          if (result.user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          showToast(result.error || 'Google Registration failed.', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Google Sign-Up failed', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      showToast('Google Sign-Up was cancelled or failed.', 'error');
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
            showToast(`Account ready! Welcome, ${result.user?.name}!`, 'success');
            if (result.user?.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/dashboard');
            }
          } else {
            showToast(result.error || 'Google Sign-Up failed.', 'error');
          }
        });
      }
    }
  }, [loginWithGoogle, role, navigate, showToast]);

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

        {/* RIGHT COLUMN: SIGNUP FORM */}
        <div className="auth-form-panel">
          {/* Back Navigation Button */}
          <button
            type="button"
            className="auth-back-btn"
            onClick={() => navigate('/login')}
            title="Go back"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="auth-heading">Create Account</h1>
          <div className="auth-subheading-row">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-subheading-link">
              Sign in
            </Link>
          </div>

          {/* Role Switcher Pill */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-role-tab ${role === 'candidate' ? 'active' : ''}`}
              onClick={() => {
                setRole('candidate');
                setSearchParams({ role: 'candidate' });
              }}
            >
              <UserIcon size={14} />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              className={`auth-role-tab ${role === 'employer' ? 'active' : ''}`}
              onClick={() => {
                setRole('employer');
                setSearchParams({ role: 'employer' });
              }}
            >
              <Briefcase size={14} />
              <span>Employer</span>
            </button>
          </div>

          <form onSubmit={handleSignup}>
            {/* Full Name */}
            <div className="auth-input-group">
              <label className="auth-label">
                Full Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="auth-input-box">
                <input
                  type="text"
                  className="auth-input"
                  placeholder={role === 'employer' ? 'HR / Plant Manager Name' : 'Ramesh Sharma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="auth-input-group">
              <label className="auth-label">
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="auth-input-box">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mobile Phone Number */}
            <div className="auth-input-group">
              <label className="auth-label">
                Mobile Phone Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="auth-input-box">
                <input
                  type="tel"
                  className="auth-input"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* Role specific inputs */}
            {role === 'employer' ? (
              <>
                <div className="auth-input-group">
                  <label className="auth-label">
                    Company / Factory Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="auth-input-box">
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Tata Motors Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">GSTIN / Factory Registration (Optional)</label>
                  <div className="auth-input-box">
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="27AAAAA1111A1Z1"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-input-group">
                <label className="auth-label">Aadhaar Number (for eKYC verification - Optional)</label>
                <div className="auth-input-box">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="12-digit Aadhaar number"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    maxLength={12}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="auth-input-group">
              <label className="auth-label">
                Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="auth-input-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
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

            {/* Confirm Password */}
            <div className="auth-input-group">
              <label className="auth-label">
                Confirm Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="auth-input-box">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Primary CTA: Create Account Button */}
            <button
              type="submit"
              className="auth-primary-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
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
              onClick={() => triggerGoogleSignup()}
              disabled={isLoading}
            >
              <GoogleGLogo size={18} />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '420px', margin: '0 16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '28px 28px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>
                📧
              </div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 700 }}>Verify Your Email</h3>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.5 }}>
                We've sent a 6-digit code to<br />
                <strong style={{ color: 'white' }}>{pendingEmail}</strong>
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                {!canResend ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '8px 16px' }}>
                    <span style={{ fontSize: '13.5px', color: '#0369a1', fontWeight: 600, fontFamily: 'monospace' }}>
                      Code expires in {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '8px 16px' }}>
                    <span style={{ fontSize: '13.5px', color: '#9a3412' }}>OTP expired.</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px', padding: 0, textDecoration: 'underline' }}
                    >
                      {isLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', textAlign: 'center', marginBottom: '8px', color: '#475569', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    autoFocus
                    disabled={canResend}
                    style={{ width: '100%', textAlign: 'center', fontSize: '28px', letterSpacing: '8px', fontWeight: 700, padding: '12px', borderRadius: '12px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  {otpError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '8px 12px', marginTop: '10px', color: '#b91c1c', fontSize: '12.5px', textAlign: 'center', fontWeight: 500 }}>
                      ⚠️ {otpError}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    style={{ flex: 1, height: '44px', borderRadius: '22px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => { setShowOtpModal(false); if (timerRef.current) clearInterval(timerRef.current); }}
                    disabled={isVerifying}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 2, height: '44px', borderRadius: '22px', border: 'none', background: '#2563EB', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', opacity: (isVerifying || otp.length !== 6 || canResend) ? 0.7 : 1 }}
                    disabled={isVerifying || otp.length !== 6 || canResend}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
