import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Switch,
  DeviceEventEmitter,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Clock,
  Gift,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Wrench,
  Search,
  X,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { FilterOptions } from '../../components/common/JobFilterSideDrawer';
import { Job } from '../../types';
import { candidateApi } from '../../api/candidateApi';
import { jobsApi } from '../../api/jobsApi';
import { evaluateJobMatchesFilter } from '../candidate/utils/jobFilterEngine';

export type JobFilterTabKey =
  | 'INDUSTRY'
  | 'EDUCATION'
  | 'JOB_ROLE'
  | 'EXPERIENCE'
  | 'LOCATION'
  | 'JOB_TYPE'
  | 'WORK_MODE'
  | 'AMENITIES';

export const JOB_INDUSTRIES: string[] = [
  'All Industries',
  'Automotive & Auto Components',
  'Industrial & Heavy Manufacturing',
  'CNC Machining & Precision Tooling',
  'Pharmaceutical & Chemical Manufacturing',
  'Electronics & Electrical Assembly',
  'Steel, Metal & Fabrication',
  'Packaging, Paper & Printing',
  'Food Processing & Beverages',
  'Textile & Garment Manufacturing',
  'Warehouse & Logistics Operations',
  'IT & Software Engineering',
];

export const JOB_EDUCATIONS: string[] = [
  'All Education Levels',
  '10th / SSC Pass',
  '12th / HSC Pass',
  'ITI Certificate (Fitter / Welder / Electrician / CNC / Machinist)',
  'Diploma in Engineering (Mechanical / Electrical / Automobile / Civil)',
  'B.E. / B.Tech (Engineering Graduate)',
  'Graduate (B.Sc / B.Com / BA / BCA / BBA)',
  'Post Graduate (M.Tech / MBA / MCA)',
];

export const JOB_EXPERIENCES: string[] = [
  'All Experience',
  'Fresher (0 Yrs)',
  '1-3 Years',
  '3-5 Years',
  '5+ Years',
];

export const JOB_MIDC_ZONES: string[] = [
  'All MIDC Zones',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Shendra MIDC / AURIC City (Chhatrapati Sambhajinagar)',
  'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
  'Chitegaon MIDC (Chhatrapati Sambhajinagar)',
  'Paithan MIDC (Chhatrapati Sambhajinagar)',
  'Bidkin DMIC / AURIC City (Chhatrapati Sambhajinagar)',
  'Railway Station Industrial Area',
  'Chhatrapati Sambhajinagar (All Areas)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Ranjangaon MIDC (Pune)',
  'Taloja MIDC (Navi Mumbai)',
  'Thane Belapur MIDC',
];

export const JOB_TYPES_LIST: string[] = [
  'All Types',
  'Full-time',
  'Part-time',
  'Contract',
  'Apprenticeship',
];

export const JOB_WORK_MODES: string[] = [
  'All Modes',
  'On-site',
  'Hybrid',
  'Remote',
];

