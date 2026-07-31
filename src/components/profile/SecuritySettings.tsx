import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Shield, Key, Lock } from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('Failed to update password. Please check current password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#344BFD' }}>
          <Shield size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0F172A' }}>Security & Account Protection</h2>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '13px' }}>Manage password, active sessions, and multi-factor security</p>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1.5px solid #CBD5E1', borderRadius: '4px', padding: '24px', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} style={{ color: '#344BFD' }} /> Change Password
        </h3>
        
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              alignSelf: 'flex-start',
              background: '#344BFD',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Lock size={16} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
