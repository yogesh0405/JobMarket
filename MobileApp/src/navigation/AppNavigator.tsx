import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { EmployerLoginScreen } from '../screens/auth/EmployerLoginScreen';
import { EmployerSignupScreen } from '../screens/auth/EmployerSignupScreen';
import { VerifyOTPScreen } from '../screens/auth/VerifyOTPScreen';
import { GoogleAuthScreen } from '../screens/auth/GoogleAuthScreen';
import { JobApplicantsScreen } from '../screens/jobs/JobApplicantsScreen';
import { ApplicantDetailScreen } from '../screens/jobs/ApplicantDetailScreen';
import { JobPostScreen } from '../screens/jobs/JobPostScreen';
import { EmployerTabNavigator } from './EmployerTabNavigator';
import { CompanyProfileScreen } from '../screens/profile/CompanyProfileScreen';
import { SecuritySettingsScreen } from '../screens/profile/SecuritySettingsScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { CandidateTabNavigator } from './CandidateTabNavigator';
import { CandidateProfileScreen } from '../screens/candidate/CandidateProfileScreen';
import { CandidateEditProfileScreen } from '../screens/candidate/CandidateEditProfileScreen';
import { CandidateResumeScreen } from '../screens/candidate/CandidateResumeScreen';
import { CandidateJobDetailScreen } from '../screens/candidate/CandidateJobDetailScreen';
import { CandidateApplyConfirmScreen } from '../screens/candidate/CandidateApplyConfirmScreen';
import { CandidateJobMapScreen } from '../screens/candidate/CandidateJobMapScreen';
import { CandidateJobMapViewScreen } from '../screens/candidate/CandidateJobMapViewScreen';
import { CandidateInterviewsScreen } from '../screens/candidate/CandidateInterviewsScreen';
import { CandidateSavedJobsScreen } from '../screens/candidate/CandidateSavedJobsScreen';
import { NotificationScreen } from '../screens/notifications/NotificationScreen';

import { EmployerBannersScreen } from '../screens/advertisements/EmployerBannersScreen';
import { CreateBannerScreen } from '../screens/advertisements/CreateBannerScreen';
import { EmployerInterviewsScreen } from '../screens/jobs/EmployerInterviewsScreen';
import { EmployerCandidateDetailScreen } from '../screens/candidates/EmployerCandidateDetailScreen';
import { CandidateFilterScreen } from '../screens/candidates/CandidateFilterScreen';
import { JobFilterScreen } from '../screens/jobs/JobFilterScreen';
import { CompanyFilterScreen } from '../screens/company/CompanyFilterScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const isCandidate = (user?.role || '').toLowerCase() === 'candidate';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack (Default for guest/login & public shared job link resolution)
        <>
          <Stack.Screen name="EmployerLogin" component={EmployerLoginScreen} />
          <Stack.Screen name="EmployerSignup" component={EmployerSignupScreen} />
          <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
          <Stack.Screen name="GoogleAuth" component={GoogleAuthScreen} />
          <Stack.Screen name="CandidateJobDetail" component={CandidateJobDetailScreen} />
          <Stack.Screen name="JobFilter" component={JobFilterScreen} />
          <Stack.Screen name="CompanyFilter" component={CompanyFilterScreen} />
        </>
      ) : isCandidate ? (
        // Candidate / Employee App Stack (RBAC)
        <>
          <Stack.Screen name="CandidateMain" component={CandidateTabNavigator} />
          <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
          <Stack.Screen name="CandidateEditProfile" component={CandidateEditProfileScreen} />
          <Stack.Screen name="EditProfile" component={CandidateEditProfileScreen} />
          <Stack.Screen name="CandidateResume" component={CandidateResumeScreen} />
          <Stack.Screen name="CandidateJobDetail" component={CandidateJobDetailScreen} />
          <Stack.Screen name="CandidateApplyConfirm" component={CandidateApplyConfirmScreen} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
          <Stack.Screen name="AboutUs" component={AboutScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="CandidateJobMap" component={CandidateJobMapScreen} />
          <Stack.Screen name="CandidateJobMapView" component={CandidateJobMapViewScreen} />
          <Stack.Screen name="CandidateMap" component={CandidateJobMapScreen} />
          <Stack.Screen name="CandidateSavedJobs" component={CandidateSavedJobsScreen} />
          <Stack.Screen name="SavedJobs" component={CandidateSavedJobsScreen} />
          <Stack.Screen name="CandidateSaved" component={CandidateSavedJobsScreen} />
          <Stack.Screen name="MyInterviews" component={CandidateInterviewsScreen} />
          <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
          <Stack.Screen name="JobFilter" component={JobFilterScreen} />
          <Stack.Screen name="CompanyFilter" component={CompanyFilterScreen} />
        </>
      ) : (
        // Employer App Stack (RBAC)
        <>
          <Stack.Screen name="EmployerMain" component={EmployerTabNavigator} />
          <Stack.Screen name="JobPost" component={JobPostScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PostJob" component={JobPostScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PostTab" component={JobPostScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmployerPostJob" component={JobPostScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
          <Stack.Screen name="EmployerInterviews" component={EmployerInterviewsScreen} />
          <Stack.Screen name="ScheduledInterviews" component={EmployerInterviewsScreen} />
          <Stack.Screen name="EmployerBanners" component={EmployerBannersScreen} />
          <Stack.Screen name="CreateBanner" component={CreateBannerScreen} />
          <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
          <Stack.Screen name="ApplicantDetail" component={ApplicantDetailScreen} />
          <Stack.Screen name="EmployerCandidateDetail" component={EmployerCandidateDetailScreen} />
          <Stack.Screen name="CandidateJobDetail" component={CandidateJobDetailScreen} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
          <Stack.Screen name="AboutUs" component={AboutScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="CandidateFilter" component={CandidateFilterScreen} />
          <Stack.Screen name="CompanyFilter" component={CompanyFilterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
