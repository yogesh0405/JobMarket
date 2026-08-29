import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Keyboard as KeyboardIcon, Clock, ChevronDown } from 'lucide-react';

export interface ClockTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTime: (timeStr: string) => void;
  initialTime?: string;
}

const CLOCK_DIAMETER = 240;
const RADIUS = 90;
const CENTER = CLOCK_DIAMETER / 2; // 120
const NODE_SIZE = 36;

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const ClockTimePickerModal: React.FC<ClockTimePickerModalProps> = ({
  visible,
  onClose,
  onSelectTime,
  initialTime = '10:37 AM',
}) => {
  const [activeMode, setActiveMode] = useState<'hour' | 'minute'>('hour');
  const [inputMode, setInputMode] = useState<'clock' | 'keyboard'>('clock');
  const [selectedHour, setSelectedHour] = useState<number>(10);
  const [selectedMinute, setSelectedMinute] = useState<number>(37);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  
  const [keyboardHour, setKeyboardHour] = useState<string>('10');
  const [keyboardMinute, setKeyboardMinute] = useState<string>('37');
  const [isDragging, setIsDragging] = useState(false);

  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTime) {
      const match = initialTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        let hr = parseInt(match[1], 10);
        if (hr === 0) hr = 12;
        if (hr > 12) hr = hr % 12 || 12;
        const min = parseInt(match[2], 10) || 0;
        const p = (match[3]?.toUpperCase() as 'AM' | 'PM') || 'AM';
        setSelectedHour(hr);
        setSelectedMinute(min);
        setPeriod(p);
        setKeyboardHour(hr < 10 ? `0${hr}` : `${hr}`);
        setKeyboardMinute(min < 10 ? `0${min}` : `${min}`);
      }
    }
    setActiveMode('hour');
    setInputMode('clock');
  }, [initialTime, visible]);

  if (!visible) return null;

  const getClockCoordinates = (index: number, total: number) => {
    const angle = (index * (360 / total) - 90) * (Math.PI / 180);
    const x = CENTER + RADIUS * Math.cos(angle) - NODE_SIZE / 2;
    const y = CENTER + RADIUS * Math.sin(angle) - NODE_SIZE / 2;
    return { x, y };
  };

  const handlePointerMath = (clientX: number, clientY: number, isRelease: boolean = false) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const locationX = clientX - rect.left;
    const locationY = clientY - rect.top;
    const dx = locationX - CENTER;
    const dy = locationY - CENTER;
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;

    if (activeMode === 'hour') {
      let hr = Math.round(deg / 30);
      if (hr === 0) hr = 12;
      setSelectedHour(hr);
      setKeyboardHour(hr < 10 ? `0${hr}` : `${hr}`);
      if (isRelease) {
        setTimeout(() => setActiveMode('minute'), 250);
      }
    } else {
      let min = Math.round(deg / 6) % 60;
      setSelectedMinute(min);
      setKeyboardMinute(min < 10 ? `0${min}` : `${min}`);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMath(e.clientX, e.clientY, false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handlePointerMath(e.clientX, e.clientY, false);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      handlePointerMath(e.clientX, e.clientY, true);
    }
  };

  const currentAngleDeg = activeMode === 'hour' ? selectedHour * 30 : selectedMinute * 6;

  const formattedHour = selectedHour < 10 ? `0${selectedHour}` : `${selectedHour}`;
  const formattedMinute = selectedMinute < 10 ? `0${selectedMinute}` : `${selectedMinute}`;
  const formattedTimeString = `${formattedHour}:${formattedMinute} ${period}`;

  const handleConfirm = () => {
    if (inputMode === 'keyboard') {
      let h = parseInt(keyboardHour, 10) || 12;
      if (h <= 0) h = 12;
      if (h > 12) h = 12;
      let m = parseInt(keyboardMinute, 10) || 0;
      if (m < 0) m = 0;
      if (m > 59) m = 59;
      const hStr = h < 10 ? `0${h}` : `${h}`;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      onSelectTime(`${hStr}:${mStr} ${period}`);
    } else {
      onSelectTime(formattedTimeString);
    }
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.54)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: '100%',
          maxWidth: '310px',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {/* ── 1. MATERIAL BLUE HEADER BANNER ── */}
        <div style={{
          backgroundColor: '#1E88E5',
          padding: inputMode === 'clock' ? '24px 24px' : '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: inputMode === 'clock' ? 'center' : 'flex-start',
          color: '#FFFFFF'
        }}>
          {inputMode === 'clock' ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
              {/* Hour & Minute Digits */}
              <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
                <button
                  type="button"
                  onClick={() => setActiveMode('hour')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: activeMode === 'hour' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '56px',
                    fontWeight: 400,
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'Roboto, sans-serif',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {formattedHour}
                </button>

                <span style={{ fontSize: '52px', fontWeight: 300, color: 'rgba(255, 255, 255, 0.85)', margin: '0 2px' }}>
                  :
                </span>

                <button
                  type="button"
                  onClick={() => setActiveMode('minute')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: activeMode === 'minute' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '56px',
                    fontWeight: 400,
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'Roboto, sans-serif',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {formattedMinute}
                </button>
              </div>

              {/* AM / PM Vertical Switcher on Right */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: '12px',
                marginTop: '4px',
                gap: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: period === 'AM' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '15px',
                    fontWeight: period === 'AM' ? 700 : 500,
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left'
                  }}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('PM')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: period === 'PM' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '15px',
                    fontWeight: period === 'PM' ? 700 : 500,
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left'
                  }}
                >
                  PM
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '24px', fontWeight: 500, color: '#FFFFFF' }}>
              Set time
            </div>
          )}
        </div>

        {/* ── 2. BODY CONTENT ── */}
        {inputMode === 'clock' ? (
          /* CLOCK DIAL VIEW */
          <div style={{
            padding: '24px 20px 16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF'
          }}>
            <div
              ref={clockRef}
              onMouseDown={handleMouseDown}
              style={{
                width: `${CLOCK_DIAMETER}px`,
                height: `${CLOCK_DIAMETER}px`,
                borderRadius: '50%',
                backgroundColor: '#F0F0F0',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {/* Center Pivot Point */}
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#1E88E5',
                position: 'absolute',
                zIndex: 6
              }} />

              {/* Rotating Pointer Arm */}
              <div
                style={{
                  position: 'absolute',
                  width: '2px',
                  height: `${RADIUS * 2}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: `rotate(${currentAngleDeg}deg)`,
                  transformOrigin: 'center center',
                  zIndex: 3,
                  pointerEvents: 'none'
                }}
              >
                {/* Pointer End Bubble */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  width: `${NODE_SIZE}px`,
                  height: `${NODE_SIZE}px`,
                  borderRadius: '50%',
                  backgroundColor: '#1E88E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  transform: `rotate(-${currentAngleDeg}deg)`
                }}>
                  {activeMode === 'hour'
                    ? selectedHour
                    : selectedMinute < 10
                    ? `0${selectedMinute}`
                    : selectedMinute}
                </div>
                {/* Needle Line */}
                <div style={{
                  position: 'absolute',
                  bottom: `${RADIUS}px`,
                  width: '2px',
                  height: `${RADIUS}px`,
                  backgroundColor: '#1E88E5'
                }} />
              </div>

              {/* Numbers on Dial */}
              {activeMode === 'hour'
                ? HOURS.map((hr, idx) => {
                    const isSelected = selectedHour === hr;
                    const { x, y } = getClockCoordinates(idx, 12);
                    return (
                      <div
                        key={hr}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHour(hr);
                          setKeyboardHour(hr < 10 ? `0${hr}` : `${hr}`);
                          setTimeout(() => setActiveMode('minute'), 250);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${x}px`,
                          top: `${y}px`,
                          width: `${NODE_SIZE}px`,
                          height: `${NODE_SIZE}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#FFFFFF' : '#212121',
                          zIndex: 4,
                          borderRadius: '50%'
                        }}
                      >
                        {hr}
                      </div>
                    );
                  })
                : MINUTES_STEPS.map((min, idx) => {
                    const isSelected = selectedMinute === min;
                    const { x, y } = getClockCoordinates(idx, 12);
                    const displayMin = min < 10 ? `0${min}` : `${min}`;
                    return (
                      <div
                        key={min}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMinute(min);
                          setKeyboardMinute(displayMin);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${x}px`,
                          top: `${y}px`,
                          width: `${NODE_SIZE}px`,
                          height: `${NODE_SIZE}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13.5px',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#FFFFFF' : '#212121',
                          zIndex: 4,
                          borderRadius: '50%'
                        }}
                      >
                        {displayMin}
                      </div>
                    );
                  })}
            </div>
          </div>
        ) : (
          /* KEYBOARD MANUAL INPUT VIEW */
          <div style={{ padding: '24px 24px 16px 24px', backgroundColor: '#FFFFFF' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#212121', marginBottom: '20px' }}>
              Type in time
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {/* Hour Input Block */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  type="text"
                  maxLength={2}
                  value={keyboardHour}
                  autoFocus
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setKeyboardHour(val);
                    const n = parseInt(val, 10);
                    if (n >= 1 && n <= 12) setSelectedHour(n);
                  }}
                  style={{
                    width: '64px',
                    height: '56px',
                    border: 'none',
                    borderBottom: '2px solid #1E88E5',
                    textAlign: 'center',
                    fontSize: '44px',
                    fontWeight: 400,
                    color: '#212121',
                    outline: 'none',
                    padding: 0,
                    fontFamily: 'Roboto, sans-serif'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#757575', marginTop: '6px' }}>hour</span>
              </div>

              <span style={{ fontSize: '38px', fontWeight: 400, color: '#212121', marginBottom: '18px' }}>:</span>

              {/* Minute Input Block */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  type="text"
                  maxLength={2}
                  value={keyboardMinute}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setKeyboardMinute(val);
                    const n = parseInt(val, 10);
                    if (n >= 0 && n <= 59) setSelectedMinute(n);
                  }}
                  style={{
                    width: '64px',
                    height: '56px',
                    border: 'none',
                    borderBottom: '2px solid #1E88E5',
                    textAlign: 'center',
                    fontSize: '44px',
                    fontWeight: 400,
                    color: '#212121',
                    outline: 'none',
                    padding: 0,
                    fontFamily: 'Roboto, sans-serif'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#757575', marginTop: '6px' }}>minute</span>
              </div>

              {/* AM / PM Select Dropdown Pill */}
              <div style={{ marginLeft: '12px', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setPeriod(period === 'AM' ? 'PM' : 'AM')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#212121',
                    cursor: 'pointer',
                    padding: '8px 4px'
                  }}
                >
                  <span>{period}</span>
                  <ChevronDown size={16} color="#757575" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. FOOTER ACTIONS ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px 14px 16px',
          backgroundColor: '#FFFFFF'
        }}>
          {/* Toggle Dial / Keyboard */}
          <button
            type="button"
            onClick={() => setInputMode(inputMode === 'clock' ? 'keyboard' : 'clock')}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#616161',
              borderRadius: '50%'
            }}
            title={inputMode === 'clock' ? 'Switch to text input' : 'Switch to clock dial'}
          >
            {inputMode === 'clock' ? <KeyboardIcon size={22} color="#616161" /> : <Clock size={22} color="#616161" />}
          </button>

          {/* Cancel & OK Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '8px 14px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: '#1E88E5',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '8px 14px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: '#1E88E5',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
