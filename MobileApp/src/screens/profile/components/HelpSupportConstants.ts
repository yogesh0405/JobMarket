export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  text: string;
  attachment?: string;
  createdAt: string;
}

export const FAQ_DATA = [
  {
    category: 'Job Search',
    question: 'How do I search for jobs in my local MIDC area?',
    answer: 'Use the Find Jobs search bar to type trade names (e.g. VMC Operator, Welder, Fitter) or locality (e.g. Waluj MIDC, Chhatrapati Sambhajinagar). You can filter by job type, experience, and shift details.',
  },
  {
    category: 'Saved Jobs',
    question: 'How do I save a job to view or apply later?',
    answer: 'Tap the blue bookmark icon on any job card. Saved jobs appear instantly under "Saved Jobs" in your bottom tab and side menu.',
  },
  {
    category: 'Applications',
    question: 'How do I track my submitted job applications?',
    answer: 'Navigate to "Applied" in your bottom navigation bar. You can view real-time application status updates from employers (e.g. Applied, Under Review, Shortlisted, Interview Scheduled).',
  },
  {
    category: 'Resume & Profile',
    question: 'How do I upload or update my resume document?',
    answer: 'Open the menu drawer and tap "My Resume". You can upload your latest PDF resume, update skills, trade certification, and contact information.',
  },
  {
    category: 'Account',
    question: 'How do I update my profile details?',
    answer: 'Go to your side menu drawer and tap "My Profile" to update your full name, trade sector, location, phone number, and bio data.',
  },
  {
    category: 'Account',
    question: 'How can I reset my account password?',
    answer: 'Navigate to "Security & Sessions" from the header drawer menu. You can update your current password or request a 6-digit OTP verification code sent directly to your registered email address.',
  },
  {
    category: 'Job Posting',
    question: 'How long does job post approval take?',
    answer: 'Once an employer publishes a job post, it enters the admin review queue under the "Pending" tab. Verification typically takes less than 2 hours, after which the status automatically changes to "Active".',
  },
  {
    category: 'Technical',
    question: 'Why am I not receiving OTP emails?',
    answer: 'OTP emails are dispatched via Brevo transactional servers. Please check your Spam/Junk folder and ensure your registered email address is correctly spelled.',
  },
];
