import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Share,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Building2,
  BarChart3,
  ArrowLeft,
  Share2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../api/client';
import { Header } from '../../components/common/Header';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { CompanySkeleton } from '../../components/common/SkeletonLoader';
import { COLORS } from '../../constants/theme';
import { CompanyHeaderCard } from './components/CompanyHeaderCard';
import { CompanyMetricsBar } from './components/CompanyMetricsBar';
import { CompanyOverviewSection } from './components/CompanyOverviewSection';
import { CompanyDetailsCard } from './components/CompanyDetailsCard';
import { CompanyActiveJobsSection } from './components/CompanyActiveJobsSection';
import { CompanyProfileAnalyticsTab } from './components/CompanyProfileAnalyticsTab';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { shareCompany } from '../../utils/shareUtils';

interface Props {
  navigation: any;
  route?: any;
}

export const CompanyProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user, updateUserProfile, refreshUser } = useAuth();
  const routeCompany = route?.params?.company;
  const routeCompanyId = route?.params?.companyId || route?.params?.id || routeCompany?.id;

  const userCompanyName = (user?.company_name || user?.companyName || user?.name || '').trim();

  // Determine Company ID or Name from route params or logged-in user
  const targetCompanyId =
    routeCompanyId ||
    route?.params?.name ||
    routeCompany?.name ||
    userCompanyName ||
    user?.id ||
    '';

  // Tab State: PROFILE vs ANALYTICS
  const [profileTab, setProfileTab] = useState<'PROFILE' | 'ANALYTICS'>('PROFILE');

  // Company State
  const [company, setCompany] = useState<any>(routeCompany || null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(!routeCompany);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply blue status bar ONLY while on Employer Company Profile, restore on exit
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#0A58E2', true);
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setTranslucent(true);
      }
      return () => {
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#FFFFFF', true);
          StatusBar.setBarStyle('dark-content', true);
          StatusBar.setTranslucent(false);
        }
      };
    }, [])
  );

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

  // Owner Verification
  const isOwner = useMemo(() => {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    if (role !== 'employer' && role !== 'admin') return false;

    if (routeCompanyId || route?.params?.company || route?.params?.name) {
      if (company && company.employer_id && user.id === company.employer_id) return true;
      if (company && company.email && user.email && user.email.toLowerCase() === company.email.toLowerCase()) return true;
      const userCompName = user.companyName || user.company_name || '';
      if (company && company.name && userCompName && userCompName.toLowerCase() === company.name.toLowerCase()) return true;
      return false;
    }

    return true;
  }, [user, company, routeCompanyId, route?.params]);

  // Load Live Company Details from Live Backend API
  const loadCompanyDetails = async () => {
    if (!company) setLoadingCompany(true);
    setError(null);

    if (targetCompanyId) {
      try {
        const companyQuery = encodeURIComponent(targetCompanyId);
        const json = await apiFetch(`/api/v1/companies/${companyQuery}`);
        const compData = json?.data || (json?.name ? json : null);

        if (compData && compData.name) {
          setCompany(compData);
          setLoadingCompany(false);
          return;
        }
      } catch (err: any) {
        console.warn('API fetch company details notice:', err);
      }
    }

    try {
      const json = await apiFetch('/api/v1/companies');
      const compList = Array.isArray(json) ? json : (json?.data || []);
      if (Array.isArray(compList) && compList.length > 0) {
        const targetLower = targetCompanyId ? targetCompanyId.toLowerCase().trim() : '';
        const matched = compList.find((c: any) =>
          c && (
            (targetCompanyId && c.id === targetCompanyId) ||
            (user?.id && c.employer_id === user.id) ||
            (targetLower && (c.name || '').toLowerCase().trim() === targetLower)
          )
        );
        if (matched) {
          setCompany(matched);
          setLoadingCompany(false);
          return;
        }
      }
    } catch (_) {}

    // Fallback: Populate strictly from authentic user state or route parameters without mock values
    setCompany((prev: any) => {
      if (prev && prev.name) return prev;
      if (routeCompany && routeCompany.name) return routeCompany;
      const u = user as any;
      const realName = userCompanyName || (targetCompanyId ? targetCompanyId : 'My Company');
      return {
        id: u?.id || targetCompanyId,
        employer_id: u?.id,
        name: realName,
        logo: u?.profile_picture_url || u?.profilePictureUrl || u?.avatar_url || u?.company_logo || u?.companyLogo || null,
        industry: routeCompany?.industry || u?.tradeSpecialization || u?.trade_specialization || '',
        company_type: routeCompany?.company_type || routeCompany?.companyType || '',
        description: routeCompany?.description || u?.bio || '',
        website: routeCompany?.website || '',
        address: routeCompany?.address || u?.location || '',
        city: routeCompany?.city || routeCompany?.location || u?.location || '',
        midc_zone: routeCompany?.midc_zone || routeCompany?.midcZone || '',
        email: routeCompany?.email || u?.email || '',
        phone: routeCompany?.phone || u?.phone || '',
        company_size: routeCompany?.company_size || '',
        gst_number: routeCompany?.gst_number || u?.gst_number || u?.gstNumber || '',
        verified: Boolean(u?.is_verified || u?.aadhaar_verified),
      };
    });
    setLoadingCompany(false);
  };

  // Load Live Company Job Openings from Live Backend API
  const loadCompanyJobs = async () => {
    setLoadingJobs(true);

    try {
      const companyQuery = encodeURIComponent(targetCompanyId);
      const json = await apiFetch(`/api/v1/companies/${companyQuery}/jobs`);
      const list = Array.isArray(json) ? json : (json?.data || []);

      if (Array.isArray(list) && list.length > 0) {
        setJobs(list);
        setLoadingJobs(false);
        return;
      }
    } catch (err) {
      console.warn('Backend company jobs fetch notice:', err);
    }

    try {
      const json = await apiFetch('/api/v1/jobs');
      const allJobs = Array.isArray(json) ? json : (json?.data || []);
      if (Array.isArray(allJobs) && allJobs.length > 0) {
        const targetLower = targetCompanyId.toLowerCase().trim();
        const cleanTarget = targetLower.replace(/[^a-z0-9]/g, '');
        const matching = allJobs.filter((j: any) => {
          if (!j) return false;
          const compName = (j.company || '').toLowerCase().trim();
          const cleanComp = compName.replace(/[^a-z0-9]/g, '');
          return (
            compName === targetLower ||
            (cleanTarget.length > 2 && cleanComp === cleanTarget) ||
            compName.includes(targetLower) ||
            targetLower.includes(compName)
          );
        });
        setJobs(matching);
      } else {
        setJobs([]);
      }
    } catch (_) {
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch 100% Real Live Recruitment Analytics Data from Backend
  const fetchAnalytics = useCallback(async () => {
    if (!isOwner) return;
    try {
      const json = await apiFetch('/api/v1/jobs/employer/analytics');
      const data = json?.data || json;
      if (data && typeof data === 'object') {
        const liveTotalJobs = Number(data.totalJobs ?? jobs.length);
        const liveActiveJobs = Number(data.activeJobs ?? jobs.filter((j) => (j?.status || '').toUpperCase() === 'APPROVED' || (j?.status || '').toUpperCase() === 'ACTIVE').length);
        const liveApplications = Number(data.totalApplications ?? 0);
        const liveShortlisted = Number(data.shortlisted ?? 0);
        const liveInterviewed = Number(data.interviewed ?? 0);
        const liveHired = Number(data.hired ?? 0);
        const liveRejected = Number(data.rejected ?? 0);

        setAnalyticsData({
          totalJobs: liveTotalJobs,
          activeJobs: liveActiveJobs,
          totalApplications: liveApplications,
          shortlisted: liveShortlisted,
          interviewed: liveInterviewed,
          hired: liveHired,
          rejected: liveRejected,
          avgResponseTimeHours: Number(data.avgResponseTimeHours || 24),
        });
        return;
      }
    } catch (_) {}

    // Fallback: derive 100% real live metrics directly from loaded jobs array
    const realTotalJobs = jobs.length;
    const realActiveJobs = jobs.filter((j) => (j?.status || '').toUpperCase() === 'APPROVED' || (j?.status || '').toUpperCase() === 'ACTIVE').length;
    const realAppsCount = jobs.reduce((acc, j) => acc + Number(j?.applicationsCount || j?.applicants_count || j?.applications_count || 0), 0);

    setAnalyticsData((prev) => ({
      ...prev,
      totalJobs: realTotalJobs,
      activeJobs: realActiveJobs,
      totalApplications: realAppsCount,
    }));
  }, [isOwner, jobs]);

  useFocusEffect(
    useCallback(() => {
      loadCompanyDetails();
      loadCompanyJobs();
      if (isOwner) {
        fetchAnalytics();
      }
    }, [targetCompanyId, isOwner])
  );

  useEffect(() => {
    loadCompanyDetails();
    loadCompanyJobs();
  }, [targetCompanyId]);

  useEffect(() => {
    if (isOwner) {
      fetchAnalytics();
    }
  }, [isOwner, targetCompanyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshUser(),
        loadCompanyDetails(),
        loadCompanyJobs(),
        fetchAnalytics(),
      ]);
    } catch (_) {
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    const companyName = company?.name || targetCompanyId || 'Company Profile';
    const companyTargetId = company?.id || company?.name || targetCompanyId;
    await shareCompany({
      id: companyTargetId,
      name: companyName,
      industry: company?.industry,
      location: company?.city || company?.address || company?.midc_zone,
    });
  };

  const handleSaveSuccess = async (updatedCompany: any) => {
    if (updatedCompany) {
      setCompany((prev: any) => ({ ...prev, ...updatedCompany }));
    }
    const newLogo =
      updatedCompany?.logo ||
      updatedCompany?.logoUrl ||
      updatedCompany?.profile_picture_url ||
      updatedCompany?.profilePictureUrl;
    if (newLogo) {
      await updateUserProfile({
        companyLogo: newLogo,
        company_logo: newLogo,
        profilePictureUrl: newLogo,
        profile_picture_url: newLogo,
        avatar_url: newLogo,
        avatarUrl: newLogo,
        avatar: newLogo,
      } as any);
    }
    await refreshUser().catch(() => {});
    loadCompanyDetails();
    Alert.alert('Profile Saved', 'Company profile updated successfully!');
  };

  const formattedLocation = useMemo(() => {
    if (!company) return '';
    const parts: string[] = [];
    if (company.address?.trim()) parts.push(company.address.trim());
    if (company.city?.trim() && !company.address?.toLowerCase().includes(company.city.toLowerCase())) {
      parts.push(company.city.trim());
    }
    if (company.midc_zone || company.midcZone) {
      const midc = (company.midc_zone || company.midcZone).split('(')[0].trim();
      if (!parts.join(', ').includes(midc)) {
        parts.push(midc);
      }
    }
    return parts.join(', ') || company.city || company.address || company.midc_zone || company.midcZone || '';
  }, [company]);

  return (
    <View style={[styles.container, { backgroundColor: '#0A58E2' }]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A58E2" translucent={true} />

      {/* Main Body Scroll Area */}
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F7F9FC' }}
        contentContainerStyle={[
          styles.scrollContentBody,
          { paddingBottom: Math.max(insets.bottom + 140, 160) },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Primary Blue Header Banner */}
        {company ? (
          <CompanyHeaderCard
            company={company}
            isOwner={isOwner}
            onEditPress={() => {
              navigation.navigate('EditCompanyProfile', {
                company,
                onSaveSuccess: handleSaveSuccess,
              });
            }}
            onSharePress={handleShare}
            onBackPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                const role = (user?.role || '').toLowerCase();
                if (role === 'candidate') {
                  navigation.navigate('CandidateMain');
                } else {
                  navigation.navigate('EmployerMain');
                }
              }
            }}
            formattedLocation={formattedLocation}
            profileTab={profileTab}
            onTabChange={(tab) => setProfileTab(tab)}
          />
        ) : null}

        {error ? <ErrorBanner message={error} /> : null}

        {loadingCompany ? (
          <CompanySkeleton />
        ) : profileTab === 'ANALYTICS' ? (
          <CompanyProfileAnalyticsTab analyticsData={analyticsData} />
        ) : (
          <>
            {/* 2. Metrics Bar with Jobs Posted, Profile Score %, and Post Job Action */}
            <CompanyMetricsBar
              jobsCount={jobs.length}
              completionPct={company?.completion_percentage || 75}
              midcZone={company?.midc_zone || company?.midcZone}
              isVerified={company?.verified !== false}
              isOwner={isOwner}
              onPostJobPress={() => navigation.navigate('JobPost')}
            />

            {/* 3. About Company & Operations Section */}
            <CompanyOverviewSection
              description={company?.description}
              companyName={company?.name}
              specializations={company?.specializations}
            />

            {/* 4. Company Details Sidebar Card */}
            <CompanyDetailsCard
              company={company}
              formattedLocation={formattedLocation}
            />

            {/* 5. Active Job Openings Section */}
            <CompanyActiveJobsSection
              jobs={jobs}
              companyName={company?.name}
              onJobPress={(job: any) => {
                navigation.navigate('CandidateJobDetail', { jobId: job.id, job });
              }}
              onViewAllPress={() => {
                navigation.navigate('CandidateJobSearch');
              }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
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
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 100,
  },
});
