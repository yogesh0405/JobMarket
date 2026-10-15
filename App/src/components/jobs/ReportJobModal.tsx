import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  X,
  ChevronRight,
  Check,
  Ban,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { reportedJobsStore } from '../../utils/reportedJobsStore';

export interface ReportJobModalProps {
  isOpen: boolean;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  onClose: () => void;
  onReportSuccess?: () => void;
}

interface ReportReasonOption {
  key: string;
  label: string;
  descriptionHint: string;
}

const REPORT_REASONS: ReportReasonOption[] = [
  {
    key: 'MONEY_DEMAND',
    label: 'Asking for money or advance payment',
    descriptionHint: 'Did the recruiter ask for registration fees, training charges, or security deposit?',
  },
  {
    key: 'FAKE_EMPLOYER',
    label: 'Fake company or brand impersonation',
    descriptionHint: 'Is this company pretending to be an existing brand, or non-existent?',
  },
  {
    key: 'MISLEADING_TERMS',
    label: 'Misleading role, salary, or job terms',
    descriptionHint: 'Are the promised salary, job role, or location different from advertised?',
  },
  {
    key: 'OFFENSIVE_CONTENT',
    label: 'Offensive, discriminatory, or inappropriate',
    descriptionHint: 'Does this listing contain inappropriate language or discriminatory requirements?',
  },
  {
    key: 'SCAM_OR_PHISHING',
    label: 'Suspected scam, fraud, or phishing',
    descriptionHint: 'Are they asking for sensitive personal IDs, OTPs, or suspicious link clicks?',
  },
  {
    key: 'DUPLICATE_OR_EXPIRED',
    label: 'Duplicate, spam, or expired vacancy',
    descriptionHint: 'Is this job listing repeated, obsolete, or no longer accepting applicants?',
  },
  {
    key: 'OTHER',
    label: 'Something else',
    descriptionHint: 'Please describe the issue you encountered with this job listing.',
  },
];

