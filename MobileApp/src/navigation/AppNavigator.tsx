import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { EmployerLoginScreen } from '../screens/auth/EmployerLoginScreen';
import { EmployerSignupScreen } from '../screens/auth/EmployerSignupScreen';
import { VerifyOTPScreen } from '../screens/auth/VerifyOTPScreen';
import { JobApplicantsScreen } from '../screens/jobs/JobApplicantsScreen';
import { EmployerDashboardScreen } from '../screens/dashboard/EmployerDashboardScreen';
import { EmployerTabNavigator } from './EmployerTabNavigator';
import { CompanyProfileScreen } from '../screens/profile/CompanyProfileScreen';
import { SecuritySettingsScreen } from '../screens/profile/SecuritySettingsScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { CandidateTabNavigator } from './CandidateTabNavigator';
import { CandidateProfileScreen } from '../screens/candidate/CandidateProfileScreen';
import { CandidateResumeScreen } from '../screens/candidate/CandidateResumeScreen';
import { CandidateJobDetailScreen } from '../screens/candidate/CandidateJobDetailScreen';
import { CandidateApplyConfirmScreen } from '../screens/candidate/CandidateApplyConfirmScreen';

import { EmployerBannersScreen } from '../screens/advertisements/EmployerBannersScreen';

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
          <Stack.Screen name="CandidateJobDetail" component={CandidateJobDetailScreen} />
        </>
      ) : isCandidate ? (
        // Candidate / Employee App Stack (RBAC)
        <>
          <Stack.Screen name="CandidateMain" component={CandidateTabNavigator} />
          <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
          <Stack.Screen name="CandidateResume" component={CandidateResumeScreen} />
          <Stack.Screen name="CandidateJobDetail" component={CandidateJobDetailScreen} />
          <Stack.Screen name="CandidateApplyConfirm" component={CandidateApplyConfirmScreen} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
          <Stack.Screen name="AboutUs" component={AboutScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        </>
      ) : (
        // Employer App Stack (RBAC)
        <>
          <Stack.Screen name="EmployerMain" component={EmployerTabNavigator} />
          <Stack.Screen name="EmployerDashboard" component={EmployerDashboardScreen} />
          <Stack.Screen name="Dashboard" component={EmployerDashboardScreen} />
          <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
          <Stack.Screen name="EmployerBanners" component={EmployerBannersScreen} />
          <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
          <Stack.Screen name="CandidateJobDetail" component={CandidateJobDetailScreen} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
          <Stack.Screen name="AboutUs" component={AboutScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
