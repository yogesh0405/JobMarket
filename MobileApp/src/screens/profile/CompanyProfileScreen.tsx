import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Building2,
  BarChart3,
  Save,
  LogOut,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi } from '../../api/jobsApi';
import { candidateApi } from '../../api/candidateApi';
import { apiFetch } from '../../api/client';
import { Header } from '../../components/common/Header';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { Button } from '../../components/common/Button';
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { COLORS } from '../../constants/theme';
import { CompanyProfileFormCard } from './components/CompanyProfileFormCard';
import { CompanyProfileAnalyticsTab } from './components/CompanyProfileAnalyticsTab';

interface Props {
  navigation: any;
}

const INDUSTRY_LIST = [
  'Automotive & Auto Components',
  'Industrial Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Logistics & Warehousing',
  'Services & General Engineering',
];

const MIDC_LIST = [
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (PCMC Pune)',
  'Ranjangaon MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Hadapsar Industrial Estate',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Shendra MIDC (Chhatrapati Sambhajinagar)',
  'Taloja MIDC (Navi Mumbai)',
  'Rabale MIDC (Navi Mumbai)',
  'Tarapur MIDC (Palghar)',
  'Additional Ambernath MIDC (Thane)',
  'Satpur MIDC (Nashik)',
  'Ambad MIDC (Nashik)',
  'Kagal Five Star MIDC (Kolhapur)',
  'Gokul Shirgaon MIDC (Kolhapur)',
  'Butibori MIDC (Nagpur)',
  'Rohanan MIDC (Raigad)',
  'Non-MIDC Private Industrial Zone',
];