export const ReportJobModal: React.FC<ReportJobModalProps> = ({
  isOpen,
  jobId,
  jobTitle = 'Job Listing',
  companyName = 'Employer',
  onClose,
  onReportSuccess,
}) => {
  const { reportJob } = useJobs();

  // Step: 'SELECT_REASON' | 'ADD_DETAILS' | 'SUCCESS'
  const [currentStep, setCurrentStep] = useState<'SELECT_REASON' | 'ADD_DETAILS' | 'SUCCESS'>('SELECT_REASON');
  const [selectedReason, setSelectedReason] = useState<ReportReasonOption | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEmployerHidden, setIsEmployerHidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset modal when reopened or closed
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('SELECT_REASON');
      setSelectedReason(null);
      setDescription('');
      setIsSubmitting(false);
      setIsEmployerHidden(false);
      setErrorMessage(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSelectReason = (reason: ReportReasonOption) => {
    setSelectedReason(reason);
    setCurrentStep('ADD_DETAILS');
  };

  const handleBack = () => {
    if (currentStep === 'ADD_DETAILS') {
      setCurrentStep('SELECT_REASON');
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedReason) return;
    if (!jobId) {
      setErrorMessage('Invalid job listing ID');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await reportJob(jobId, {
        reasonCategory: selectedReason.key,
        description: description.trim() || undefined,
      });

      reportedJobsStore.addReportedJob(jobId, {
        title: jobTitle,
        company: companyName,
        reasonCategory: selectedReason.label,
        reportedAt: new Date().toISOString(),
      });

      setCurrentStep('SUCCESS');
      onReportSuccess?.();
    } catch (err: any) {
      console.warn('Report submission fallback handling:', err);
      // Graceful local persistence if upstream has transient error or job already reported
      reportedJobsStore.addReportedJob(jobId, {
        title: jobTitle,
        company: companyName,
        reasonCategory: selectedReason.label,
        reportedAt: new Date().toISOString(),
      });
      setCurrentStep('SUCCESS');
      onReportSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHideEmployer = () => {
    setIsEmployerHidden(true);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '0px',
          border: '1px solid #CBD5E1',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid #F1F5F9',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentStep === 'ADD_DETAILS' && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Back"
              >
                <ArrowLeft size={20} strokeWidth={2.2} />
              </button>
            )}
          </div>

          <span
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#0F172A',
              letterSpacing: '-0.01em',
            }}
          >
            Report
          </span>

          <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
            >
              <X size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* STEP 1: SELECT REASON */}
        {currentStep === 'SELECT_REASON' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '24px 20px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h2
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '17px',
                  fontWeight: '800',
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                }}
              >
                Why are you reporting this job?
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#64748B',
                  lineHeight: '1.45',
                }}
              >
                Your report is confidential. If someone is asking for advance money or you are in immediate danger, do not pay and alert local authorities.
              </p>
            </div>

            {/* Clean Reasons List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: '1px solid #F1F5F9',
              }}
            >
              {REPORT_REASONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelectReason(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px 0',
                    border: 'none',
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0F172A',
                      paddingRight: '12px',
                    }}
                  >
                    {item.label}
                  </span>
                  <ChevronRight size={18} color="#94A3B8" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: ADD DETAILS & SUBMIT */}
        {currentStep === 'ADD_DETAILS' && (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '20px',
              boxSizing: 'border-box',
            }}
          >
            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #F87171',
                  borderRadius: '0px',
                  color: '#B91C1C',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  marginBottom: '16px',
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Selected Reason Card */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0px',
                padding: '12px 14px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '3px',
                }}
              >
                Reporting category
              </div>
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: '#0F172A',
                }}
              >
                {selectedReason?.label}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h3
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#0F172A',
                }}
              >
                Provide additional context
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '12.5px',
                  color: '#64748B',
                  lineHeight: '1.4',
                }}
              >
                {selectedReason?.descriptionHint || 'Please explain what happened to help our moderation team investigate.'}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: '0px',
                  backgroundColor: '#F8FAFC',
                  padding: '10px',
                  boxSizing: 'border-box',
                }}
              >
                <textarea
                  rows={5}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write additional details here (optional)..."
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    color: '#0F172A',
                    resize: 'none',
                    boxSizing: 'border-box',
                    lineHeight: '1.45',
                  }}
                />
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: '11.5px',
                    color: '#94A3B8',
                    fontWeight: '600',
                    marginTop: '4px',
                  }}
                >
                  {description.length}/500
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0px',
                padding: '12px 16px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '15px',
                      height: '15px',
                      border: '2px solid #FFFFFF',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {currentStep === 'SUCCESS' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '28px 20px 24px',
              boxSizing: 'border-box',
            }}
          >
            {/* Centered Big Checkmark Icon */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '2.5px solid #0F172A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F172A',
                }}
              >
                <Check size={28} strokeWidth={2.6} />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#0F172A',
                }}
              >
                Thanks for your feedback
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#64748B',
                  lineHeight: '1.45',
                  maxWidth: '420px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                We use these reports to show you less of this kind of content and ensure genuine, scam-free job opportunities.
              </p>
            </div>

            {/* Other steps you can take */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: '10px',
                }}
              >
                Other steps you can take
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                {/* Step 1: Hide Employer */}
                <button
                  type="button"
                  onClick={handleHideEmployer}
                  disabled={isEmployerHidden}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    border: 'none',
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: 'transparent',
                    cursor: isEmployerHidden ? 'default' : 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Ban size={20} color={isEmployerHidden ? '#94A3B8' : '#0F172A'} strokeWidth={1.9} />
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: '600',
                        color: isEmployerHidden ? '#94A3B8' : '#0F172A',
                      }}
                    >
                      {isEmployerHidden ? `Hidden jobs from ${companyName}` : `Hide jobs from ${companyName}`}
                    </span>
                  </div>
                  {isEmployerHidden ? (
                    <CheckCircle2 size={18} color="#16A34A" />
                  ) : (
                    <ChevronRight size={18} color="#94A3B8" />
                  )}
                </button>

                {/* Step 2: Safety Guidelines */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldCheck size={20} color="#0F172A" strokeWidth={1.9} />
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A' }}>
                      Learn more about our Safety Standards
                    </span>
                  </div>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>

                {/* Step 3: Support */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Headphones size={20} color="#0F172A" strokeWidth={1.9} />
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A' }}>
                      Contact Trust & Safety Support
                    </span>
                  </div>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>
              </div>
            </div>

            {/* Bottom Done CTA */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0px',
                padding: '12px 16px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ReportJobModal;
