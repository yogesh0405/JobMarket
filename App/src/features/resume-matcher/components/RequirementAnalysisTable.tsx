import React, { useState } from 'react';
import { RequirementAssessment } from '../types';
import { CheckCircle2, AlertCircle, HelpCircle, ChevronRight, FileText } from 'lucide-react';

interface RequirementAnalysisTableProps {
  requirements: RequirementAssessment[];
}

export const RequirementAnalysisTable: React.FC<RequirementAnalysisTableProps> = ({ requirements }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'demonstrated' | 'needs_verification' | 'not_evidenced'>('all');

  const filteredRequirements = requirements.filter(req => {
    if (activeFilter === 'all') return true;
    return req.status === activeFilter;
  });

  const getStatusBadge = (status: RequirementAssessment['status']) => {
    switch (status) {
      case 'demonstrated':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#15803D',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            <CheckCircle2 size={13} color="#15803D" /> Demonstrated
          </span>
        );
      case 'needs_verification':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#B45309',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            <HelpCircle size={13} color="#B45309" /> Needs Context
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#B91C1C',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            <AlertCircle size={13} color="#B91C1C" /> Not Evidenced
          </span>
        );
    }
  };

  const getImportanceBadge = (importance: RequirementAssessment['importance']) => {
    const isRequired = importance === 'required';
    return (
      <span style={{
        fontSize: '10.5px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        color: isRequired ? '#1B4FDF' : '#64748B',
        background: isRequired ? '#EFF6FF' : '#F8FAFC',
        border: `1px solid ${isRequired ? '#BFDBFE' : '#E2E8F0'}`,
        padding: '2px 6px',
        borderRadius: '4px'
      }}>
        {importance}
      </span>
    );
  };

  const counts = {
    all: requirements.length,
    demonstrated: requirements.filter(r => r.status === 'demonstrated').length,
    needs_verification: requirements.filter(r => r.status === 'needs_verification').length,
    not_evidenced: requirements.filter(r => r.status === 'not_evidenced').length
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      padding: '24px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Requirement-Level Skill Matching
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', marginBottom: 0 }}>
              Each requirement is mapped to verified citations from your resume document.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                background: activeFilter === 'all' ? '#1B4FDF' : '#F8FAFC',
                color: activeFilter === 'all' ? '#FFFFFF' : '#475569',
                border: `1px solid ${activeFilter === 'all' ? '#1B4FDF' : '#E2E8F0'}`,
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('demonstrated')}
              style={{
                background: activeFilter === 'demonstrated' ? '#15803D' : '#F8FAFC',
                color: activeFilter === 'demonstrated' ? '#FFFFFF' : '#475569',
                border: `1px solid ${activeFilter === 'demonstrated' ? '#15803D' : '#E2E8F0'}`,
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Demonstrated ({counts.demonstrated})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('needs_verification')}
              style={{
                background: activeFilter === 'needs_verification' ? '#B45309' : '#F8FAFC',
                color: activeFilter === 'needs_verification' ? '#FFFFFF' : '#475569',
                border: `1px solid ${activeFilter === 'needs_verification' ? '#B45309' : '#E2E8F0'}`,
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Needs Context ({counts.needs_verification})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('not_evidenced')}
              style={{
                background: activeFilter === 'not_evidenced' ? '#B91C1C' : '#F8FAFC',
                color: activeFilter === 'not_evidenced' ? '#FFFFFF' : '#475569',
                border: `1px solid ${activeFilter === 'not_evidenced' ? '#B91C1C' : '#E2E8F0'}`,
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Not Evidenced ({counts.not_evidenced})
            </button>
          </div>
        </div>
      </div>

      {/* Main Section Divider */}
      <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '6px 0 16px 0' }} />

      {/* Requirements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRequirements.map((req, idx) => (
          <div
            key={idx}
            style={{
              padding: '16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {getImportanceBadge(req.importance)}
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{req.category}</span>
                </div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.4 }}>
                  {req.requirement}
                </h4>
              </div>

              <div>
                {getStatusBadge(req.status)}
              </div>
            </div>

            {/* Evidence Citation */}
            {req.evidenceSnippet && (
              <div style={{
                marginTop: '10px',
                padding: '10px 12px',
                backgroundColor: '#FFFFFF',
                borderLeft: '3px solid #1B4FDF',
                fontSize: '12.5px',
                color: '#334155',
                fontStyle: 'italic',
                lineHeight: 1.4
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontStyle: 'normal', fontSize: '11px', fontWeight: 700, color: '#1B4FDF', marginBottom: '4px' }}>
                  <FileText size={12} /> CITED RESUME EVIDENCE:
                </div>
                {req.evidenceSnippet}
              </div>
            )}

            {/* Explanation & Next Step */}
            <div style={{ marginTop: '10px', fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
              <div>{req.explanation}</div>
              {req.suggestedNextStep && (
                <div style={{ marginTop: '5px', color: '#1B4FDF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ChevronRight size={13} />
                  <span>Action: {req.suggestedNextStep}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