export const CompanyProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUserProfile, refreshUser, logout } = useAuth();

  // Tab State: PROFILE vs ANALYTICS
  const [profileTab, setProfileTab] = useState<'PROFILE' | 'ANALYTICS'>('PROFILE');

  // Profile Form State
  const [companyName, setCompanyName] = useState(user?.companyName || user?.company_name || '');
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || user?.gst_number || '');
  const [industry, setIndustry] = useState(
    user?.tradeSpecialization || user?.trade_specialization || user?.industry || 'Industrial Manufacturing'
  );
  const [midcZone, setMidcZone] = useState(user?.midcZone || user?.midc_zone || 'Chakan MIDC (Pune)');
  const [contactPerson, setContactPerson] = useState(user?.contactPerson || user?.contact_person || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [address, setAddress] = useState(user?.address || '');
  const [description, setDescription] = useState(user?.companyDescription || user?.company_description || '');
  const [logoUri, setLogoUri] = useState<string | null>(user?.companyLogo || user?.company_logo || null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Backend Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewed: 0,
    hired: 0,
    rejected: 0,
    avgResponseTimeHours: 24,
  });

  const fetchAnalytics = async () => {
    try {
      const [res, jobsRes] = await Promise.all([
        apiFetch('/api/v1/jobs/employer/analytics').catch(() => ({ success: false, data: null })),
        jobsApi.getMyJobs().catch(() => ({ success: false, data: [] })),
      ]);

      const myJobs: any[] = (jobsRes.success && Array.isArray(jobsRes.data)) ? jobsRes.data : [];
      const calcTotalJobs = myJobs.length;
      const calcActiveJobs = myJobs.filter((j: any) => ['APPROVED', 'ACTIVE'].includes((j.status || '').toUpperCase())).length;
      const calcTotalApps = myJobs.reduce((acc: number, j: any) => {
        const count = typeof j.applicants_count === 'number' ? j.applicants_count : (Array.isArray(j.applicants) ? j.applicants.length : 0);
        return acc + count;
      }, 0);

      const calcShortlisted = myJobs.reduce((acc: number, j: any) => {
        if (!Array.isArray(j.applicants)) return acc;
        return acc + j.applicants.filter((a: any) => ['shortlisted', 'accepted', 'approved', 'under_review'].includes((a.status || '').toLowerCase())).length;
      }, 0);

      const calcInterviewed = myJobs.reduce((acc: number, j: any) => {
        if (!Array.isArray(j.applicants)) return acc;
        return acc + j.applicants.filter((a: any) => ['interview', 'interview_scheduled', 'interviewed', 'called', 'applied'].includes((a.status || '').toLowerCase())).length;
      }, 0);

      const calcHired = myJobs.reduce((acc: number, j: any) => {
        if (!Array.isArray(j.applicants)) return acc;
        return acc + j.applicants.filter((a: any) => ['hired', 'joined', 'offered', 'selected'].includes((a.status || '').toLowerCase())).length;
      }, 0);

      if (res.success && res.data && (Number(res.data.totalJobs) > 0 || Number(res.data.totalApplications) > 0)) {
        setAnalyticsData({
          totalJobs: Number(res.data.totalJobs || 0),
          activeJobs: Number(res.data.activeJobs || 0),
          totalApplications: Number(res.data.totalApplications || 0),
          shortlisted: Number(res.data.shortlisted || 0),
          interviewed: Number(res.data.interviewed || 0),
          hired: Number(res.data.hired || 0),
          rejected: Number(res.data.rejected || 0),
          avgResponseTimeHours: Number(res.data.avgResponseTimeHours || 24),
        });
      } else {
        setAnalyticsData({
          totalJobs: calcTotalJobs,
          activeJobs: calcActiveJobs,
          totalApplications: calcTotalApps,
          shortlisted: calcShortlisted,
          interviewed: calcInterviewed,
          hired: calcHired,
          rejected: 0,
          avgResponseTimeHours: 24,
        });
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      await fetchAnalytics();
    } catch (_) {
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.companyName || user.company_name) setCompanyName(user.companyName || user.company_name || '');
      if (user.gstNumber || user.gst_number) setGstNumber(user.gstNumber || user.gst_number || '');
      if (user.tradeSpecialization || user.trade_specialization || user.industry) {
        setIndustry(user.tradeSpecialization || user.trade_specialization || user.industry || 'Industrial Manufacturing');
      }
      if (user.midcZone || user.midc_zone) setMidcZone(user.midcZone || user.midc_zone || 'Chakan MIDC (Pune)');
      if (user.contactPerson || user.contact_person || user.name) setContactPerson(user.contactPerson || user.contact_person || user.name || '');
      if (user.phone) setPhone(user.phone || '');
      if (user.website) setWebsite(user.website || '');
      if (user.address) setAddress(user.address || '');
      if (user.companyDescription || user.company_description) {
        setDescription(user.companyDescription || user.company_description || '');
      }
      if (user.companyLogo || user.company_logo) setLogoUri(user.companyLogo || user.company_logo || null);
    }
  }, [user]);

  const handlePickLogo = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required to upload logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const photoUri = asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : (asset.uri || '');
      setLogoUri(photoUri);

      try {
        const res = await candidateApi.uploadProfilePicture(photoUri);
        const finalCloudUrl = res.data?.url || photoUri;

        await updateUserProfile({
          companyLogo: finalCloudUrl,
          company_logo: finalCloudUrl,
          logoUrl: finalCloudUrl,
          logo_url: finalCloudUrl,
          profile_picture_url: finalCloudUrl,
          profilePictureUrl: finalCloudUrl,
          avatar_url: finalCloudUrl,
          avatarUrl: finalCloudUrl,
          avatar: finalCloudUrl,
        } as any);
        setLogoUri(finalCloudUrl);
      } catch (err) {
        console.warn('Background logo Cloudinary upload notice:', err);
      }
    }
  };

  const handleSaveProfile = async () => {
    setError(null);

    if (!companyName.trim()) {
      setError('Company / Enterprise Name is mandatory.');
      return;
    }

    if (gstNumber.trim() && gstNumber.trim().length !== 15) {
      setError('GST Registration Number must be exactly 15 characters (e.g. 27AAAAA0000A1Z5).');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        companyName: companyName.trim(),
        company_name: companyName.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        gst_number: gstNumber.trim().toUpperCase(),
        tradeSpecialization: industry,
        trade_specialization: industry,
        industry,
        midcZone,
        midc_zone: midcZone,
        contactPerson: contactPerson.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        companyDescription: description.trim(),
        company_description: description.trim(),
        companyLogo: logoUri || undefined,
        company_logo: logoUri || undefined,
        logoUrl: logoUri || undefined,
        logo_url: logoUri || undefined,
      } as any);

      Alert.alert('Profile Saved', 'Company profile details updated successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to update company profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your employer account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Company Profile & Settings"
        subtitle="Manage enterprise details, branding & analytics"
        onBack={() => navigation.goBack()}
        hideRightActions={true}
      />

      {/* Top Navigation Tabs */}
      <View style={styles.topTabBarRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabItemBtn, profileTab === 'PROFILE' && styles.tabItemBtnActive]}
          onPress={() => setProfileTab('PROFILE')}
        >
          <Building2 size={15} color={profileTab === 'PROFILE' ? COLORS.primary : '#64748B'} />
          <Text style={[styles.tabItemText, profileTab === 'PROFILE' && styles.tabItemTextActive]}>Enterprise Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tabItemBtn, profileTab === 'ANALYTICS' && styles.tabItemBtnActive]}
          onPress={() => setProfileTab('ANALYTICS')}
        >
          <BarChart3 size={15} color={profileTab === 'ANALYTICS' ? COLORS.primary : '#64748B'} />
          <Text style={[styles.tabItemText, profileTab === 'ANALYTICS' && styles.tabItemTextActive]}>Recruitment Analytics</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContentBody}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {error ? <ErrorBanner message={error} /> : null}

        {profileTab === 'PROFILE' ? (
          <CompanyProfileFormCard
            logoUri={logoUri}
            onPickLogo={handlePickLogo}
            companyName={companyName}
            setCompanyName={setCompanyName}
            gstNumber={gstNumber}
            setGstNumber={setGstNumber}
            industry={industry}
            setIndustry={setIndustry}
            industryList={INDUSTRY_LIST}
            midcZone={midcZone}
            setMidcZone={setMidcZone}
            midcList={MIDC_LIST}
            contactPerson={contactPerson}
            setContactPerson={setContactPerson}
            userEmail={user?.email}
            phone={phone}
            setPhone={setPhone}
            website={website}
            setWebsite={setWebsite}
            address={address}
            setAddress={setAddress}
            description={description}
            setDescription={setDescription}
          />
        ) : (
          <CompanyProfileAnalyticsTab analyticsData={analyticsData} />
        )}

        {profileTab === 'PROFILE' && (
          <View style={{ marginTop: 16, marginBottom: 28 }}>
            <Button
              title="Save Company Profile"
              onPress={handleSaveProfile}
              loading={loading}
              icon={<Save size={16} color="#FFFFFF" />}
              style={{ borderRadius: 6, height: 46 }}
            />
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topTabBarRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  tabItemBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabItemTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContentBody: {
    padding: 16,
    paddingBottom: 120,
  },
  logoutBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 10,
  },
  logoutBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DC2626',
  },
});
