import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';

interface EducationYearPickerProps {
  value: string;
  onChange: (year: string) => void;
  label?: string;
  required?: boolean;
}

export const EducationYearPicker: React.FC<EducationYearPickerProps> = ({
  value,
  onChange,
  label = 'Passing Year / Year of Completion',
  required = true,
}) => {
  const currentYear = new Date().getFullYear();
  const currentSelectedYear = value || String(currentYear);
  const yrNum = parseInt(currentSelectedYear, 10) || currentYear;
  const minYear = 1970;
  const maxYear = currentYear + 4;

  const handlePrev = () => {
    if (yrNum > minYear) {
      onChange(String(yrNum - 1));
    }
  };

  const handleNext = () => {
    if (yrNum < maxYear) {
      onChange(String(yrNum + 1));
    }
  };

  // Generate options for quick selection if clicked
  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </label>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC',
          border: '1px solid #CBD5E1',
          borderRadius: '6px',
          height: '44px',
          padding: '4px',
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={yrNum <= minYear}
          aria-label="Previous Year"
          style={{
            width: '38px',
            height: '36px',
            borderRadius: '5px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: yrNum <= minYear ? 'not-allowed' : 'pointer',
            opacity: yrNum <= minYear ? 0.4 : 1,
            color: '#0F172A',
            transition: 'background-color 0.15s'
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            position: 'relative'
          }}
        >
          <Calendar size={16} color="#0284C7" />
          <select
            value={currentSelectedYear}
            onChange={(e) => onChange(e.target.value)}
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#0F172A',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              textAlign: 'center',
              appearance: 'none',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
            title="Click to select year directly"
          >
            {yearOptions.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={yrNum >= maxYear}
          aria-label="Next Year"
          style={{
            width: '38px',
            height: '36px',
            borderRadius: '5px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: yrNum >= maxYear ? 'not-allowed' : 'pointer',
            opacity: yrNum >= maxYear ? 0.4 : 1,
            color: '#0F172A',
            transition: 'background-color 0.15s'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

interface ExperienceDateSelectorProps {
  startYear: string;
  onChangeStartYear: (year: string) => void;
  endYear: string;
  onChangeEndYear: (year: string) => void;
  isCurrent: boolean;
  onChangeIsCurrent: (isCurrent: boolean) => void;
}

export const ExperienceDateSelector: React.FC<ExperienceDateSelectorProps> = ({
  startYear,
  onChangeStartYear,
  endYear,
  onChangeEndYear,
  isCurrent,
  onChangeIsCurrent,
}) => {
  const currentYear = new Date().getFullYear();
  const startNum = parseInt(startYear || '2022', 10);
  const endNum = isCurrent ? currentYear : parseInt(endYear || String(currentYear), 10);
  const diffYears = Math.max(endNum - startNum, 0);
  const diffText = diffYears === 0 ? '< 1 Year' : diffYears === 1 ? '1 Year' : `${diffYears} Years`;
  const calcDurationStr = `${diffText} (${startNum} - ${isCurrent ? 'Present' : endNum})`;

  // Start Year Handlers
  const handlePrevStart = () => {
    if (startNum > 1970) {
      const nextStart = startNum - 1;
      onChangeStartYear(String(nextStart));
      if (!isCurrent && endNum < nextStart) {
        onChangeEndYear(String(nextStart));
      }
    }
  };

  const handleNextStart = () => {
    if (startNum < currentYear) {
      const nextStart = startNum + 1;
      onChangeStartYear(String(nextStart));
      if (!isCurrent && endNum < nextStart) {
        onChangeEndYear(String(nextStart));
      }
    }
  };

  // End Year Handlers
  const handlePrevEnd = () => {
    if (!isCurrent && endNum > startNum) {
      onChangeEndYear(String(endNum - 1));
    }
  };

  const handleNextEnd = () => {
    if (!isCurrent && endNum < currentYear + 1) {
      onChangeEndYear(String(endNum + 1));
    }
  };

  // Generate Year Options
  const startYearOptions = [];
  for (let y = currentYear; y >= 1970; y--) {
    startYearOptions.push(y);
  }

  const endYearOptions = [];
  for (let y = currentYear + 1; y >= startNum; y--) {
    endYearOptions.push(y);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
      {/* Side-by-side Start & End Year Stepper Boxes */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Start Year Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Start Year <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              height: '46px',
              padding: '4px',
              boxSizing: 'border-box'
            }}
          >
            <button
              type="button"
              onClick={handlePrevStart}
              disabled={startNum <= 1970}
              aria-label="Previous Start Year"
              style={{
                width: '32px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: startNum <= 1970 ? 'not-allowed' : 'pointer',
                opacity: startNum <= 1970 ? 0.4 : 1,
                color: '#64748B'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Calendar size={14} color="#0284C7" />
              <select
                value={String(startNum)}
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeStartYear(val);
                  if (!isCurrent && parseInt(val, 10) > endNum) {
                    onChangeEndYear(val);
                  }
                }}
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#0F172A',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  textAlign: 'center'
                }}
                title="Click to select start year"
              >
                {startYearOptions.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextStart}
              disabled={startNum >= currentYear}
              aria-label="Next Start Year"
              style={{
                width: '32px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: startNum >= currentYear ? 'not-allowed' : 'pointer',
                opacity: startNum >= currentYear ? 0.4 : 1,
                color: '#64748B'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* End Year Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            End Year <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isCurrent ? '#F8FAFC' : '#FFFFFF',
              border: isCurrent ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
              borderRadius: '8px',
              height: '46px',
              padding: '4px',
              boxSizing: 'border-box'
            }}
          >
            <button
              type="button"
              onClick={handlePrevEnd}
              disabled={isCurrent || endNum <= startNum}
              aria-label="Previous End Year"
              style={{
                width: '32px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: isCurrent ? '#F1F5F9' : '#F1F5F9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isCurrent || endNum <= startNum ? 'not-allowed' : 'pointer',
                opacity: isCurrent || endNum <= startNum ? 0.4 : 1,
                color: isCurrent ? '#CBD5E1' : '#64748B'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Calendar size={14} color={isCurrent ? '#94A3B8' : '#0284C7'} />
              {isCurrent ? (
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0284C7' }}>Present</span>
              ) : (
                <select
                  value={String(endNum)}
                  onChange={(e) => onChangeEndYear(e.target.value)}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0F172A',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    textAlign: 'center'
                  }}
                  title="Click to select end year"
                >
                  {endYearOptions.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextEnd}
              disabled={isCurrent || endNum >= currentYear + 1}
              aria-label="Next End Year"
              style={{
                width: '32px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: isCurrent ? '#F1F5F9' : '#F1F5F9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isCurrent || endNum >= currentYear + 1 ? 'not-allowed' : 'pointer',
                opacity: isCurrent || endNum >= currentYear + 1 ? 0.4 : 1,
                color: isCurrent ? '#CBD5E1' : '#64748B'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Currently Working in Factory / Role Toggle Row */}
      <div
        onClick={() => onChangeIsCurrent(!isCurrent)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 0',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            border: isCurrent ? '1.5px solid #0284C7' : '1.5px solid #94A3B8',
            backgroundColor: isCurrent ? '#0284C7' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          {isCurrent && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
          Currently working in this factory / role
        </span>
      </div>

      {/* Calculated Experience Duration Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '6px',
          padding: '7px 10px',
          boxSizing: 'border-box'
        }}
      >
        <Clock size={13} color="#0284C7" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7' }}>
          Calculated Experience: {calcDurationStr}
        </span>
      </div>
    </div>
  );
};
