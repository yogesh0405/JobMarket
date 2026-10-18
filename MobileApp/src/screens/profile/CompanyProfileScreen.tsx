import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import {
  Building2,
  Briefcase,
  MapPin,
  Layers,
  ChevronRight,
  X,
  Wrench,
  ShieldCheck,
  Settings,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../api/client';
import { companyApi } from '../../api/companyApi';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { CompanySkeleton } from '../../components/common/SkeletonLoader';
import { CompanyHeaderCard } from './components/CompanyHeaderCard';
import { CompanyOverviewSection } from './components/CompanyOverviewSection';
import { CompanyOperationsSection } from './components/CompanyOperationsSection';
import { CompanyActiveJobsSection } from './components/CompanyActiveJobsSection';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { shareCompany } from '../../utils/shareUtils';
import { isJobLive } from '../../utils/jobStatusUtils';

interface Props {
  navigation: any;
  route?: any;
}

export const CompanyProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user, updateUserProfile, refreshUser } = useAuth();
  const { showToast } = useToast();
  const routeCompany = route?.params?.company;
  const routeCompanyId = route?.params?.companyId || route?.params?.id || routeCompany?.id;

  const userCompanyName = (user?.company_name || user?.companyName || user?.name || '').trim();
  const isViewingExternal = Boolean(routeCompanyId || routeCompany || route?.params?.name);

  // Determine Company ID or Name from route params or logged-in user
  const targetCompanyId =
    routeCompanyId ||
    route?.params?.name ||
    routeCompany?.name ||
    (!isViewingExternal ? ((userCompanyName && userCompanyName !== 'My Company') ? userCompanyName : user?.id || '') : '');

  // 3-Option Interactive Tabs matching Web App
  const [activeTab, setActiveTab] = useState<'jobs' | 'overview' | 'operations'>('jobs');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  // Company State
  const [company, setCompany] = useState<any>(routeCompany || null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(!routeCompany);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Follower State
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isSubmittingFollow, setIsSubmittingFollow] = useState<boolean>(false);

  // Apply blue status bar ONLY while on Company Profile, restore on exit
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

  // Owner Verification
  const isOwner = useMemo(() => {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    if (role !== 'employer' && role !== 'admin') return false;

    if (isViewingExternal) {
      if (company && company.employer_id && user.id === company.employer_id) return true;
      if (company && company.email && user.email && user.email.toLowerCase() === company.email.toLowerCase()) return true;
      const userCompName = user.companyName || user.company_name || '';
      if (company && company.name && userCompName && userCompName.toLowerCase() === company.name.toLowerCase()) return true;
      return false;
    }

    return true;
  }, [user, company, isViewingExternal]);

  // Load Live Company Details from Live Backend API
  const loadCompanyDetails = async () => {
    if (!company) setLoadingCompany(true);
    setError(null);

    if (targetCompanyId && targetCompanyId !== 'My Company') {
      try {
        const companyQuery = encodeURIComponent(targetCompanyId);
        const json = await apiFetch(`/api/v1/companies/${companyQuery}`);
        const compData = json?.data || (json?.name ? json : null);

        if (compData && compData.name) {
          setCompany(compData);
          setLoadingCompany(false);
          return;
        }
      } catch (_) {
        // Continue to user id or companies directory lookup
      }
    }

    if (!isViewingExternal && user?.id && user.id !== targetCompanyId) {
      try {
        const json = await apiFetch(`/api/v1/companies/${encodeURIComponent(user.id)}`);
        const compData = json?.data || (json?.name ? json : null);

        if (compData && compData.name) {
          setCompany(compData);
          setLoadingCompany(false);
          return;
        }
      } catch (_) {
        // Continue to fallback lookup
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
            (!isViewingExternal && user?.id && c.employer_id === user.id) ||
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

    // Fallback: Populate strictly from route parameters or user state
    setCompany((prev: any) => {
      if (prev && prev.name) return prev;
      if (routeCompany && routeCompany.name) return routeCompany;
      if (isViewingExternal) {
        const extName = route?.params?.name || targetCompanyId || 'Company';
        return {
          id: routeCompanyId || targetCompanyId,
          name: extName,
          logo: routeCompany?.logo || routeCompany?.logoUrl || null,
          industry: routeCompany?.industry || 'Industrial Manufacturing',
          company_type: routeCompany?.company_type || routeCompany?.companyType || 'Private Limited',
          description: routeCompany?.description || routeCompany?.about || '',
          website: routeCompany?.website || '',
          address: routeCompany?.address || routeCompany?.location || '',
          city: routeCompany?.city || routeCompany?.location || 'Chhatrapati Sambhajinagar',
          midc_zone: routeCompany?.midc_zone || routeCompany?.midcZone || '',
          email: routeCompany?.email || '',
          phone: routeCompany?.phone || '',
          company_size: routeCompany?.company_size || '50-200 Employees',
          gst_number: routeCompany?.gst_number || '',
        };
      }
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

  // Load Live Company Job Openings
  const loadCompanyJobs = async () => {
    setLoadingJobs(true);

    const compId = (company?.id || routeCompanyId || '').toString().trim();
    const compName = (company?.name || routeCompany?.name || route?.params?.name || userCompanyName || '').trim();
    const employerId = (company?.employer_id || company?.employerId || routeCompany?.employer_id || (isOwner ? user?.id : '') || '').toString().trim();

    let resolvedJobs: any[] = [];

    const queryCandidates = [employerId, compId, compName].filter(
      (c) => c && c !== 'My Company' && c !== '00000000-0000-0000-0000-000000000000'
    );

    for (const candidate of queryCandidates) {
      if (resolvedJobs.length > 0) break;
      try {
        const json = await apiFetch(`/api/v1/companies/${encodeURIComponent(candidate)}/jobs`);
        const list = Array.isArray(json) ? json : (json?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          resolvedJobs = list;
          break;
        }
      } catch (_) {}
    }

    if (resolvedJobs.length === 0) {
      try {
        const json = await apiFetch('/api/v1/jobs');
        const allJobs = Array.isArray(json) ? json : (json?.data || []);
        if (Array.isArray(allJobs) && allJobs.length > 0) {
          const compLower = compName.toLowerCase();
          resolvedJobs = allJobs.filter((j: any) => {
            if (!j) return false;
            if (employerId && (j.employer_id === employerId || j.employerId === employerId)) return true;
            if (compId && (j.company_id === compId || j.companyId === compId)) return true;
            const jc = (j.company || '').toLowerCase().trim();
            return compLower && (jc === compLower || jc.includes(compLower) || compLower.includes(jc));
          });
        }
      } catch (_) {}
    }

    setJobs(resolvedJobs);
    setLoadingJobs(false);
  };

  // Strictly memoize live active job postings only
  const liveJobs = useMemo(() => {
    return (jobs || []).filter(isJobLive);
  }, [jobs]);

  // Group live jobs by department / trade for interactive department filtering
  const departmentsList = useMemo(() => {
    const map = new Map<string, number>();
    liveJobs.forEach((job) => {
      const dept = (job.department || job.trade || job.category || 'Operations').trim();
      map.set(dept, (map.get(dept) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [liveJobs]);

  const filteredByDeptJobs = useMemo(() => {
    if (!selectedDept) return liveJobs;
    return liveJobs.filter((job) => {
      const dept = (job.department || job.trade || job.category || 'Operations').trim();
      return dept.toLowerCase() === selectedDept.toLowerCase();
    });
  }, [liveJobs, selectedDept]);

  // Department icon helper
  const getDeptIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('assembly') || n.includes('production')) return Layers;
    if (n.includes('quality') || n.includes('testing')) return ShieldCheck;
    if (n.includes('maintenance') || n.includes('tooling') || n.includes('machin')) return Wrench;
    if (n.includes('finance') || n.includes('bank') || n.includes('account')) return Briefcase;
    return Settings;
  };

  // Load Live Real-Time Follower Status and Count
  const loadFollowStatus = useCallback(async () => {
    const candidateId = company?.id || (targetCompanyId && targetCompanyId !== 'My Company' ? targetCompanyId : '') || user?.id || routeCompanyId;
    if (!candidateId) return;
    try {
      const res = await companyApi.getFollowStatus(candidateId);
      if (res?.success && res.data) {
        setIsFollowing(Boolean(res.data.isFollowing));
        setFollowersCount(Number(res.data.followersCount) || 0);
      }
    } catch (err) {
      console.warn('Live follow status fetch notice:', err);
    }
  }, [company?.id, routeCompanyId, targetCompanyId, user?.id]);

  // Handle Optimistic Toggle Follow / Unfollow
  const handleToggleFollow = async () => {
    if (!user) {
      showToast('Please sign in to follow companies and receive live vacancy alerts.', 'info');
      Alert.alert(
        'Sign In Required',
        'Please sign in to follow companies and receive live vacancy notifications when new jobs are published.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => {
              navigation.navigate('EmployerLogin');
            },
          },
        ]
      );
      return;
    }

    const candidateId = company?.id || routeCompanyId || targetCompanyId;
    if (isSubmittingFollow || !candidateId || candidateId === 'My Company') return;

    const displayCompName = company?.name || targetCompanyId || 'Company';
    const prevFollowing = isFollowing;
    const prevCount = followersCount;
    const nextFollowing = !prevFollowing;
    const nextCount = nextFollowing ? prevCount + 1 : Math.max(0, prevCount - 1);

    // Optimistic UI Update
    setIsFollowing(nextFollowing);
    setFollowersCount(nextCount);
    setIsSubmittingFollow(true);

    if (nextFollowing) {
      showToast(`You are now following ${displayCompName}`, 'success');
    } else {
      showToast(`Unfollowed ${displayCompName}`, 'info');
    }
    DeviceEventEmitter.emit('COMPANY_FOLLOW_CHANGED', { companyId: candidateId, isFollowing: nextFollowing });

    try {
      const res = await companyApi.toggleFollow(candidateId);
      if (res?.success && res.data) {
        setIsFollowing(Boolean(res.data.isFollowing));
        setFollowersCount(Number(res.data.followersCount) || 0);
        DeviceEventEmitter.emit('COMPANY_FOLLOW_CHANGED', { companyId: candidateId, isFollowing: Boolean(res.data.isFollowing) });
      } else {
        // Rollback on server rejection
        setIsFollowing(prevFollowing);
        setFollowersCount(prevCount);
        DeviceEventEmitter.emit('COMPANY_FOLLOW_CHANGED', { companyId: candidateId, isFollowing: prevFollowing });
        showToast(res?.error || 'Unable to update follow status.', 'error');
      }
    } catch (err: any) {
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
      DeviceEventEmitter.emit('COMPANY_FOLLOW_CHANGED', { companyId: candidateId, isFollowing: prevFollowing });
    } finally {
      setIsSubmittingFollow(false);
    }
  };

  useEffect(() => {
    loadCompanyDetails();
    loadFollowStatus();
  }, [targetCompanyId, routeCompanyId]);

  useEffect(() => {
    if (company) {
      loadCompanyJobs();
    }
  }, [company?.id, company?.name, company?.employer_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshUser(),
        loadCompanyDetails(),
        loadCompanyJobs(),
        loadFollowStatus(),
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

  const formattedLocation = useMemo(() => {
    if (!company) return '';
    const rawAddr = (company.address || '').trim();
    if (rawAddr) return rawAddr;
    const parts: string[] = [];
    if (company.midc_zone || company.midcZone) {
      const midc = (company.midc_zone || company.midcZone).split('(')[0].trim();
      if (midc) parts.push(midc);
    }
    if (company.city?.trim()) {
      const city = company.city.trim();
      if (!parts.some((p) => p.toLowerCase().includes(city.toLowerCase()))) {
        parts.push(city);
      }
    }
    return parts.join(', ');
  }, [company]);

  return (
    <View style={[styles.container, { backgroundColor: '#0A58E2' }]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A58E2" translucent={true} />

      {/* Main Body Scroll Area */}
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        contentContainerStyle={[
          styles.scrollContentBody,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Banner & Floating Elevated Card */}
        {company ? (
          <CompanyHeaderCard
            company={company}
            isOwner={isOwner}
            followersCount={followersCount}
            isFollowing={isFollowing}
            isSubmittingFollow={isSubmittingFollow}
            onToggleFollow={handleToggleFollow}
            onEditPress={() => {
              navigation.navigate('EditCompanyProfile', {
                company,
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
          />
        ) : null}

        {/* 2. Interactive Navigation Tabs Bar (Exact Web Layout: Jobs, Overview, Plant & Operations) */}
        <View style={styles.tabBarWrapper}>
          <View style={styles.tabBarRow}>
            {/* Tab 1: Jobs */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab('jobs')}
              style={[
                styles.tabItem,
                activeTab === 'jobs' && styles.tabItemActive,
              ]}
            >
              <Briefcase
                size={15}
                color={activeTab === 'jobs' ? '#1B4FDF' : '#64748B'}
                strokeWidth={activeTab === 'jobs' ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'jobs' && styles.tabLabelActive,
                ]}
              >
                Jobs
              </Text>
              <View
                style={[
                  styles.counterBadge,
                  activeTab === 'jobs' && styles.counterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.counterBadgeText,
                    activeTab === 'jobs' && styles.counterBadgeTextActive,
                  ]}
                >
                  {liveJobs.length}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tab 2: Overview */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab('overview')}
              style={[
                styles.tabItem,
                activeTab === 'overview' && styles.tabItemActive,
              ]}
            >
              <Building2
                size={15}
                color={activeTab === 'overview' ? '#1B4FDF' : '#64748B'}
                strokeWidth={activeTab === 'overview' ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'overview' && styles.tabLabelActive,
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>

            {/* Tab 3: Plant & Operations */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab('operations')}
              style={[
                styles.tabItem,
                styles.tabItemOperations,
                activeTab === 'operations' && styles.tabItemActive,
              ]}
            >
              <MapPin
                size={15}
                color={activeTab === 'operations' ? '#1B4FDF' : '#64748B'}
                strokeWidth={activeTab === 'operations' ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'operations' && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                Plant & Operations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? <ErrorBanner message={error} /> : null}

        {loadingCompany ? (
          <CompanySkeleton />
        ) : activeTab === 'overview' ? (
          /* TAB 2: OVERVIEW */
          <CompanyOverviewSection
            company={company}
            jobsCount={liveJobs.length}
            formattedLocation={formattedLocation}
            onSharePress={handleShare}
          />
        ) : activeTab === 'operations' ? (
          /* TAB 3: PLANT & OPERATIONS */
          <CompanyOperationsSection
            company={company}
            formattedLocation={formattedLocation}
          />
        ) : (
          /* TAB 1: JOBS (DEFAULT) */
          <>
            {/* "Departments hiring at [Company]" Section */}
            {departmentsList.length > 0 && (
              <View style={styles.deptSurfaceCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderTitleGroup}>
                    <View style={styles.cardIconWrap}>
                      <Layers size={16} color="#1B4FDF" strokeWidth={2.4} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitleText}>
                        Departments hiring at {company?.name || 'Company'}
                      </Text>
                      <Text style={styles.cardSubtitleText}>
                        Explore live vacancies categorized by technical department & trade
                      </Text>
                    </View>
                  </View>

                  {selectedDept && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setSelectedDept(null)}
                      style={styles.clearFilterLink}
                    >
                      <X size={13} color="#1B4FDF" />
                      <Text style={styles.clearFilterLinkText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Horizontal Scroll of Department Cards */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.deptCardsScroll}
                >
                  {departmentsList.map((dept, idx) => {
                    const isSelected = selectedDept === dept.name;
                    const IconComp = getDeptIcon(dept.name);

                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.75}
                        onPress={() => setSelectedDept(isSelected ? null : dept.name)}
                        style={[
                          styles.deptCard,
                          isSelected && styles.deptCardSelected,
                        ]}
                      >
                        <View style={styles.deptCardTop}>
                          <View style={styles.deptIconBox}>
                            <IconComp size={16} color="#1B4FDF" strokeWidth={2.2} />
                          </View>
                          <Text
                            style={[
                              styles.deptCardName,
                              isSelected && styles.deptCardNameSelected,
                            ]}
                            numberOfLines={2}
                          >
                            {dept.name}
                          </Text>
                        </View>

                        <View style={styles.deptOpeningsLink}>
                          <Text
                            style={[
                              styles.deptOpeningsText,
                              isSelected && styles.deptOpeningsTextSelected,
                            ]}
                          >
                            {dept.count} {dept.count === 1 ? 'opening' : 'openings'}
                          </Text>
                          <ChevronRight
                            size={13}
                            color={isSelected ? '#1541BD' : '#1B4FDF'}
                            strokeWidth={2.4}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Active Job Openings Section */}
            <CompanyActiveJobsSection
              jobs={filteredByDeptJobs}
              companyName={company?.name}
              isOwner={isOwner}
              selectedDept={selectedDept}
              onClearDept={() => setSelectedDept(null)}
              onPostJobPress={() => navigation.navigate('JobPost')}
              onJobPress={(job: any) => {
                navigation.navigate('CandidateJobDetail', { jobId: job.id, job });
              }}
              onViewAllPress={() => {
                if (isOwner) {
                  navigation.navigate('EmployerMain', { screen: 'ManageJobsTab' });
                } else {
                  navigation.navigate('CandidateJobSearch');
                }
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
    backgroundColor: '#F8FAFC',
  },
  scrollContentBody: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  tabBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#1B4FDF',
  },
  tabItemOperations: {
    marginRight: 12,
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#1B4FDF',
    fontWeight: '700',
  },
  counterBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadgeActive: {
    backgroundColor: '#1B4FDF',
  },
  counterBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1B4FDF',
  },
  counterBadgeTextActive: {
    color: '#FFFFFF',
  },
  deptSurfaceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  clearFilterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  clearFilterLinkText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1B4FDF',
  },
  deptCardsScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  deptCard: {
    width: 172,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 78,
    justifyContent: 'center',
    gap: 5,
  },
  deptCardSelected: {
    borderColor: '#1B4FDF',
    backgroundColor: '#F8FAFF',
  },
  deptCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deptIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deptCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 15,
  },
  deptCardNameSelected: {
    color: '#1B4FDF',
  },
  deptOpeningsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deptOpeningsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4FDF',
  },
  deptOpeningsTextSelected: {
    color: '#1541BD',
  },
});
