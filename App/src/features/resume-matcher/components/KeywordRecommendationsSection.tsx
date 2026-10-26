import React from 'react';
import { KeywordRecommendation } from '../types';
import { Tag, Check, ArrowRight } from 'lucide-react';

interface KeywordRecommendationsSectionProps {
  keywords: KeywordRecommendation[];
}

export const KeywordRecommendationsSection: React.FC<KeywordRecommendationsSectionProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) return null;

  const getPresenceBadge = (presence: KeywordRecommendation['presence']) => {
    switch (presence) {
      case 'present':
        return (
          <span style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#15803D',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            Present
          </span>
        );
      case 'related':
        return (
          <span style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#B45309',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            Related
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#B91C1C',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            Missing
          </span>
        );
    }
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
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          ATS Keyword & Industry Vocabulary
        </h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', marginBottom: 0 }}>
          Recruiter applicant tracking systems search for these specific terms.
        </p>
      </div>

      <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '6px 0 16px 0' }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px'
      }}>
        {keywords.map((kw, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} color="#1B4FDF" />
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    {kw.keyword}
                  </span>
                </div>
                {getPresenceBadge(kw.presence)}
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4, margin: '4px 0 8px 0' }}>
                {kw.reason}
              </p>
            </div>

            <div style={{
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#1B4FDF',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ArrowRight size={12} />
              <span>{kw.suggestedAction}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
