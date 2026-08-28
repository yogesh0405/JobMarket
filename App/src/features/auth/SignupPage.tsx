import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserRole } from '../../types';
import { GoogleLogin } from '@react-oauth/google';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
        // Send raw aadhaar number — backend validates and derives aadhaar_verified
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse?.credential) {
      setIsLoading(true);
      try {
        let googlePicture = '';
        let googleName = '';
        let googleEmail = '';
        try {
          const base64Url = credentialResponse.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          googlePicture = decoded.picture || '';
          googleName = decoded.name || '';
          googleEmail = decoded.email || '';
        } catch (_) {}

        const result = await loginWithGoogle({
          idToken: credentialResponse.credential,
          picture: googlePicture,
          name: googleName,
          email: googleEmail,
        }, role);

        if (result.success) {
          showToast(`Account ready! Welcome, ${result.user?.name}!`, 'success');
          if (result.user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          showToast(result.error || 'Google Registration failed.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

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
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand" onClick={() => navigate('/')}>
          <div className="auth-brand-logo">JM</div>
          <span className="auth-brand-text">JobMarket</span>
        </div>
        <div className="auth-left-content">
          <h1>Join the <span>Industrial Workforce Network</span></h1>
          <p>
            Create an account to connect directly with verified factories and ITI technicians. Find local work in seconds.
          </p>
          <div className="auth-illustration">
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', color: 'white', padding: '16px 20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 'bold' }}>✓</div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>Verified Listings</h4>
                  <p style={{ margin: '2px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>GST and Aadhaar verified candidates & plants</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background shapes */}
        <div className="auth-float-shape"></div>
        <div className="auth-float-shape"></div>
        <div className="auth-float-shape"></div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-welcome">REGISTER PROFILE</div>
          <h2 className="auth-title">Create an <span>Account</span></h2>

          {/* Role selector buttons */}
          <div className="auth-role-toggle">
            {(['candidate', 'employer'] as UserRole[]).map(r => (
              <button
                key={r}
                type="button"
                className={`role-btn ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
              >
                {r === 'candidate' ? 'Worker' : 'Employer'}
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder={role === 'employer' ? 'Enter HR / Plant Manager name' : 'Enter your full name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
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
              <label className="form-label">Phone Number (WhatsApp) <span className="required">*</span></label>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                required
              />
            </div>

            {role === 'employer' && (
              <>
                <div className="form-group">
                  <label className="form-label">Company / Factory Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter legally registered plant name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN / Factory Registration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 27AAAAA1111A1Z1"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                  />
                </div>
              </>
            )}

            {role === 'candidate' && (
              <div className="form-group">
                <label className="form-label">Aadhaar Number (for eKYC verification)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="12-digit Aadhaar number"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading} style={{ background: 'var(--gradient-accent)' }}>
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #E2E8F0)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748B)', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #E2E8F0)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '16px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                showToast('Google Sign-Up was cancelled or failed.', 'error');
              }}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', margin: '0 16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '28px 28px 24px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '26px' }}>
                📧
              </div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 700 }}>Verify Your Email</h3>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.5 }}>
                We've sent a 6-digit code to<br />
                <strong style={{ color: 'white' }}>{pendingEmail}</strong>
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px' }}>

              {/* Timer / Resend */}
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                {!canResend ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '10px 18px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: 600, fontFamily: 'monospace' }}>
                      Code expires in {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '10px 18px' }}>
                    <span style={{ fontSize: '14px', color: '#9a3412' }}>OTP expired.</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '14px', padding: 0, textDecoration: 'underline' }}
                    >
                      {isLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', textAlign: 'center', marginBottom: '10px', color: '#475569', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    autoFocus
                    disabled={canResend}
                    style={{ textAlign: 'center', fontSize: '30px', letterSpacing: '10px', fontWeight: 700, padding: '14px', caretColor: '#2563eb' }}
                  />
                  {otpError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '10px 14px', marginTop: '12px', color: '#b91c1c', fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>
                      ⚠️ {otpError}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => { setShowOtpModal(false); if (timerRef.current) clearInterval(timerRef.current); }}
                    disabled={isVerifying}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2, background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', opacity: (isVerifying || otp.length !== 6 || canResend) ? 0.7 : 1 }}
                    disabled={isVerifying || otp.length !== 6 || canResend}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Account'}
                  </button>
                </div>
              </form>

              <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                Didn't receive it? Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;

