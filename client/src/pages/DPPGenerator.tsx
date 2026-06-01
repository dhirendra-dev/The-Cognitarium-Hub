import React, { useState } from 'react';
import { BookOpen, Loader, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface DPPQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface DPP {
  id: string;
  subject: string;
  chapter: string;
  difficulty: string;
  questions: DPPQuestion[];
  generatedAt: string;
}

const CHAPTERS = {
  physics: [
    'Rotational Dynamics',
    'Thermodynamics',
    'Waves & Acoustics',
    'Gravitation',
    'SHM'
  ],
  chemistry: [
    'Chemical Bonding',
    'Ionic Equilibrium',
    'Redox Reactions',
    'Organic Chemistry',
    'Thermochemistry'
  ],
  math: [
    'Conic Sections',
    'Permutations & Combinations',
    'Limits & Continuity',
    'Trigonometry',
    'Coordinate Geometry'
  ]
};

export default function DPPGenerator() {
  const [config, setConfig] = useState({
    subject: 'physics',
    chapter: 'Rotational Dynamics',
    difficulty: 'Mains' as 'Mains' | 'Advanced'
  });
  const [loading, setLoading] = useState(false);
  const [generatedDpp, setGeneratedDpp] = useState<DPP | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showSolutions, setShowSolutions] = useState(false);

  const handleGenerateDPP = async () => {
    setLoading(true);
    try {
      // Simulate DPP generation - in production, call API
      const mockDpp: DPP = {
        id: `dpp-${Date.now()}`,
        subject: config.subject,
        chapter: config.chapter,
        difficulty: config.difficulty,
        generatedAt: new Date().toLocaleString(),
        questions: [
          {
            id: 'q1',
            question: `A solid cylinder of mass M and radius R rolls without slipping on a horizontal surface with velocity v_cm. What is the total kinetic energy?`,
            options: [
              '(1/2)Mv_cm²',
              '(3/4)Mv_cm²',
              '(1/4)Mv_cm²',
              '(5/4)Mv_cm²'
            ],
            correctAnswer: 1,
            explanation: 'For rolling without slipping: KE_total = KE_translational + KE_rotational = (1/2)Mv_cm² + (1/2)Iω². For a solid cylinder, I = (1/2)MR² and ω = v_cm/R, so KE_rotational = (1/4)Mv_cm². Total = (3/4)Mv_cm².'
          },
          {
            id: 'q2',
            question: 'In an adiabatic process for an ideal gas, which relation holds true?',
            options: [
              'PV = constant',
              'PV^γ = constant',
              'TV^(γ-1) = constant',
              'Both B and C'
            ],
            correctAnswer: 3,
            explanation: 'For an adiabatic process (Q = 0), we have PV^γ = constant and TV^(γ-1) = constant. Both are equivalent relations derived from the first law of thermodynamics.'
          },
          {
            id: 'q3',
            question: 'What is the steric number for a carbon atom in sp³ hybridization?',
            options: [
              '2',
              '3',
              '4',
              '5'
            ],
            correctAnswer: 2,
            explanation: 'Steric Number = (number of σ bonds) + (number of lone pairs). For sp³ hybridization with 4 σ bonds and 0 lone pairs, SN = 4.'
          }
        ]
      };

      setGeneratedDpp(mockDpp);
      setUserAnswers({});
      setShowSolutions(false);
    } catch (error) {
      console.error('Error generating DPP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    if (!generatedDpp) return 0;
    let correct = 0;
    generatedDpp.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / generatedDpp.questions.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-green-400" />
            <h1 className="text-4xl font-bold text-white">DPP Generator</h1>
          </div>
          <p className="text-slate-300">Daily Practice Problems - Customized for Your Level</p>
        </div>

        {!generatedDpp ? (
          // Configuration Panel
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-6">
            {/* Subject Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">Subject</label>
              <div className="flex gap-3">
                {(['physics', 'chemistry', 'math'] as const).map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      subject,
                      chapter: CHAPTERS[subject][0]
                    }))}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      config.subject === subject
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">Chapter</label>
              <select
                value={config.chapter}
                onChange={(e) => setConfig(prev => ({...prev, chapter: e.target.value}))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              >
                {CHAPTERS[config.subject as keyof typeof CHAPTERS].map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">Difficulty Level</label>
              <div className="flex gap-3">
                {(['Mains', 'Advanced'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setConfig(prev => ({...prev, difficulty: diff}))}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      config.difficulty === diff
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateDPP}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating DPP...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Generate DPP
                </>
              )}
            </button>
          </div>
        ) : (
          // DPP Display Panel
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-slate-400 text-sm">Subject</p>
                  <p className="text-white font-semibold text-lg capitalize">{generatedDpp.subject}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Chapter</p>
                  <p className="text-white font-semibold text-lg">{generatedDpp.chapter}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Difficulty</p>
                  <p className="text-white font-semibold text-lg">{generatedDpp.difficulty}</p>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {generatedDpp.questions.map((question, idx) => (
                <div key={question.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">Q{idx + 1}: {question.question}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerSelect(question.id, optIdx)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          userAnswers[question.id] === optIdx
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + optIdx)}.</span> {option}
                      </button>
                    ))}
                  </div>

                  {showSolutions && (
                    <div className={`p-4 rounded-lg ${
                      userAnswers[question.id] === question.correctAnswer
                        ? 'bg-green-600/20 border border-green-600'
                        : 'bg-red-600/20 border border-red-600'
                    }`}>
                      <p className="text-sm font-semibold mb-2">
                        {userAnswers[question.id] === question.correctAnswer ? (
                          <span className="text-green-300 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Correct!
                          </span>
                        ) : (
                          <span className="text-red-300 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </p>
                      <p className="text-slate-200 text-sm">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowSolutions(!showSolutions)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
              </button>
              <button
                onClick={() => setGeneratedDpp(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Generate New DPP
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            {/* Score Display */}
            {showSolutions && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
                <p className="text-slate-400 mb-2">Your Score</p>
                <p className="text-4xl font-bold text-green-400">{calculateScore()}%</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
