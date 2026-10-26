import React from 'react';
import { ImprovementPriority } from '../types';
import { ArrowUpRight, Wrench, FileSearch, FileText } from 'lucide-react';

interface ImprovementPrioritiesSectionProps {
  priorities: ImprovementPriority[];
}

export const ImprovementPrioritiesSection: React.FC<ImprovementPrioritiesSectionProps> = ({ priorities }) => {
  if (!priorities || priorities.length === 0) return null;

  const getActionBadge = (actionType: ImprovementPriority['actionType']) => {
    switch (actionType) {
      case 'build_evidence':
        return (
          <span style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#1B4FDF',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '2px 7px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Wrench size={12} /> Build Evidence
          </span>
        );
      case 'strengthen':
        return (
          <span style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#15803D',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '2px 7px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ArrowUpRight size={12} /> Quantify Impact
          </span>
        );
      case 'clarify':
        return (
          <span style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#7C3AED',
            background: '#F5F3FF',
            border: '1px solid #DDD6FE',
            padding: '2px 7px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FileText size={12} /> Clarify Context
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#B45309',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            padding: '2px 7px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FileSearch size={12} /> Verify Experience
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Prioritized Improvement Steps
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', marginBottom: 0 }}>
            Targeted enhancements to close skill gaps and improve recruiter ATS visibility.
          </p>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '6px 0 16px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {priorities.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#1B4FDF',
                  background: '#EFF6FF',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  #{idx + 1}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  {item.title}
                </span>
              </div>
              {getActionBadge(item.actionType)}
            </div>

            <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
