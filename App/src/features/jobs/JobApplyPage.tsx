import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  FileText,
  Building2,
  ChevronRight,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { ensureArray, formatDate } from '../../utils/helpers';

export const JobApplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getJobById, fetchJobById, applyToJob } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [directJob, setDirectJob] = useState<any>(null);
  const storeJob = id ? getJobById(id) : undefined;
  const job = storeJob || directJob || undefined;

  const [isFetching, setIsFetching] = useState(!job);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (id && fetchJobById) {
      if (!job) setIsFetching(true);
      fetchJobById(id)
        .then((data: any) => {
          if (isMounted && data) setDirectJob(data);
        })
        .finally(() => {
          if (isMounted) setIsFetching(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [id]);

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '32px 24px', borderRadius: '8px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>Sign In Required</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>Please log in to your candidate account to apply for this job opening.</p>
          <button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '11px 24px', borderRadius: '6px', fontWeight: '800', fontSize: '13.5px', cursor: 'pointer', width: '100%' }}
          >
            Sign In to Apply
          </button>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '700' }}>Loading job application details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '32px 24px', borderRadius: '8px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>Job Opening Not Found</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>This job post is no longer accepting applications or may have expired.</p>
          <button
            onClick={() => navigate('/jobs')}
            style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '11px 24px', borderRadius: '6px', fontWeight: '800', fontSize: '13.5px', cursor: 'pointer', width: '100%' }}
          >
            Explore Other Jobs
          </button>
        </div>
      </div>
    );
  }

  const applicantRecord = job.applicants?.find((a: any) => a.userId === currentUser.id || a.id === currentUser.id);
  const userAppWithStatus = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
  const hasApplied = Boolean(
    currentUser.appliedJobs?.includes(job.id) ||
    userAppWithStatus ||
    applicantRecord ||
    (job as any).applicationStatus ||
    (job as any).appliedAt
  );

  const appliedAtDate = userAppWithStatus?.appliedAt || applicantRecord?.appliedAt || (job as any).appliedAt || null;
  const applicationStatus = userAppWithStatus?.status || applicantRecord?.status || (job as any).applicationStatus || 'applied';

  if (hasApplied && !submittedSuccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '36px 28px', borderRadius: '8px', maxWidth: '520px', width: '100%', textAlign: 'center', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
            Application Already Submitted
          </h2>

          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 8px 0' }}>
            You have already applied for <strong>{job.title}</strong> at <strong>{job.company}</strong>.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '700', color: '#15803D', margin: '8px 0 24px 0' }}>
            <span>{appliedAtDate ? `Applied on ${formatDate(appliedAtDate)}` : 'Applied'}</span>
            <span>•</span>
            <span style={{ textTransform: 'capitalize' }}>Status: {applicationStatus}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/job/${job.id}`)}
              style={{ backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Back to Job
            </button>
            <button
              onClick={() => navigate('/dashboard?tab=applied')}
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
            >
              View My Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract skills safely
  const skillsList: string[] = Array.isArray(currentUser.skills)
    ? currentUser.skills
    : typeof currentUser.skills === 'string'
    ? (currentUser.skills as string).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Extract experience safely
  const expList: any[] = Array.isArray(currentUser.experience)
    ? currentUser.experience
    : typeof currentUser.experience === 'string'
    ? ((): any[] => { try { return JSON.parse(currentUser.experience as string); } catch (_) { return []; } })()
    : [];

  // Extract education safely
  const eduList: any[] = Array.isArray(currentUser.education)
    ? currentUser.education
    : typeof currentUser.education === 'string'
    ? ((): any[] => { try { return JSON.parse(currentUser.education as string); } catch (_) { return []; } })()
    : [];

  const hasResume = !!(currentUser.resume && (currentUser.resume.url || currentUser.resume.name));

  // Determine missing profile sections
  const missingSections: string[] = [];
  if (!hasResume) missingSections.push('CV / Resume Document');
  if (!currentUser.phone) missingSections.push('Phone Number');
  if (!currentUser.location) missingSections.push('Location / City');
  if (!currentUser.tradeSpecialization) missingSections.push('Primary Trade Specialization');
  if (!currentUser.preferredShift) missingSections.push('Preferred Shift Timing');
  if (skillsList.length < 5) missingSections.push(`Technical Skills (${skillsList.length}/5 minimum recommended)`);
  if (expList.length === 0) missingSections.push('Work Experience History');
  if (eduList.length === 0) missingSections.push('Education Records');

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await applyToJob(job.id);
      if (res && res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Application submitted successfully!', 'success');
        setSubmittedSuccess(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State View
  if (submittedSuccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '36px 28px', borderRadius: '8px', maxWidth: '520px', width: '100%', textAlign: 'center', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
            Application Submitted Successfully!
          </h2>

          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 20px 0' }}>
            Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been transmitted directly to the hiring employer.
          </p>

          {job.isWalkIn && (
            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#B45309', marginBottom: '4px' }}>WALK-IN INTERVIEW ENTRY PASS GENERATED</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Venue: {job.interviewAddress || job.location}</div>
              {job.walkInDocuments && <div style={{ fontSize: '12px', color: '#78350F', marginTop: '4px' }}>Documents to Carry: {job.walkInDocuments}</div>}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/job/${job.id}`)}
              style={{ backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Back to Job
            </button>
            <button
              onClick={() => navigate('/dashboard?tab=applied')}
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
            >
              View My Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '100px' }}>
      
      {/* Top Application Header Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #CBD5E1', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(`/job/${job.id}`)}
            style={{ background: 'transparent', border: 'none', color: '#0F172A', fontSize: '13.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={18} />
            <span>Back to Job Details</span>
          </button>
          <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563EB' }}>Confirm Job Application</span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '800px', margin: '20px auto 0', padding: '0 16px', boxSizing: 'border-box' }}>
        
        {/* CARD 1: Target Job Opening Summary Card */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
          <div style={{ backgroundColor: '#2563EB', padding: '14px 18px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CompanyDefaultLogo logoUrl={job.companyLogo || (job as any).logo} companyName={job.company} size={44} borderRadius="50%" />
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#DBEAFE' }}>{job.company || 'Industrial Partner'}</div>
              <h1 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>{job.title}</h1>
            </div>
          </div>
          <div style={{ padding: '12px 18px', backgroundColor: '#F8FAFC', display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '12px', color: '#475569', fontWeight: '600' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#64748B" />
              <span>{job.location}</span>
            </span>
            {Boolean((job.salary_min || job.salaryMin) && (job.salary_max || job.salaryMax)) ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={14} color="#2563EB" />
                <span>₹{job.salary_min || job.salaryMin} - ₹{job.salary_max || job.salaryMax} / mo</span>
              </span>
            ) : null}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#64748B" />
              <span>{job.min_experience ?? 0} - {job.max_experience ?? 3} Years Exp</span>
            </span>
          </div>
        </div>

        {/* CARD 2: Candidate Profile (FIRST) */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={18} color="#2563EB" />
              <span>Candidate Profile</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Full Name</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{currentUser.name}</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{currentUser.email}</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Phone Contact</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: currentUser.phone ? '#0F172A' : '#94A3B8', marginTop: '2px' }}>
                {currentUser.phone || 'Not Provided'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Location / City</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: currentUser.location ? '#0F172A' : '#94A3B8', marginTop: '2px' }}>
                {currentUser.location || 'Not Provided'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Primary Trade</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {currentUser.tradeSpecialization || 'General Technical Worker'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Experience</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {currentUser.yearsOfExperience ? `${currentUser.yearsOfExperience} Years` : 'Fresh / Entry Level'}
              </div>
            </div>
          </div>

          {/* Resume Attachment Box */}
          <div style={{ backgroundColor: hasResume ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${hasResume ? '#BBF7D0' : '#FDE68A'}`, borderRadius: '6px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color={hasResume ? '#16A34A' : '#B45309'} />
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: hasResume ? '#15803D' : '#92400E' }}>
                  {hasResume ? (currentUser.resume?.name || 'Resume Document PDF Attached') : 'No CV / Resume Document Uploaded'}
                </div>
                <div style={{ fontSize: '11px', color: hasResume ? '#166534' : '#B45309' }}>
                  {hasResume ? 'This document will be automatically transmitted to the employer' : 'Add your CV in profile to improve hiring selection chances'}
                </div>
              </div>
            </div>
            {!hasResume && (
              <button
                onClick={() => navigate('/dashboard?tab=profile')}
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Upload CV
              </button>
            )}
          </div>
        </div>

        {/* SECTION SEPARATOR: SOFT SLATE LINE (#94A3B8) */}
        <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '18px 0' }} />

        {/* CARD 3: Information Not Available / Incomplete Profile Details (BELOW SEPARATOR) */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '18px 20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: 0 }}>
              <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
              <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: '1.3' }}>
                Information Not Provided in Profile
              </h2>
            </div>
            <span style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', borderRadius: '4px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {missingSections.length > 0 ? `${missingSections.length} Missing ${missingSections.length === 1 ? 'Field' : 'Fields'}` : 'Profile Complete'}
            </span>
          </div>

          {missingSections.length > 0 ? (
            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400E', marginBottom: '8px' }}>
                The following candidate profile details are currently empty or not configured:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {missingSections.map((sec, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#B45309', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#D97706', fontWeight: '800', fontSize: '14px' }}>•</span>
                    <span>{sec}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12.5px', color: '#166534', backgroundColor: '#F0FDF4', padding: '10px 14px', borderRadius: '6px', border: '1px solid #BBF7D0', fontWeight: '600', marginBottom: '14px' }}>
              ✓ Outstanding! Your candidate profile is 100% complete with no missing information.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '2px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', flex: '1 1 240px', lineHeight: '1.4' }}>
              You can still submit your application now or edit your candidate profile first.
            </span>
            <button
              onClick={() => navigate('/dashboard?tab=profile')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#2563EB',
                border: '1px solid #CBD5E1',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s ease'
              }}
            >
              <Edit3 size={14} color="#2563EB" />
              <span>Update Profile Details</span>
            </button>
          </div>
        </div>

      </div>

      {/* PERMANENTLY ANCHORED BOTTOM ACTION BAR (FULL VIEWPORT WIDTH) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #CBD5E1',
        padding: '12px 16px max(12px, env(safe-area-inset-bottom, 12px)) 16px',
        zIndex: 20000,
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <button
            onClick={() => navigate(`/job/${job.id}`)}
            disabled={isSubmitting}
            style={{
              padding: '11px 22px',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmSubmit}
            disabled={isSubmitting}
            style={{
              flex: 1,
              maxWidth: '320px',
              height: '46px',
              backgroundColor: isSubmitting ? '#6366F1' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '800',
              fontSize: '14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <Send size={16} strokeWidth={2.5} color="#FFFFFF" />
                <span>Confirm & Submit Application</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default JobApplyPage;
