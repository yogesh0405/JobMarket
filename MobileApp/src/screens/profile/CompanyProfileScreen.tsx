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
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { SelectDropdown } from '../../components/common/SelectDropdown';
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
  const { user, updateUserProfile, logout } = useAuth();

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
      const res = await apiFetch('/api/v1/jobs/employer/analytics');
      if (res.success && res.data) {
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
      }
    } catch (err) {
      // Keep baseline values if offline
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
      const base64Data = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      setLogoUri(base64Data);
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
        >
          {error ? <ErrorBanner message={error} style={{ marginBottom: SPACING.md }} /> : null}

          {/* 3D Header Profile Card */}
          <LinearGradient
            colors={['#0F172A', '#1E3A8A', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.avatarRow}>
              <TouchableOpacity style={styles.avatarPicker} activeOpacity={0.8} onPress={handlePickLogo}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Building2 size={32} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={13} color={COLORS.textWhite} />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={13} color="#34D399" />
                  <Text style={styles.verifiedText}>Verified Employer</Text>
                </View>
                <Text style={styles.companyTitle} numberOfLines={1}>
                  {companyName || 'Enterprise Company Name'}
                </Text>
                <Text style={styles.emailSubtitle} numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Tabular Menu Strip: Profile vs Dashboard & Analytics */}
          <View style={styles.tabStripWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setProfileTab('PROFILE')}
              style={[styles.tabBtn, profileTab === 'PROFILE' && styles.tabBtnActive]}
            >
              <Building2 size={16} color={profileTab === 'PROFILE' ? '#2563EB' : '#64748B'} />
              <Text style={[styles.tabBtnText, profileTab === 'PROFILE' && styles.tabBtnTextActive]}>
                Company Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setProfileTab('ANALYTICS')}
              style={[styles.tabBtn, profileTab === 'ANALYTICS' && styles.tabBtnActive]}
            >
              <BarChart3 size={16} color={profileTab === 'ANALYTICS' ? '#2563EB' : '#64748B'} />
              <Text style={[styles.tabBtnText, profileTab === 'ANALYTICS' && styles.tabBtnTextActive]}>
                Dashboard & Analytics
              </Text>
            </TouchableOpacity>
          </View>

          {profileTab === 'ANALYTICS' ? (
            <View style={{ gap: 14 }}>
              {/* Single Unified 3D Master Analytics Card */}
              {/* Ultra-Professional Industry Grade Performance Card */}
              <View style={styles.analyticsCard}>
                {/* Header Row with Title & Live Database Badge */}
                <View style={styles.cardHeaderWithBadge}>
                  <View style={styles.cardTitleBox}>
                    <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <BarChart3 size={20} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Recruitment Performance</Text>
                      <Text style={styles.sectionSubtitle}>Real-time pipeline & hiring statistics</Text>
                    </View>
                  </View>
                  <View style={styles.liveIndicatorBadge}>
                    <View style={styles.greenPulseDot} />
                    <Text style={styles.liveBadgeText}>LIVE DB</Text>
                  </View>
                </View>

                {/* 6 Perfectly Aligned Metric Grid Cells with Vertical & Horizontal Hairlines */}
                <View style={styles.proGridContainer}>
                  {/* Row 1: Posted Jobs & Total Applicants */}
                  <View style={styles.proGridRow}>
                    <View style={[styles.proGridCell, styles.proGridCellRightBorder]}>
                      <View style={styles.proLogoNumRow}>
                        <View style={[styles.proMetricIcon, { backgroundColor: '#EFF6FF' }]}>
                          <Briefcase size={16} color="#2563EB" />
                        </View>
                        <Text style={styles.proMetricVal}>{analyticsData.totalJobs}</Text>
                        <View style={styles.proMetaPillBlue}>
                          <Text style={styles.proMetaPillTextBlue}>{analyticsData.activeJobs} Active</Text>
                        </View>
                      </View>
                      <Text style={styles.proMetricTitle}>Posted Job Vacancies</Text>
                    </View>

                    <View style={styles.proGridCell}>
                      <View style={styles.proLogoNumRow}>
                        <View style={[styles.proMetricIcon, { backgroundColor: '#F0FDF4' }]}>
                          <Users size={16} color="#16A34A" />
                        </View>
                        <Text style={styles.proMetricVal}>{analyticsData.totalApplications}</Text>
                        <View style={styles.proMetaPillGreen}>
                          <Text style={styles.proMetaPillTextGreen}>Applicants</Text>
                        </View>
                      </View>
                      <Text style={styles.proMetricTitle}>Total Applications Received</Text>
                    </View>
                  </View>

                  <View style={styles.proHorizontalDivider} />

                  {/* Row 2: Shortlisted & Interviews */}
                  <View style={styles.proGridRow}>
                    <View style={[styles.proGridCell, styles.proGridCellRightBorder]}>
                      <View style={styles.proLogoNumRow}>
                        <View style={[styles.proMetricIcon, { backgroundColor: '#FEF3C7' }]}>
                          <Award size={16} color="#D97706" />
                        </View>
                        <Text style={styles.proMetricVal}>{analyticsData.shortlisted}</Text>
                        <View style={styles.proMetaPillAmber}>
                          <Text style={styles.proMetaPillTextAmber}>Qualified</Text>
                        </View>
                      </View>
                      <Text style={styles.proMetricTitle}>Shortlisted Candidates</Text>
                    </View>

                    <View style={styles.proGridCell}>
                      <View style={styles.proLogoNumRow}>
                        <View style={[styles.proMetricIcon, { backgroundColor: '#E0F2FE' }]}>
                          <Calendar size={16} color="#0284C7" />
                        </View>
                        <Text style={styles.proMetricVal}>{analyticsData.interviewed}</Text>
                        <View style={styles.proMetaPillSky}>
                          <Text style={styles.proMetaPillTextSky}>Scheduled</Text>
                        </View>
                      </View>
                      <Text style={styles.proMetricTitle}>Technical Interviews</Text>
                    </View>
                  </View>

                  <View style={styles.proHorizontalDivider} />

                  {/* Row 3: Confirmed Hires & Avg Response */}
                  <View style={styles.proGridRow}>
                    <View style={[styles.proGridCell, styles.proGridCellRightBorder]}>
                      <View style={styles.proLogoNumRow}>
                        <View style={[styles.proMetricIcon, { backgroundColor: '#F3E8FF' }]}>
                          <UserCheck size={16} color="#9333EA" />
                        </View>
                        <Text style={styles.proMetricVal}>{analyticsData.hired}</Text>
                        <View style={styles.proMetaPillPurple}>
                          <Text style={styles.proMetaPillTextPurple}>Joined</Text>
                        </View>
                      </View>
                      <Text style={styles.proMetricTitle}>Confirmed Hires Offered</Text>
                    </View>

                    <View style={styles.proGridCell}>
                      <View style={styles.proLogoNumRow}>
                        <View style={[styles.proMetricIcon, { backgroundColor: '#ECFDF5' }]}>
                          <Clock size={16} color="#059669" />
                        </View>
                        <Text style={styles.proMetricVal}>{analyticsData.avgResponseTimeHours}h</Text>
                        <View style={styles.proMetaPillEmerald}>
                          <Text style={styles.proMetaPillTextEmerald}>Fast SLA</Text>
                        </View>
                      </View>
                      <Text style={styles.proMetricTitle}>Avg Response Speed</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Hiring Conversion Funnel Card */}
              {(() => {
                const totalApps = analyticsData.totalApplications || 1;
                const shortlistedPct = Math.min(100, Math.round((analyticsData.shortlisted / totalApps) * 100));
                const interviewedPct = Math.min(100, Math.round((analyticsData.interviewed / totalApps) * 100));
                const hiredPct = Math.min(100, Math.round((analyticsData.hired / totalApps) * 100));

                return (
                  <View style={styles.analyticsCard}>
                    <View style={styles.cardTitleBox}>
                      <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                        <PieChart size={20} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Recruitment Conversion Funnel</Text>
                        <Text style={styles.sectionSubtitle}>Live database candidate pipeline metrics</Text>
                      </View>
                    </View>

                    <View style={{ gap: 10, marginTop: 6 }}>
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

                      <View>
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

              {/* Quick Navigation Shortcuts */}
              <View style={styles.analyticsCard}>
                <Text style={styles.infoSectionTitle}>RECRUITMENT DASHBOARD ACTIONS</Text>
                <View style={{ gap: 8, marginTop: 6 }}>
                  <TouchableOpacity
                    style={styles.actionNavRow}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('JobPost')}
                  >
                    <Briefcase size={16} color="#2563EB" />
                    <Text style={styles.actionNavText}>Post New Job Vacancy</Text>
                    <ArrowUpRight size={16} color="#64748B" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionNavRow}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('EmployerJobs')}
                  >
                    <Layers size={16} color="#D97706" />
                    <Text style={styles.actionNavText}>Manage Posted Jobs & Vacancies</Text>
                    <ArrowUpRight size={16} color="#64748B" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionNavRow}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Candidates')}
                  >
                    <Users size={16} color="#16A34A" />
                    <Text style={styles.actionNavText}>Explore Candidate Talent Pool</Text>
                    <ArrowUpRight size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {/* SECTION 1: GENERAL ENTERPRISE DETAILS */}
              <View style={styles.card}>
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

          {/* SECTION 2: CONTACT & PLANT LOCATION */}
          <View style={styles.card}>
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

          {/* SECTION 3: QUICK NAVIGATION & ACCOUNT */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { marginBottom: SPACING.md }]}>
              Account Quick Links
            </Text>

            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SecuritySettings')}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Lock size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navTitle}>Security & Active Sessions</Text>
                <Text style={styles.navSubtitle}>Manage passwords & signed-in devices</Text>
              </View>
              <ChevronRight size={18} color={COLORS.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#ECFEFF' }]}>
                <HelpCircle size={18} color="#0891B2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navTitle}>Help & Support Desk</Text>
                <Text style={styles.navSubtitle}>FAQ knowledge base & support tickets</Text>
              </View>
              <ChevronRight size={18} color={COLORS.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AboutUs')}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Info size={18} color="#B45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navTitle}>About JobMarket</Text>
                <Text style={styles.navSubtitle}>Industrial marketplace mission & stats</Text>
              </View>
              <ChevronRight size={18} color={COLORS.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navRow, { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#FEE2E2' }]}>
                <LogOut size={18} color={COLORS.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, { color: COLORS.danger }]}>Logout Account</Text>
                <Text style={styles.navSubtitle}>Sign out from current mobile session</Text>
              </View>
              <ChevronRight size={18} color={COLORS.slate400} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 130,
  },
  heroBanner: {
    borderRadius: 8,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderBottomWidth: 3.5,
    borderBottomColor: '#172554',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarPicker: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  verifiedText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '800',
  },
  companyTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textWhite,
  },
  emailSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3.5,
    borderBottomColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
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

  /* Tabular Menu Strip Styles */
  tabStripWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 4,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderBottomWidth: 2.5,
    borderBottomColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#2563EB',
    fontWeight: '900',
  },

  /* Ultra-Professional Performance Card Styles */
  cardHeaderWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  proGridContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  proGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proGridCell: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  proGridCellRightBorder: {
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  proHorizontalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  proLogoNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  proMetricIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proMetricVal: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
  },
  proMetricTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  proMetaPillBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  proMetaPillTextBlue: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  proMetaPillGreen: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  proMetaPillTextGreen: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  proMetaPillAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  proMetaPillTextAmber: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D97706',
  },
  proMetaPillSky: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  proMetaPillTextSky: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  proMetaPillPurple: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  proMetaPillTextPurple: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9333EA',
  },
  proMetaPillEmerald: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  proMetaPillTextEmerald: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
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
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 10,
  },
  actionNavText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
});
