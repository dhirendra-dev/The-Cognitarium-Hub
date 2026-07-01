import { Award, CheckCircle, Target, Zap, BookOpen, Users, Brain, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Certificate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirements: string[];
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CERTIFICATES: Certificate[] = [
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete 5 study sessions in a single day',
    icon: <Zap className="w-8 h-8" />,
    requirements: [
      'Complete 5 study sessions',
      'All sessions in one day',
      'Minimum 30 minutes per session'
    ],
    color: 'from-yellow-400 to-orange-500',
    difficulty: 'Beginner'
  },
  {
    id: 'consistency-champion',
    name: 'Consistency Champion',
    description: 'Maintain a 30-day study streak',
    icon: <Trophy className="w-8 h-8" />,
    requirements: [
      'Study for 30 consecutive days',
      'Minimum 1 hour per day',
      'No days missed'
    ],
    color: 'from-purple-400 to-pink-500',
    difficulty: 'Intermediate'
  },
  {
    id: 'concept-master',
    name: 'Concept Master',
    description: 'Complete all topics in a subject',
    icon: <Brain className="w-8 h-8" />,
    requirements: [
      'Complete all chapters',
      'Score 80%+ on all topics',
      'Pass all quizzes'
    ],
    color: 'from-blue-400 to-cyan-500',
    difficulty: 'Advanced'
  },
  {
    id: 'community-contributor',
    name: 'Community Contributor',
    description: 'Help 10 students by answering questions',
    icon: <Users className="w-8 h-8" />,
    requirements: [
      'Answer 10 community questions',
      'Get 5+ helpful votes per answer',
      'Maintain quality standards'
    ],
    color: 'from-green-400 to-emerald-500',
    difficulty: 'Intermediate'
  },
  {
    id: 'test-ace',
    name: 'Test Ace',
    description: 'Score 95%+ on 5 mock tests',
    icon: <Target className="w-8 h-8" />,
    requirements: [
      'Complete 5 mock tests',
      'Score 95%+ on each',
      'Average score 97%+'
    ],
    color: 'from-red-400 to-rose-500',
    difficulty: 'Advanced'
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'View 100 study materials',
    icon: <BookOpen className="w-8 h-8" />,
    requirements: [
      'View 100+ study materials',
      'Explore 5+ different subjects',
      'Spend 50+ hours studying'
    ],
    color: 'from-indigo-400 to-blue-500',
    difficulty: 'Beginner'
  },
  {
    id: 'perfect-scorer',
    name: 'Perfect Scorer',
    description: 'Score 100% on a full-length test',
    icon: <Award className="w-8 h-8" />,
    requirements: [
      'Complete full-length test',
      'Score exactly 100%',
      'No time extension used'
    ],
    color: 'from-yellow-300 to-yellow-500',
    difficulty: 'Advanced'
  },
  {
    id: 'board-ready',
    name: 'Board Ready',
    description: 'Complete entire board exam preparation',
    icon: <CheckCircle className="w-8 h-8" />,
    requirements: [
      'Complete all subjects',
      'Average score 85%+',
      'Pass final mock test'
    ],
    color: 'from-green-500 to-teal-600',
    difficulty: 'Advanced'
  }
];

export function CertificateShowcase() {
  return (
    <div className="space-y-8 py-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Earn Certificates</h2>
        <p className="text-lg text-gray-600">
          Showcase your achievements and progress with our comprehensive certificate system
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CERTIFICATES.map((cert) => (
          <Card key={cert.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            {/* Color Header */}
            <div className={`h-24 bg-gradient-to-r ${cert.color} flex items-center justify-center`}>
              <div className="text-white">{cert.icon}</div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{cert.name}</CardTitle>
              <CardDescription className="text-xs">
                <span className={`inline-block px-2 py-1 rounded-full text-white text-xs font-semibold ${
                  cert.difficulty === 'Beginner' ? 'bg-green-500' :
                  cert.difficulty === 'Intermediate' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {cert.difficulty}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{cert.description}</p>
              
              {/* Requirements */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Requirements:</p>
                <ul className="space-y-1">
                  {cert.requirements.map((req, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">How Certificate Earning Works</h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              number: '1',
              title: 'Study & Learn',
              description: 'Complete study materials and practice problems'
            },
            {
              number: '2',
              title: 'Meet Requirements',
              description: 'Achieve the specific criteria for each certificate'
            },
            {
              number: '3',
              title: 'Auto-Award',
              description: 'Certificates are automatically awarded when criteria met'
            },
            {
              number: '4',
              title: 'Download & Share',
              description: 'Download your certificate and share your achievement'
            }
          ].map((step) => (
            <div key={step.number} className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto">
                {step.number}
              </div>
              <h4 className="font-semibold text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Total Certificates', value: '8' },
          { label: 'Students Certified', value: '2,500+' },
          { label: 'Certificates Earned', value: '12,000+' }
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