// Industry → Job Roles mapping (Dynamic industry-grade mapping)
export const INDUSTRY_JOB_ROLES: Record<string, string[]> = {
  'All Industries': [
    'All Roles',
    'Machine Operator',
    'Production Supervisor',
    'Quality Inspector (QA / QC)',
    'Maintenance Technician',
    'Fitter',
    'Welder',
    'Electrician',
    'CNC Operator',
    'Assembly Technician',
    'Store Keeper / Inventory',
    'Packing / Packaging Operator',
    'Helper / General Worker',
    'Safety Officer (EHS)',
    'Forklift Operator / Driver',
    'Plant / Production Engineer',
  ],
  'Automotive & Auto Components': [
    'All Roles',
    'Automotive Assembly Technician',
    'Chassis & Body Assembler',
    'Wiring Harness Assembler',
    'Automotive Paint Shop Operator',
    'Engine Assembly Technician',
    'Stamping / Press Operator',
    'Quality Inspector (Automotive PDI)',
    'Production Supervisor',
    'Die Casting Operator',
    'Tool & Die Maker',
    'Line Inspector / QA',
    'Robotic Welding Operator',
    'Maintenance Electrician / Fitter',
    'Automotive Design Draughtsman',
  ],
  'Industrial & Heavy Manufacturing': [
    'All Roles',
    'Heavy Equipment Operator',
    'Plant Maintenance Engineer',
    'Industrial Mechanical Fitter',
    'Boiler Attendant / Operator',
    'Hydraulics & Pneumatics Tech',
    'Production Shift Supervisor',
    'Foundry & Moulding Operator',
    'Safety & EHS Officer',
    'Heavy Fabrication Welder',
    'EOT Crane Operator',
    'Plant Quality Inspector',
    'Assembly Line Worker',
    'Store & Dispatch Executive',
  ],
  'CNC Machining & Precision Tooling': [
    'All Roles',
    'CNC Milling Operator',
    'CNC Turning Operator',
    'VMC Operator / Setter',
    'CNC Programmer (Fanuc / Siemens)',
    'Precision Machinist',
    'Tool & Die Maker',
    'Surface Grinding Machine Operator',
    'CMM Inspector (Quality Assurance)',
    'Lathe Machine Turner',
    'Boring Machine Operator',
    'EDM / Wire Cut Operator',
    'Quality Checker (Vernier / Micrometer)',
    'Tool Room Supervisor',
  ],
  'Pharmaceutical & Chemical Manufacturing': [
    'All Roles',
    'Production Chemist',
    'QC / QA Chemist',
    'Formulation Operator (Granulation / Tablet)',
    'API Plant Operator',
    'Packaging Machine Operator (Blister / Strip)',
    'Cleanroom Technician',
    'Microbiologist',
    'Chemical Plant Operator',
    'Analytical Lab Chemist (HPLC / GC)',
    'R&D Executive',
    'Safety & Effluent Treatment (ETP) Tech',
    'Documentation Executive (GMP / Regulatory)',
    'Pharma Warehouse Assistant',
  ],
  'Electronics & Electrical Assembly': [
    'All Roles',
    'PCB Assembly Technician',
    'SMT Machine Operator',
    'Soldering & Wireman Technician',
    'Control Panel Wiring Electrician',
    'Electronics Testing Technician',
    'PLC & Automation Programmer',
    'Appliance Assembly Worker',
    'Electrical Maintenance Engineer',
    'Transformer & Motor Winding Tech',
    'In-Circuit Quality Tester',
    'Component Sorter & Packer',
    'R&D Electronics Technician',
  ],
  'Steel, Metal & Fabrication': [
    'All Roles',
    'MIG / TIG / Arc Welder',
    'Structural Fabricator',
    'Sheet Metal Worker',
    'Laser Cutting Machine Operator',
    'Press Brake Operator (Bending)',
    'Foundry & Furnace Operator',
    'Gas Cutter / Grinder',
    'Galvanizing / Coating Operator',
    'Pipe Fitter & Plumber (Industrial)',
    'NDT Quality Inspector (Welding)',
    'Metal Polisher / Finisher',
    'Rolling Mill Operator',
  ],
  'Packaging, Paper & Printing': [
    'All Roles',
    'Corrugated Box Machine Operator',
    'Offset Printing Machine Operator',
    'Flexographic Printer',
    'Carton Pasting / Gluing Operator',
    'Die Punching Machine Operator',
    'Blown Film Extruder Operator',
    'Lamination Machine Operator',
    'Slitting & Rewinding Operator',
    'Packaging Quality Checker',
    'Finished Goods Packing Helper',
    'Graphic Pre-Press Technician',
    'Dispatch & Logistics Assistant',
  ],
  'Food Processing & Beverages': [
    'All Roles',
    'Food Processing Machine Operator',
    'Bakery / Confectionery Worker',
    'Beverage Bottling Line Operator',
    'Dairy Plant Technician',
    'Food Safety & QA Inspector (HACCP)',
    'Cold Storage & Chiller Attendant',
    'Sorting & Grading Worker',
    'Pouch Packing Machine Operator',
    'Nutrition / Food Lab Assistant',
    'Cooking & Mixing Operator',
    'Sanitation & Hygiene Worker',
    'Warehouse & Dispatch Staff',
  ],
  'Textile & Garment Manufacturing': [
    'All Roles',
    'Industrial Sewing Machine Operator',
    'Pattern Maker / Cutter',
    'Spinning Machine Operator',
    'Weaving / Loom Operator',
    'Dyeing & Bleaching Operator',
    'Garment Finishing & Ironing Worker',
    'Textile Quality Checker',
    'Tailor / Sample Maker',
    'Embroidery Machine Operator',
    'Fabric Inspector',
    'Packing & Folding Helper',
    'Textile Supervisor',
  ],
  'Warehouse & Logistics Operations': [
    'All Roles',
    'Forklift / Reach Truck Operator',
    'Warehouse Store Keeper',
    'Inventory / Stock Executive',
    'Loading / Unloading Supervisor',
    'Order Picker & Packer',
    'Dispatch & Shipping Coordinator',
    'Billing & SAP / ERP Data Operator',
    'Material Handler',
    'Fleet / Driver Supervisor',
    'Logistics Coordinator',
    'Safety & Yard Inspector',
    'Supply Chain Executive',
  ],
  'IT & Software Engineering': [
    'All Roles',
    'Full Stack Developer',
    'Frontend Developer (React / React Native)',
    'Backend Developer (Node.js / Python / Java)',
    'Mobile App Developer',
    'QA / Software Test Engineer',
    'DevOps & Cloud Engineer',
    'IT Support / Network Engineer',
    'Database Administrator (DBA)',
    'UI/UX Designer',
    'Data Analyst / BI Developer',
    'Technical Support Executive',
    'ERP / SAP Consultant',
  ],
};

