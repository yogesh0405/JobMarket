import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Plus,
  Image as ImageIcon,
  Sparkles,
  Eye,
  MousePointerClick,
  CheckCircle2,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../../components/common/Header';
import { apiFetch } from '../../api/client';
import { jobsApi } from '../../api/jobsApi';
import { Advertisement, AdvertisementAnalytics, AdvertisementType, Job } from '../../types';
import { COLORS } from '../../constants/theme';
import { EmployerBannerItemCard } from './components/EmployerBannerItemCard';
import { EmployerBannerModal } from './components/EmployerBannerModal';

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

    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(future.toISOString().split('T')[0]);
    setModalVisible(true);
  };

  const openEditModal = (banner: Advertisement) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setDescription(banner.description || '');
    setBannerImage(banner.banner_image || '');
    setAdvertisementType(banner.advertisement_type || 'FEATURED_JOB');
    setLinkedJobId((banner as any).job_id || (banner as any).jobId || '');
    setRedirectUrl((banner as any).target_url || (banner as any).targetUrl || (banner as any).redirectUrl || '');
    setButtonText(banner.button_text || 'Apply Now');
    setStartDate(banner.start_date ? banner.start_date.slice(0, 10) : '');
    setEndDate(banner.end_date ? banner.end_date.slice(0, 10) : '');
    setTargetAudience(banner.target_audience || '');
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Gallery access is needed to select banner images.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!res.canceled && res.assets[0]) {
        const asset = res.assets[0];
        const base64Data = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        setBannerImage(base64Data);
      }
    } catch (err) {
      Alert.alert('Image Error', 'Could not process selected image.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your banner advertisement.');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Validation Error', 'Please select both start date and end date for the banner campaign.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        bannerImage: bannerImage.trim() || undefined,
        advertisementType,
        jobId: linkedJobId || undefined,
        redirectUrl: redirectUrl.trim() || undefined,
        buttonText: buttonText.trim() || 'Apply Now',
        startDate,
        endDate,
        targetAudience: targetAudience.trim() || undefined,
      };

      let res;
      if (editingBanner) {
        res = await apiFetch(`/api/v1/employer/advertisements/${editingBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch('/api/v1/employer/advertisements', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        Alert.alert(
          'Banner Submitted for Review',
          editingBanner
            ? 'Your updated banner has been saved and sent for admin review.'
            : 'Your promotional banner advertisement has been submitted successfully and is currently pending admin verification.',
          [{ text: 'OK', onPress: () => setModalVisible(false) }]
        );
        loadData();
      } else {
        Alert.alert('Submission Failed', res.message || 'Could not submit banner advertisement.');
      }
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Network error submitting banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, bannerTitle: string) => {
    Alert.alert(
      'Delete Banner',
      `Are you sure you want to delete "${bannerTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiFetch(`/api/v1/employer/advertisements/${id}`, { method: 'DELETE' });
              if (res.success) {
                setBanners((prev) => prev.filter((b) => b.id !== id));
              }
            } catch (err) {
              setBanners((prev) => prev.filter((b) => b.id !== id));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="JobMarket"
        subtitle="Industrial & Factory Jobs"
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Top Header Card */}
        <View style={styles.topHeaderCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.topHeaderTitle}>Promotional Banners Desk</Text>
            <Text style={styles.topHeaderSubtitle}>
              Promote factory job openings & walk-in drives to candidates across Maharashtra
            </Text>
          </View>

          <TouchableOpacity style={styles.createBtnHeader} activeOpacity={0.85} onPress={openCreateModal}>
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.createBtnHeaderText}>Create Banner</Text>
          </TouchableOpacity>
        </View>

        {/* Analytics Performance Summary Metrics Card */}
        <View style={styles.analyticsGridRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Total Banners</Text>
              <ImageIcon size={16} color={COLORS.primary} />
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
            <ActivityIndicator size="large" color={COLORS.primary} />
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
          banners.map((banner) => (
            <EmployerBannerItemCard
              key={banner.id}
              banner={banner}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>

      {/* Create / Edit Modal */}
      <EmployerBannerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        editingBanner={editingBanner}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        advertisementType={advertisementType}
        setAdvertisementType={setAdvertisementType}
        jobs={jobs}
        linkedJobId={linkedJobId}
        setLinkedJobId={setLinkedJobId}
        redirectUrl={redirectUrl}
        setRedirectUrl={setRedirectUrl}
        buttonText={buttonText}
        setButtonText={setButtonText}
        bannerImage={bannerImage}
        setBannerImage={setBannerImage}
        onPickImage={handlePickImage}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        targetAudience={targetAudience}
        setTargetAudience={setTargetAudience}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
  },
  topHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    marginBottom: 12,
  },
  topHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  topHeaderSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  createBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createBtnHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  analyticsGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  metricValueText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
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
    marginBottom: 14,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
  },
  emptyActionText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
