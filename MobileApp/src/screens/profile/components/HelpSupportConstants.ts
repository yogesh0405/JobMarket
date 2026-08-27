export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  fullName?: string;
  category: string;
  subject: string;
  description: string;
  attachment?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  rawCreatedAt?: string;
  updatedAt?: string;
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
    category: 'General',
    question: 'How do I manage my notifications?',
    answer: 'To manage notifications, go to "Settings," select "Notification Settings," and customize your alerts for new job postings, application status updates, and interview calls.',
  },
  {
    category: 'General',
    question: 'Is JobMarket free for job seekers?',
    answer: 'Yes, 100% free! Candidates can create profiles, build digital resumes, apply to verified employers, and attend interviews without any hidden fees.',
  },
  {
    category: 'General',
    question: 'Is my personal data safe and private?',
    answer: 'Yes. All personal contact information, resumes, and identification documents are encrypted with enterprise AES-256 standard and only shared with employers you apply to.',
  },
  {
    category: 'Account',
    question: 'How do I update my profile and trade details?',
    answer: 'Tap your profile in the top drawer menu and select "My Profile". You can edit your name, trade specializations, experience level, expected salary, and bio.',
  },
  {
    category: 'Account',
    question: 'How do I reset or change my account password?',
    answer: 'Navigate to "Security & Sessions" from the header drawer. You can update your password directly or verify via an email OTP code.',
  },
  {
    category: 'Job Search',
    question: 'How do I search for jobs in specific industrial areas?',
    answer: 'Use the Find Jobs search bar to filter by trade (e.g. CNC Operator, Welder, Electrician) or locality (e.g. Waluj MIDC, Shendra MIDC, Chhatrapati Sambhajinagar).',
  },
  {
    category: 'Job Search',
    question: 'How do I save a job to apply later?',
    answer: 'Tap the bookmark icon on any job card. Saved jobs appear immediately under "Saved Jobs" in your bottom navigation dock.',
  },
  {
    category: 'Applications',
    question: 'How do I track my submitted job applications?',
    answer: 'Open the "Applied" tab in your navigation dock. You will see live status badges from employers: Applied, Under Review, Shortlisted, and Scheduled Interviews.',
  },
  {
    category: 'Applications',
    question: 'Can I withdraw or edit a submitted job application?',
    answer: 'Once submitted, applications are delivered directly to the hiring employer. You can update your master resume profile anytime to ensure employers see your latest credentials.',
  },
  {
    category: 'Resume',
    question: 'How do I upload or update my PDF resume?',
    answer: 'Open the side drawer menu and tap "My Resume". You can upload a fresh PDF file, preview your formatted resume document, and download it with 1 tap.',
  },
  {
    category: 'Security',
    question: 'What should I do if I suspect a fraudulent job listing?',
    answer: 'All employers on JobMarket go through enterprise verification. If you ever encounter suspicious behavior, raise a support ticket immediately under the "Help & Contact" tab.',
  },
  {
    category: 'Technical',
    question: 'Why am I not receiving OTP or email notifications?',
    answer: 'OTP emails are dispatched via high-speed transactional servers. Please check your Spam/Junk folder and ensure your email address is spelled correctly in profile settings.',
  },
];