export const JobFilterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const currentFilters: FilterOptions = route.params?.currentFilters || {
    industry: 'All Industries',
    education: 'All Education Levels',
    jobType: 'All Types',
    workMode: 'All Modes',
    minExperience: 'All Experience',
    salaryMin: 0,
    midcZone: 'All MIDC Zones',
    busFacility: false,
    canteen: false,
    accommodation: false,
    overtime: false,
  };

  const initialTab: JobFilterTabKey = route.params?.defaultTab || 'INDUSTRY';
  const initialJobsList: Job[] = route.params?.jobs || [];
  const [loadedJobs, setLoadedJobs] = useState<Job[]>(initialJobsList);

  React.useEffect(() => {
    if (!initialJobsList || initialJobsList.length === 0) {
      candidateApi.getAllJobs().then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLoadedJobs(res.data);
        }
      }).catch(() => {});
    }
  }, []);

  const [activeFilterTab, setActiveFilterTab] = useState<JobFilterTabKey>(initialTab);
  const [tabSearchQuery, setTabSearchQuery] = useState<string>('');

  const [draftIndustries, setDraftIndustries] = useState<string[]>(
    currentFilters.industries && currentFilters.industries.length > 0
      ? currentFilters.industries
      : currentFilters.industry && currentFilters.industry !== 'All Industries'
      ? [currentFilters.industry]
      : []
  );
  const [draftEducations, setDraftEducations] = useState<string[]>(
    currentFilters.educations && currentFilters.educations.length > 0
      ? currentFilters.educations
      : currentFilters.education && currentFilters.education !== 'All Education Levels'
      ? [currentFilters.education]
      : []
  );
  const [draftJobRoles, setDraftJobRoles] = useState<string[]>(
    currentFilters.jobRoles && currentFilters.jobRoles.length > 0
      ? currentFilters.jobRoles
      : currentFilters.jobRole && currentFilters.jobRole !== 'All Roles'
      ? [currentFilters.jobRole]
      : []
  );
  const [draftLocations, setDraftLocations] = useState<string[]>(
    currentFilters.locations && currentFilters.locations.length > 0
      ? currentFilters.locations
      : currentFilters.midcZone && currentFilters.midcZone !== 'All MIDC Zones'
      ? [currentFilters.midcZone]
      : []
  );
  const [draftWorkModes, setDraftWorkModes] = useState<string[]>(
    currentFilters.workModes && currentFilters.workModes.length > 0
      ? currentFilters.workModes
      : currentFilters.workMode && currentFilters.workMode !== 'All Modes'
      ? [currentFilters.workMode]
      : []
  );

  const [draftExp, setDraftExp] = useState<string>(currentFilters.minExperience || 'All Experience');
  const [draftJobType, setDraftJobType] = useState<string>(currentFilters.jobType || 'All Types');
  const [draftBus, setDraftBus] = useState<boolean>(Boolean(currentFilters.busFacility));
  const [draftCanteen, setDraftCanteen] = useState<boolean>(Boolean(currentFilters.canteen));
  const [draftAccommodation, setDraftAccommodation] = useState<boolean>(Boolean(currentFilters.accommodation));
  const [draftOvertime, setDraftOvertime] = useState<boolean>(Boolean(currentFilters.overtime));

  // Reset tab search query when tab switches
  React.useEffect(() => {
    setTabSearchQuery('');
  }, [activeFilterTab]);

  // Dynamic Categories from backend API
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  React.useEffect(() => {
    let isMounted = true;
    jobsApi.getCategories()
      .then((res: any) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data.map((c: any) => typeof c === 'string' ? c : c.name).filter(Boolean);
          setAvailableCategories(names);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const displayedIndustries = useMemo(() => {
    return Array.from(new Set(['All Industries', ...availableCategories, ...JOB_INDUSTRIES])).filter(Boolean);
  }, [availableCategories]);

  // Dynamically compute available job roles based on ALL selected Industries
  const availableJobRoles = useMemo(() => {
    const activeInds = draftIndustries.length > 0 ? draftIndustries : ['All Industries'];
    const baseRoles = new Set<string>();

    activeInds.forEach((ind) => {
      const roles = INDUSTRY_JOB_ROLES[ind] || INDUSTRY_JOB_ROLES['All Industries'] || [];
      roles.forEach((r) => baseRoles.add(r));
    });

    const customRoles = new Set<string>();

    if (loadedJobs && loadedJobs.length > 0) {
      loadedJobs.forEach((job) => {
        const jobInd = (job.industry || '').toLowerCase();
        const matchesIndustry =
          draftIndustries.length === 0 ||
          draftIndustries.some((targetInd) => {
            const t = targetInd.toLowerCase();
            return jobInd.includes(t.slice(0, 5)) || t.includes(jobInd.slice(0, 5));
          });

        if (matchesIndustry) {
          if (job.trade && job.trade.trim().length >= 2) {
            customRoles.add(job.trade.trim());
          }
          if (job.title && job.title.trim().length >= 2 && job.title.length <= 40) {
            customRoles.add(job.title.trim());
          }
        }
      });
    }

    const uniqueList: string[] = ['All Roles'];
    Array.from(baseRoles).forEach((role) => {
      if (role !== 'All Roles' && !uniqueList.some((r) => r.toLowerCase() === role.toLowerCase())) {
        uniqueList.push(role);
      }
    });

    Array.from(customRoles).forEach((role) => {
      if (!uniqueList.some((r) => r.toLowerCase() === role.toLowerCase())) {
        uniqueList.push(role);
      }
    });

    return uniqueList;
  }, [draftIndustries, loadedJobs]);

  const filteredIndustries = useMemo(() => {
    if (!tabSearchQuery.trim()) return displayedIndustries;
    const q = tabSearchQuery.toLowerCase().trim();
    return displayedIndustries.filter(
      (opt) => opt === 'All Industries' || opt.toLowerCase().includes(q)
    );
  }, [displayedIndustries, tabSearchQuery]);

  const filteredEducations = useMemo(() => {
    if (!tabSearchQuery.trim()) return JOB_EDUCATIONS;
    const q = tabSearchQuery.toLowerCase().trim();
    return JOB_EDUCATIONS.filter(
      (opt) => opt === 'All Education Levels' || opt.toLowerCase().includes(q)
    );
  }, [tabSearchQuery]);

  const filteredJobRoles = useMemo(() => {
    if (!tabSearchQuery.trim()) return availableJobRoles;
    const q = tabSearchQuery.toLowerCase().trim();
    return availableJobRoles.filter(
      (opt) => opt === 'All Roles' || opt.toLowerCase().includes(q)
    );
  }, [availableJobRoles, tabSearchQuery]);

  const filteredLocations = useMemo(() => {
    if (!tabSearchQuery.trim()) return JOB_MIDC_ZONES;
    const q = tabSearchQuery.toLowerCase().trim();
    return JOB_MIDC_ZONES.filter(
      (opt) => opt === 'All MIDC Zones' || opt.toLowerCase().includes(q)
    );
  }, [tabSearchQuery]);

  const filteredWorkModes = useMemo(() => {
    if (!tabSearchQuery.trim()) return JOB_WORK_MODES;
    const q = tabSearchQuery.toLowerCase().trim();
    return JOB_WORK_MODES.filter(
      (opt) => opt === 'All Modes' || opt.toLowerCase().includes(q)
    );
  }, [tabSearchQuery]);

  const toggleDraftIndustry = (option: string) => {
    if (option === 'All Industries') {
      setDraftIndustries([]);
      return;
    }
    setDraftIndustries((prev) =>
      prev.includes(option) ? prev.filter((i) => i !== option) : [...prev, option]
    );
  };

  const toggleDraftEducation = (option: string) => {
    if (option === 'All Education Levels') {
      setDraftEducations([]);
      return;
    }
    setDraftEducations((prev) =>
      prev.includes(option) ? prev.filter((e) => e !== option) : [...prev, option]
    );
  };

  const toggleDraftJobRole = (option: string) => {
    if (option === 'All Roles') {
      setDraftJobRoles([]);
      return;
    }
    setDraftJobRoles((prev) =>
      prev.includes(option) ? prev.filter((r) => r !== option) : [...prev, option]
    );
  };

  const toggleDraftLocation = (option: string) => {
    if (option === 'All MIDC Zones') {
      setDraftLocations([]);
      return;
    }
    setDraftLocations((prev) =>
      prev.includes(option) ? prev.filter((l) => l !== option) : [...prev, option]
    );
  };

  const toggleDraftWorkMode = (option: string) => {
    if (option === 'All Modes') {
      setDraftWorkModes([]);
      return;
    }
    setDraftWorkModes((prev) =>
      prev.includes(option) ? prev.filter((m) => m !== option) : [...prev, option]
    );
  };

  const handleResetFilters = () => {
    setDraftIndustries([]);
    setDraftEducations([]);
    setDraftJobRoles([]);
    setDraftLocations([]);
    setDraftWorkModes([]);
    setDraftExp('All Experience');
    setDraftJobType('All Types');
    setDraftBus(false);
    setDraftCanteen(false);
    setDraftAccommodation(false);
    setDraftOvertime(false);
    setTabSearchQuery('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += draftIndustries.length;
    count += draftEducations.length;
    count += draftJobRoles.length;
    count += draftLocations.length;
    count += draftWorkModes.length;
    if (draftExp && draftExp !== 'All Experience') count++;
    if (draftJobType && draftJobType !== 'All Types') count++;
    if (draftBus) count++;
    if (draftCanteen) count++;
    if (draftAccommodation) count++;
    if (draftOvertime) count++;
    return count;
  }, [
    draftIndustries,
    draftEducations,
    draftJobRoles,
    draftLocations,
    draftWorkModes,
    draftExp,
    draftJobType,
    draftBus,
    draftCanteen,
    draftAccommodation,
    draftOvertime,
  ]);

  const perksCount = (draftBus ? 1 : 0) + (draftCanteen ? 1 : 0) + (draftAccommodation ? 1 : 0) + (draftOvertime ? 1 : 0);

  const currentDraftFilterOptions = useMemo<FilterOptions>(() => {
    return {
      industry: draftIndustries.length > 0 ? draftIndustries[0] : 'All Industries',
      industries: draftIndustries,
      education: draftEducations.length > 0 ? draftEducations[0] : 'All Education Levels',
      educations: draftEducations,
      jobRole: draftJobRoles.length > 0 ? draftJobRoles[0] : undefined,
      jobRoles: draftJobRoles,
      minExperience: draftExp,
      midcZone: draftLocations.length > 0 ? draftLocations[0] : 'All MIDC Zones',
      locations: draftLocations,
      jobType: draftJobType,
      workMode: draftWorkModes.length > 0 ? draftWorkModes[0] : 'All Modes',
      workModes: draftWorkModes,
      salaryMin: currentFilters.salaryMin || 0,
      busFacility: draftBus,
      canteen: draftCanteen,
      accommodation: draftAccommodation,
      overtime: draftOvertime,
    };
  }, [
    draftIndustries,
    draftEducations,
    draftJobRoles,
    draftLocations,
    draftWorkModes,
    draftExp,
    draftJobType,
    draftBus,
    draftCanteen,
    draftAccommodation,
    draftOvertime,
    currentFilters.salaryMin,
  ]);

  // Real-time matching jobs calculation using unified industry-grade engine
  const draftMatchingCount = useMemo(() => {
    const listToFilter = loadedJobs.length > 0 ? loadedJobs : initialJobsList;
    if (!listToFilter || listToFilter.length === 0) {
      return route.params?.totalMatchingJobsCount ?? 0;
    }

    return listToFilter.filter((job) =>
      evaluateJobMatchesFilter(job, currentDraftFilterOptions)
    ).length;
  }, [loadedJobs, initialJobsList, currentDraftFilterOptions, route.params?.totalMatchingJobsCount]);

  const handleApplyFilters = () => {
    const applied: FilterOptions = currentDraftFilterOptions;

    // 1. Broadcast event so target screens update their filter state synchronously
    DeviceEventEmitter.emit('APPLY_JOB_FILTERS', applied);

    // 2. Perform reliable navigation back
    const returnScreen = route.params?.returnScreen;

    if (returnScreen === 'CandidateHomeTab') {
      navigation.navigate('CandidateMain' as never, {
        screen: 'CandidateJobsTab',
        params: {
          screen: 'CandidateJobSearch',
          params: { homeFilters: applied, appliedFilters: applied },
        },
      } as never);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CandidateMain' as never, {
        screen: 'CandidateJobsTab',
        params: {
          screen: 'CandidateJobSearch',
          params: { appliedFilters: applied },
        },
      } as never);
    }
  };

  const renderTabContent = () => {
    switch (activeFilterTab) {
      case 'INDUSTRY': {
        const isAll = draftIndustries.length === 0;
        return (
          <View style={styles.tabContentWrapper}>
            <View style={styles.searchHeaderBox}>
              <View style={styles.tabSearchBar}>
                <Search size={15} color="#94A3B8" />
                <TextInput
                  style={styles.tabSearchInput}
                  placeholder="Search industries..."
                  placeholderTextColor="#94A3B8"
                  value={tabSearchQuery}
                  onChangeText={setTabSearchQuery}
                  autoCorrect={false}
                />
                {tabSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setTabSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={15} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.tabStatusRow}>
                <Text style={styles.tabStatusText}>
                  {draftIndustries.length > 0 ? `${draftIndustries.length} selected` : 'Any Industry'}
                </Text>
                {draftIndustries.length > 0 && (
                  <TouchableOpacity onPress={() => setDraftIndustries([])}>
                    <Text style={styles.tabClearAction}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
              {filteredIndustries.map((option) => {
                const isOptionAll = option === 'All Industries';
                const isSelected = isOptionAll ? isAll : draftIndustries.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => toggleDraftIndustry(option)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                      {option}
                    </Text>
                    <View style={[styles.checkBoxSquare, isSelected && styles.checkBoxSquareSelected]}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      }

      case 'EDUCATION': {
        const isAll = draftEducations.length === 0;
        return (
          <View style={styles.tabContentWrapper}>
            <View style={styles.searchHeaderBox}>
              <View style={styles.tabStatusRow}>
                <Text style={styles.tabStatusText}>
                  {draftEducations.length > 0 ? `${draftEducations.length} selected` : 'Any Education'}
                </Text>
                {draftEducations.length > 0 && (
                  <TouchableOpacity onPress={() => setDraftEducations([])}>
                    <Text style={styles.tabClearAction}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
              {filteredEducations.map((option) => {
                const isOptionAll = option === 'All Education Levels';
                const isSelected = isOptionAll ? isAll : draftEducations.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => toggleDraftEducation(option)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                      {option}
                    </Text>
                    <View style={[styles.checkBoxSquare, isSelected && styles.checkBoxSquareSelected]}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      }

      case 'JOB_ROLE': {
        const isAll = draftJobRoles.length === 0;
        return (
          <View style={styles.tabContentWrapper}>
            <View style={styles.searchHeaderBox}>
              <View style={styles.tabSearchBar}>
                <Search size={15} color="#94A3B8" />
                <TextInput
                  style={styles.tabSearchInput}
                  placeholder="Search job roles..."
                  placeholderTextColor="#94A3B8"
                  value={tabSearchQuery}
                  onChangeText={setTabSearchQuery}
                  autoCorrect={false}
                />
                {tabSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setTabSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={15} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
              {draftIndustries.length > 0 && (
                <View style={styles.roleHintRow}>
                  <Building2 size={13} color="#64748B" strokeWidth={1.8} />
                  <Text style={styles.roleHintText} numberOfLines={1}>
                    Roles for: {draftIndustries.slice(0, 2).map((i) => i.split('&')[0].trim()).join(', ')}
                    {draftIndustries.length > 2 ? ` +${draftIndustries.length - 2}` : ''}
                  </Text>
                </View>
              )}
              <View style={styles.tabStatusRow}>
                <Text style={styles.tabStatusText}>
                  {draftJobRoles.length > 0 ? `${draftJobRoles.length} selected` : 'Any Role'}
                </Text>
                {draftJobRoles.length > 0 && (
                  <TouchableOpacity onPress={() => setDraftJobRoles([])}>
                    <Text style={styles.tabClearAction}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
              {filteredJobRoles.map((option) => {
                const isOptionAll = option === 'All Roles';
                const isSelected = isOptionAll ? isAll : draftJobRoles.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => toggleDraftJobRole(option)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                      {option}
                    </Text>
                    <View style={[styles.checkBoxSquare, isSelected && styles.checkBoxSquareSelected]}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      }

      case 'EXPERIENCE':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_EXPERIENCES.map((option) => {
              const isSelected = draftExp === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftExp(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                    {option}
                  </Text>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'LOCATION': {
        const isAll = draftLocations.length === 0;
        return (
          <View style={styles.tabContentWrapper}>
            <View style={styles.searchHeaderBox}>
              <View style={styles.tabSearchBar}>
                <Search size={15} color="#94A3B8" />
                <TextInput
                  style={styles.tabSearchInput}
                  placeholder="Search MIDC / city..."
                  placeholderTextColor="#94A3B8"
                  value={tabSearchQuery}
                  onChangeText={setTabSearchQuery}
                  autoCorrect={false}
                />
                {tabSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setTabSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={15} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.tabStatusRow}>
                <Text style={styles.tabStatusText}>
                  {draftLocations.length > 0 ? `${draftLocations.length} selected` : 'Any Location'}
                </Text>
                {draftLocations.length > 0 && (
                  <TouchableOpacity onPress={() => setDraftLocations([])}>
                    <Text style={styles.tabClearAction}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
              {filteredLocations.map((option) => {
                const isOptionAll = option === 'All MIDC Zones';
                const isSelected = isOptionAll ? isAll : draftLocations.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => toggleDraftLocation(option)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                      {option}
                    </Text>
                    <View style={[styles.checkBoxSquare, isSelected && styles.checkBoxSquareSelected]}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      }

      case 'JOB_TYPE':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_TYPES_LIST.map((option) => {
              const isSelected = draftJobType === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftJobType(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'WORK_MODE': {
        const isAll = draftWorkModes.length === 0;
        return (
          <View style={styles.tabContentWrapper}>
            <View style={styles.searchHeaderBox}>
              <View style={styles.tabStatusRow}>
                <Text style={styles.tabStatusText}>
                  {draftWorkModes.length > 0 ? `${draftWorkModes.length} selected` : 'Any Work Mode'}
                </Text>
                {draftWorkModes.length > 0 && (
                  <TouchableOpacity onPress={() => setDraftWorkModes([])}>
                    <Text style={styles.tabClearAction}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
              {filteredWorkModes.map((option) => {
                const isOptionAll = option === 'All Modes';
                const isSelected = isOptionAll ? isAll : draftWorkModes.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => toggleDraftWorkMode(option)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option}
                    </Text>
                    <View style={[styles.checkBoxSquare, isSelected && styles.checkBoxSquareSelected]}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      }

      case 'AMENITIES':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            <TouchableOpacity
              style={[styles.switchCardRow, draftBus && styles.switchCardRowActive]}
              onPress={() => setDraftBus(!draftBus)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, draftBus && styles.switchTitleActive]}>Free Bus Facility</Text>
                <Text style={styles.switchSub}>Company provided pick & drop transport</Text>
              </View>
              <Switch
                value={draftBus}
                onValueChange={setDraftBus}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={draftBus ? COLORS.primary : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchCardRow, draftCanteen && styles.switchCardRowActive]}
              onPress={() => setDraftCanteen(!draftCanteen)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, draftCanteen && styles.switchTitleActive]}>Free / Subsidized Canteen</Text>
                <Text style={styles.switchSub}>Tea, breakfast & nutritious meals</Text>
              </View>
              <Switch
                value={draftCanteen}
                onValueChange={setDraftCanteen}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={draftCanteen ? COLORS.primary : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchCardRow, draftAccommodation && styles.switchCardRowActive]}
              onPress={() => setDraftAccommodation(!draftAccommodation)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, draftAccommodation && styles.switchTitleActive]}>Accommodation / Hostel</Text>
                <Text style={styles.switchSub}>Company quarters or shared rooms</Text>
              </View>
              <Switch
                value={draftAccommodation}
                onValueChange={setDraftAccommodation}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={draftAccommodation ? COLORS.primary : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchCardRow, draftOvertime && styles.switchCardRowActive]}
              onPress={() => setDraftOvertime(!draftOvertime)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, draftOvertime && styles.switchTitleActive]}>Overtime (OT) Pay</Text>
                <Text style={styles.switchSub}>Extra double OT rate incentives</Text>
              </View>
              <Switch
                value={draftOvertime}
                onValueChange={setDraftOvertime}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={draftOvertime ? COLORS.primary : '#FFFFFF'}
              />
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter Vacancies</Text>
        </View>

        {/* Header Reset Icon Button */}
        <TouchableOpacity
          style={styles.headerResetBtn}
          onPress={handleResetFilters}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <RotateCcw size={17} color="#475569" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* Two-Column Master-Detail Layout */}
      <View style={styles.twoColumnContainer}>
        {/* Left Column: Category Tabs */}
        <View style={styles.leftTabsColumn}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
            {/* 1. Industry */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'INDUSTRY' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('INDUSTRY')}
              activeOpacity={0.8}
            >
              <Building2
                size={18}
                color={activeFilterTab === 'INDUSTRY' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'INDUSTRY' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'INDUSTRY' && styles.tabTitleActive]}>
                  Industry
                </Text>
                {draftIndustries.length > 0 ? (
                  <View style={styles.tabCountBadge}>
                    <Text style={styles.tabCountBadgeText}>{draftIndustries.length}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* 2. Education */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'EDUCATION' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('EDUCATION')}
              activeOpacity={0.8}
            >
              <GraduationCap
                size={18}
                color={activeFilterTab === 'EDUCATION' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'EDUCATION' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'EDUCATION' && styles.tabTitleActive]}>
                  Education
                </Text>
                {draftEducations.length > 0 ? (
                  <View style={styles.tabCountBadge}>
                    <Text style={styles.tabCountBadgeText}>{draftEducations.length}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* 3. Job Roles */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'JOB_ROLE' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('JOB_ROLE')}
              activeOpacity={0.8}
            >
              <Wrench
                size={18}
                color={activeFilterTab === 'JOB_ROLE' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'JOB_ROLE' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'JOB_ROLE' && styles.tabTitleActive]}>
                  Job Roles
                </Text>
                {draftJobRoles.length > 0 ? (
                  <View style={styles.tabCountBadge}>
                    <Text style={styles.tabCountBadgeText}>{draftJobRoles.length}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* 4. Experience */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'EXPERIENCE' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('EXPERIENCE')}
              activeOpacity={0.8}
            >
              <Briefcase
                size={18}
                color={activeFilterTab === 'EXPERIENCE' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'EXPERIENCE' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'EXPERIENCE' && styles.tabTitleActive]}>
                  Experience
                </Text>
                {draftExp !== 'All Experience' ? (
                  <View style={styles.tabCountBadge}>
                    <Text style={styles.tabCountBadgeText}>1</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* 5. Location / MIDC */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'LOCATION' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('LOCATION')}
              activeOpacity={0.8}
            >
              <MapPin
                size={18}
                color={activeFilterTab === 'LOCATION' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'LOCATION' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'LOCATION' && styles.tabTitleActive]}>
                  Location
                </Text>
                {draftLocations.length > 0 ? (
                  <View style={styles.tabCountBadge}>
                    <Text style={styles.tabCountBadgeText}>{draftLocations.length}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* 6. Job Type */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'JOB_TYPE' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('JOB_TYPE')}
              activeOpacity={0.8}
            >
              <Clock
                size={18}
                color={activeFilterTab === 'JOB_TYPE' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'JOB_TYPE' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'JOB_TYPE' && styles.tabTitleActive]}>
                  Job Type
                </Text>
                {draftJobType !== 'All Types' ? (
                  <View style={styles.tabCountBadge}>
                    <Text style={styles.tabCountBadgeText}>1</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* 7. Work Mode */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'WORK_MODE' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('WORK_MODE')}
              activeOpacity={0.8}
            >
              <SlidersHorizontal
                size={18}
                color={activeFilterTab === 'WORK_MODE' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'WORK_MODE' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'WORK_MODE' && styles.tabTitleActive]}>
                  Work Mode
                </Text>
                {draftWorkModes.length > 0 ? (
                  <View style={styles.tabCountBadge}>
                    <Text style={styles.tabCountBadgeText}>{draftWorkModes.length}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* 8. Amenities */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'AMENITIES' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('AMENITIES')}
              activeOpacity={0.8}
            >
              <Gift
                size={18}
                color={activeFilterTab === 'AMENITIES' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'AMENITIES' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'AMENITIES' && styles.tabTitleActive]}>
                  Perks
                </Text>
                {perksCount > 0 ? (
                  <View style={styles.tabCountBadge}>
                    <Text style={styles.tabCountBadgeText}>{perksCount}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Right Column: Dynamic Options List */}
        <View style={styles.rightOptionsColumn}>{renderTabContent()}</View>
      </View>

      {/* Screen Bottom Actions Footer */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleResetFilters}
          activeOpacity={0.7}
        >
          <RotateCcw size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.resetBtnText}>Reset All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApplyFilters}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>
            Show ({draftMatchingCount}) Jobs
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerResetBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoColumnContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftTabsColumn: {
    width: 120,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  tabsScrollContent: {
    paddingVertical: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    borderLeftColor: COLORS.primary,
  },
  tabTextGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  tabCountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  tabCountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rightOptionsColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContentWrapper: {
    flex: 1,
  },
  searchHeaderBox: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tabSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  tabSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  tabStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  tabStatusText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabClearAction: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  optionsListContainer: {
    padding: 12,
    gap: 8,
  },
  roleHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  roleHintText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  optionRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkBoxSquare: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkBoxSquareSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  switchCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  switchCardRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  switchTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    color: '#64748B',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  resetBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
