import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: "Physics" | "Chemistry" | "Mathematics";
  difficulty: "easy" | "medium" | "hard" | "jeeAdvanced";
  explanation: string;
}

const MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: 1,
    question: "What is the SI unit of force?",
    options: ["Dyne", "Newton", "Erg", "Joule"],
    correctAnswer: 1,
    subject: "Physics",
    difficulty: "easy",
    explanation: "Newton (N) is the SI unit of force. 1 N = 1 kg⋅m/s²",
  },
  {
    id: 2,
    question: "Which of the following is a non-metal?",
    options: ["Iron", "Copper", "Oxygen", "Sodium"],
    correctAnswer: 2,
    subject: "Chemistry",
    difficulty: "easy",
    explanation: "Oxygen is a non-metal. Iron, Copper, and Sodium are metals.",
  },
  {
    id: 3,
    question: "What is the derivative of x² with respect to x?",
    options: ["x", "2x", "x³", "2"],
    correctAnswer: 1,
    subject: "Mathematics",
    difficulty: "easy",
    explanation: "The derivative of x² is 2x using the power rule: d/dx(xⁿ) = n⋅xⁿ⁻¹",
  },
  {
    id: 4,
    question: "The velocity of light in vacuum is approximately:",
    options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁵ m/s"],
    correctAnswer: 0,
    subject: "Physics",
    difficulty: "medium",
    explanation: "The speed of light (c) is approximately 3 × 10⁸ m/s or 299,792,458 m/s",
  },
  {
    id: 5,
    question: "What is the pH of a neutral solution?",
    options: ["0", "7", "14", "1"],
    correctAnswer: 1,
    subject: "Chemistry",
    difficulty: "medium",
    explanation: "A neutral solution has pH = 7. Acidic solutions have pH < 7, basic solutions have pH > 7",
  },
  {
    id: 6,
    question: "The integral of cos(x) is:",
    options: ["-sin(x)", "sin(x)", "cos(x)", "-cos(x)"],
    correctAnswer: 1,
    subject: "Mathematics",
    difficulty: "medium",
    explanation: "∫cos(x)dx = sin(x) + C, where C is the constant of integration",
  },
  {
    id: 7,
    question: "Which of the following is the correct electron configuration of Oxygen?",
    options: ["1s² 2s² 2p³", "1s² 2s² 2p⁴", "1s² 2s¹ 2p⁵", "1s¹ 2s² 2p⁵"],
    correctAnswer: 1,
    subject: "Chemistry",
    difficulty: "hard",
    explanation: "Oxygen (Z=8) has electron configuration: 1s² 2s² 2p⁴",
  },
  {
    id: 8,
    question: "A projectile is launched at 45° with initial velocity v₀. The range is:",
    options: ["v₀²/g", "v₀²sin(45°)/g", "v₀²sin(90°)/g", "2v₀²sin(45°)cos(45°)/g"],
    correctAnswer: 3,
    subject: "Physics",
    difficulty: "hard",
    explanation: "Range R = (v₀²sin(2θ))/g. At 45°, sin(90°) = 1, so R = v₀²/g",
  },
];

interface MCQPracticeProps {
  limit?: number;
  showScore?: boolean;
}

export default function MCQPractice({ limit = 3, showScore = true }: MCQPracticeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<"Physics" | "Chemistry" | "Mathematics" | "All">("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | "jeeAdvanced" | "All">("All");

  const filteredQuestions = MCQ_QUESTIONS.filter((q) => {
    const subjectMatch = selectedSubject === "All" || q.subject === selectedSubject;
    const difficultyMatch = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    return subjectMatch && difficultyMatch;
  });

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isAnswerCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const handleAnswerSelect = (optionIndex: number) => {
    if (!answered) {
      setSelectedAnswer(optionIndex);
      setAnswered(true);
      setQuestionsAttempted(questionsAttempted + 1);

      if (optionIndex === currentQuestion.correctAnswer) {
        setScore(score + 1);
        toast.success("Correct! 🎉");
      } else {
        toast.error("Incorrect. Try the next one!");
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1 && currentQuestionIndex < limit - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      toast.success(`Quiz Complete! Score: ${score}/${Math.min(questionsAttempted, limit)}`);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setScore(0);
      setQuestionsAttempted(0);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      case "jeeAdvanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!currentQuestion) {
    return (
      <Card className="bg-white shadow-lg p-6">
        <p className="text-center text-gray-600">No questions available for selected filters.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">MCQ Practice</h2>
          {showScore && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-indigo-600">{score}/{Math.min(questionsAttempted, limit)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value as any);
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setAnswered(false);
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value as any);
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setAnswered(false);
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="jeeAdvanced">JEE Advanced</option>
            </select>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            Question {Math.min(currentQuestionIndex + 1, limit)} of {Math.min(filteredQuestions.length, limit)}
          </span>
          <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
            {currentQuestion.difficulty}
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / Math.min(filteredQuestions.length, limit)) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentQuestion.question}</h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={answered}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? isAnswerCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : answered && index === currentQuestion.correctAnswer
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
              } ${answered ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {String.fromCharCode(65 + index)}. {option}
                </span>
                {answered && selectedAnswer === index && (
                  isAnswerCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )
                )}
                {answered && index === currentQuestion.correctAnswer && selectedAnswer !== index && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {answered && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">Explanation:</p>
          <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Next Button */}
      {answered && (
        <Button
          onClick={handleNextQuestion}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {currentQuestionIndex < Math.min(filteredQuestions.length - 1, limit - 1) ? "Next Question" : "Finish Practice"}
        </Button>
      )}
    </Card>
  );
}
