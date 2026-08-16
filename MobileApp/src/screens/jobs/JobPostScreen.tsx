import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Check, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { COLORS } from '../../constants/theme';
import {
  INDUSTRY_LIST,
} from './components/JobPostConstants';
import { JobPostStep1Basic } from './components/JobPostStep1Basic';
import { JobPostStep2Location } from './components/JobPostStep2Location';
import { JobPostStep3WorkPay } from './components/JobPostStep3WorkPay';
import { JobPostStep4Eligibility } from './components/JobPostStep4Eligibility';
import { useJobPostForm } from './hooks/useJobPostForm';

interface Props {
  navigation: any;
  route: any;
}

export const JobPostScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const form = useJobPostForm(navigation, route);

  // Intercept back navigation & show user confirmation modal dialog
  useEffect(() => {
    if (!navigation || typeof navigation.addListener !== 'function') return;

    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Allow navigation if form was successfully submitted
      if (form.isSubmittedRef && form.isSubmittedRef.current) {
        return;
      }

      // Prevent default exit action
      e.preventDefault();

      // Prompt confirmation alert dialog
      Alert.alert(
        'Discard Job Post Draft?',
        'Are you sure you want to go back? Any unsubmitted job details will be lost.',
        [
          { text: 'Stay & Continue', style: 'cancel', onPress: () => {} },
          {
            text: 'Discard & Exit',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, form.isSubmittedRef]);

  const STEPS = [
    { id: 1, title: 'Basic Details' },
    { id: 2, title: 'Location' },
    { id: 3, title: 'Work & Pay' },
    { id: 4, title: 'Role & Skills' },
  ];

  const ITI_TRADES_LIST = [
    'Fitter',
    'Turner',
    'Machinist',
    'Electrician',
    'Welder (MIG/TIG/ARC)',
    'VMC/CNC Operator',
    'Quality Inspector',
    'Tool & Die Maker',
    'Other ITI Trade...',
  ];

  const MIDC_LIST = [
    'Waluj MIDC (Chhatrapati Sambhajinagar)',
    'Chakan MIDC (Pune)',
    'Bhosari MIDC (Pune)',
    'Taloja MIDC (Navi Mumbai)',
    'Ranjangaon MIDC (Pune)',
    'Butibori MIDC (Nagpur)',
    'Other MIDC Zone...',
  ];

  const handleNextStep = () => {
    form.setError(null);
    if (form.currentStep === 1) {
      const activeInd = form.industry === 'Other' ? form.customIndustry.trim() : form.industry.trim();
      const activeRole = form.title === 'Other' ? form.customTitle.trim() : form.title.trim();
      if (!activeInd) {
        form.setError('Please select or specify an Industry Sector.');
        return;
      }
      if (!activeRole) {
        form.setError('Please select or specify a Job Role.');
        return;
      }
      if (!form.openingsInput || parseInt(form.openingsInput, 10) < 1) {
        form.setError('Please enter a valid number of vacancies (minimum 1).');
        return;
      }
      form.setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (form.currentStep === 2) {
      if (!form.location.trim()) {
        form.setError('Please enter a City Location / Factory Address.');
        return;
      }
      form.setCurrentStep(3);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (form.currentStep === 3) {
      form.setCurrentStep(4);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePrevStep = () => {
    form.setError(null);
    if (form.currentStep > 1) {
      form.setCurrentStep(form.currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  return (
    <View style={[styles.container, { paddingTop: topInset + (Platform.OS === 'android' ? 6 : 4) }]}>
      {/* Stepper Header Bar */}
      <View style={styles.stepperHeaderCard}>
        <View style={styles.stepTrack}>
          {STEPS.map((step, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = form.currentStep > stepNumber;
            const isActive = form.currentStep === stepNumber;
            const isLast = idx === STEPS.length - 1;

            return (
              <React.Fragment key={step.id}>
                <TouchableOpacity
                  style={styles.stepNodeCol}
                  activeOpacity={0.7}
                  disabled={stepNumber > form.currentStep}
                  onPress={() => {
                    if (stepNumber < form.currentStep) {
                      form.setCurrentStep(stepNumber);
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }
                  }}
                >
                  <View style={[styles.stepCircle, isCompleted && styles.stepCircleCompleted, isActive && styles.stepCircleActive]}>
                    {isCompleted ? (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Text style={[styles.stepCircleText, isActive && styles.stepCircleTextActive]}>{stepNumber}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepNodeTitle, isActive && styles.stepNodeTitleActive]} numberOfLines={1}>
                    {step.title}
                  </Text>
                </TouchableOpacity>

                {!isLast && (
                  <View style={styles.connectorTrack}>
                    <View style={[styles.connectorLine, form.currentStep > stepNumber && styles.connectorLineActive]} />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {form.error ? <ErrorBanner message={form.error} /> : null}

        {form.currentStep === 1 ? (
          <JobPostStep1Basic
            companyLogo={form.companyLogo}
            onPickLogo={form.handlePickLogo}
            industry={form.industry}
            customIndustry={form.customIndustry}
            setCustomIndustry={form.setCustomIndustry}
            title={form.title}
            customTitle={form.customTitle}
            setCustomTitle={form.setCustomTitle}
            setTitle={form.setTitle}
            currentRoleOptions={form.currentRoleOptions}
            onIndustryChange={form.handleIndustryChange}
            openingsInput={form.openingsInput}
            setOpeningsInput={form.setOpeningsInput}
            targetIti={form.targetIti}
            setTargetIti={form.setTargetIti}
            itiTrade={form.itiTrade}
            setItiTrade={form.setItiTrade}
            itiTradesList={ITI_TRADES_LIST}
            isMidcLocation={form.isMidcLocation}
            setIsMidcLocation={form.setIsMidcLocation}
            midcZone={form.midcZone}
            setMidcZone={form.setMidcZone}
            midcList={MIDC_LIST}
          />
        ) : null}

        {form.currentStep === 2 ? (
          <JobPostStep2Location
            location={form.location}
            setLocation={form.setLocation}
            googleMapsUrl={form.googleMapsUrl}
            setGoogleMapsUrl={form.setGoogleMapsUrl}
            autoResolveMsg={form.autoResolveMsg}
            resolvingMap={form.resolvingMap}
            onResolveMapUrl={form.handleResolveMapUrl}
            latitude={form.latitude}
            longitude={form.longitude}
            resolvedAddress={form.resolvedAddress}
          />
        ) : null}

        {form.currentStep === 3 ? (
          <JobPostStep3WorkPay
            experienceRequired={form.experienceRequired}
            setExperienceRequired={form.setExperienceRequired}
            minExperience={form.minExperience}
            setMinExperience={form.setMinExperience}
            maxExperience={form.maxExperience}
            setMaxExperience={form.setMaxExperience}
            discloseSalary={form.discloseSalary}
            setDiscloseSalary={form.setDiscloseSalary}
            salaryMin={form.salaryMin}
            setSalaryMin={form.setSalaryMin}
            salaryMax={form.salaryMax}
            setSalaryMax={form.setSalaryMax}
            workMode={form.workMode}
            setWorkMode={form.setWorkMode}
            workType={form.workType}
            setWorkType={form.setWorkType}
            shiftCategory={form.shiftCategory}
            setShiftCategory={form.setShiftCategory}
            overtime={form.overtime}
            setOvertime={form.setOvertime}
            canteen={form.canteen}
            setCanteen={form.setCanteen}
            busFacility={form.busFacility}
            setBusFacility={form.setBusFacility}
            accommodation={form.accommodation}
            setAccommodation={form.setAccommodation}
            pf={form.pf}
            setPf={form.setPf}
            esic={form.esic}
            setEsic={form.setEsic}
            uniform={form.uniform}
            setUniform={form.setUniform}
            medicalInsurance={form.medicalInsurance}
            setMedicalInsurance={form.setMedicalInsurance}
          />
        ) : null}

        {form.currentStep === 4 ? (
          <JobPostStep4Eligibility
            genderPreference={form.genderPreference}
            setGenderPreference={form.setGenderPreference}
            minAgeInput={form.minAgeInput}
            setMinAgeInput={form.setMinAgeInput}
            maxAgeInput={form.maxAgeInput}
            setMaxAgeInput={form.setMaxAgeInput}
            hiringMethod={form.hiringMethod}
            setHiringMethod={form.setHiringMethod}
            walkInDate={form.walkInDate}
            setWalkInDate={form.setWalkInDate}
            walkInStartTime={form.walkInStartTime}
            setWalkInStartTime={form.setWalkInStartTime}
            walkInEndTime={form.walkInEndTime}
            setWalkInEndTime={form.setWalkInEndTime}
            interviewAddress={form.interviewAddress}
            setInterviewAddress={form.setInterviewAddress}
            walkInContactPerson={form.walkInContactPerson}
            setWalkInContactPerson={form.setWalkInContactPerson}
            walkInContactNumber={form.walkInContactNumber}
            setWalkInContactNumber={form.setWalkInContactNumber}
            applicationDeadline={form.applicationDeadline}
            setApplicationDeadline={form.setApplicationDeadline}
            maxApplicantsInput={form.maxApplicantsInput}
            setMaxApplicantsInput={form.setMaxApplicantsInput}
            description={form.description}
            setDescription={form.setDescription}
            showResponsibilities={form.showResponsibilities}
            setShowResponsibilities={form.setShowResponsibilities}
            responsibilities={form.responsibilities}
            setResponsibilities={form.setResponsibilities}
            showRequirements={form.showRequirements}
            setShowRequirements={form.setShowRequirements}
            requirements={form.requirements}
            setRequirements={form.setRequirements}
            skillsTags={form.skillsTags}
            customSkillInput={form.customSkillInput}
            setCustomSkillInput={form.setCustomSkillInput}
            onAddCustomSkill={form.handleAddCustomSkill}
            onToggleSkill={form.handleToggleSkill}
            availableSkills={form.availableSkills}
          />
        ) : null}
      </KeyboardAwareScrollView>

      {/* Fixed Sticky Action Bar at Bottom */}
      <View style={[styles.submitContainer, { paddingBottom: Math.max(insets.bottom + 10, 24) }]}>
        {form.currentStep === 1 ? (
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.prevBtn} activeOpacity={0.85} onPress={handlePrevStep}>
            <ArrowLeft size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.prevBtnText}>Back</Text>
          </TouchableOpacity>
        )}

        {form.currentStep < 4 ? (
          <TouchableOpacity style={styles.nextBtn} activeOpacity={0.85} onPress={handleNextStep}>
            <Text style={styles.nextBtnText}>Next Step</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, form.loading && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            disabled={form.loading}
            onPress={form.handleSubmitJob}
          >
            <Text style={styles.submitBtnText}>{form.loading ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  stepperHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepNodeCol: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  stepCircleCompleted: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stepCircleTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepNodeTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  stepNodeTitleActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  connectorTrack: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: -12,
    marginHorizontal: -4,
  },
  connectorLine: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  connectorLineActive: {
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  submitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  prevBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  prevBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  nextBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  nextBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  submitBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
