import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Camera,
  ShieldCheck,
  FileText,
  Clock,
  Bus,
  Home,
  Save,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';

const TRADES = [
  'VMC Operator',
  'CNC Machinist',
  'Fitter',
  'Electrician',
  'Quality Inspector',
  'Welder',
  'Tool & Die Maker',
  'Assembly Operator',
  'Turner',
  'Maintenance Technician',
];

const SHIFTS = ['Day Shift', 'Night Shift', 'Rotational Shift'];

interface Props {
  navigation: any;
}

export const CandidateProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUserProfile, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [tradeSpecialization, setTradeSpecialization] = useState(user?.tradeSpecialization || user?.trade_specialization || 'VMC Operator');
  const [preferredShift, setPreferredShift] = useState(user?.preferredShift || user?.preferred_shift || 'Day Shift');
  const [requiresBus, setRequiresBus] = useState(!!(user?.requiresBus || user?.requires_bus));
  const [requiresAccommodation, setRequiresAccommodation] = useState(!!(user?.requiresAccommodation || user?.requires_accommodation));
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [experience, setExperience] = useState<any[]>(Array.isArray(user?.experience) ? (user?.experience as any[]) : []);
  const [education, setEducation] = useState<any[]>(Array.isArray(user?.education) ? (user?.education as any[]) : []);

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Modal States
  const [skillInput, setSkillInput] = useState('');
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduYear, setEduYear] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
      setLocation(user.location || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setTradeSpecialization(user.tradeSpecialization || user.trade_specialization || 'VMC Operator');
      setPreferredShift(user.preferredShift || user.preferred_shift || 'Day Shift');
      setRequiresBus(!!(user.requiresBus || user.requires_bus));
      setRequiresAccommodation(!!(user.requiresAccommodation || user.requires_accommodation));
      setSkills(user.skills || []);
      setExperience(Array.isArray(user.experience) ? (user.experience as any[]) : []);
      setEducation(Array.isArray(user.education) ? (user.education as any[]) : []);
    }
  }, [user]);

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Permission needed to access photo library', 'warning');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]?.base64) {
        setUploadingPhoto(true);
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const res = await candidateApi.uploadProfilePicture(base64Img);
        setUploadingPhoto(false);

        if (res.success) {
          await refreshUser();
          showToast('Profile photo updated successfully', 'success');
        } else {
          showToast(res.message || 'Failed to update photo', 'error');
        }
      }
    } catch (e: any) {
      setUploadingPhoto(false);
      showToast(e.message || 'Failed to pick image', 'error');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name,
        headline,
        location,
        phone,
        bio,
        tradeSpecialization,
        preferredShift,
        requiresBus,
        requiresAccommodation,
        skills,
        experience,
        education,
      };

      await updateUserProfile(payload);
      setSaving(false);
      await refreshUser();
      showToast('Candidate Profile Updated', 'success');
    } catch (e: any) {
      setSaving(false);
      showToast(e.message || 'Failed to save profile', 'error');
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      showToast('Skill already added', 'warning');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperienceSubmit = () => {
    if (!expTitle.trim() || !expCompany.trim() || !expDuration.trim()) {
      showToast('Please fill in required experience fields', 'warning');
      return;
    }
    const newItem = {
      title: expTitle.trim(),
      company: expCompany.trim(),
      duration: expDuration.trim(),
      description: expDesc.trim(),
    };
    setExperience([...experience, newItem]);
    setExpTitle('');
    setExpCompany('');
    setExpDuration('');
    setExpDesc('');
    setExpModalOpen(false);
  };

  const handleRemoveExperience = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleAddEducationSubmit = () => {
    if (!eduDegree.trim() || !eduInstitution.trim() || !eduYear.trim()) {
      showToast('Please fill in required education fields', 'warning');
      return;
    }
    const newItem = {
      degree: eduDegree.trim(),
      institution: eduInstitution.trim(),
      year: eduYear.trim(),
    };
    setEducation([...education, newItem]);
    setEduDegree('');
    setEduInstitution('');
    setEduYear('');
    setEduModalOpen(false);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const profilePhotoUrl = user?.profile_picture_url || user?.profilePictureUrl;

  return (
    <View style={styles.container}>
      <Header
        title="Profile"
        showBack={true}
        onBack={() => {
          if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
            navigation.goBack();
          } else if (navigation) {
            navigation.navigate('CandidateMain');
          }
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Header */}
        <View style={styles.card3D}>
          <View style={styles.avatarHeaderRow}>
            <TouchableOpacity style={styles.avatarCircleBox} onPress={handlePickPhoto} activeOpacity={0.8}>
              {profilePhotoUrl ? (
                <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarLetter}>{(name || 'C').charAt(0).toUpperCase()}</Text>
              )}

              <View style={styles.cameraIconBadge}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Camera size={12} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.displayName}>{name || 'Candidate User'}</Text>
              <Text style={styles.displayEmail}>{user?.email}</Text>
              <View style={styles.verifiedBadgePill}>
                <ShieldCheck size={12} color="#10B981" />
                <Text style={styles.verifiedBadgeText}>VERIFIED WORKFORCE CANDIDATE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Info Form Card */}
        <View style={styles.card3D}>
          <Text style={styles.sectionTitle}>Personal & Contact Details</Text>

          <Input
            label="Full Name *"
            required
            value={name}
            onChangeText={setName}
            leftIcon={<UserIcon size={18} color="#64748B" />}
          />

          <Input
            label="Professional Headline *"
            value={headline}
            placeholder="e.g. ITI VMC Operator & CNC Setter"
            onChangeText={setHeadline}
            leftIcon={<Briefcase size={18} color="#64748B" />}
          />

          <Input
            label="Current City / MIDC Location *"
            required
            value={location}
            placeholder="e.g. Waluj MIDC, Chhatrapati Sambhajinagar"
            onChangeText={setLocation}
            leftIcon={<MapPin size={18} color="#64748B" />}
          />

          <Input
            label="Mobile Phone Number *"
            required
            value={phone}
            keyboardType="phone-pad"
            maxLength={10}
            onChangeText={setPhone}
            leftIcon={<Phone size={18} color="#64748B" />}
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
            />
          </View>
        </View>

        {/* Industrial Trade & Work Preferences */}
        <View style={styles.card3D}>
          <Text style={styles.sectionTitle}>Trade Specialization & Preferences</Text>

          <Text style={styles.inputLabel}>Select Trade Specialization *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
            {TRADES.map((trade) => {
              const isActive = tradeSpecialization === trade;
              return (
                <TouchableOpacity
                  key={trade}
                  activeOpacity={0.8}
                  style={[styles.tradePill, isActive && styles.tradePillActive]}
                  onPress={() => setTradeSpecialization(trade)}
                >
                  <Text style={[styles.tradePillText, isActive && styles.tradePillTextActive]}>{trade}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.inputLabel}>Preferred Shift *</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {SHIFTS.map((shift) => {
              const isActive = preferredShift === shift;
              return (
                <TouchableOpacity
                  key={shift}
                  activeOpacity={0.8}
                  style={[styles.shiftTab, isActive && styles.shiftTabActive]}
                  onPress={() => setPreferredShift(shift)}
                >
                  <Text style={[styles.shiftTabText, isActive && styles.shiftTabTextActive]}>{shift}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Requires Bus Transport</Text>
              <Text style={styles.toggleDesc}>Company bus pickup/drop facility needed</Text>
            </View>
            <Switch
              value={requiresBus}
              onValueChange={setRequiresBus}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={requiresBus ? '#2563EB' : '#94A3B8'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Requires Hostel Stay</Text>
              <Text style={styles.toggleDesc}>Accommodation / Hostel room facility needed</Text>
            </View>
            <Switch
              value={requiresAccommodation}
              onValueChange={setRequiresAccommodation}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={requiresAccommodation ? '#2563EB' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Skills Tag Management Card */}
        <View style={styles.card3D}>
          <Text style={styles.sectionTitle}>Skills & Technical Capabilities</Text>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <TextInput
              style={[styles.inputField, { flex: 1 }]}
              placeholder="e.g. Vernier Caliper, Fanuc Control..."
              placeholderTextColor="#94A3B8"
              value={skillInput}
              onChangeText={setSkillInput}
            />
            <TouchableOpacity style={styles.addSkillBtn} onPress={handleAddSkill}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addSkillBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.skillsTagRow}>
            {skills.map((s, idx) => (
              <View key={idx} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{s}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(s)}>
                  <X size={13} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Work Experience Section */}
        <View style={styles.card3D}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Work Experience History</Text>
            <TouchableOpacity style={styles.addBtnSmall} onPress={() => setExpModalOpen(true)}>
              <Plus size={14} color="#2563EB" />
              <Text style={styles.addBtnSmallText}>Add Experience</Text>
            </TouchableOpacity>
          </View>

          {experience.length === 0 ? (
            <Text style={styles.emptySubText}>No work experience entries added yet.</Text>
          ) : (
            experience.map((item, idx) => (
              <View key={idx} style={styles.itemRowCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemRowTitle}>{item.title}</Text>
                  <Text style={styles.itemRowSub}>{item.company} • {item.duration}</Text>
                  {item.description ? <Text style={styles.itemRowDesc}>{item.description}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => handleRemoveExperience(idx)}>
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Education & Certifications Section */}
        <View style={styles.card3D}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Education & ITI Certification</Text>
            <TouchableOpacity style={styles.addBtnSmall} onPress={() => setEduModalOpen(true)}>
              <Plus size={14} color="#2563EB" />
              <Text style={styles.addBtnSmallText}>Add Education</Text>
            </TouchableOpacity>
          </View>

          {education.length === 0 ? (
            <Text style={styles.emptySubText}>No education or ITI certificate entries added yet.</Text>
          ) : (
            education.map((item, idx) => (
              <View key={idx} style={styles.itemRowCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemRowTitle}>{item.degree}</Text>
                  <Text style={styles.itemRowSub}>{item.institution} • Passing Year: {item.year}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveEducation(idx)}>
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Save Profile Button */}
        <Button
          title="Save Profile & Bio-Data"
          onPress={handleSaveProfile}
          loading={saving}
          size="lg"
          style={{ marginBottom: 30 }}
        />
      </ScrollView>

      {/* Experience Modal */}
      <Modal visible={expModalOpen} transparent animationType="slide" onRequestClose={() => setExpModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Work Experience</Text>
              <TouchableOpacity onPress={() => setExpModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <Input label="Job Position / Role *" value={expTitle} onChangeText={setExpTitle} placeholder="e.g. VMC Operator" />
            <Input label="Company Name *" value={expCompany} onChangeText={setExpCompany} placeholder="e.g. Tata Motors Waluj" />
            <Input label="Duration / Years *" value={expDuration} onChangeText={setExpDuration} placeholder="e.g. 2 Years (2022 - 2024)" />
            <Input label="Key Responsibilities" value={expDesc} onChangeText={setExpDesc} placeholder="e.g. VMC program setting..." />
            <Button title="Save Experience Entry" onPress={handleAddExperienceSubmit} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>

      {/* Education Modal */}
      <Modal visible={eduModalOpen} transparent animationType="slide" onRequestClose={() => setEduModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Education / ITI Certificate</Text>
              <TouchableOpacity onPress={() => setEduModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <Input label="Degree / Trade Certificate *" value={eduDegree} onChangeText={setEduDegree} placeholder="e.g. ITI Machinist / Diploma" />
            <Input label="Institution / College Name *" value={eduInstitution} onChangeText={setEduInstitution} placeholder="e.g. Govt ITI Aurangabad" />
            <Input label="Passing Year *" value={eduYear} onChangeText={setEduYear} keyboardType="number-pad" placeholder="e.g. 2023" />
            <Button title="Save Education Entry" onPress={handleAddEducationSubmit} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 95,
    gap: 16,
  },
  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 16,
    gap: 12,
  },
  avatarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircleBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  displayName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  displayEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  tradePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tradePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  tradePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tradePillTextActive: {
    color: '#FFFFFF',
  },
  shiftTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  shiftTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  shiftTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  shiftTabTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  toggleDesc: {
    fontSize: 11.5,
    color: '#64748B',
  },
  addSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addSkillBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnSmallText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  emptySubText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  itemRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    gap: 10,
  },
  itemRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemRowSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  itemRowDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
});
