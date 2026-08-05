import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Building2,
  ChevronRight,
  ChevronLeft,
  IndianRupee,
  Users,
  Award,
  Clock,
  TrendingUp,
  CheckCircle2,
  Zap,
  ArrowRight,
  Layers,
  HeartPulse,
  Utensils,
  BookOpen,
  ChevronDown,
  X,
  Bookmark,
  Star,
  Wrench,
  Tv,
  Power,
  Cog,
  Package,
  Shield,
  Folder,
  BarChart2,
  FileText,
  Smartphone,
  Check,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 1. Promotional Banners Data (Identical to Web App DEFAULT_PROMOTIONAL_BANNERS)
const PROMO_BANNERS = [
  {
    id: 'banner-1',
    badge: '⚡ MEGA WALK-IN DRIVE',
    title: '500+ Vacancies in Chakan & Waluj MIDC',
    description: 'Spot job offers for ITI Fitters, Welders, CNC Operators & Machine Helpers. Free bus & canteen.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
    tag: 'Chakan MIDC',
    btnText: 'Register Spot Interview',
    color: '#1E40AF',
  },
  {
    id: 'banner-2',
    badge: '⭐ TATA MOTORS RECRUITMENT',
    title: 'Apprentice & Technician Campaign',
    description: 'Immediate openings for 1st & 2nd shift. High stipend + monthly attendance bonus.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=70',
    tag: 'Tata Motors',
    btnText: 'Apply Now',
    color: '#065F46',
  },
  {
    id: 'banner-3',
    badge: '🔥 URGENT HIRING',
    title: 'Senior CNC & VMC Operators Needed',
    description: 'High salary package up to ₹35,000/month + Overtime + Free Hostel accommodation.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=70',
    tag: 'CNC Operator',
    btnText: 'View Vacancy Details',
    color: '#991B1B',
  },
  {
    id: 'banner-4',
    badge: '🏛️ GOVT APPRENTICESHIP',
    title: 'Govt Skill Certification Drive 2026',
    description: 'Government authorized NSDC apprenticeship scheme with official trade certification.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=70',
    tag: 'Apprentice',
    btnText: 'Apply Online',
    color: '#3B82F6',
  },
];

// Industry Select Options
const INDUSTRIES = [
  'Select Industry',
  'Manufacturing & Assembly',
  'CNC Machining & Tooling',
  'Welding & Metal Fabrication',
  'Electricals & Electronics',
  'Quality & Inspection',
  'Logistics & Warehouse',
  'Pharma & Healthcare',
  'Automotive & Engineering',
];

// Education Select Options
const EDUCATIONS = [
  'Select Education',
  '10th Pass',
  '12th Pass',
  'ITI Certificate',
  'Diploma',
  'Graduate (BE / B.Tech / BA / B.Com)',
];

// Role Filter Tabs for Popular Role Picks
const ROLE_TABS = [
  'All Opportunities',
  'Electrician',
  'Welder',
  'CNC Operator',
  'Quality Inspector',
  'Fitter',
  'Machinist',
  'Helper',
];

// 3-Column ITI Trade Cards Grid Data
const ITI_TRADES_GRID = [
  { name: 'Fitter', count: '1,450 open positions', icon: Wrench },
  { name: 'Welder', count: '980 open positions', icon: Zap },
  { name: 'CNC Operator', count: '1,200 open positions', icon: Tv },
  { name: 'Electrician', count: '750 open positions', icon: Power },
  { name: 'Machinist', count: '850 open positions', icon: Cog },
  { name: 'Helper / Loader', count: '2,100 open positions', icon: Package },
  { name: 'Quality Inspector', count: '480 open positions', icon: Search },
  { name: 'Apprentice', count: '1,600 open positions', icon: GraduationCap },
  { name: 'Driver / Forklift', count: '320 open positions', icon: Briefcase },
  { name: 'Security Guard', count: '550 open positions', icon: Shield },
  { name: 'Store Keeper', count: '420 open positions', icon: Folder },
  { name: 'Technician', count: '680 open positions', icon: Wrench },
];

