import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  Globe,
  MapPin,
  Camera,
  ShieldCheck,
  LogOut,
  Lock,
  UserCheck,
  Briefcase,
  Layers,
  ChevronRight,
  HelpCircle,
  Info,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Award,
  Clock,
  ArrowUpRight,
  PieChart,
  Zap,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi } from '../../api/jobsApi';
import { candidateApi } from '../../api/candidateApi';
import { apiFetch } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { SelectDropdown } from '../../components/common/SelectDropdown';
import { ProfileSkeleton, AnalyticsSkeleton } from '../../components/common/SkeletonLoader';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

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
  const [pageLoading, setPageLoading] = useState(true);
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
    } catch (_) {} finally {
      setPageLoading(false);
    }
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

  React.useEffect(() => {
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

      // Upload to live Cloudinary CDN & PostgreSQL Database
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
      });

      setLoading(false);
      Alert.alert(
        'Profile Saved',
        'Your company profile details have been saved directly to the database!'
      );
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to update company profile.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout Confirmation', 'Are you sure you want to sign out from JobMarket?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} tintColor="#2563EB" />
          }
        >
          {error ? <ErrorBanner message={error} style={{ marginBottom: SPACING.md }} /> : null}

          {pageLoading ? (
            profileTab === 'ANALYTICS' ? <AnalyticsSkeleton /> : <ProfileSkeleton />
          ) : (
            <>
          {/* Compact White Header Profile Card with Tabular Navigation Inside Below Profile & Name */}
          <View style={styles.heroBanner}>
            <View style={styles.avatarRow}>
              <TouchableOpacity style={styles.avatarPicker} activeOpacity={0.8} onPress={handlePickLogo}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Building2 size={24} color="#2563EB" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={10} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.companyTitle} numberOfLines={1}>
                    {companyName || 'Enterprise Company Name'}
                  </Text>
                  <ShieldCheck size={16} color="#16A34A" />
                </View>
                <Text style={styles.emailSubtitle} numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
            </View>

            <View style={styles.cardRowDivider} />

            {/* Tabular Segmented Menu Inside Header Card Below Profile & Name */}
            <View style={styles.tabsInsideHeroWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setProfileTab('PROFILE')}
                style={[styles.industryTabPill, profileTab === 'PROFILE' && styles.industryTabPillActive]}
              >
                <Building2 size={14} color={profileTab === 'PROFILE' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.industryTabText, profileTab === 'PROFILE' && styles.industryTabTextActive]}>
                  Company Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setProfileTab('ANALYTICS')}
                style={[styles.industryTabPill, profileTab === 'ANALYTICS' && styles.industryTabPillActive]}
              >
                <BarChart3 size={14} color={profileTab === 'ANALYTICS' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.industryTabText, profileTab === 'ANALYTICS' && styles.industryTabTextActive]}>
                  Analytics
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {profileTab === 'ANALYTICS' ? (
            <View style={styles.analyticsCard}>
              {/* SECTION 1: Recruitment Performance */}
              <View style={styles.cardHeaderWithBadge}>
                <View style={styles.cardTitleBox}>
                  <View style={styles.sectionIconBox}>
                    <BarChart3 size={18} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Recruitment Performance</Text>
                    <Text style={styles.sectionSubtitle}>Real-time pipeline & hiring statistics</Text>
                  </View>
                </View>
              </View>

              {/* 6 Aligned Metric Rows */}
              <View style={styles.proRowsContainer}>
                {/* Row 1: Posted Vacancies */}
                <View style={styles.metricRow}>
                  <View style={styles.rowIconBox}>
                    <Briefcase size={16} color="#2563EB" />
                  </View>
                  <Text style={styles.rowMetricTitle}>Posted Job Vacancies</Text>
                  <Text style={styles.rowMetricVal}>{analyticsData.totalJobs}</Text>
                </View>

                <View style={styles.rowDivider} />

                {/* Row 2: Total Applications */}
                <View style={styles.metricRow}>
                  <View style={styles.rowIconBox}>
                    <Users size={16} color="#16A34A" />
                  </View>
                  <Text style={styles.rowMetricTitle}>Total Applications</Text>
                  <Text style={styles.rowMetricVal}>{analyticsData.totalApplications}</Text>
                </View>

                <View style={styles.rowDivider} />

                {/* Row 3: Shortlisted */}
                <View style={styles.metricRow}>
                  <View style={styles.rowIconBox}>
                    <Award size={16} color="#D97706" />
                  </View>
                  <Text style={styles.rowMetricTitle}>Shortlisted Candidates</Text>
                  <Text style={styles.rowMetricVal}>{analyticsData.shortlisted}</Text>
                </View>

                <View style={styles.rowDivider} />

                {/* Row 4: Technical Interviews */}
                <View style={styles.metricRow}>
                  <View style={styles.rowIconBox}>
                    <Calendar size={16} color="#0284C7" />
                  </View>
                  <Text style={styles.rowMetricTitle}>Technical Interviews</Text>
                  <Text style={styles.rowMetricVal}>{analyticsData.interviewed}</Text>
                </View>

                <View style={styles.rowDivider} />

                {/* Row 5: Confirmed Hires Offered */}
                <View style={styles.metricRow}>
                  <View style={styles.rowIconBox}>
                    <UserCheck size={16} color="#9333EA" />
                  </View>
                  <Text style={styles.rowMetricTitle}>Confirmed Hires</Text>
                  <Text style={styles.rowMetricVal}>{analyticsData.hired}</Text>
                </View>

                <View style={styles.rowDivider} />

                {/* Row 6: Response Speed */}
                <View style={styles.metricRow}>
                  <View style={styles.rowIconBox}>
                    <Clock size={16} color="#059669" />
                  </View>
                  <Text style={styles.rowMetricTitle}>Avg Response Speed</Text>
                  <Text style={styles.rowMetricVal}>{analyticsData.avgResponseTimeHours}h</Text>
                </View>
              </View>

              <View style={styles.sectionDividerInline} />

              {/* SECTION 2: Hiring Conversion Funnel */}
              {(() => {
                const totalApps = analyticsData.totalApplications || 1;
                const shortlistedPct = Math.min(100, Math.round((analyticsData.shortlisted / totalApps) * 100));
                const interviewedPct = Math.min(100, Math.round((analyticsData.interviewed / totalApps) * 100));
                const hiredPct = Math.min(100, Math.round((analyticsData.hired / totalApps) * 100));

                return (
                  <View>
                    <View style={styles.cardTitleBox}>
                      <View style={styles.sectionIconBox}>
                        <PieChart size={18} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Recruitment Conversion Funnel</Text>
                        <Text style={styles.sectionSubtitle}>Live database candidate pipeline metrics</Text>
                      </View>
                    </View>

                    <View style={{ gap: 6, marginTop: 4 }}>
                      <View>
                        <View style={styles.funnelRow}>
                          <Text style={styles.funnelLabel}>1. Total Applications Received</Text>
                          <Text style={styles.funnelVal}>{analyticsData.totalApplications} (100%)</Text>
                        </View>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: '100%', backgroundColor: '#2563EB' }]} />
                        </View>
                      </View>

                      <View>
                        <View style={styles.funnelRow}>
                          <Text style={styles.funnelLabel}>2. Shortlisted for Evaluation</Text>
                          <Text style={styles.funnelVal}>{analyticsData.shortlisted} ({shortlistedPct}%)</Text>
                        </View>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${shortlistedPct}%`, backgroundColor: '#D97706' }]} />
                        </View>
                      </View>

                      <View>
                        <View style={styles.funnelRow}>
                          <Text style={styles.funnelLabel}>3. Technical Interviews Invited</Text>
                          <Text style={styles.funnelVal}>{analyticsData.interviewed} ({interviewedPct}%)</Text>
                        </View>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${interviewedPct}%`, backgroundColor: '#0284C7' }]} />
                        </View>
                      </View>

                      <View style={{ marginBottom: 14 }}>
                        <View style={styles.funnelRow}>
                          <Text style={styles.funnelLabel}>4. Confirmed Hires Offered</Text>
                          <Text style={styles.funnelVal}>{analyticsData.hired} ({hiredPct}%)</Text>
                        </View>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${hiredPct}%`, backgroundColor: '#16A34A' }]} />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })()}

              <View style={[styles.sectionDividerInline, { marginBottom: 12, marginTop: 10 }]} />

              {/* SECTION 3: Quick Navigation Shortcuts */}
              <View style={{ marginTop: 8 }}>
                <Text style={styles.infoSectionTitle}>RECRUITMENT DASHBOARD ACTIONS</Text>
                <View style={{ gap: 4, marginTop: 4 }}>
                  <TouchableOpacity
                    style={styles.actionNavRow}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('PostTab')}
                  >
                    <Briefcase size={16} color="#2563EB" />
                    <Text style={styles.actionNavText}>Post New Job Vacancy</Text>
                    <ArrowUpRight size={16} color="#64748B" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionNavRow}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ManageJobsTab')}
                  >
                    <Layers size={16} color="#D97706" />
                    <Text style={styles.actionNavText}>Manage Posted Jobs & Vacancies</Text>
                    <ArrowUpRight size={16} color="#64748B" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionNavRow}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('CandidatesTab')}
                  >
                    <Users size={16} color="#16A34A" />
                    <Text style={styles.actionNavText}>Explore Candidate Talent Pool</Text>
                    <ArrowUpRight size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              {/* SECTION 1: GENERAL ENTERPRISE DETAILS */}
              <View>
                <View style={styles.cardTitleBox}>
                  <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Building2 size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>General Enterprise Details</Text>
                    <Text style={styles.sectionSubtitle}>Primary company registration & industrial zone info</Text>
                  </View>
                </View>

                <Input
                  label="Company / Enterprise Name *"
                  placeholder="e.g. Acme Industrial Technologies Pvt Ltd"
                  value={companyName}
                  onChangeText={setCompanyName}
                  leftIcon={<Building2 size={18} color={COLORS.slate400} />}
                />

                <Input
                  label="GST Registration Number"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  autoCapitalize="characters"
                  maxLength={15}
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  leftIcon={<FileText size={18} color={COLORS.slate400} />}
                />

                <SelectDropdown
                  label="Primary Industry Sector *"
                  required
                  placeholder="Select Industry Sector..."
                  value={industry}
                  options={INDUSTRY_LIST}
                  onSelect={(val) => setIndustry(val)}
                />

                <SelectDropdown
                  label="MIDC Industrial Zone in Maharashtra"
                  placeholder="Select MIDC Zone..."
                  value={midcZone}
                  options={MIDC_LIST}
                  onSelect={(val) => setMidcZone(val)}
                />
              </View>

              <View style={styles.sectionDivider} />

              {/* SECTION 2: CONTACT & PLANT LOCATION */}
              <View>
                <View style={styles.cardTitleBox}>
                  <View style={[styles.sectionIconBox, { backgroundColor: '#F0FDF4' }]}>
                    <UserCheck size={20} color="#15803D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>Contact & Plant Location</Text>
                    <Text style={styles.sectionSubtitle}>Recruiter contact person & factory plant details</Text>
                  </View>
                </View>

                <Input
                  label="Primary Recruiter / HR Contact Person"
                  placeholder="e.g. Rajesh Sharma (HR Head)"
                  value={contactPerson}
                  onChangeText={setContactPerson}
                  leftIcon={<UserCheck size={18} color={COLORS.slate400} />}
                />

                <Input
                  label="Contact Phone Number"
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  leftIcon={<Phone size={18} color={COLORS.slate400} />}
                />

                <Input
                  label="Company Official Website"
                  placeholder="https://www.company.com"
                  autoCapitalize="none"
                  keyboardType="url"
                  value={website}
                  onChangeText={setWebsite}
                  leftIcon={<Globe size={18} color={COLORS.slate400} />}
                />

                <Input
                  label="Registered Plant / Office Address"
                  placeholder="Full factory or office street address..."
                  multiline
                  numberOfLines={2}
                  value={address}
                  onChangeText={setAddress}
                  leftIcon={<MapPin size={18} color={COLORS.slate400} />}
                />

                <Input
                  label="Company Overview & Products"
                  placeholder="Brief overview of products, CNC capabilities, shifts, or company history..."
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                  style={{ minHeight: 70 }}
                />

                <Button
                  title="Save Company Profile"
                  onPress={handleSaveProfile}
                  loading={loading}
                  style={{ marginTop: SPACING.xs }}
                />
              </View>
            </View>
          )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 130,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPicker: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2563EB',
    padding: 3,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  verifiedText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },
  companyTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  emailSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  cardRowDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 2,
  },
  tabsInsideHeroWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 2,
  },
  industryTabPill: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    paddingHorizontal: 4,
    marginBottom: -2,
  },
  industryTabPillActive: {
    borderBottomColor: '#2563EB',
  },
  industryTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  industryTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  sectionDividerInline: {
    height: 1,
    backgroundColor: '#64748B',
    marginTop: 14,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  cardTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionIconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate900,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: COLORS.slate500,
    marginTop: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  navSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: COLORS.slate500,
  },
  tabStripWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
  },
  tabBtnInactive: {
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  tabBtnBanners: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
  },
  tabBtnBannersText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  cardHeaderWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  liveIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  proRowsContainer: {
    paddingVertical: 0,
    marginTop: 0,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1.5,
    gap: 8,
  },
  rowIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMetricTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  rowRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowMetricVal: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 26,
    textAlign: 'right',
    marginRight: 10,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  tileGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metricTile: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  tileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tileIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileMetricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  tileMetricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  proMetaPillBlue: {
    marginLeft: 'auto',
  },
  proMetaPillTextBlue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  proMetaPillGreen: {
    marginLeft: 'auto',
  },
  proMetaPillTextGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  proMetaPillAmber: {
    marginLeft: 'auto',
  },
  proMetaPillTextAmber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  proMetaPillSky: {
    marginLeft: 'auto',
  },
  proMetaPillTextSky: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  proMetaPillPurple: {
    marginLeft: 'auto',
  },
  proMetaPillTextPurple: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9333EA',
  },
  proMetaPillEmerald: {
    marginLeft: 'auto',
  },
  proMetaPillTextEmerald: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  funnelLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  funnelVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  barBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  infoSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  actionNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  actionNavText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
});
