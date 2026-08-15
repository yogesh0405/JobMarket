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
  ActivityIndicator,
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
  Save,
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
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { ProfileSkeleton, AnalyticsSkeleton } from '../../components/common/SkeletonLoader';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';

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
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFFFFF']} tintColor="#FFFFFF" />
        }
      >
          {/* Top overscroll blue fill */}
          <View style={styles.topOverscrollBlueFill} />

          {error ? <ErrorBanner message={error} style={{ marginHorizontal: 16, marginBottom: 8 }} /> : null}

          {/* Hero Blue Banner */}
          <LinearGradient
            colors={COLORS.employerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.heroBlueBanner}
          >
            <View style={styles.bannerBadgeTop}>
              <ShieldCheck size={12} color="#FFFFFF" />
              <Text style={styles.bannerBadgeTopText}>VERIFIED EMPLOYER</Text>
            </View>
          </LinearGradient>

          {/* Profile Header Card */}
          <View style={styles.profileHeaderCard}>
            {/* Overlapping circular avatar */}
            <View style={styles.centeredAvatarContainer}>
              <TouchableOpacity style={styles.avatarOverlappingCircle} onPress={handlePickLogo} activeOpacity={0.85}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.avatarImgFull} />
                ) : (
                  <Building2 size={36} color="#FFFFFF" />
                )}
                <View style={styles.cameraIconBadgeOverlapping}>
                  <Camera size={12} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Company info + tabs */}
            <View style={styles.companyHeaderInfoStack}>
              <View style={styles.nameRowCentered}>
                <Text style={styles.companyNameTitle} numberOfLines={1}>
                  {companyName || 'Enterprise Company'}
                </Text>
                <CheckCircle2 size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.companyEmailSubtitle}>{user?.email}</Text>

              {/* Underline tab bar */}
              <View style={styles.tabBarContainerUnderProfile}>
                <TouchableOpacity
                  style={[styles.tabSegmentBtn, profileTab === 'PROFILE' && styles.tabSegmentBtnActive]}
                  activeOpacity={0.7}
                  onPress={() => setProfileTab('PROFILE')}
                >
                  <Building2 size={16} color={profileTab === 'PROFILE' ? COLORS.primary : '#64748B'} />
                  <Text style={[styles.tabSegmentText, profileTab === 'PROFILE' && styles.tabSegmentTextActive]}>
                    About
                  </Text>
                  {profileTab === 'PROFILE' ? <View style={styles.activeTabIndicator} /> : null}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabSegmentBtn, profileTab === 'ANALYTICS' && styles.tabSegmentBtnActive]}
                  activeOpacity={0.7}
                  onPress={() => setProfileTab('ANALYTICS')}
                >
                  <BarChart3 size={16} color={profileTab === 'ANALYTICS' ? COLORS.primary : '#64748B'} />
                  <Text style={[styles.tabSegmentText, profileTab === 'ANALYTICS' && styles.tabSegmentTextActive]}>
                    Analytics
                  </Text>
                  {profileTab === 'ANALYTICS' ? <View style={styles.activeTabIndicator} /> : null}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {profileTab === 'ANALYTICS' ? (
            <>
              <View style={styles.sectionDivider} />
              <View style={styles.cardContainerBlock}>
                <View style={styles.cardHeaderRowCustom}>
                  <View style={styles.cardIconChipSquare}>
                    <BarChart3 size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.cardHeaderTitleText}>Recruitment Performance</Text>
                </View>
                {pageLoading ? <AnalyticsSkeleton /> : (
                  <View style={{ gap: 0 }}>
                    <View style={styles.metricRow}><Briefcase size={16} color="#0F172A" /><Text style={styles.rowMetricTitle}>Posted Job Vacancies</Text><Text style={styles.rowMetricVal}>{analyticsData.totalJobs}</Text></View>
                    <View style={styles.rowDivider} />
                    <View style={styles.metricRow}><Users size={16} color="#0F172A" /><Text style={styles.rowMetricTitle}>Total Applications</Text><Text style={styles.rowMetricVal}>{analyticsData.totalApplications}</Text></View>
                    <View style={styles.rowDivider} />
                    <View style={styles.metricRow}><Award size={16} color="#0F172A" /><Text style={styles.rowMetricTitle}>Shortlisted Candidates</Text><Text style={styles.rowMetricVal}>{analyticsData.shortlisted}</Text></View>
                    <View style={styles.rowDivider} />
                    <View style={styles.metricRow}><Calendar size={16} color="#0F172A" /><Text style={styles.rowMetricTitle}>Interview Invites</Text><Text style={styles.rowMetricVal}>{analyticsData.interviewed}</Text></View>
                    <View style={styles.rowDivider} />
                    <View style={styles.metricRow}><UserCheck size={16} color="#0F172A" /><Text style={styles.rowMetricTitle}>Confirmed Hires</Text><Text style={styles.rowMetricVal}>{analyticsData.hired}</Text></View>
                    <View style={styles.rowDivider} />
                    <View style={styles.metricRow}><Clock size={16} color="#0F172A" /><Text style={styles.rowMetricTitle}>Avg Response Speed</Text><Text style={styles.rowMetricVal}>{analyticsData.avgResponseTimeHours}h</Text></View>
                  </View>
                )}
              </View>

              <View style={styles.sectionDivider} />

              {(() => {
                const totalApps = analyticsData.totalApplications || 1;
                const shortlistedPct = Math.min(100, Math.round((analyticsData.shortlisted / totalApps) * 100));
                const interviewedPct = Math.min(100, Math.round((analyticsData.interviewed / totalApps) * 100));
                const hiredPct = Math.min(100, Math.round((analyticsData.hired / totalApps) * 100));
                return (
                  <View style={styles.cardContainerBlock}>
                    <View style={styles.cardHeaderRowCustom}>
                      <View style={styles.cardIconChipSquare}><TrendingUp size={18} color={COLORS.primary} /></View>
                      <Text style={styles.cardHeaderTitleText}>Conversion Funnel</Text>
                    </View>
                    <View style={{ gap: 14 }}>
                      <View><View style={styles.funnelRow}><Text style={styles.funnelLabel}>1. Applications Received</Text><Text style={styles.funnelVal}>{analyticsData.totalApplications} (100%)</Text></View><View style={styles.barBg}><View style={[styles.barFill, { width: '100%', backgroundColor: 'rgba(27,73,128,0.35)' }]} /></View></View>
                      <View><View style={styles.funnelRow}><Text style={styles.funnelLabel}>2. Shortlisted</Text><Text style={styles.funnelVal}>{analyticsData.shortlisted} ({shortlistedPct}%)</Text></View><View style={styles.barBg}><View style={[styles.barFill, { width: `${shortlistedPct}%`, backgroundColor: 'rgba(27,73,128,0.35)' }]} /></View></View>
                      <View><View style={styles.funnelRow}><Text style={styles.funnelLabel}>3. Interview Invites</Text><Text style={styles.funnelVal}>{analyticsData.interviewed} ({interviewedPct}%)</Text></View><View style={styles.barBg}><View style={[styles.barFill, { width: `${interviewedPct}%`, backgroundColor: 'rgba(27,73,128,0.35)' }]} /></View></View>
                      <View><View style={styles.funnelRow}><Text style={styles.funnelLabel}>4. Confirmed Hires</Text><Text style={styles.funnelVal}>{analyticsData.hired} ({hiredPct}%)</Text></View><View style={styles.barBg}><View style={[styles.barFill, { width: `${hiredPct}%`, backgroundColor: 'rgba(27,73,128,0.35)' }]} /></View></View>
                    </View>
                  </View>
                );
              })()}

              <View style={styles.sectionDivider} />

              <View style={styles.cardContainerBlock}>
                <View style={styles.cardHeaderRowCustom}>
                  <View style={styles.cardIconChipSquare}><Zap size={18} color={COLORS.primary} /></View>
                  <Text style={styles.cardHeaderTitleText}>Recruitment Actions</Text>
                </View>
                <View>
                  <TouchableOpacity style={styles.actionNavRow} activeOpacity={0.7} onPress={() => navigation.navigate('PostTab')}>
                    <Briefcase size={16} color="#0F172A" /><Text style={styles.actionNavText}>Post New Job Vacancy</Text><ArrowUpRight size={16} color="#94A3B8" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionNavRow} activeOpacity={0.7} onPress={() => navigation.navigate('ManageJobsTab')}>
                    <Layers size={16} color="#0F172A" /><Text style={styles.actionNavText}>Manage Posted Jobs</Text><ArrowUpRight size={16} color="#94A3B8" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionNavRow, { borderBottomWidth: 0 }]} activeOpacity={0.7} onPress={() => navigation.navigate('CandidatesTab')}>
                    <Users size={16} color="#0F172A" /><Text style={styles.actionNavText}>Explore Candidate Pool</Text><ArrowUpRight size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.sectionDivider} />

              <View style={styles.cardContainerBlock}>
                <View style={styles.cardHeaderRowCustom}>
                  <View style={styles.cardIconChipSquare}><Building2 size={18} color={COLORS.primary} /></View>
                  <Text style={styles.cardHeaderTitleText}>Company Details</Text>
                </View>
                <Input label="Company / Enterprise Name *" placeholder="e.g. Acme Industrial Technologies Pvt Ltd" value={companyName} onChangeText={setCompanyName} />
                <Input label="GST Registration Number" placeholder="e.g. 27AAAAA0000A1Z5" autoCapitalize="characters" maxLength={15} value={gstNumber} onChangeText={setGstNumber} />
                <SelectDropdown label="Primary Industry Sector *" required placeholder="Select Industry Sector..." value={industry} options={INDUSTRY_LIST} onSelect={(val) => setIndustry(val)} />
                <SelectDropdown label="MIDC Industrial Zone" placeholder="Select MIDC Zone..." value={midcZone} options={MIDC_LIST} onSelect={(val) => setMidcZone(val)} />
              </View>

              <View style={styles.sectionDivider} />

              <View style={styles.cardContainerBlock}>
                <View style={styles.cardHeaderRowCustom}>
                  <View style={styles.cardIconChipSquare}><Mail size={18} color={COLORS.primary} /></View>
                  <Text style={styles.cardHeaderTitleText}>Contact & Location</Text>
                </View>
                <View style={styles.contactListStack}>
                  <View style={styles.contactItemRow}>
                    <View style={styles.contactIconBox}><Mail size={16} color="#64748B" /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactLabelSmall}>Email Address</Text>
                      <Text style={styles.contactValueText}>{user?.email || '—'}</Text>
                    </View>
                  </View>
                </View>
                <Input label="Primary Recruiter / HR Contact Person" placeholder="e.g. Rajesh Sharma (HR Head)" value={contactPerson} onChangeText={setContactPerson} />
                <Input label="Contact Phone Number" placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} />
                <Input label="Company Official Website" placeholder="https://www.company.com" autoCapitalize="none" keyboardType="url" value={website} onChangeText={setWebsite} />
                <Input label="Registered Plant / Office Address" placeholder="Full factory or office street address..." multiline numberOfLines={2} value={address} onChangeText={setAddress} />
                <Input label="Company Overview & Products" placeholder="Brief overview of products, CNC capabilities, shifts, or company history..." multiline numberOfLines={3} value={description} onChangeText={setDescription} style={{ minHeight: 70 }} />
              </View>

              <TouchableOpacity activeOpacity={0.85} style={styles.saveProfileBtn} onPress={handleSaveProfile} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : (<><Save size={18} color="#FFFFFF" /><Text style={styles.saveProfileBtnText}>Save Profile Changes</Text></>)}
              </TouchableOpacity>
            </>
          )}
        </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  topOverscrollBlueFill: {
    position: 'absolute',
    top: -600,
    left: 0,
    right: 0,
    height: 600,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 110,
    backgroundColor: '#F8F9FA',
  },
  heroBlueBanner: {
    width: '100%',
    height: 100,
    paddingHorizontal: 16,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  bannerBadgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bannerBadgeTopText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 0,
    marginHorizontal: 0,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  centeredAvatarContainer: {
    marginTop: -42,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatarOverlappingCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarImgFull: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  cameraIconBadgeOverlapping: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 3,
  },
  companyHeaderInfoStack: {
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  nameRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyNameTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  companyEmailSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  tabBarContainerUnderProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: 14,
    width: '100%',
    gap: 32,
  },
  tabSegmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    position: 'relative',
  },
  tabSegmentBtnActive: {},
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  tabSegmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  tabSegmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  cardContainerBlock: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  cardHeaderRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconChipSquare: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  contactListStack: {
    gap: 10,
    marginTop: 2,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  contactIconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabelSmall: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  contactValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 1,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rowMetricTitle: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: '#334155',
  },
  rowMetricVal: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  funnelLabel: {
    fontSize: 13.5,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: '#334155',
  },
  funnelVal: {
    fontSize: 13.5,
    fontFamily: FONTS.bold,
    fontWeight: '700',
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
  actionNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    gap: 12,
  },
  actionNavText: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: '#0F172A',
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 44,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  saveProfileBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Stubs for legacy properties if needed
  card: { backgroundColor: '#FFFFFF' },
  analyticsCard: { backgroundColor: '#FFFFFF' },
  cardTitleBox: { flexDirection: 'row' },
  sectionIconBox: { width: 24, height: 24 },
  sectionTitle: { fontSize: 15 },
  sectionSubtitle: { fontSize: 11 },
  sectionDividerInline: { height: 1, backgroundColor: '#CBD5E1' },
  rowIconBox: { width: 20, height: 20 },
  infoSectionTitle: { fontSize: 12 },
});
