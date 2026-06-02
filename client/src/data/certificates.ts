export type CertificateCategory = 'achievement' | 'subject' | 'exam' | 'community' | 'milestone';
export type CertificateTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Certificate {
  id: string;
  name: string;
  title: string;
  description: string;
  category: CertificateCategory;
  tier: CertificateTier;
  xpReward: number;
  icon: string;
  condition: string;
  color: string;
}

export const CERTIFICATES: Certificate[] = [
  // ACHIEVEMENT CERTIFICATES (10)
  {
    id: 'cert_001',
    name: 'Welcome Warrior',
    title: 'First Login',
    description: 'Congratulations on joining Cognitrium Hub! Your learning journey begins here.',
    category: 'achievement',
    tier: 'bronze',
    xpReward: 50,
    icon: '🎯',
    condition: 'Complete your first login',
    color: '#CD7F32'
  },
  {
    id: 'cert_002',
    name: 'Consistency Champion',
    title: '7-Day Streak',
    description: 'You have maintained a 7-day learning streak. Consistency is the key to success!',
    category: 'achievement',
    tier: 'silver',
    xpReward: 100,
    icon: '🔥',
    condition: 'Study for 7 consecutive days',
    color: '#C0C0C0'
  },
  {
    id: 'cert_003',
    name: 'Iron Discipline',
    title: '30-Day Streak',
    description: 'An impressive 30-day streak! Your dedication is unmatched.',
    category: 'achievement',
    tier: 'gold',
    xpReward: 200,
    icon: '⚡',
    condition: 'Study for 30 consecutive days',
    color: '#FFD700'
  },
  {
    id: 'cert_004',
    name: 'Century Scholar',
    title: '100-Day Streak',
    description: 'You have achieved a legendary 100-day streak. You are unstoppable!',
    category: 'achievement',
    tier: 'platinum',
    xpReward: 500,
    icon: '👑',
    condition: 'Study for 100 consecutive days',
    color: '#E5E4E2'
  },
  {
    id: 'cert_005',
    name: 'Test Taker',
    title: 'First Mock Test',
    description: 'You have attempted your first mock test. Great start!',
    category: 'achievement',
    tier: 'bronze',
    xpReward: 75,
    icon: '📝',
    condition: 'Attempt your first mock test',
    color: '#CD7F32'
  },
  {
    id: 'cert_006',
    name: 'Rising Star',
    title: 'Mock Test 70%+',
    description: 'You scored 70% or higher on a mock test. You are on the right track!',
    category: 'achievement',
    tier: 'silver',
    xpReward: 150,
    icon: '⭐',
    condition: 'Score 70% or higher on a mock test',
    color: '#C0C0C0'
  },
  {
    id: 'cert_007',
    name: 'Excellence Award',
    title: 'Mock Test 90%+',
    description: 'Exceptional performance! You scored 90% or higher on a mock test.',
    category: 'achievement',
    tier: 'gold',
    xpReward: 250,
    icon: '🏆',
    condition: 'Score 90% or higher on a mock test',
    color: '#FFD700'
  },
  {
    id: 'cert_008',
    name: 'Flawless Performer',
    title: 'Perfect Score (100%)',
    description: 'Outstanding! You achieved a perfect score of 100% on a mock test.',
    category: 'achievement',
    tier: 'platinum',
    xpReward: 400,
    icon: '💯',
    condition: 'Score 100% on a mock test',
    color: '#E5E4E2'
  },
  {
    id: 'cert_009',
    name: 'Resource Explorer',
    title: 'First PDF Downloaded',
    description: 'You have downloaded your first study resource. Keep learning!',
    category: 'achievement',
    tier: 'bronze',
    xpReward: 50,
    icon: '📚',
    condition: 'Download your first PDF resource',
    color: '#CD7F32'
  },
  {
    id: 'cert_010',
    name: 'Resource Hunter',
    title: '10 PDFs Downloaded',
    description: 'You have collected 10 study resources. You are well-prepared!',
    category: 'achievement',
    tier: 'silver',
    xpReward: 120,
    icon: '🎁',
    condition: 'Download 10 PDF resources',
    color: '#C0C0C0'
  },

  // SUBJECT MASTERY CERTIFICATES (10)
  {
    id: 'cert_011',
    name: 'Physics Champion',
    title: 'Physics Master',
    description: 'You have demonstrated exceptional mastery in Physics. Congratulations!',
    category: 'subject',
    tier: 'gold',
    xpReward: 200,
    icon: '⚛️',
    condition: 'Score 85%+ in Physics tests',
    color: '#FFD700'
  },
  {
    id: 'cert_012',
    name: 'Chemistry Champion',
    title: 'Chemistry Master',
    description: 'You have mastered the fundamentals of Chemistry. Well done!',
    category: 'subject',
    tier: 'gold',
    xpReward: 200,
    icon: '🧪',
    condition: 'Score 85%+ in Chemistry tests',
    color: '#FFD700'
  },
  {
    id: 'cert_013',
    name: 'Mathematics Champion',
    title: 'Mathematics Master',
    description: 'Your mathematical prowess is undeniable. Excellent work!',
    category: 'subject',
    tier: 'gold',
    xpReward: 200,
    icon: '🔢',
    condition: 'Score 85%+ in Mathematics tests',
    color: '#FFD700'
  },
  {
    id: 'cert_014',
    name: 'Biology Champion',
    title: 'Biology Master',
    description: 'You have achieved mastery in Biology. Outstanding performance!',
    category: 'subject',
    tier: 'gold',
    xpReward: 200,
    icon: '🧬',
    condition: 'Score 85%+ in Biology tests',
    color: '#FFD700'
  },
  {
    id: 'cert_015',
    name: 'English Proficiency',
    title: 'English Excellence',
    description: 'Your English language skills are exceptional. Great achievement!',
    category: 'subject',
    tier: 'silver',
    xpReward: 150,
    icon: '📖',
    condition: 'Score 80%+ in English tests',
    color: '#C0C0C0'
  },
  {
    id: 'cert_016',
    name: 'Social Science Expert',
    title: 'Social Science Excellence',
    description: 'You have excelled in Social Science. Impressive knowledge!',
    category: 'subject',
    tier: 'silver',
    xpReward: 150,
    icon: '🌍',
    condition: 'Score 80%+ in Social Science tests',
    color: '#C0C0C0'
  },
  {
    id: 'cert_017',
    name: 'JEE Math Specialist',
    title: 'JEE Mathematics Expert',
    description: 'You have specialized in JEE Mathematics. Excellent focus!',
    category: 'subject',
    tier: 'gold',
    xpReward: 250,
    icon: '📐',
    condition: 'Complete JEE Math module with 85%+ score',
    color: '#FFD700'
  },
  {
    id: 'cert_018',
    name: 'NEET Biology Specialist',
    title: 'NEET Biology Expert',
    description: 'You have specialized in NEET Biology. Outstanding dedication!',
    category: 'subject',
    tier: 'gold',
    xpReward: 250,
    icon: '🔬',
    condition: 'Complete NEET Biology module with 85%+ score',
    color: '#FFD700'
  },
  {
    id: 'cert_019',
    name: 'Organic Chemistry Master',
    title: 'Organic Chemistry Expert',
    description: 'You have mastered Organic Chemistry. Exceptional understanding!',
    category: 'subject',
    tier: 'platinum',
    xpReward: 300,
    icon: '⚗️',
    condition: 'Score 90%+ in Organic Chemistry',
    color: '#E5E4E2'
  },
  {
    id: 'cert_020',
    name: 'Mechanics Expert',
    title: 'Mechanics Mastery',
    description: 'You have achieved expertise in Mechanics. Brilliant work!',
    category: 'subject',
    tier: 'platinum',
    xpReward: 300,
    icon: '🎯',
    condition: 'Score 90%+ in Mechanics',
    color: '#E5E4E2'
  },

  // EXAM PREPARATION CERTIFICATES (10)
  {
    id: 'cert_021',
    name: 'JEE Aspirant',
    title: 'JEE Preparation',
    description: 'You have enrolled in JEE preparation. Your journey to success begins!',
    category: 'exam',
    tier: 'bronze',
    xpReward: 100,
    icon: '🎓',
    condition: 'Enroll in JEE track',
    color: '#CD7F32'
  },
  {
    id: 'cert_022',
    name: 'NEET Aspirant',
    title: 'NEET Preparation',
    description: 'You have enrolled in NEET preparation. Best of luck on your medical journey!',
    category: 'exam',
    tier: 'bronze',
    xpReward: 100,
    icon: '⚕️',
    condition: 'Enroll in NEET track',
    color: '#CD7F32'
  },
  {
    id: 'cert_023',
    name: 'CBSE Board Ready',
    title: 'CBSE Board Preparation',
    description: 'You have completed CBSE board preparation. You are ready!',
    category: 'exam',
    tier: 'silver',
    xpReward: 150,
    icon: '📋',
    condition: 'Complete CBSE board prep module',
    color: '#C0C0C0'
  },
  {
    id: 'cert_024',
    name: 'HSLC Ready',
    title: 'HSLC Board Preparation',
    description: 'You have completed HSLC board preparation. Best wishes for your exams!',
    category: 'exam',
    tier: 'silver',
    xpReward: 150,
    icon: '🎖️',
    condition: 'Complete HSLC board prep module',
    color: '#C0C0C0'
  },
  {
    id: 'cert_025',
    name: 'JEE Mock Marathon',
    title: 'JEE Mock Marathon',
    description: 'You have attempted 10+ JEE mock tests. Incredible dedication!',
    category: 'exam',
    tier: 'gold',
    xpReward: 250,
    icon: '🏃',
    condition: 'Attempt 10+ JEE mock tests',
    color: '#FFD700'
  },
  {
    id: 'cert_026',
    name: 'NEET Mock Marathon',
    title: 'NEET Mock Marathon',
    description: 'You have attempted 10+ NEET mock tests. Exceptional effort!',
    category: 'exam',
    tier: 'gold',
    xpReward: 250,
    icon: '🏥',
    condition: 'Attempt 10+ NEET mock tests',
    color: '#FFD700'
  },
  {
    id: 'cert_027',
    name: 'Board Exam Warrior',
    title: 'Board Exam Warrior',
    description: 'You have attempted 5+ board exam mock tests. You are battle-ready!',
    category: 'exam',
    tier: 'silver',
    xpReward: 180,
    icon: '⚔️',
    condition: 'Attempt 5+ board exam mocks',
    color: '#C0C0C0'
  },
  {
    id: 'cert_028',
    name: 'All-Rounder',
    title: 'Multi-Subject Expert',
    description: 'You have excelled in 3+ subjects. You are a true all-rounder!',
    category: 'exam',
    tier: 'gold',
    xpReward: 200,
    icon: '🌟',
    condition: 'Score 80%+ in 3+ different subjects',
    color: '#FFD700'
  },
  {
    id: 'cert_029',
    name: 'Speed Solver',
    title: 'Speed Solver',
    description: 'You completed a test in top 25% time. Lightning fast!',
    category: 'exam',
    tier: 'silver',
    xpReward: 120,
    icon: '⚡',
    condition: 'Complete test in top 25% time',
    color: '#C0C0C0'
  },
  {
    id: 'cert_030',
    name: 'Accuracy Ace',
    title: 'Accuracy Ace',
    description: 'You maintained 90%+ accuracy in your last 5 tests. Perfect precision!',
    category: 'exam',
    tier: 'platinum',
    xpReward: 300,
    icon: '🎯',
    condition: '90%+ accuracy in last 5 tests',
    color: '#E5E4E2'
  },

  // COMMUNITY ENGAGEMENT CERTIFICATES (10)
  {
    id: 'cert_031',
    name: 'Community Star',
    title: 'Community Star',
    description: 'You have been active in the community for 60+ days. You are a star!',
    category: 'community',
    tier: 'gold',
    xpReward: 200,
    icon: '⭐',
    condition: 'Active for 60+ days',
    color: '#FFD700'
  },
  {
    id: 'cert_032',
    name: 'Helpful Peer',
    title: 'Helpful Peer',
    description: 'You have answered 10+ questions. You are helping others succeed!',
    category: 'community',
    tier: 'silver',
    xpReward: 150,
    icon: '🤝',
    condition: 'Answer 10+ community questions',
    color: '#C0C0C0'
  },
  {
    id: 'cert_033',
    name: 'Top Contributor',
    title: 'Top Contributor of the Month',
    description: 'You are the top contributor this month. Outstanding contribution!',
    category: 'community',
    tier: 'platinum',
    xpReward: 350,
    icon: '🏅',
    condition: 'Be top contributor in a month',
    color: '#E5E4E2'
  },
  {
    id: 'cert_034',
    name: 'Referral Champion',
    title: 'Referral Champion',
    description: 'You have referred 5+ students. You are spreading knowledge!',
    category: 'community',
    tier: 'gold',
    xpReward: 200,
    icon: '📢',
    condition: 'Refer 5+ students',
    color: '#FFD700'
  },
  {
    id: 'cert_035',
    name: 'Motivator Badge',
    title: 'Motivator Badge',
    description: 'You have shared motivational content. Keep inspiring others!',
    category: 'community',
    tier: 'silver',
    xpReward: 100,
    icon: '💪',
    condition: 'Share motivational content',
    color: '#C0C0C0'
  },
  {
    id: 'cert_036',
    name: 'Discussion Leader',
    title: 'Discussion Leader',
    description: 'You have started 5+ study discussions. You are a thought leader!',
    category: 'community',
    tier: 'gold',
    xpReward: 180,
    icon: '💬',
    condition: 'Start 5+ study discussions',
    color: '#FFD700'
  },
  {
    id: 'cert_037',
    name: 'Feedback Champion',
    title: 'Feedback Champion',
    description: 'You have submitted 5+ feedback forms. Your input matters!',
    category: 'community',
    tier: 'silver',
    xpReward: 120,
    icon: '📝',
    condition: 'Submit 5+ feedback forms',
    color: '#C0C0C0'
  },
  {
    id: 'cert_038',
    name: 'Event Participant',
    title: 'Event Participant',
    description: 'You have attended a live session/webinar. Great engagement!',
    category: 'community',
    tier: 'bronze',
    xpReward: 75,
    icon: '🎤',
    condition: 'Attend a live session',
    color: '#CD7F32'
  },
  {
    id: 'cert_039',
    name: 'Webinar Host',
    title: 'Webinar Host Volunteer',
    description: 'You have hosted a webinar. You are a community leader!',
    category: 'community',
    tier: 'platinum',
    xpReward: 300,
    icon: '🎙️',
    condition: 'Host a webinar',
    color: '#E5E4E2'
  },
  {
    id: 'cert_040',
    name: 'Mission Ambassador',
    title: 'Mission Ambassador',
    description: 'You have promoted Cognitrium Hub externally. You are an ambassador!',
    category: 'community',
    tier: 'platinum',
    xpReward: 250,
    icon: '🌐',
    condition: 'Promote community externally',
    color: '#E5E4E2'
  },

  // MILESTONE CERTIFICATES (10)
  {
    id: 'cert_041',
    name: 'Beginner Graduate',
    title: 'Beginner Graduate',
    description: 'You have completed the beginner study plan. Well done!',
    category: 'milestone',
    tier: 'silver',
    xpReward: 150,
    icon: '🎓',
    condition: 'Complete beginner study plan',
    color: '#C0C0C0'
  },
  {
    id: 'cert_042',
    name: 'Intermediate Scholar',
    title: 'Intermediate Scholar',
    description: 'You have completed the intermediate study plan. Impressive progress!',
    category: 'milestone',
    tier: 'gold',
    xpReward: 220,
    icon: '📚',
    condition: 'Complete intermediate study plan',
    color: '#FFD700'
  },
  {
    id: 'cert_043',
    name: 'Advanced Achiever',
    title: 'Advanced Achiever',
    description: 'You have completed the advanced study plan. Exceptional dedication!',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 350,
    icon: '🚀',
    condition: 'Complete advanced study plan',
    color: '#E5E4E2'
  },
  {
    id: 'cert_044',
    name: 'Chapter Completer',
    title: 'Chapter Completer',
    description: 'You have finished an entire chapter. One step closer to mastery!',
    category: 'milestone',
    tier: 'bronze',
    xpReward: 80,
    icon: '✅',
    condition: 'Complete an entire chapter',
    color: '#CD7F32'
  },
  {
    id: 'cert_045',
    name: 'Unit Completer',
    title: 'Unit Completer',
    description: 'You have finished an entire unit. Great milestone achieved!',
    category: 'milestone',
    tier: 'silver',
    xpReward: 140,
    icon: '🎯',
    condition: 'Complete an entire unit',
    color: '#C0C0C0'
  },
  {
    id: 'cert_046',
    name: 'JEE Physics Finisher',
    title: 'JEE Physics Syllabus Finisher',
    description: 'You have completed the entire JEE Physics syllabus. Outstanding!',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 400,
    icon: '⚛️',
    condition: 'Complete JEE Physics syllabus',
    color: '#E5E4E2'
  },
  {
    id: 'cert_047',
    name: 'JEE Chemistry Finisher',
    title: 'JEE Chemistry Syllabus Finisher',
    description: 'You have completed the entire JEE Chemistry syllabus. Excellent!',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 400,
    icon: '🧪',
    condition: 'Complete JEE Chemistry syllabus',
    color: '#E5E4E2'
  },
  {
    id: 'cert_048',
    name: 'JEE Math Finisher',
    title: 'JEE Mathematics Syllabus Finisher',
    description: 'You have completed the entire JEE Mathematics syllabus. Brilliant!',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 400,
    icon: '🔢',
    condition: 'Complete JEE Math syllabus',
    color: '#E5E4E2'
  },
  {
    id: 'cert_049',
    name: 'NEET Biology Finisher',
    title: 'NEET Biology Syllabus Finisher',
    description: 'You have completed the entire NEET Biology syllabus. Amazing!',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 400,
    icon: '🧬',
    condition: 'Complete NEET Biology syllabus',
    color: '#E5E4E2'
  },
  {
    id: 'cert_050',
    name: 'Grand Scholar',
    title: 'Grand Scholar',
    description: 'You have earned 10+ certificates. You are a true grand scholar!',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 500,
    icon: '👑',
    condition: 'Earn 10+ certificates',
    color: '#E5E4E2'
  }
];

export const CATEGORY_LABELS: Record<CertificateCategory, string> = {
  achievement: '🏆 Achievement Certificates',
  subject: '📚 Subject Mastery',
  exam: '🎯 Exam Preparation',
  community: '🌟 Community Engagement',
  milestone: '🚀 Milestones'
};

export const getCertificatesByCategory = (category: CertificateCategory) => {
  return CERTIFICATES.filter(cert => cert.category === category);
};

export const generateCertificateId = () => {
  const prefix = 'MA';
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};
