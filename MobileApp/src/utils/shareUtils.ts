import { Share, Platform } from 'react-native';

/**
 * Returns the Canonical Live Web Frontend Base URL.
 * Automatically respects EXPO_PUBLIC_WEB_URL if configured,
 * or defaults to the official live production domain without hardcoding.
 */
export const getLiveWebUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_WEB_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'https://job-market-wine.vercel.app';
};

export interface ShareJobParams {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export const shareJob = async (params: ShareJobParams): Promise<boolean> => {
  try {
    const baseUrl = getLiveWebUrl();
    const jobUrl = `${baseUrl}/job/${encodeURIComponent(params.id)}`;
    const titleStr = params.title
      ? `${params.title}${params.company ? ` - ${params.company}` : ''}`
      : 'Job Opening on JobMarket';
    const locationStr = params.location || 'MIDC Industrial Zone';

    let salStr = 'Competitive Salary';
    if (params.salaryMin && params.salaryMax) {
      salStr = `₹${Math.round(params.salaryMin / 1000)}k - ₹${Math.round(params.salaryMax / 1000)}k / month`;
    } else if (params.salaryMin) {
      salStr = `₹${Math.round(params.salaryMin / 1000)}k+ / month`;
    }

    const shareMsg = `🔥 Industrial Job Opening!\n\n📋 Role: ${params.title || 'Technical Specialist'}\n🏢 Company: ${params.company || 'Industrial Company'}\n📍 Location: ${locationStr}\n💰 Salary: ${salStr}\n\n👉 View & Apply:\n${jobUrl}`;

    if (Platform.OS === 'ios') {
      await Share.share({ title: titleStr, message: shareMsg, url: jobUrl });
    } else {
      await Share.share({ title: titleStr, message: shareMsg }, { dialogTitle: titleStr });
    }
    return true;
  } catch (err: any) {
    if (err && err.name === 'AbortError') return false;
    console.warn('Share error:', err);
    return false;
  }
};

export interface ShareCompanyParams {
  id: string;
  name?: string;
  industry?: string;
  location?: string;
}

export const shareCompany = async (params: ShareCompanyParams): Promise<boolean> => {
  try {
    const baseUrl = getLiveWebUrl();
    const companyUrl = `${baseUrl}/company/${encodeURIComponent(params.id)}`;
    const companyName = params.name || 'Company Profile';
    const shareMsg = `🏢 ${companyName}\n\nExplore plant profile, active industrial vacancies, and direct recruiter contacts on JobMarket.\n\n👉 View Company Details:\n${companyUrl}`;

    if (Platform.OS === 'ios') {
      await Share.share({ title: `${companyName} - JobMarket`, message: shareMsg, url: companyUrl });
    } else {
      await Share.share({ title: `${companyName} - JobMarket`, message: shareMsg }, { dialogTitle: `${companyName} Profile` });
    }
    return true;
  } catch (err: any) {
    if (err && err.name === 'AbortError') return false;
    console.warn('Share error:', err);
    return false;
  }
};

export interface ShareCandidateParams {
  id: string;
  name?: string;
  trade?: string;
  location?: string;
}

export const shareCandidate = async (params: ShareCandidateParams): Promise<boolean> => {
  try {
    const baseUrl = getLiveWebUrl();
    const profileUrl = `${baseUrl}/profile/${encodeURIComponent(params.id)}`;
    const candidateName = params.name || 'Candidate Profile';
    const tradeStr = params.trade || 'Industrial Specialist';

    const shareMsg = `👤 ${candidateName} — ${tradeStr}\n\nCheck out verified technical qualifications, trade experience, and bio-data on JobMarket.\n\n👉 View Profile:\n${profileUrl}`;

    if (Platform.OS === 'ios') {
      await Share.share({ title: `${candidateName} - JobMarket Profile`, message: shareMsg, url: profileUrl });
    } else {
      await Share.share({ title: `${candidateName} - JobMarket Profile`, message: shareMsg }, { dialogTitle: `${candidateName} Profile` });
    }
    return true;
  } catch (err: any) {
    if (err && err.name === 'AbortError') return false;
    console.warn('Share error:', err);
    return false;
  }
};
