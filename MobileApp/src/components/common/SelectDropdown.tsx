import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { ChevronDown, Check, X, Search } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewStyle } from 'react-native';

export interface DropdownOption {
  label: string;
  value: string;
}

interface SelectDropdownProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabledPlaceholder?: string;
  value: string;
  options: (string | DropdownOption)[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  triggerStyle?: ViewStyle;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  required = false,
  placeholder = 'Select an option...',
  disabledPlaceholder = 'Select previous item first...',
  value,
  options,
  onSelect,
  disabled = false,
  leftIcon,
  triggerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e?.endCoordinates?.height || 280);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  // Selected Option Object
  const selectedObj = normalizedOptions.find((o) => o.value === value);
  const displayLabel = selectedObj ? selectedObj.label : value;

  const filteredOptions = normalizedOptions.filter((o) =>
    o.label.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleOpen = () => {
    if (disabled) return;
    Keyboard.dismiss();
    setSearchFilter('');
    setModalVisible(true);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    setSearchFilter('');
  };

  const handleSelectOption = (val: string) => {
    Keyboard.dismiss();
    onSelect(val);
    setModalVisible(false);
    setSearchFilter('');
  };

  const windowHeight = Dimensions.get('window').height;
  const topSafeInset = insets.top || (Platform.OS === 'android' ? 24 : 0);
  const bottomSafeInset = insets.bottom || 0;

  // When keyboard is visible, limit sheet height so the search box and options list remain visible above the keyboard
  const availableSheetHeight = keyboardHeight > 0
    ? Math.max(260, windowHeight - keyboardHeight - topSafeInset - 24)
    : windowHeight * 0.75;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.required}> *</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        style={[
          styles.triggerBox,
          triggerStyle,
          disabled && styles.triggerDisabled,
          !!value && styles.triggerActive,
        ]}
        onPress={handleOpen}
      >
        {leftIcon ? <View style={styles.leftIconSlot}>{leftIcon}</View> : null}

        <Text
          style={[
            styles.triggerText,
            disabled && styles.triggerTextDisabled,
            !value && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {disabled
            ? disabledPlaceholder
            : value
            ? displayLabel
            : placeholder}
        </Text>

        <ChevronDown
          size={18}
          color={disabled ? COLORS.slate300 : COLORS.slate500}
        />
      </TouchableOpacity>

      {/* Options Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.sheetPanel,
              {
                maxHeight: availableSheetHeight,
                paddingBottom: keyboardHeight > 0 ? 12 : Math.max(bottomSafeInset + 16, 28),
                marginBottom: Platform.OS === 'android' && keyboardHeight > 0 ? keyboardHeight : 0,
              },
            ]}
          >
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={COLORS.slate500} />
              </TouchableOpacity>
            </View>

            {/* Optional Filter Search Input if > 6 options */}
            {normalizedOptions.length > 6 ? (
              <View style={styles.searchBox}>
                <Search size={16} color={COLORS.slate400} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search options..."
                  placeholderTextColor={COLORS.slate400}
                  value={searchFilter}
                  onChangeText={setSearchFilter}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  autoCorrect={false}
                />
                {searchFilter.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => setSearchFilter('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ padding: 4 }}
                  >
                    <X size={15} color={COLORS.slate400} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching options found</Text>
                  {searchFilter ? (
                    <TouchableOpacity
                      onPress={() => setSearchFilter('')}
                      style={styles.clearSearchBtn}
                    >
                      <Text style={styles.clearSearchBtnText}>Clear search filter</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.optionRow, isSelected && styles.optionSelected]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectOption(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {isSelected ? <Check size={18} color={COLORS.primary} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  required: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  triggerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
  },
  triggerDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  triggerActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  leftIconSlot: {
    marginRight: 10,
  },
  triggerText: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  triggerTextDisabled: {
    color: COLORS.slate400,
    fontWeight: '500',
  },
  placeholderText: {
    color: COLORS.slate400,
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheetPanel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '75%',
    paddingBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  sheetTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.slate900,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.slate800,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.slate500,
    fontWeight: '500',
  },
  clearSearchBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  clearSearchBtnText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
