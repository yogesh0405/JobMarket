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
  const [draftIndustry, setDraftIndustry] = useState<string>(currentFilters.industry || 'All Industries');
  const [draftEducation, setDraftEducation] = useState<string>(currentFilters.education || 'All Education Levels');
  const [draftExp, setDraftExp] = useState<string>(currentFilters.minExperience || 'All Experience');
  const [draftZone, setDraftZone] = useState<string>(currentFilters.midcZone || 'All MIDC Zones');
  const [draftJobType, setDraftJobType] = useState<string>(currentFilters.jobType || 'All Types');
  const [draftWorkMode, setDraftWorkMode] = useState<string>(currentFilters.workMode || 'All Modes');
  const [draftBus, setDraftBus] = useState<boolean>(Boolean(currentFilters.busFacility));
  const [draftCanteen, setDraftCanteen] = useState<boolean>(Boolean(currentFilters.canteen));
  const [draftAccommodation, setDraftAccommodation] = useState<boolean>(Boolean(currentFilters.accommodation));
  const [draftOvertime, setDraftOvertime] = useState<boolean>(Boolean(currentFilters.overtime));
  const [draftJobRole, setDraftJobRole] = useState<string>(currentFilters.jobRole || 'All Roles');

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

  // Dynamically compute available job roles based on selected Industry + dynamically discovered from loaded jobs
  const availableJobRoles = useMemo(() => {
    const baseRoles = INDUSTRY_JOB_ROLES[draftIndustry] || INDUSTRY_JOB_ROLES['All Industries'] || [];
    const customRoles = new Set<string>();

    if (loadedJobs && loadedJobs.length > 0) {
      loadedJobs.forEach((job) => {
        const jobInd = (job.industry || '').toLowerCase();
        const targetInd = (draftIndustry || '').toLowerCase();
        const matchesIndustry =
          !draftIndustry ||
          draftIndustry === 'All Industries' ||
          jobInd.includes(targetInd.slice(0, 5)) ||
          targetInd.includes(jobInd.slice(0, 5));

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
    baseRoles.forEach((role) => {
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
  }, [draftIndustry, loadedJobs]);

  // Auto-reset job role when industry changes and current role is not in new list
  const prevIndustryRef = React.useRef(draftIndustry);
  React.useEffect(() => {
    if (prevIndustryRef.current !== draftIndustry) {
      prevIndustryRef.current = draftIndustry;
      if (!availableJobRoles.includes(draftJobRole)) {
        setDraftJobRole('All Roles');
      }
    }
  }, [draftIndustry, availableJobRoles, draftJobRole]);

  const handleResetFilters = () => {
    setDraftIndustry('All Industries');
    setDraftEducation('All Education Levels');
    setDraftJobRole('All Roles');
    setDraftExp('All Experience');
    setDraftZone('All MIDC Zones');
    setDraftJobType('All Types');
    setDraftWorkMode('All Modes');
    setDraftBus(false);
    setDraftCanteen(false);
    setDraftAccommodation(false);
    setDraftOvertime(false);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (draftIndustry && draftIndustry !== 'All Industries') count++;
    if (draftEducation && draftEducation !== 'All Education Levels') count++;
    if (draftJobRole && draftJobRole !== 'All Roles') count++;
    if (draftExp && draftExp !== 'All Experience') count++;
    if (draftZone && draftZone !== 'All MIDC Zones') count++;
    if (draftJobType && draftJobType !== 'All Types') count++;
    if (draftWorkMode && draftWorkMode !== 'All Modes') count++;
    if (draftBus) count++;
    if (draftCanteen) count++;
    if (draftAccommodation) count++;
    if (draftOvertime) count++;
    return count;
  }, [
    draftIndustry,
    draftEducation,
    draftJobRole,
    draftExp,
    draftZone,
    draftJobType,
    draftWorkMode,
    draftBus,
    draftCanteen,
    draftAccommodation,
    draftOvertime,
  ]);

  // Real-time matching jobs calculation using unified industry-grade engine
  const draftMatchingCount = useMemo(() => {
    const listToFilter = loadedJobs.length > 0 ? loadedJobs : initialJobsList;
    if (!listToFilter || listToFilter.length === 0) {
      return route.params?.totalMatchingJobsCount ?? 0;
    }

    const draftFilters: FilterOptions = {
      industry: draftIndustry,
      education: draftEducation,
      jobRole: draftJobRole !== 'All Roles' ? draftJobRole : undefined,
      minExperience: draftExp,
      midcZone: draftZone,
      jobType: draftJobType,
      workMode: draftWorkMode,
      salaryMin: currentFilters.salaryMin || 0,
      busFacility: draftBus,
      canteen: draftCanteen,
      accommodation: draftAccommodation,
      overtime: draftOvertime,
    };

    return listToFilter.filter((job) => evaluateJobMatchesFilter(job, draftFilters)).length;
  }, [
    loadedJobs,
    initialJobsList,
    draftIndustry,
    draftEducation,
    draftJobRole,
    draftExp,
    draftZone,
    draftJobType,
    draftWorkMode,
    draftBus,
    draftCanteen,
    draftAccommodation,
    draftOvertime,
    route.params?.totalMatchingJobsCount,
  ]);

  const handleApplyFilters = () => {
    const applied: FilterOptions = {
      industry: draftIndustry,
      education: draftEducation,
      jobRole: draftJobRole !== 'All Roles' ? draftJobRole : undefined,
      minExperience: draftExp,
      midcZone: draftZone,
      jobType: draftJobType,
      workMode: draftWorkMode,
      salaryMin: currentFilters.salaryMin || 0,
      busFacility: draftBus,
      canteen: draftCanteen,
      accommodation: draftAccommodation,
      overtime: draftOvertime,
    };

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
      case 'INDUSTRY':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {displayedIndustries.map((option) => {
              const isSelected = draftIndustry === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftIndustry(option)}
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

      case 'EDUCATION':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_EDUCATIONS.map((option) => {
              const isSelected = draftEducation === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftEducation(option)}
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

      case 'JOB_ROLE':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {draftIndustry !== 'All Industries' && (
              <View style={styles.roleHintRow}>
                <Building2 size={13} color="#64748B" strokeWidth={1.8} />
                <Text style={styles.roleHintText}>
                  Roles for: {draftIndustry.split('&')[0].trim()}
                </Text>
              </View>
            )}
            {availableJobRoles.map((option) => {
              const isSelected = draftJobRole === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftJobRole(option)}
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

      case 'LOCATION':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_MIDC_ZONES.map((option) => {
              const isSelected = draftZone === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftZone(option)}
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

      case 'WORK_MODE':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_WORK_MODES.map((option) => {
              const isSelected = draftWorkMode === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftWorkMode(option)}
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
                {draftIndustry !== 'All Industries' && (
                  <View style={styles.tabActiveDot} />
                )}
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
                {draftEducation !== 'All Education Levels' && (
                  <View style={styles.tabActiveDot} />
                )}
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
                {draftJobRole !== 'All Roles' && (
                  <View style={styles.tabActiveDot} />
                )}
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
                {draftExp !== 'All Experience' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 4. Location / MIDC */}
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
                {draftZone !== 'All MIDC Zones' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 5. Job Type */}
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
                {draftJobType !== 'All Types' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 6. Work Mode */}
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
                {draftWorkMode !== 'All Modes' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 7. Amenities */}
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
                {(draftBus || draftCanteen || draftAccommodation || draftOvertime) && (
                  <View style={styles.tabActiveDot} />
                )}
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
  rightOptionsColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
