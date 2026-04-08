import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Lightbulb, HelpCircle, TrendingUp, Brain, BookOpen, Zap } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  Physics: [
    "Mechanics",
    "Thermodynamics",
    "Waves & Oscillations",
    "Optics",
    "Electromagnetism",
    "Modern Physics",
    "Nuclear Physics",
  ],
  Chemistry: [
    "Physical Chemistry",
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Coordination Chemistry",
    "Qualitative Analysis",
  ],
  Mathematics: [
    "Algebra",
    "Calculus",
    "Geometry",
    "Trigonometry",
    "Vectors",
    "3D Geometry",
    "Probability",
  ],
};

const EXAM_TYPES = ["Class 11", "Class 12", "JEE Main", "JEE Advanced"];

export default function AIAssistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tips");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedTopic, setSelectedTopic] = useState("Mechanics");
  const [selectedExam, setSelectedExam] = useState("JEE Main");
  const [questionCount, setQuestionCount] = useState("5");
  const [userQuestion, setUserQuestion] = useState("");
  const [tips, setTips] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  // tRPC mutations
  const generateTipsMutation = trpc.ai.generateTips.useMutation({
    onSuccess: (data: any) => {
      setTips(data);
      toast.success("Study tips generated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate tips");
    },
  });

  const generateQuestionsMutation = trpc.ai.generateQuestions.useMutation({
    onSuccess: (data: any) => {
      setQuestions(Array.isArray(data) ? data : [data]);
      toast.success("Practice questions generated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate questions");
    },
  });

  const askQuestionMutation = trpc.ai.askQuestion.useMutation({
    onSuccess: (data: any) => {
      setChatHistory([...chatHistory, { question: userQuestion, answer: data }]);
      toast.success("Answer received!");
      setUserQuestion("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to get answer");
    },
  });

  const getRecommendationsMutation = trpc.ai.getRecommendations.useQuery();

  const handleGenerateTips = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }
    generateTipsMutation.mutate({
      subject: selectedSubject,
    });
  };

  const handleGenerateQuestions = () => {
    if (!selectedSubject || !selectedTopic) {
      toast.error("Please select a subject and topic");
      return;
    }
    generateQuestionsMutation.mutate({
      subject: selectedSubject,
      topic: selectedTopic,
      count: parseInt(questionCount),
    });
  };

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }
    askQuestionMutation.mutate({
      question: userQuestion,
      subject: selectedSubject,
    });
  };

  const availableTopics = TOPICS_BY_SUBJECT[selectedSubject] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">AI Study Assistant</h1>
          </div>
          <p className="text-purple-200">Powered by advanced AI for JEE 2028 & Class 11-12 PCM exams</p>
        </div>

        {/* Subject & Exam Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div>
            <Label className="text-white font-semibold mb-2 block">Subject</Label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopic(TOPICS_BY_SUBJECT[e.target.value]?.[0] || "");
              }}
              className="w-full bg-white/20 border border-white/30 text-white rounded px-3 py-2"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-white font-semibold mb-2 block">Topic</Label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-white/20 border border-white/30 text-white rounded px-3 py-2"
            >
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-white font-semibold mb-2 block">Exam Type</Label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-white/20 border border-white/30 text-white rounded px-3 py-2"
            >
              {EXAM_TYPES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-white font-semibold mb-2 block">Questions</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className="bg-white/20 border-white/30 text-white"
            />
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border border-white/20">
            <TabsTrigger value="tips" className="text-white data-[state=active]:bg-purple-600">
              <Lightbulb className="w-4 h-4 mr-2" />
              Study Tips
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-white data-[state=active]:bg-purple-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-purple-600">
              <HelpCircle className="w-4 h-4 mr-2" />
              Ask Doubt
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-white data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Study Tips Tab */}
          <TabsContent value="tips" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white lg:col-span-1">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Generate Study Tips</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Get AI-generated study tips tailored for {selectedSubject} - {selectedTopic}
                  </p>
                  <Button
                    onClick={handleGenerateTips}
                    disabled={generateTipsMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {generateTipsMutation.isPending ? "Generating..." : "Generate Tips"}
                  </Button>
                </div>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20 text-white lg:col-span-2">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Tips for {selectedTopic}</h3>
                  {tips ? (
                    <ScrollArea className="h-96">
                      <Streamdown>{tips}</Streamdown>
                    </ScrollArea>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                      <p>Generate tips to see recommendations here</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Practice Questions Tab */}
          <TabsContent value="questions" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white lg:col-span-1">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Generate Questions</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Generate {questionCount} practice questions for {selectedTopic}
                  </p>
                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={generateQuestionsMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {generateQuestionsMutation.isPending ? "Generating..." : "Generate Questions"}
                  </Button>
                </div>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20 text-white lg:col-span-2">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Practice Questions</h3>
                  {questions.length > 0 ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {questions.map((q, idx) => (
                          <div key={idx} className="bg-white/10 p-4 rounded border border-white/20">
                            <p className="font-semibold mb-2">Q{idx + 1}: {typeof q === "string" ? q : q.question || "Question"}</p>
                            {typeof q !== "string" && q.options && (
                              <div className="space-y-2 ml-4">
                                {q.options.map((opt: string, i: number) => (
                                  <p key={i} className="text-sm text-gray-300">
                                    {String.fromCharCode(65 + i)}) {opt}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                      <p>Generate questions to see them here</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Ask Doubt Tab */}
          <TabsContent value="chat" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white lg:col-span-1">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Ask Your Doubt</h3>
                  <Textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ask any question about the topic..."
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 mb-4 h-24"
                  />
                  <Button
                    onClick={handleAskQuestion}
                    disabled={askQuestionMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {askQuestionMutation.isPending ? "Getting answer..." : "Ask"}
                  </Button>
                </div>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20 text-white lg:col-span-2">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Chat History</h3>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {chatHistory.length > 0 ? (
                        chatHistory.map((msg, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="bg-blue-600/30 p-3 rounded">
                              <p className="text-sm font-semibold text-blue-200">You:</p>
                              <p className="text-sm">{msg.question}</p>
                            </div>
                            <div className="bg-green-600/30 p-3 rounded">
                              <p className="text-sm font-semibold text-green-200">AI:</p>
                              <p className="text-sm">{msg.answer}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p>Ask a question to start the conversation</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-6">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Personalized Study Recommendations</h3>
                {getRecommendationsMutation.data ? (
                  <ScrollArea className="h-96">
                    <Streamdown>{getRecommendationsMutation.data}</Streamdown>
                  </ScrollArea>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Loading your personalized recommendations...</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-white">
          <p className="text-lg font-semibold text-purple-300">
            💡 Tip: Use the AI Assistant daily to strengthen your concepts and solve doubts instantly!
          </p>
        </div>
      </div>
    </div>
  );
}