// 3-Column Education Qualification Cards Grid Data
const EDUCATION_GRID = [
  { name: '12th Pass Jobs', count: '63,232 Job Openings', icon: GraduationCap },
  { name: 'B.Com Jobs', count: '34,503 Job Openings', icon: BarChart2 },
  { name: 'BA Jobs', count: '28,123 Job Openings', icon: FileText },
  { name: 'B.E. / B.Tech Jobs', count: '26,397 Job Openings', icon: Cog },
  { name: 'Diploma Jobs', count: '26,208 Job Openings', icon: CheckCircle2 },
  { name: 'BCA Jobs', count: '21,767 Job Openings', icon: Tv },
  { name: 'BBA Jobs', count: '19,641 Job Openings', icon: BarChart2 },
  { name: 'B.Sc Jobs', count: '18,617 Job Openings', icon: Tv },
  { name: '10th Pass Jobs', count: '27,412 Job Openings', icon: GraduationCap },
];

// Hospital & Healthcare Jobs Grid Data
const HOSPITAL_GRID = [
  { name: 'Staff Nurse', count: '450 Job Openings', icon: HeartPulse },
  { name: 'Ward Boy / Assistant', count: '380 Job Openings', icon: HeartPulse },
  { name: 'Lab Assistant', count: '190 Job Openings', icon: HeartPulse },
];

// Hotel, Restaurant & Catering Jobs Grid Data
const HOTEL_GRID = [
  { name: 'Commi 1 Chef / Cook', count: '320 Job Openings', icon: Utensils },
  { name: 'Hotel Waiter', count: '280 Job Openings', icon: Utensils },
  { name: 'Housekeeping Associate', count: '210 Job Openings', icon: Utensils },
];

// School, College & Education Jobs Grid Data
const SCHOOL_GRID = [
  { name: 'Primary Teacher', count: '290 Job Openings', icon: BookOpen },
  { name: 'High School Teacher', count: '240 Job Openings', icon: BookOpen },
  { name: 'Librarian Assistant', count: '110 Job Openings', icon: HeartPulse },
];

interface Props {
  navigation: any;
}

