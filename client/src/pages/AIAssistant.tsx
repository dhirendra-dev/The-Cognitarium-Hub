import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Lightbulb, HelpCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const SUBJECTS = ["Advanced Mathematics", "Science", "SST", "English", "Hindi", "Optional Subject"];

export default function AIAssistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tips");
  const [selectedSubject, setSelectedSubject] = useState("Advanced Mathematics");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questionCount, setQuestionCount] = useState("3");
  const [userQuestion, setUserQuestion] = useState("");
  const [tips, setTips] = useState("");
  const [questions, setQuestions] = useState("");
  const [recommendations, setRecommendations] = useState("");

  // tRPC mutations
  const generateTipsMutation = trpc.ai.generateTips.useMutation({
    onSuccess: (data) => {
      setTips(data);
      toast.success("Study tips generated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate tips");
    },
  });

  const generateQuestionsMutation = trpc.ai.generateQuestions.useMutation({
    onSuccess: (data) => {
      setQuestions(data);
      toast.success("Practice questions generated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate questions");
    },
  });

  const askQuestionMutation = trpc.ai.askQuestion.useMutation({
    onSuccess: (data) => {
      toast.success("Answer received!");
      setUserQuestion("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to get answer");
    },
  });

  const { data: chatHistory, refetch: refetchHistory } = trpc.ai.getChatHistory.useQuery({
    subject: selectedSubject,
  });

  const getRecommendationsMutation = trpc.ai.getRecommendations.useQuery();

  const handleGenerateTips = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }
    generateTipsMutation.mutate({ subject: selectedSubject });
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

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion) {
      toast.error("Please enter a question");
      return;
    }
    askQuestionMutation.mutate({
      subject: selectedSubject,
      question: userQuestion,
    });
    await refetchHistory();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Study Assistant</h1>
          </div>
          <p className="text-gray-600">Get personalized study tips, practice questions, and answers to your doubts</p>
        </div>

        {/* Subject Selector */}
        <Card className="bg-white shadow-lg mb-8 p-6">
          <Label className="text-sm font-semibold text-gray-700 block mb-3">Select Subject</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {SUBJECTS.map((subject) => (
              <Button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                variant={selectedSubject === subject ? "default" : "outline"}
                className={`${
                  selectedSubject === subject
                    ? "bg-indigo-600 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {subject.split(" ")[0]}
              </Button>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg mb-8">
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Tips</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Questions</span>
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Q&A</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Recommendations</span>
            </TabsTrigger>
          </TabsList>

          {/* Study Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <Card className="bg-white shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Personalized Study Tips</h3>
              <p className="text-gray-600 mb-6">
                Get expert tips tailored to {selectedSubject} to improve your exam preparation
              </p>
              <Button
                onClick={handleGenerateTips}
                disabled={generateTipsMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {generateTipsMutation.isPending ? "Generating..." : "Generate Tips"}
              </Button>
            </Card>

            {tips && (
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg p-6 border-2 border-indigo-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Study Tips for {selectedSubject}</h4>
                <ScrollArea className="h-96">
                  <div className="pr-4">
                    <Streamdown>{tips}</Streamdown>
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>

          {/* Practice Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="bg-white shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Practice Question Generator</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic" className="text-sm font-semibold text-gray-700">
                    Topic/Chapter
                  </Label>
                  <Input
                    id="topic"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    placeholder="e.g., Quadratic Equations, Photosynthesis"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="count" className="text-sm font-semibold text-gray-700">
                    Number of Questions
                  </Label>
                  <select
                    id="count"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="3">3 Questions</option>
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                  </select>
                </div>

                <Button
                  onClick={handleGenerateQuestions}
                  disabled={generateQuestionsMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {generateQuestionsMutation.isPending ? "Generating..." : "Generate Questions"}
                </Button>
              </div>
            </Card>

            {questions && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg p-6 border-2 border-yellow-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  Practice Questions for {selectedTopic}
                </h4>
                <ScrollArea className="h-96">
                  <div className="pr-4">
                    <Streamdown>{questions}</Streamdown>
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa" className="space-y-6">
            <Card className="bg-white shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Ask Your Questions</h3>

              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div>
                  <Label htmlFor="question" className="text-sm font-semibold text-gray-700">
                    Your Question
                  </Label>
                  <Textarea
                    id="question"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ask any question related to this subject..."
                    className="mt-2 resize-none"
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={askQuestionMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {askQuestionMutation.isPending ? "Getting Answer..." : "Get Answer"}
                </Button>
              </form>
            </Card>

            {/* Chat History */}
            {chatHistory && chatHistory.length > 0 && (
              <Card className="bg-white shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-6">Previous Q&A</h4>
                <ScrollArea className="h-96">
                  <div className="space-y-6 pr-4">
                    {chatHistory.map((entry) => (
                      <div key={entry.id} className="border-l-4 border-indigo-500 pl-4 pb-4">
                        <p className="font-semibold text-gray-800 mb-2">Q: {entry.question}</p>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <Streamdown>{entry.answer}</Streamdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-white shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Personalized Recommendations</h3>
              <p className="text-gray-600 mb-6">
                Based on your study patterns and progress, here are personalized recommendations to improve your exam preparation
              </p>
              <Button
                onClick={() => getRecommendationsMutation.refetch()}
                disabled={getRecommendationsMutation.isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {getRecommendationsMutation.isLoading ? "Loading..." : "Get Recommendations"}
              </Button>
            </Card>

            {getRecommendationsMutation.data && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg p-6 border-2 border-green-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Your Personalized Plan</h4>
                <ScrollArea className="h-96">
                  <div className="pr-4">
                    <Streamdown>{getRecommendationsMutation.data}</Streamdown>
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
