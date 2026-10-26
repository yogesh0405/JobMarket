import React from 'react';
import { ScoreBreakdown, ScoreComponentNote } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface MatchScoreSummaryProps {
  score: number;
  breakdown: ScoreBreakdown;
  components: ScoreComponentNote[];
  explanation: string;
}

export const MatchScoreSummary: React.FC<MatchScoreSummaryProps> = ({
  score,
  breakdown,
  components,
  explanation
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 75) return '#16A34A'; // Green
    if (val >= 55) return '#1B4FDF'; // Brand Blue
    return '#D97706'; // Amber
  };

  const scoreMetrics = [
    { name: 'Required Skill Coverage', value: breakdown.requiredSkillCoverage, weight: '35%' },
    { name: 'Semantic Relevance', value: breakdown.semanticRelevance, weight: '25%' },
    { name: 'Experience Alignment', value: breakdown.experienceAlignment, weight: '20%' },
    { name: 'Preferred Skill Coverage', value: breakdown.preferredSkillCoverage, weight: '10%' },
    { name: 'Project Evidence', value: breakdown.projectRelevance, weight: '10%' },
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      padding: '24px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Left: Overall Score Gauge */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderRight: '1px solid #E2E8F0',
          paddingRight: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#1B4FDF" />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#64748B'
            }}>
              Transparent Match Score
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
            <span style={{
              fontSize: '52px',
              fontWeight: 800,
              color: getScoreColor(score),
              lineHeight: 1
            }}>
              {score}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#94A3B8' }}>/ 100</span>
          </div>

          {/* Linear Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#F1F5F9',
            borderRadius: '4px',
            marginTop: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              borderRadius: '4px',
              backgroundColor: getScoreColor(score),
              width: `${Math.min(100, Math.max(5, score))}%`,
              transition: 'width 0.6s ease'
            }} />
          </div>

          <p style={{
            fontSize: '13px',
            color: '#334155',
            lineHeight: 1.5,
            marginTop: '14px',
            marginBottom: 0
          }}>
            {explanation}
          </p>
        </div>

        {/* Right: Weighted Components Breakdown */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0F172A', letterSpacing: '0.4px' }}>
              Weighted Score Breakdown
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} /> 100% Normalized
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scoreMetrics.map((metric, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                      {metric.name}
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      color: '#64748B',
                      background: '#F1F5F9',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}>
                      Weight: {metric.weight}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: getScoreColor(metric.value) }}>
                    {metric.value}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(4, metric.value))}%`,
                    height: '100%',
                    borderRadius: '3px',
                    backgroundColor: getScoreColor(metric.value),
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