export const CandidateHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePromoIndex, setActivePromoIndex] = useState(0);

  // Auto-play promotional banner slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePromoIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Top Search Bar State
  const [topSearch, setTopSearch] = useState('');

  // Hero Search Card State
  const [selectedIndustry, setSelectedIndustry] = useState('Select Industry');
  const [selectedEducation, setSelectedEducation] = useState('Select Education');
  const [locationQuery, setLocationQuery] = useState('');

  // Modals State
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);

  // Role Tab State
  const [activeRoleTab, setActiveRoleTab] = useState('All Opportunities');

  const loadHomeData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const [jobsRes, savedRes] = await Promise.all([
        candidateApi.getAllJobs(),
        candidateApi.getSavedJobs(),
      ]);

      if (jobsRes.success && jobsRes.data) {
        setJobs(jobsRes.data || []);
      }
      if (savedRes.success && savedRes.data) {
        const savedIds = (savedRes.data || []).map((j) => j.id);
        setSavedJobIds(savedIds);
      }
    } catch (e) {
      console.log('Error loading home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData(false);
    }, [loadHomeData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData(false);
  };

  const handleToggleSave = useCallback((jobId: string) => {
    setSavedJobIds((prev) => {
      const isSaved = prev.includes(jobId);
      if (isSaved) {
        showToast('Job removed !', 'info');
        return prev.filter((id) => id !== jobId);
      } else {
        showToast('Job saved !', 'success');
        return [...prev, jobId];
      }
    });

    candidateApi.toggleSaveJob(jobId).catch(() => {});
  }, [showToast]);

  const handleSearchSubmit = () => {
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params: {
        keyword: topSearch.trim() || undefined,
        location: locationQuery.trim() || undefined,
        industry: selectedIndustry !== 'Select Industry' ? selectedIndustry : undefined,
        education: selectedEducation !== 'Select Education' ? selectedEducation : undefined,
      },
    });
  };

  const handleQuickTradeSearch = (tradeName: string) => {
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params: { keyword: tradeName },
    });
  };

  // Filtered jobs for Popular Role Picks section
  const roleFilteredJobs = jobs.filter((j) => {
    if (activeRoleTab === 'All Opportunities') return true;
    const tabLower = activeRoleTab.toLowerCase();
    const titleMatch = j.title && j.title.toLowerCase().includes(tabLower);
    const tradeMatch = j.trade && j.trade.toLowerCase().includes(tabLower);
    const indMatch = j.industry && j.industry.toLowerCase().includes(tabLower);
    return titleMatch || tradeMatch || indMatch;
  });

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
      >
        {/* 1. Top Search Bar Pill (Above Banner) */}
        <View style={styles.topSearchPillRow}>
          <Search size={18} color="#2563EB" />
          <TextInput
            style={styles.topSearchInput}
            placeholder="Search jobs, trades, companies..."
            placeholderTextColor="#94A3B8"
            value={topSearch}
            onChangeText={setTopSearch}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>

        {/* 2. Promotional Banner Slider Carousel */}
        <View style={styles.promoSliderCard}>
          <Image source={{ uri: PROMO_BANNERS[activePromoIndex].image }} style={styles.promoImage} />

          {/* Left Arrow Button */}
          <TouchableOpacity
            style={styles.bannerArrowLeft}
            onPress={() => setActivePromoIndex((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length)}
          >
            <ChevronLeft size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Right Arrow Button */}
          <TouchableOpacity
            style={styles.bannerArrowRight}
            onPress={() => setActivePromoIndex((prev) => (prev + 1) % PROMO_BANNERS.length)}
          >
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.promoOverlay}>
            <View style={styles.promoBadgeOrange}>
              <Text style={styles.promoBadgeOrangeText}>WALK-IN DRIVE</Text>
            </View>
            <Text style={styles.promoTitle}>{PROMO_BANNERS[activePromoIndex].title}</Text>
            <Text style={styles.promoDesc} numberOfLines={2}>{PROMO_BANNERS[activePromoIndex].description}</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.promoActionBtnBlue}
              onPress={() => handleQuickTradeSearch(PROMO_BANNERS[activePromoIndex].tag)}
            >
              <Text style={styles.promoActionBtnText}>{PROMO_BANNERS[activePromoIndex].btnText}</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Dots pagination */}
          <View style={styles.dotsRow}>
            {PROMO_BANNERS.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActivePromoIndex(idx)}
                style={[styles.dot, activePromoIndex === idx && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* 3. Hero Header Title & Badge Section */}
        <View style={styles.heroTextSection}>
          <View style={styles.heroPillBadge}>
            <Star size={12} color="#2563EB" />
            <Text style={styles.heroPillBadgeText}>Industrial & Factory Jobs</Text>
          </View>
          <Text style={styles.heroMainTitle}>Discover Factory & Technical Jobs near you</Text>
          <Text style={styles.heroMainSubtitle}>
            Direct hiring for ITI, CNC operators, Welders, Fitters & Helpers in MIDC industrial clusters.
          </Text>
        </View>

        {/* 2. Hero White Search Container Card */}
        <View style={styles.heroSearchCard}>
          {/* Select Industry Dropdown */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.heroInputRow}
            onPress={() => setIndustryModalOpen(true)}
          >
            <Briefcase size={18} color="#2563EB" />
            <Text style={[styles.heroInputText, selectedIndustry !== 'Select Industry' && styles.heroInputTextActive]}>
              {selectedIndustry}
            </Text>
            <ChevronDown size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Select Education Dropdown */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.heroInputRow}
            onPress={() => setEducationModalOpen(true)}
          >
            <GraduationCap size={18} color="#2563EB" />
            <Text style={[styles.heroInputText, selectedEducation !== 'Select Education' && styles.heroInputTextActive]}>
              {selectedEducation}
            </Text>
            <ChevronDown size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* India (MIDC Zone or City) Input */}
          <View style={styles.heroInputRow}>
            <MapPin size={18} color="#2563EB" />
            <TextInput
              style={styles.heroTextInput}
              placeholder="India (MIDC Zone or City)"
              placeholderTextColor="#94A3B8"
              value={locationQuery}
              onChangeText={setLocationQuery}
            />
          </View>

          {/* Blue Primary Search Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.searchJobsBtn}
            onPress={handleSearchSubmit}
          >
            <Search size={18} color="#FFFFFF" />
            <Text style={styles.searchJobsBtnText}>Search Jobs</Text>
          </TouchableOpacity>

          {/* Popular Trades Pills */}
          <View style={styles.popularTradesSection}>
            <Text style={styles.popularTradesLabel}>Popular Trades:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tradePillsRow}>
              {['Fitter', 'Welder', 'CNC Operator', 'Electrician', 'Helper'].map((trade) => (
                <TouchableOpacity
                  key={trade}
                  activeOpacity={0.8}
                  style={styles.tradePillBtn}
                  onPress={() => handleQuickTradeSearch(trade)}
                >
                  <Text style={styles.tradePillBtnText}>{trade}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* 3. Popular Role Picks Section */}
        <View style={styles.sectionHeaderBox}>
          <View style={styles.titleWithBadgeRow}>
            <View style={styles.blueSquareIcon}>
              <Briefcase size={20} color="#2563EB" />
            </View>
            <Text style={styles.sectionTitleText}>Popular Role Picks</Text>
            <View style={styles.verifiedJobsBadge}>
              <Text style={styles.verifiedJobsBadgeText}>VERIFIED JOBS</Text>
            </View>
          </View>

          <Text style={styles.sectionSubText}>
            Explore top verified job opportunities categorized by available roles in the database
          </Text>

          {/* Horizontal Role Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleTabsRow}>
            {ROLE_TABS.map((tab) => {
              const isActive = activeRoleTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  style={[styles.roleTabPill, isActive && styles.roleTabPillActive]}
                  onPress={() => setActiveRoleTab(tab)}
                >
                  <Text style={[styles.roleTabDot, isActive && styles.roleTabDotActive]}>•</Text>
                  <Text style={[styles.roleTabText, isActive && styles.roleTabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Full Width Popular Role Job Cards List */}
          {loading ? (
            <SkeletonLoader width="100%" height={160} style={{ borderRadius: 8, marginTop: 12 }} />
          ) : roleFilteredJobs.length === 0 ? (
            <View style={styles.emptyRoleBox}>
              <Text style={styles.emptyRoleText}>No vacancies under "{activeRoleTab}" currently.</Text>
            </View>
          ) : (
            <View style={{ gap: 12, marginTop: 8 }}>
              {roleFilteredJobs.slice(0, 6).map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                const logoUrl = job.companyLogo || (job as any).company_logo;
                const minExp = job.min_experience ?? (job as any).minExperience ?? 0;
                const maxExp = job.max_experience ?? (job as any).maxExperience ?? 2;
                const expStr = minExp === maxExp ? `${minExp} Yrs Exp` : `${minExp}-${maxExp} Yrs Exp`;

                let salaryStr = '₹15-25K / mo';
                const sMin = job.salary_min ?? (job as any).salaryMin;
                const sMax = job.salary_max ?? (job as any).salaryMax;
                if (sMin && sMax) {
                  if (sMin >= 100000) {
                    salaryStr = `₹${(sMin / 100000).toFixed(1)}-${(sMax / 100000).toFixed(1)} Lacs / yr`;
                  } else {
                    salaryStr = `₹${Math.round(sMin / 1000)}k-${Math.round(sMax / 1000)}k / mo`;
                  }
                }

                return (
                  <TouchableOpacity
                    key={job.id}
                    activeOpacity={0.85}
                    style={styles.homeJobCardFull}
                    onPress={() =>
                      navigation.navigate('CandidateJobsTab', {
                        screen: 'CandidateJobDetail',
                        params: { jobId: job.id },
                      })
                    }
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.companyLogoSquare}>
                        {logoUrl ? (
                          <Image source={{ uri: logoUrl }} style={styles.logoImg} />
                        ) : (
                          <Building2 size={20} color="#2563EB" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardJobTitle} numberOfLines={1}>
                          {job.title}
                        </Text>
                        <Text style={styles.cardCompanyName} numberOfLines={1}>
                          {job.company || 'Industrial Manufacturer'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.bookmarkIconBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleToggleSave(job.id);
                        }}
                      >
                        <Bookmark
                          size={18}
                          color={isSaved ? '#2563EB' : '#94A3B8'}
                          fill={isSaved ? '#2563EB' : 'transparent'}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Single Row Metadata Bar */}
                    <View style={styles.singleRowMetaBar}>
                      <View style={styles.metaItemCompact}>
                        <Briefcase size={12} color="#64748B" />
                        <Text style={styles.metaTextCompact} numberOfLines={1}>{expStr}</Text>
                      </View>
                      <Text style={styles.metaDotDivider}>•</Text>
                      <View style={styles.metaItemCompact}>
                        <MapPin size={12} color="#64748B" />
                        <Text style={styles.metaTextCompact} numberOfLines={1}>{job.location || 'MIDC Zone'}</Text>
                      </View>
                      <Text style={styles.metaDotDivider}>•</Text>
                      <View style={styles.metaItemCompact}>
                        <IndianRupee size={12} color="#16A34A" />
                        <Text style={styles.salaryTextHighlight} numberOfLines={1}>{salaryStr}</Text>
                      </View>
                    </View>

                    {/* Non-wrapping Badges Row */}
                    <View style={styles.singleRowBadgesContainer}>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgePillText} numberOfLines={1}>
                          {job.work_mode || job.workMode || 'Onsite'}
                        </Text>
                      </View>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgePillText} numberOfLines={1}>
                          {job.job_type || job.jobType || 'Full-Time'}
                        </Text>
                      </View>
                      {job.shift_details || (job as any).shiftDetails ? (
                        <View style={[styles.badgePill, { backgroundColor: '#F3E8FF', borderColor: '#DDD6FE' }]}>
                          <Clock size={10} color="#7C3AED" />
                          <Text style={[styles.badgePillText, { color: '#7C3AED' }]} numberOfLines={1}>
                            {job.shift_details || (job as any).shiftDetails}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Explore All Opportunities Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.exploreAllBtn}
            onPress={() => navigation.navigate('CandidateJobsTab')}
          >
            <Text style={styles.exploreAllBtnText}>Explore All Opportunities</Text>
            <ArrowRight size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* 4. Live Stats 2x2 Grid */}
        <View style={styles.statsGrid2x2}>
          <View style={styles.statSquareCard}>
            <Text style={[styles.statValueText, { color: '#2563EB' }]}>2,240+</Text>
            <Text style={styles.statLabelText}>Active Listings</Text>
          </View>

          <View style={styles.statSquareCard}>
            <Text style={[styles.statValueText, { color: '#059669' }]}>225+</Text>
            <Text style={styles.statLabelText}>Factories Hiring</Text>
          </View>

          <View style={styles.statSquareCard}>
            <Text style={[styles.statValueText, { color: '#7C3AED' }]}>2,070+</Text>
            <Text style={styles.statLabelText}>Verified Workers</Text>
          </View>

          <View style={styles.statSquareCard}>
            <Text style={[styles.statValueText, { color: '#EA580C' }]}>8,155+</Text>
            <Text style={styles.statLabelText}>Placements</Text>
          </View>
        </View>

        {/* 5. Browse by ITI Trade / Specialty Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.popularTradesBadge}>
            <Text style={styles.popularTradesBadgeText}>POPULAR TRADES</Text>
          </View>

          <Text style={styles.sectionTitleBig}>Browse by ITI Trade / Specialty</Text>
          <Text style={styles.sectionSubTextCentered}>
            Direct vacancies in production, quality, maintenance & logistics
          </Text>

          {/* 3-Column Grid of Trade Cards */}
          <View style={styles.threeColumnGrid}>
            {ITI_TRADES_GRID.map((trade, idx) => {
              const IconComp = trade.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.tradeSquareCard}
                  onPress={() => handleQuickTradeSearch(trade.name)}
                >
                  <View style={styles.tradeIconSquare}>
                    <IconComp size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.tradeCardTitle} numberOfLines={1}>{trade.name}</Text>
                  <Text style={styles.tradeCardCount}>{trade.count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. Browse Jobs by Qualification Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.educationBadge}>
            <Text style={styles.educationBadgeText}>EDUCATION</Text>
          </View>

          <Text style={styles.sectionTitleBig}>Browse Jobs by Qualification</Text>
          <Text style={styles.sectionSubTextCentered}>
            Find jobs matching your school education or college degree
          </Text>

          {/* 3-Column Grid of Qualification Cards */}
          <View style={styles.threeColumnGrid}>
            {EDUCATION_GRID.map((qual, idx) => {
              const IconComp = qual.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.qualSquareCard}
                  onPress={() => handleQuickTradeSearch(qual.name)}
                >
                  <View style={styles.qualIconSquare}>
                    <IconComp size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.qualCardTitle} numberOfLines={1}>{qual.name}</Text>
                  <Text style={styles.qualCardCount}>{qual.count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 7. Hospital & Healthcare Jobs Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.hospitalBadge}>
            <Text style={styles.hospitalBadgeText}>HOSPITAL</Text>
          </View>

          <Text style={styles.sectionTitleBig}>Hospital & Healthcare Jobs</Text>
          <Text style={styles.sectionSubTextCentered}>
            Browse medical, nursing, administration and support staff jobs
          </Text>

          <View style={styles.threeColumnGrid}>
            {HOSPITAL_GRID.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.qualSquareCard}
                  onPress={() => handleQuickTradeSearch(item.name)}
                >
                  <View style={styles.qualIconSquare}>
                    <IconComp size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.qualCardCount}>{item.count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 8. Hotel, Restaurant & Catering Jobs Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.hotelBadge}>
            <Text style={styles.hotelBadgeText}>HOTEL</Text>
          </View>

          <Text style={styles.sectionTitleBig}>Hotel, Restaurant & Catering Jobs</Text>
          <Text style={styles.sectionSubTextCentered}>
            Find jobs in top hotels, cafes, pantries, and food companies
          </Text>

          <View style={styles.threeColumnGrid}>
            {HOTEL_GRID.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.qualSquareCard}
                  onPress={() => handleQuickTradeSearch(item.name)}
                >
                  <View style={styles.qualIconSquare}>
                    <IconComp size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.qualCardCount}>{item.count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 9. School, College & Education Jobs Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.schoolBadge}>
            <Text style={styles.schoolBadgeText}>SCHOOL & COLLEGE</Text>
          </View>

          <Text style={styles.sectionTitleBig}>School, College & Education Jobs</Text>
          <Text style={styles.sectionSubTextCentered}>
            Browse teaching, clerical, administrative and security roles in academic institutes
          </Text>

          <View style={styles.threeColumnGrid}>
            {SCHOOL_GRID.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.qualSquareCard}
                  onPress={() => handleQuickTradeSearch(item.name)}
                >
                  <View style={styles.qualIconSquare}>
                    <IconComp size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.qualCardCount}>{item.count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Select Industry Modal Sheet */}
      <Modal visible={industryModalOpen} transparent animationType="slide" onRequestClose={() => setIndustryModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Industry</Text>
              <TouchableOpacity onPress={() => setIndustryModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {INDUSTRIES.map((ind) => (
                <TouchableOpacity
                  key={ind}
                  style={[styles.pickerItem, selectedIndustry === ind && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedIndustry(ind);
                    setIndustryModalOpen(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, selectedIndustry === ind && styles.pickerItemTextActive]}>{ind}</Text>
                  {selectedIndustry === ind ? <Check size={16} color="#2563EB" /> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Select Education Modal Sheet */}
      <Modal visible={educationModalOpen} transparent animationType="slide" onRequestClose={() => setEducationModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Education</Text>
              <TouchableOpacity onPress={() => setEducationModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {EDUCATIONS.map((ed) => (
                <TouchableOpacity
                  key={ed}
                  style={[styles.pickerItem, selectedEducation === ed && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedEducation(ed);
                    setEducationModalOpen(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, selectedEducation === ed && styles.pickerItemTextActive]}>{ed}</Text>
                  {selectedEducation === ed ? <Check size={16} color="#2563EB" /> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  topSearchPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  topSearchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  heroSearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#94A3B8',
    padding: 16,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  heroInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  heroInputText: {
    flex: 1,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroInputTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  heroTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  searchJobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 13,
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  searchJobsBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  popularTradesSection: {
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  popularTradesLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tradePillsRow: {
    gap: 6,
  },
  tradePillBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    color: '#334155',
  },
  tradePillBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  sectionHeaderBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blueSquareIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  verifiedJobsBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedJobsBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2563EB',
  },
  sectionSubText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  homeJobCardFull: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    padding: 10,
    gap: 6,
  },
  companyLogoSquare: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  cardCompanyName: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  bookmarkIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleRowMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  metaItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  metaTextCompact: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  metaDotDivider: {
    fontSize: 10,
    color: '#94A3B8',
    marginHorizontal: 1,
  },
  salaryTextHighlight: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  singleRowBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 5,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    flexShrink: 1,
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  sectionSubTextCentered: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  roleTabsRow: {
    gap: 8,
    marginVertical: 4,
  },
  roleTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  roleTabPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  roleTabDot: {
    fontSize: 14,
    color: '#64748B',
  },
  roleTabDotActive: {
    color: '#FFFFFF',
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  emptyRoleBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyRoleText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  horizontalCardsRow: {
    gap: 12,
  },
  webRoleJobCard: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#BFDBFE',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 14,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardJobTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLocationText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  cardExperienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardExperienceText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  workPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  workPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  shiftPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  shiftPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7C3AED',
  },
  cardFooterDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  companyFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyCircleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
  },
  postedByText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  exploreAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  exploreAllBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  statsGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statSquareCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#94A3B8',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  statValueText: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  popularTradesBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  popularTradesBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2563EB',
  },
  educationBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  educationBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2563EB',
  },
  standaloneSection: {
    marginVertical: 4,
    gap: 8,
  },
  sectionTitleBig: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 2,
  },
  threeColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    justifyContent: 'flex-start',
  },
  tradeSquareCard: {
    width: Math.floor((SCREEN_WIDTH - 32 - 16) / 3),
    height: 118,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#BFDBFE',
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  tradeIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  tradeCardCount: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
  },
  qualSquareCard: {
    width: Math.floor((SCREEN_WIDTH - 32 - 16) / 3),
    height: 118,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#BFDBFE',
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  qualIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  qualCardCount: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
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
    gap: 8,
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
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  pickerItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  pickerItemTextActive: {
    color: '#2563EB',
    fontWeight: '900',
  },
  promoSliderCard: {
    height: 185,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#94A3B8',
    marginBottom: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  promoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.38,
  },
  promoOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 14,
    justifyContent: 'space-between',
  },
  promoBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  promoDesc: {
    fontSize: 11.5,
    color: '#E2E8F0',
    lineHeight: 15,
  },
  promoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  promoActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
  hospitalBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'center',
  },
  hospitalBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2563EB',
  },
  hotelBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'center',
  },
  hotelBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2563EB',
  },
  schoolBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'center',
  },
  schoolBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2563EB',
  },
  bannerArrowLeft: {
    position: 'absolute',
    left: 10,
    top: '40%',
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerArrowRight: {
    position: 'absolute',
    right: 10,
    top: '40%',
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBadgeOrange: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  promoBadgeOrangeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoActionBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  heroTextSection: {
    alignItems: 'center',
    marginVertical: 4,
    gap: 6,
    paddingHorizontal: 8,
  },
  heroPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  heroPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  heroMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 26,
  },
  heroMainSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
});
