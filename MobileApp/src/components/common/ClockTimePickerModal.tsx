import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Clock } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectTime: (timeStr: string) => void;
  initialTime?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 1;
  return h < 10 ? `0${h}` : String(h);
});
const MINUTES = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : String(i)));
const PERIODS = ['AM', 'PM'];

const ITEM_HEIGHT = 42;
const WHEEL_HEIGHT = 180;
const PADDING_VERTICAL = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2; // 69px

export const ClockTimePickerModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectTime,
  initialTime = '10:00 AM',
}) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState(9); // Default '10'
  const [selectedMinIndex, setSelectedMinIndex] = useState(0);  // Default '00'
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0); // Default 'AM'

  const hourScrollRef = useRef<ScrollView>(null);
  const minScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initialTime) {
      const match = initialTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hrStr = match[1];
        if (hrStr.length === 1) hrStr = `0${hrStr}`;
        const hrIdx = HOURS.indexOf(hrStr);
        if (hrIdx !== -1) setSelectedHourIndex(hrIdx);

        const minIdx = MINUTES.indexOf(match[2]);
        if (minIdx !== -1) setSelectedMinIndex(minIdx);

        const periodIdx = PERIODS.indexOf(match[3].toUpperCase());
        if (periodIdx !== -1) setSelectedPeriodIndex(periodIdx);
      }
    }
  }, [initialTime, visible]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({ y: selectedHourIndex * ITEM_HEIGHT, animated: false });
        minScrollRef.current?.scrollTo({ y: selectedMinIndex * ITEM_HEIGHT, animated: false });
        periodScrollRef.current?.scrollTo({ y: selectedPeriodIndex * ITEM_HEIGHT, animated: false });
      }, 80);
    }
  }, [visible]);

  const handleHourScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.min(Math.max(0, Math.round(y / ITEM_HEIGHT)), HOURS.length - 1);
    setSelectedHourIndex(idx);
  };

  const handleMinScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.min(Math.max(0, Math.round(y / ITEM_HEIGHT)), MINUTES.length - 1);
    setSelectedMinIndex(idx);
  };

  const handlePeriodScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.min(Math.max(0, Math.round(y / ITEM_HEIGHT)), PERIODS.length - 1);
    setSelectedPeriodIndex(idx);
  };

  const currentCustomTimeStr = () => {
    const hr = HOURS[selectedHourIndex] || '10';
    const min = MINUTES[selectedMinIndex] || '00';
    const pd = PERIODS[selectedPeriodIndex] || 'AM';
    return `${hr}:${min} ${pd}`;
  };

  const handleConfirm = () => {
    onSelectTime(currentCustomTimeStr());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.pickerCard} onPress={(e) => e.stopPropagation()}>
          {/* Header Title */}
          <View style={styles.headerBox}>
            <Clock size={16} color="#2563EB" />
            <Text style={styles.headerTitle}>SELECT INTERVIEW TIME</Text>
          </View>

          {/* Digital Time Preview Badge */}
          <View style={styles.digitalBadgeContainer}>
            <Text style={styles.digitalBadgeText}>{currentCustomTimeStr()}</Text>
          </View>

          {/* Column Labels */}
          <View style={styles.columnLabelsRow}>
            <Text style={styles.colLabelText}>HOUR</Text>
            <Text style={styles.colLabelText}>MINUTE</Text>
            <Text style={styles.colLabelText}>PERIOD</Text>
          </View>

          {/* Wheel Spinner Container */}
          <View style={styles.spinnerContainer}>
            {/* Center Selection Highlight Overlay */}
            <View style={styles.selectionHighlightBar} />

            {/* Column 1: Hour */}
            <View style={styles.columnWrapper}>
              <ScrollView
                ref={hourScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleHourScroll}
                onScrollEndDrag={handleHourScroll}
                contentContainerStyle={{ paddingVertical: PADDING_VERTICAL }}
              >
                {HOURS.map((hr, idx) => {
                  const isSelected = selectedHourIndex === idx;
                  return (
                    <TouchableOpacity
                      key={hr}
                      activeOpacity={0.7}
                      style={styles.spinnerItem}
                      onPress={() => {
                        setSelectedHourIndex(idx);
                        hourScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
                      }}
                    >
                      <Text style={[styles.spinnerText, isSelected && styles.spinnerTextSelected]}>
                        {hr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Column 2: Minute */}
            <View style={styles.columnWrapper}>
              <ScrollView
                ref={minScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleMinScroll}
                onScrollEndDrag={handleMinScroll}
                contentContainerStyle={{ paddingVertical: PADDING_VERTICAL }}
              >
                {MINUTES.map((mn, idx) => {
                  const isSelected = selectedMinIndex === idx;
                  return (
                    <TouchableOpacity
                      key={mn}
                      activeOpacity={0.7}
                      style={styles.spinnerItem}
                      onPress={() => {
                        setSelectedMinIndex(idx);
                        minScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
                      }}
                    >
                      <Text style={[styles.spinnerText, isSelected && styles.spinnerTextSelected]}>
                        {mn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Column 3: Period (AM/PM) */}
            <View style={styles.columnWrapper}>
              <ScrollView
                ref={periodScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handlePeriodScroll}
                onScrollEndDrag={handlePeriodScroll}
                contentContainerStyle={{ paddingVertical: PADDING_VERTICAL }}
              >
                {PERIODS.map((pd, idx) => {
                  const isSelected = selectedPeriodIndex === idx;
                  return (
                    <TouchableOpacity
                      key={pd}
                      activeOpacity={0.7}
                      style={styles.spinnerItem}
                      onPress={() => {
                        setSelectedPeriodIndex(idx);
                        periodScrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
                      }}
                    >
                      <Text style={[styles.spinnerText, isSelected && styles.spinnerTextSelected]}>
                        {pd}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Action Footer Buttons (CANCEL / OK) */}
          <View style={styles.footerRowActions}>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.actionBtn}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={handleConfirm} style={styles.actionBtn}>
              <Text style={styles.okBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pickerCard: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  digitalBadgeContainer: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 0,
    marginBottom: 14,
  },
  digitalBadgeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  columnLabelsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  colLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    textAlign: 'center',
    flex: 1,
  },
  spinnerContainer: {
    width: '100%',
    height: WHEEL_HEIGHT,
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    overflow: 'hidden',
  },
  selectionHighlightBar: {
    position: 'absolute',
    top: PADDING_VERTICAL,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    zIndex: 1,
  },
  columnWrapper: {
    flex: 1,
    height: WHEEL_HEIGHT,
    zIndex: 2,
  },
  spinnerItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  spinnerTextSelected: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  footerRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 16,
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  okBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
});
