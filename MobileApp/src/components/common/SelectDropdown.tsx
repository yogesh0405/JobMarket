import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { ChevronDown, Check, X, Search } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

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
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

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

  const handleSelectOption = (val: string) => {
    onSelect(val);
    setModalVisible(false);
    setSearchFilter('');
  };

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
          disabled && styles.triggerDisabled,
          !!value && styles.triggerActive,
        ]}
        onPress={() => setModalVisible(true)}
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.sheetPanel}>
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
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
                />
              </View>
            ) : null}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
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
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    fontSize: 13.5,
    color: COLORS.slate700,
  },
  required: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  triggerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.slate300,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  triggerDisabled: {
    backgroundColor: COLORS.slate100,
    borderColor: COLORS.slate200,
    opacity: 0.7,
  },
  triggerActive: {
    borderColor: COLORS.primary,
  },
  leftIconSlot: {
    marginRight: SPACING.sm,
  },
  triggerText: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.slate900,
    fontWeight: '600',
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
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    height: 40,
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
});
