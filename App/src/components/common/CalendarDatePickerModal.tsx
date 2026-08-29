import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  initialDate?: string;
}

export const CalendarDatePickerModal: React.FC<CalendarDatePickerModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  initialDate,
}) => {
  const [currentPickerMonth, setCurrentPickerMonth] = useState<Date>(() => {
    if (initialDate) {
      const d = new Date(initialDate + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  if (!visible) return null;

  const getDaysInMonthGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid: ({ day: number; dateStr: string; isPast: boolean } | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dObj = new Date(year, month, day);
      const isPast = dObj < today;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({ day, dateStr, isPast });
    }
    return grid;
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(2px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E7EBF2',
          padding: '16px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
          userSelect: 'none'
        }}
      >
        {/* Header navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #E7EBF2'
        }}>
          <button
            type="button"
            onClick={() => {
              const prev = new Date(currentPickerMonth);
              prev.setMonth(prev.getMonth() - 1);
              setCurrentPickerMonth(prev);
            }}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} color="#334155" />
          </button>

          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#102A5C' }}>
            {currentPickerMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>

          <button
            type="button"
            onClick={() => {
              const next = new Date(currentPickerMonth);
              next.setMonth(next.getMonth() + 1);
              setCurrentPickerMonth(next);
            }}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronRight size={16} color="#334155" />
          </button>
        </div>

        {/* Week labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '6px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#657796' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {getDaysInMonthGrid(currentPickerMonth).map((item, idx) => {
            if (!item) {
              return <div key={`empty-${idx}`} style={{ height: '34px' }} />;
            }
            const isSelected = initialDate === item.dateStr;
            return (
              <button
                key={item.dateStr}
                type="button"
                disabled={item.isPast}
                onClick={() => {
                  onSelectDate(item.dateStr);
                  onClose();
                }}
                style={{
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isSelected ? '#1764E8' : 'transparent',
                  color: isSelected ? '#FFFFFF' : item.isPast ? '#94A3B8' : '#102A5C',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 600,
                  opacity: item.isPast ? 0.35 : 1,
                  cursor: item.isPast ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.day}
              </button>
            );
          })}
        </div>

        {/* Cancel button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '14px',
            width: '100%',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '9px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
};
