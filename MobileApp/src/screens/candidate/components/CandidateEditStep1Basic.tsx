import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Camera } from 'lucide-react-native';
import { Input } from '../../../components/common/Input';

interface CandidateEditStep1BasicProps {
  name: string;
  setName: (val: string) => void;
  headline: string;
  setHeadline: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  profilePhotoUrl: string;
  uploadingPhoto: boolean;
  onPickPhoto: () => void;
  onFocusBio?: (e: any) => void;
}

export const CandidateEditStep1Basic: React.FC<CandidateEditStep1BasicProps> = ({
  name,
  setName,
  headline,
  setHeadline,
  location,
  setLocation,
  phone,
  setPhone,
  bio,
  setBio,
  profilePhotoUrl,
  uploadingPhoto,
  onPickPhoto,
  onFocusBio,
}) => {
  return (
    <View style={styles.masterEditCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardHeaderTitle}>Basic Details</Text>
          <Text style={styles.cardHeaderSub}>Update avatar, name & contact information</Text>
        </View>
      </View>

      <View style={styles.avatarEditContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPickPhoto}
          style={styles.avatarCircleBorderWrapper}
        >
          {profilePhotoUrl ? (
            <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallbackLetterBox}>
              <Text style={styles.avatarFallbackLetterText}>
                {(name || 'Y').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.cameraIconBadgeBadge}>
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Camera size={12} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.tapToChangePhotoText}>Tap photo to update avatar</Text>
      </View>

      <View style={styles.sectionDividerSlate} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>Personal Information</Text>
        </View>

        <View style={{ gap: 10 }}>
          <Input
            label="Candidate Name"
            required
            value={name}
            onChangeText={setName}
            inputContainerStyle={{ borderRadius: 6 }}
          />

          <Input
            label="Professional Headline"
            value={headline}
            placeholder="e.g. ITI VMC Operator & CNC Setter"
            onChangeText={setHeadline}
            inputContainerStyle={{ borderRadius: 6 }}
          />

          <Input
            label="Current City / MIDC Location"
            required
            value={location}
            placeholder="e.g. Waluj MIDC, Chhatrapati Sambhajinagar"
            onChangeText={setLocation}
            inputContainerStyle={{ borderRadius: 6 }}
          />

          <Input
            label="Mobile Phone Number"
            required
            value={phone}
            keyboardType="number-pad"
            maxLength={10}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
            inputContainerStyle={{ borderRadius: 6 }}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio / Career Summary</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={3}
              placeholder="Brief summary of your factory experience and technical skills..."
              placeholderTextColor="#94A3B8"
              value={bio}
              onChangeText={setBio}
              onFocus={onFocusBio}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  masterEditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarCircleBorderWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#0284C7',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  avatarFallbackLetterBox: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackLetterText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cameraIconBadgeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tapToChangePhotoText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  sectionBlock: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
