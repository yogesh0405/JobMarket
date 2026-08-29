import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Keyboard as KeyboardIcon } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectTime: (timeStr: string) => void;
  initialTime?: string;
}

const CLOCK_SIZE = 246;
const RADIUS = 92;
const CENTER = CLOCK_SIZE / 2; // 123
const NODE_SIZE = 36;

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const parseTimeToDate = (timeStr?: string): Date => {
  const d = new Date();
  if (!timeStr) return d;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : undefined;
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    d.setHours(hours, minutes, 0, 0);
  }
  return d;
};

const formatTimeFromDate = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hrStr = hours < 10 ? `0${hours}` : `${hours}`;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hrStr}:${minStr} ${period}`;
};

export const ClockTimePickerModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectTime,
  initialTime = '07:00 AM',
}) => {
  const [activeMode, setActiveMode] = useState<'hour' | 'minute'>('hour');
  const [selectedHour, setSelectedHour] = useState<number>(7);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  // Launch Native Android Material 3 Time Picker when on Android platform
  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      const initialDate = parseTimeToDate(initialTime);
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'time',
        is24Hour: false,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) {
            onSelectTime(formatTimeFromDate(selectedDate));
          }
          onClose();
        },
      });
    }
  }, [visible, initialTime]);

  useEffect(() => {
    if (initialTime) {
      const match = initialTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hr = parseInt(match[1], 10);
        if (hr === 0) hr = 12;
        setSelectedHour(hr);
        setSelectedMinute(parseInt(match[2], 10));
        setPeriod((match[3].toUpperCase() as 'AM' | 'PM') || 'AM');
      }
    }
    setActiveMode('hour');
  }, [initialTime, visible]);

  if (Platform.OS === 'android') {
    // Android is handled natively via DateTimePickerAndroid above
    return null;
  }

  // Calculate coordinates on the circle for Cross-Platform / iOS / Web fallback
  const getClockCoordinates = (index: number, total: number) => {
    const angle = (index * (360 / total) - 90) * (Math.PI / 180);
    const x = CENTER + RADIUS * Math.cos(angle) - NODE_SIZE / 2;
    const y = CENTER + RADIUS * Math.sin(angle) - NODE_SIZE / 2;
    return { x, y };
  };

  const handleTouch = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const dx = locationX - CENTER;
    const dy = locationY - CENTER;
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;

    if (activeMode === 'hour') {
      let hr = Math.round(deg / 30);
      if (hr === 0) hr = 12;
      setSelectedHour(hr);
    } else {
      let min = Math.round(deg / 6) % 60;
      const nearest5 = (Math.round(min / 5) * 5) % 60;
      if (Math.abs(min - nearest5) <= 1) {
        min = nearest5;
      }
      setSelectedMinute(min);
    }
  };

  const handleTouchEnd = () => {
    if (activeMode === 'hour') {
      setTimeout(() => {
        setActiveMode('minute');
      }, 250);
    }
  };

  const currentAngleDeg =
    activeMode === 'hour'
      ? selectedHour * 30
      : selectedMinute * 6;

  const formattedHour = selectedHour < 10 ? `0${selectedHour}` : `${selectedHour}`;
  const formattedMinute = selectedMinute < 10 ? `0${selectedMinute}` : `${selectedMinute}`;
  const formattedTimeString = `${formattedHour}:${formattedMinute} ${period}`;

  const handleConfirm = () => {
    onSelectTime(formattedTimeString);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.dialogCard} onPress={(e) => e.stopPropagation()}>
          {/* Header Title */}
          <Text style={styles.headerLabel}>Select time</Text>

          {/* Time & AM/PM Row */}
          <View style={styles.timeDisplayRow}>
            {/* Hour Block */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.timeBlock,
                activeMode === 'hour' ? styles.timeBlockActive : styles.timeBlockInactive,
              ]}
              onPress={() => setActiveMode('hour')}
            >
              <Text
                style={[
                  styles.timeNumberText,
                  activeMode === 'hour' ? styles.timeTextActive : styles.timeTextInactive,
                ]}
              >
                {formattedHour}
              </Text>
            </TouchableOpacity>

            {/* Separator Colon */}
            <Text style={styles.colonText}>:</Text>

            {/* Minute Block */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.timeBlock,
                activeMode === 'minute' ? styles.timeBlockActive : styles.timeBlockInactive,
              ]}
              onPress={() => setActiveMode('minute')}
            >
              <Text
                style={[
                  styles.timeNumberText,
                  activeMode === 'minute' ? styles.timeTextActive : styles.timeTextInactive,
                ]}
              >
                {formattedMinute}
              </Text>
            </TouchableOpacity>

            {/* AM / PM Segmented Box */}
            <View style={styles.amPmContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.amPmHalf, period === 'AM' && styles.amPmActive]}
                onPress={() => setPeriod('AM')}
              >
                <Text style={[styles.amPmText, period === 'AM' && styles.amPmTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>

              <View style={styles.amPmDivider} />

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.amPmHalf, period === 'PM' && styles.amPmActive]}
                onPress={() => setPeriod('PM')}
              >
                <Text style={[styles.amPmText, period === 'PM' && styles.amPmTextActive]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Analog Circular Clock Face */}
          <View
            style={styles.clockCircle}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleTouch}
            onResponderMove={handleTouch}
            onResponderRelease={handleTouchEnd}
          >
            {/* Center Pivot Point */}
            <View style={styles.centerPivotDot} />

            {/* Rotating Clock Hand */}
            <View
              style={[
                styles.handLineWrapper,
                { transform: [{ rotate: `${currentAngleDeg}deg` }] },
              ]}
            >
              <View style={styles.handLine} />
              <View style={styles.handEndCircle}>
                <Text style={styles.handEndText}>
                  {activeMode === 'hour'
                    ? selectedHour
                    : selectedMinute < 10
                    ? `0${selectedMinute}`
                    : selectedMinute}
                </Text>
              </View>
            </View>

            {/* Clock Numbers */}
            {activeMode === 'hour'
              ? HOURS.map((hr, idx) => {
                  const isSelected = selectedHour === hr;
                  const { x, y } = getClockCoordinates(idx, 12);
                  return (
                    <TouchableOpacity
                      key={hr}
                      activeOpacity={0.7}
                      style={[styles.nodeBox, { left: x, top: y }]}
                      onPress={() => {
                        setSelectedHour(hr);
                        setTimeout(() => setActiveMode('minute'), 250);
                      }}
                    >
                      <Text
                        style={[
                          styles.nodeText,
                          isSelected && styles.nodeTextSelected,
                        ]}
                      >
                        {hr}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : MINUTES.map((min, idx) => {
                  const isSelected = selectedMinute === min;
                  const { x, y } = getClockCoordinates(idx, 12);
                  const displayMin = min < 10 ? `0${min}` : `${min}`;
                  return (
                    <TouchableOpacity
                      key={min}
                      activeOpacity={0.7}
                      style={[styles.nodeBox, { left: x, top: y }]}
                      onPress={() => setSelectedMinute(min)}
                    >
                      <Text
                        style={[
                          styles.nodeText,
                          isSelected && styles.nodeTextSelected,
                        ]}
                      >
                        {displayMin}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
          </View>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.keyboardBtn}
              onPress={() => {
                setActiveMode(activeMode === 'hour' ? 'minute' : 'hour');
              }}
            >
              <KeyboardIcon size={22} color="#49454F" strokeWidth={1.8} />
            </TouchableOpacity>

            <View style={styles.footerRightBtns}>
              <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={handleConfirm} style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#F3EEFA',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  headerLabel: {
    alignSelf: 'flex-start',
    fontSize: 12.5,
    fontWeight: '600',
    color: '#49454F',
    marginBottom: 16,
  },

  // ── Digital Time Display ──
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  timeBlock: {
    width: 86,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBlockActive: {
    backgroundColor: '#E8DEF8',
  },
  timeBlockInactive: {
    backgroundColor: '#E6E0E9',
  },
  timeNumberText: {
    fontSize: 48,
    fontWeight: '400',
    letterSpacing: -1,
  },
  timeTextActive: {
    color: '#1D192B',
    fontWeight: '500',
  },
  timeTextInactive: {
    color: '#1D1B20',
  },
  colonText: {
    fontSize: 42,
    fontWeight: '600',
    color: '#1D1B20',
    marginBottom: 6,
  },

  // ── AM / PM Segmented Box ──
  amPmContainer: {
    width: 48,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#79747E',
    overflow: 'hidden',
    marginLeft: 4,
    backgroundColor: '#E6E0E9',
  },
  amPmHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E0E9',
  },
  amPmActive: {
    backgroundColor: '#FFD8E4',
  },
  amPmDivider: {
    height: 1,
    backgroundColor: '#79747E',
  },
  amPmText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#49454F',
  },
  amPmTextActive: {
    color: '#31111D',
  },

  // ── Analog Clock Face ──
  clockCircle: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: '#ECE6F0',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  centerPivotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6750A4',
    zIndex: 5,
  },
  handLineWrapper: {
    position: 'absolute',
    width: 2,
    height: RADIUS * 2,
    alignItems: 'center',
    zIndex: 3,
  },
  handLine: {
    width: 2,
    height: RADIUS,
    backgroundColor: '#6750A4',
    position: 'absolute',
    bottom: RADIUS,
  },
  handEndCircle: {
    position: 'absolute',
    top: 0,
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: '#6750A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handEndText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nodeBox: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  nodeText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#1D1B20',
  },
  nodeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Footer ──
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 4,
  },
  keyboardBtn: {
    padding: 6,
  },
  footerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#6750A4',
  },
});
