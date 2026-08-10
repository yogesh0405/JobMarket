import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Plus,
  Image as ImageIcon,
  Sparkles,
  Eye,
  MousePointerClick,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X,
  AlertCircle,
  Briefcase,
  Calendar,
  Layers,
  UploadCloud,
  ArrowRight,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../../components/common/Header';
import { apiFetch } from '../../api/client';
import { jobsApi } from '../../api/jobsApi';
import { Advertisement, AdvertisementAnalytics, AdvertisementType, Job } from '../../types';
import { DatePickerField } from '../../components/common/DatePickerField';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export const EmployerBannersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [banners, setBanners] = useState<Advertisement[]>([]);
  const [analytics, setAnalytics] = useState<AdvertisementAnalytics | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Advertisement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [advertisementType, setAdvertisementType] = useState<AdvertisementType>('FEATURED_JOB');
  const [linkedJobId, setLinkedJobId] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [buttonText, setButtonText] = useState('Apply Now');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [bannersRes, analyticsRes, jobsRes] = await Promise.all([
        apiFetch('/api/v1/employer/advertisements').catch(() => ({ success: false, data: [] })),
        apiFetch('/api/v1/employer/advertisements/analytics').catch(() => ({ success: false, data: null })),
        jobsApi.getMyJobs().catch(() => ({ success: false, data: [] })),
      ]);

      if (bannersRes.success && Array.isArray(bannersRes.data)) {
        setBanners(bannersRes.data);
      } else {
        setBanners([]);
      }

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }

      if (jobsRes.success && Array.isArray(jobsRes.data)) {
        setJobs(jobsRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load banner advertisements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setDescription('');
    setBannerImage('');
    setAdvertisementType('FEATURED_JOB');
    setLinkedJobId('');
    setRedirectUrl('');
    setButtonText('Apply Now');
    setTargetAudience('');

    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 14);

    setStartDate(now.toISOString().slice(0, 10));
    setEndDate(future.toISOString().slice(0, 10));

    setModalVisible(true);
  };

  const openEditModal = (banner: Advertisement) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setDescription(banner.description || '');
    setBannerImage(banner.banner_image || '');
    setAdvertisementType(banner.advertisement_type);
    setLinkedJobId(banner.linked_job_id || '');
    setRedirectUrl(banner.redirect_url || '');
    setButtonText(banner.button_text || 'Apply Now');
    setTargetAudience(banner.target_audience || '');

    setStartDate(new Date(banner.start_date).toISOString().slice(0, 10));
    setEndDate(new Date(banner.end_date).toISOString().slice(0, 10));

    setModalVisible(true);
  };

  const handlePickImage = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required to select a banner image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64Data = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      setBannerImage(base64Data);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a promotional banner title.');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Required Field', 'Please select valid start and end dates.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        banner_image: bannerImage.trim() || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        advertisement_type: advertisementType,
        linked_job_id: linkedJobId || undefined,
        redirect_url: redirectUrl || undefined,
        button_text: buttonText,
        priority: 'MEDIUM',
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        target_audience: targetAudience || 'All Job Seekers',
      };

      const url = editingBanner
        ? `/api/v1/employer/advertisements/${editingBanner.id}`
        : '/api/v1/employer/advertisements';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        Alert.alert(
          'Success',
          editingBanner
            ? 'Banner updated and resubmitted for admin review!'
            : 'Promotional banner created and submitted for admin review!'
        );
        setModalVisible(false);
        loadData();
      } else {
        Alert.alert('Error', res.message || 'Failed to submit banner');
      }
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'An error occurred while saving the banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, bannerTitle: string) => {
    Alert.alert('Delete Banner', `Are you sure you want to delete "${bannerTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await apiFetch(`/api/v1/employer/advertisements/${id}`, { method: 'DELETE' });
            if (res.success) {
              setBanners((prev) => prev.filter((b) => b.id !== id));
            } else {
              Alert.alert('Error', res.message || 'Failed to delete banner.');
            }
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete banner.');
          }
        },
      },
    ]);
  };

  const renderStatusBadge = (banner: Advertisement) => {
    const s = (banner.status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'PUBLISHED' || banner.is_active) {
      return (
        <View style={[styles.statusBadgePill, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
          <CheckCircle2 size={12} color="#16A34A" />
          <Text style={[styles.statusBadgeText, { color: '#15803D' }]}>Active Live</Text>
        </View>
      );
    }
    if (s === 'REJECTED') {
      return (
        <View style={[styles.statusBadgePill, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
          <XCircle size={12} color="#DC2626" />
          <Text style={[styles.statusBadgeText, { color: '#B91C1C' }]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadgePill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
        <Clock size={12} color="#D97706" />
        <Text style={[styles.statusBadgeText, { color: '#B45309' }]}>Pending Approval</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Promote Banners" subtitle="Home Page Banner Campaigns" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Create Banner Action Bar */}
        <View style={styles.topActionBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionBarTitle}>Promote Jobs & Company</Text>
            <Text style={styles.actionBarSubtitle}>Reach More Employees</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} activeOpacity={0.8} onPress={openCreateModal}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Create Banner</Text>
          </TouchableOpacity>
        </View>

        {/* Analytics Grid Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Total Banners</Text>
              <ImageIcon size={16} color="#2563EB" />
            </View>
            <Text style={styles.metricValueText}>{analytics?.total_advertisements ?? banners.length}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Active Live</Text>
              <CheckCircle2 size={16} color="#16A34A" />
            </View>
            <Text style={styles.metricValueText}>{analytics?.active_advertisements ?? banners.filter((b) => b.is_active).length}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Total Views</Text>
              <Eye size={16} color="#0284C7" />
            </View>
            <Text style={styles.metricValueText}>{analytics?.total_views ?? 0}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Total Clicks</Text>
              <MousePointerClick size={16} color="#D97706" />
            </View>
            <Text style={styles.metricValueText}>{analytics?.total_clicks ?? 0}</Text>
          </View>
        </View>

        {/* Banners List Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>YOUR PROMOTIONAL BANNERS ({banners.length})</Text>
        </View>

        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={{ marginTop: 10, color: '#64748B', fontSize: 13, fontWeight: '600' }}>
              Loading banners from live server...
            </Text>
          </View>
        ) : banners.length === 0 ? (
          <View style={styles.emptyCard}>
            <Sparkles size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Promotional Banners Created</Text>
            <Text style={styles.emptySubtitle}>
              Promote your featured factory jobs or walk-in drives with custom banners shown to thousands of job seekers.
            </Text>
            <TouchableOpacity style={styles.emptyActionBtn} onPress={openCreateModal}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.emptyActionText}>Create First Banner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          banners.map((banner) => {
            const isRejected = (banner.status || '').toUpperCase() === 'REJECTED';

            return (
              <View key={banner.id} style={styles.bannerCardContainer}>
                {/* Status & Date Header Row */}
                <View style={styles.cardHeaderRow}>
                  {renderStatusBadge(banner)}
                  <Text style={styles.campaignDateText}>
                    {banner.start_date ? banner.start_date.slice(0, 10) : ''} - {banner.end_date ? banner.end_date.slice(0, 10) : ''}
                  </Text>
                </View>

                {/* 1:1 Pure Live Candidate Homepage Banner Layout */}
                <View style={styles.liveHomepageBannerCard}>
                  <Image
                    source={{
                      uri: banner.banner_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
                    }}
                    style={styles.livePromoImage}
                    resizeMode="cover"
                  />

                  <View style={styles.livePromoOverlay}>
                    <View style={styles.livePromoBadgeOrange}>
                      <Text style={styles.livePromoBadgeOrangeText}>
                        {(banner.advertisement_type || 'BANNER').replace('_', ' ')}
                      </Text>
                    </View>

                    <View style={{ gap: 2 }}>
                      <Text style={styles.livePromoTitle} numberOfLines={1}>
                        {banner.title}
                      </Text>
                      {banner.description ? (
                        <Text style={styles.livePromoDesc} numberOfLines={2}>
                          {banner.description}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.livePromoActionBtnBlue}>
                      <Text style={styles.livePromoActionBtnText}>
                        {banner.button_text || 'Apply Now'}
                      </Text>
                      <ArrowRight size={13} color="#FFFFFF" />
                    </View>
                  </View>
                </View>

                {/* Rejection Notice Box if rejected */}
                {isRejected && banner.rejection_reason ? (
                  <View style={styles.rejectionNoticeBox}>
                    <AlertCircle size={14} color="#DC2626" />
                    <Text style={styles.rejectionNoticeText}>
                      Rejection Reason: {banner.rejection_reason}
                    </Text>
                  </View>
                ) : null}

                {/* Card Footer: Views/Clicks Analytics + Edit/Delete Action Buttons */}
                <View style={styles.bannerFooterRow}>
                  <View style={styles.statsBarInline}>
                    <View style={styles.statItem}>
                      <Eye size={13} color="#64748B" />
                      <Text style={styles.statText}>{banner.views_count || 0} Views</Text>
                    </View>
                    <Text style={{ color: '#CBD5E1' }}>•</Text>
                    <View style={styles.statItem}>
                      <MousePointerClick size={13} color="#64748B" />
                      <Text style={styles.statText}>{banner.clicks_count || 0} Clicks</Text>
                    </View>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => openEditModal(banner)}
                    >
                      <Edit3 size={14} color="#2563EB" />
                      <Text style={styles.actionBtnSecondaryText}>{isRejected ? 'Resubmit' : 'Edit'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnDanger}
                      onPress={() => handleDelete(banner.id, banner.title)}
                    >
                      <Trash2 size={14} color="#DC2626" />
                      <Text style={styles.actionBtnDangerText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal Form for Creating / Editing Banner */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{editingBanner ? 'Edit Banner Advertisement' : 'Create Promotional Banner'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              {/* Title Input */}
              <Text style={styles.inputLabel}>Banner Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Urgent Walk-In Drive for CNC Machinists"
                value={title}
                onChangeText={setTitle}
              />

              {/* Description Input */}
              <Text style={styles.inputLabel}>Short Description / Subtitle</Text>
              <TextInput
                style={[styles.textInput, { height: 65 }]}
                placeholder="e.g. 50 Openings in Waluj MIDC. Immediate Joining."
                value={description}
                onChangeText={setDescription}
                multiline
              />

              {/* Banner Type Picker */}
              <Text style={styles.inputLabel}>Campaign Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {[
                  { id: 'FEATURED_JOB', label: 'Featured Job' },
                  { id: 'URGENT_HIRING', label: 'Urgent Hiring' },
                  { id: 'WALK_IN_DRIVE', label: 'Walk-In Drive' },
                  { id: 'COMPANY_PROMOTION', label: 'Company Spotlight' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      advertisementType === type.id && styles.typeChipActive,
                    ]}
                    onPress={() => setAdvertisementType(type.id as AdvertisementType)}
                  >
                    <Text style={[styles.typeChipText, advertisementType === type.id && styles.typeChipTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Linked Job Picker */}
              {jobs.length > 0 ? (
                <>
                  <Text style={styles.inputLabel}>Link to Posted Job (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    <TouchableOpacity
                      style={[styles.jobChip, !linkedJobId && styles.jobChipActive]}
                      onPress={() => setLinkedJobId('')}
                    >
                      <Text style={[styles.jobChipText, !linkedJobId && styles.jobChipTextActive]}>None (Custom Link)</Text>
                    </TouchableOpacity>
                    {jobs.map((j) => (
                      <TouchableOpacity
                        key={j.id}
                        style={[styles.jobChip, linkedJobId === j.id && styles.jobChipActive]}
                        onPress={() => setLinkedJobId(j.id)}
                      >
                        <Text style={[styles.jobChipText, linkedJobId === j.id && styles.jobChipTextActive]} numberOfLines={1}>
                          {j.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : null}

              {/* Custom Redirect URL */}
              {!linkedJobId ? (
                <>
                  <Text style={styles.inputLabel}>Custom Website / Target URL</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://yourcompany.com/careers"
                    value={redirectUrl}
                    onChangeText={setRedirectUrl}
                  />
                </>
              ) : null}

              {/* Action Button Name / Label Input & Presets */}
              <Text style={styles.inputLabel}>Action Button Text / Label *</Text>
              <TextInput
                style={[styles.textInput, { marginBottom: 6 }]}
                placeholder="e.g. Apply Now, View Details, Register Spot Interview"
                value={buttonText}
                onChangeText={setButtonText}
              />
              <Text style={[styles.inputLabel, { marginTop: 2, marginBottom: 4, color: '#64748B', fontSize: 11 }]}>
                Quick Button Suggestions (Tap to select):
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 14 }}
              >
                {[
                  'Apply Now',
                  'View Job Details',
                  'Register Spot Interview',
                  'Explore Jobs',
                  'Direct Walk-In',
                  'Contact Recruiter',
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.typeChip,
                      buttonText === preset && styles.typeChipActive,
                    ]}
                    onPress={() => setButtonText(preset)}
                  >
                    <Text style={[styles.typeChipText, buttonText === preset && styles.typeChipTextActive]}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Banner Image Upload & Picker */}
              <Text style={styles.inputLabel}>Banner Image *</Text>
              <TouchableOpacity
                style={styles.imagePickerBtn}
                activeOpacity={0.8}
                onPress={handlePickImage}
              >
                <UploadCloud size={20} color="#2563EB" />
                <Text style={styles.imagePickerBtnText}>
                  {bannerImage ? 'Change Image from Photos / Gallery' : 'Select Banner Image from Photos'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.inputLabel, { marginTop: 6 }]}>Or Enter Direct Image URL (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://images.unsplash.com/..."
                value={bannerImage}
                onChangeText={setBannerImage}
              />

              {/* Start & End Date Pickers */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <View style={{ flex: 1 }}>
                  <DatePickerField
                    label="Campaign Start Date"
                    required
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Select start date..."
                    minDate={new Date()}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <DatePickerField
                    label="Campaign End Date"
                    required
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="Select end date..."
                    minDate={startDate ? new Date(startDate) : new Date()}
                  />
                </View>
              </View>

              {/* Target Audience */}
              <Text style={styles.inputLabel}>Target Audience / Region</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Chhatrapati Sambhajinagar ITI Machinists"
                value={targetAudience}
                onChangeText={setTargetAudience}
              />

              {/* Banner Live Card Preview (1:1 Exact Homepage Live Layout) */}
              <Text style={styles.inputLabel}>Live Homepage Banner Preview</Text>
              <View style={styles.liveHomepageBannerCard}>
                <Image
                  source={{
                    uri: bannerImage.trim() || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
                  }}
                  style={styles.livePromoImage}
                  resizeMode="cover"
                />

                <View style={styles.livePromoOverlay}>
                  <View style={styles.livePromoBadgeOrange}>
                    <Text style={styles.livePromoBadgeOrangeText}>
                      {(advertisementType || 'FEATURED_JOB').replace('_', ' ')}
                    </Text>
                  </View>

                  <View style={{ gap: 2 }}>
                    <Text style={styles.livePromoTitle} numberOfLines={1}>
                      {title.trim() || 'Sample Banner Title'}
                    </Text>
                    <Text style={styles.livePromoDesc} numberOfLines={2}>
                      {description.trim() || 'Sample description text preview as shown to candidates on homepage.'}
                    </Text>
                  </View>

                  <View style={styles.livePromoActionBtnBlue}>
                    <Text style={styles.livePromoActionBtnText}>
                      {buttonText || 'Apply Now'}
                    </Text>
                    <ArrowRight size={13} color="#FFFFFF" />
                  </View>
                </View>
              </View>

              {/* Modal Action Buttons */}
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                disabled={isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingBanner ? 'Save & Resubmit Banner' : 'Submit Banner for Approval'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
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
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 110,
  },
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    padding: 12,
    marginBottom: 10,
  },
  actionBarTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionBarSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginBottom: 12,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  metricLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  miniIconSquircle: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Section Header */
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },

  /* Banner Card */
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    marginBottom: 12,
    overflow: 'hidden',
  },
  bannerImageContainer: {
    height: 130,
    width: '100%',
    position: 'relative',
  },
  bannerPreviewImage: {
    width: '100%',
    height: '100%',
  },
  bannerImageOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  typeTagPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  bannerBody: {
    padding: 12,
  },
  bannerTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  bannerDescText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },
  rejectionNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  rejectionNoticeText: {
    fontSize: 11.5,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  bannerCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  campaignDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  liveHomepageBannerCard: {
    height: 175,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 4,
  },
  livePromoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  livePromoOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  livePromoBadgeOrange: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  livePromoBadgeOrangeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  livePromoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  livePromoDesc: {
    fontSize: 11.5,
    color: '#E2E8F0',
    lineHeight: 15,
  },
  livePromoActionBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  livePromoActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statsBarInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnSecondaryText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnDangerText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },

  /* Empty State */
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    marginTop: 14,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  /* Modal Form */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '88%',
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalFormScroll: {
    flex: 1,
    paddingTop: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  typeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  typeChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2563EB',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  imagePickerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  typeChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  typeChipTextActive: {
    color: '#2563EB',
  },
  jobChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    maxWidth: 160,
  },
  jobChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2563EB',
  },
  jobChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  jobChipTextActive: {
    color: '#2563EB',
  },
  previewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  previewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
