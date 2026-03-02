import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Search, Filter } from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];
const DIFFICULTIES = ["easy", "medium", "hard", "jeeAdvanced"];

export default function BoardExamQuestions() {
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const { data: questions, isLoading } = trpc.boardExamQuestions.getBySubject.useQuery(
    { subject: selectedSubject, limit: 50 },
    { enabled: !!selectedSubject }
  );

  const { data: mcqOptions } = trpc.boardExamQuestions.getMCQOptions.useQuery(
    { questionId: questions?.[currentQuestionIndex]?.id || 0 },
    { enabled: !!questions?.[currentQuestionIndex]?.id && questions[currentQuestionIndex]?.questionType === "mcq" }
  );

  const { data: userStats } = trpc.boardExamQuestions.getUserStats.useQuery();

  const submitAnswerMutation = trpc.boardExamQuestions.submitAnswer.useMutation({
    onSuccess: () => {
      toast.success("Answer submitted!");
      setShowResults(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit answer");
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    const userAnswer = userAnswers[currentQuestion.id] || "";
    if (!userAnswer) {
      toast.error("Please select or enter an answer");
      return;
    }

    const isCorrect = mcqOptions?.some(
      (opt) => opt.isCorrect && opt.optionText === userAnswer
    ) || false;

    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      userAnswer,
      isCorrect,
      marksObtained: isCorrect ? currentQuestion.marks || 1 : 0,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResults(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowResults(false);
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">JEE & Board Exam Questions</h1>
          <p className="text-gray-600">Practice JEE Main, JEE Advanced, and board exam questions for Class 11-12</p>
        </div>

        {/* Stats Card */}
        {userStats && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-blue-600">{userStats.totalAttempts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.correctAnswers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.accuracy}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Marks</p>
                  <p className="text-2xl font-bold text-orange-600">{userStats.totalMarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentQuestionIndex(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {isLoading ? (
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-12 pb-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        ) : questions && questions.length > 0 ? (
          <>
            {/* Question Card */}
            <Card className="mb-6 bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getDifficultyColor(currentQuestion?.difficulty || "")}>
                        {currentQuestion?.difficulty}
                      </Badge>
                      <Badge variant="outline">{currentQuestion?.marks} marks</Badge>
                      <Badge variant="outline">{currentQuestion?.questionType}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-lg font-medium text-gray-900 mb-4">{currentQuestion?.questionText}</p>

                  {/* MCQ Options */}
                  {currentQuestion?.questionType === "mcq" && mcqOptions && (
                    <div className="space-y-3">
                      {mcqOptions.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option.optionText}
                            checked={userAnswers[currentQuestion.id] === option.optionText}
                            onChange={(e) =>
                              setUserAnswers({
                                ...userAnswers,
                                [currentQuestion.id]: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3 text-gray-700">{option.optionText}</span>
                          {showResults && option.isCorrect && (
                            <CheckCircle2 className="ml-auto w-5 h-5 text-green-600" />
                          )}
                          {showResults && userAnswers[currentQuestion.id] === option.optionText && !option.isCorrect && (
                            <XCircle className="ml-auto w-5 h-5 text-red-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQuestion?.questionType === "shortAnswer" && (
                    <textarea
                      placeholder="Enter your answer..."
                      value={userAnswers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setUserAnswers({
                          ...userAnswers,
                          [currentQuestion.id]: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  )}

                  {/* Show explanation if correct */}
                  {showResults && mcqOptions?.find((opt) => opt.isCorrect)?.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Explanation:</p>
                      <p className="text-sm text-blue-800 mt-1">
                        {mcqOptions.find((opt) => opt.isCorrect)?.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-between">
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>

                  {!showResults ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={submitAnswerMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submitAnswerMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Answer"
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === (questions?.length || 0) - 1}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Next Question
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-600">No questions found for this subject and difficulty level.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
