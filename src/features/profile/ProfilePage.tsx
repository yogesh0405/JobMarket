import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getInitials, formatDate, capitalize } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');

  // Industrial fields
  const [tradeSpecialization, setTradeSpecialization] = useState('');
  const [preferredShift, setPreferredShift] = useState('');
  const [requiresBus, setRequiresBus] = useState(false);
  const [requiresAccommodation, setRequiresAccommodation] = useState(false);

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3>Please Log In</h3>
          <p>Log in to view and manage your profile.</p>
          <Link to="/login" className="btn btn-primary mt-4">Login</Link>
        </div>
      </div>
    );
  }

  const openEditModal = () => {
    setName(currentUser.name);
    setHeadline(currentUser.headline || '');
    setLocation(currentUser.location || '');
    setPhone(currentUser.phone || '');
    setSkills((currentUser.skills || []).join(', '));
    setTradeSpecialization(currentUser.tradeSpecialization || '');
    setPreferredShift(currentUser.preferredShift || '');
    setRequiresBus(!!currentUser.requiresBus);
    setRequiresAccommodation(!!currentUser.requiresAccommodation);
    setEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    const updatedSkills = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    updateUser({
      name,
      headline,
      location,
      phone,
      skills: updatedSkills,
      tradeSpecialization,
      preferredShift,
      requiresBus,
      requiresAccommodation
    });

    showToast('Profile updated successfully!', 'success');
    setEditModalOpen(false);
  };

  const tradesList = ['Fitter', 'Welder', 'CNC Operator', 'Electrician', 'Machinist', 'Helper', 'Quality Inspector'];

  return (
    <div className="profile-page">
      <div className="container">
        {/* About */}
        <div className="profile-section">
          <div className="profile-section-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              About
            </h2>
          </div>
          <div className="profile-section-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div><span className="text-sm text-secondary">Email</span><p className="font-medium">{currentUser.email}</p></div>
              <div><span className="text-sm text-secondary">Phone</span><p className="font-medium">{currentUser.phone || 'Not provided'}</p></div>
              <div><span className="text-sm text-secondary">Role</span><p className="font-medium">{capitalize(currentUser.role)}</p></div>
              <div><span className="text-sm text-secondary">Joined</span><p className="font-medium">{formatDate(currentUser.createdAt)}</p></div>
            </div>
          </div>
        </div>

        {/* Industrial Profile section for candidates */}
        {currentUser.role === 'candidate' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                Industrial Job Preferences
              </h2>
            </div>
            <div className="profile-section-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <span className="text-sm text-secondary">Trade Specialization</span>
                  <p className="font-medium">{currentUser.tradeSpecialization || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Preferred Shift</span>
                  <p className="font-medium">{currentUser.preferredShift || 'Any Shift'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Requires Bus facility</span>
                  <p className="font-medium">{currentUser.requiresBus ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Requires Hostel accommodation</span>
                  <p className="font-medium">{currentUser.requiresAccommodation ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experience */}
        {currentUser.role === 'candidate' && (
          <>
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  Work Experience
                </h2>
              </div>
              <div className="profile-section-body">
                {currentUser.experience && currentUser.experience.length > 0 ? (
                  currentUser.experience.map((exp: any, index: number) => (
                    <div key={index} className="experience-item">
                      <div className="exp-dot"></div>
                      <div className="exp-content">
                        <h4>{exp.title}</h4>
                        <div className="exp-company">{exp.company}</div>
                        <div className="exp-duration">{exp.duration}</div>
                        {exp.description && <p className="exp-description">{exp.description}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No experience details added.</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/>
                  </svg>
                  Education
                </h2>
              </div>
              <div className="profile-section-body">
                {currentUser.education && currentUser.education.length > 0 ? (
                  currentUser.education.map((edu: any, index: number) => (
                    <div key={index} className="experience-item">
                      <div className="exp-dot"></div>
                      <div className="exp-content">
                        <h4>{edu.degree}</h4>
                        <div className="exp-company">{edu.institution}</div>
                        <div className="exp-duration">{edu.year}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No education details added.</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Skills
                </h2>
              </div>
              <div className="profile-section-body">
                {currentUser.skills && currentUser.skills.length > 0 ? (
                  <div className="skills-list">
                    {currentUser.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No skills listed.</p>
                )}
              </div>
            </div>

            {/* Resume */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Resume
                </h2>
              </div>
              <div className="profile-section-body">
                {currentUser.resume ? (
                  <div className="file-preview">
                    <div className="file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div className="file-info">
                      <h4>{currentUser.resume.name}</h4>
                      <p>{currentUser.resume.size}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>No resume uploaded yet.</p>
                    <Link to="/resume" className="btn btn-primary btn-sm">Upload Resume</Link>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile</h3>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form id="edit-profile-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={headline}
                    placeholder="e.g. ITI Welder Apprentice"
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    placeholder="e.g. Chakan MIDC, Pune"
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {currentUser.role === 'candidate' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Trade Specialty</label>
                      <select className="form-select" value={tradeSpecialization} onChange={(e) => setTradeSpecialization(e.target.value)}>
                        <option value="">Select Specialty</option>
                        {tradesList.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preferred Shift</label>
                      <select className="form-select" value={preferredShift} onChange={(e) => setPreferredShift(e.target.value)}>
                        <option value="">Any Shift</option>
                        <option value="Day Shift (8 AM - 5 PM)">Day Shift (8 AM - 5 PM)</option>
                        <option value="Night Shift (8 PM - 5 AM)">Night Shift (8 PM - 5 AM)</option>
                        <option value="Rotational (Shift A / B)">Rotational (Shift A / B)</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', margin: 'var(--space-2) 0' }}>
                      <label className="form-checkbox">
                        <input type="checkbox" checked={requiresBus} onChange={(e) => setRequiresBus(e.target.checked)} />
                        Requires Bus Transport
                      </label>
                      <label className="form-checkbox">
                        <input type="checkbox" checked={requiresAccommodation} onChange={(e) => setRequiresAccommodation(e.target.checked)} />
                        Requires Hostel Stay
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Skills (comma separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={skills}
                        placeholder="MIG Welding, Fitting, Machine tools"
                        onChange={(e) => setSkills(e.target.value)}
                      />
                    </div>
                  </>
                )}
                
                <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default ProfilePage;
