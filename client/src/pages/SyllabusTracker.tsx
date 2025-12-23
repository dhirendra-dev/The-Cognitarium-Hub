import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle2, Circle } from "lucide-react";

const syllabi = {
  math: [
    "Sets",
    "Complex Numbers",
    "Arithmetic of Integers",
    "Quadratic Equations",
    "Application of Common Logarithm",
    "Permutation and Combination",
    "Trigonometry",
    "Plane Geometry",
    "Co-ordinate Geometry",
  ],
  science: [
    "Chemical Reactions and Equations",
    "Acids, Bases and Salts",
    "Metals and Non-metals",
    "Carbon and its Compounds",
    "Periodic Classification of Elements",
    "Life Processes",
    "Control and Coordination",
    "How do Organisms Reproduce?",
    "Heredity and Evolution",
    "Light-Reflection and Refraction",
    "Human Eye and Colourful World",
    "Electricity",
    "Magnetic Effects of Electric Current",
    "Sources of Energy",
    "Our Environment",
    "Management of Natural Resources",
  ],
  english: {
    prose: [
      "A Letter To God",
      "Nelson Mandela: Long Walk to Freedom",
      "Glimpses of India",
      "Madam Rides the Bus",
    ],
    poetry: [
      "A Tiger in the Zoo",
      "Amanda",
      "Animals",
      "The Tale of Custard the Dragon",
      "The Fog",
    ],
    supplementary: [
      "The Midnight Visitor",
      "A Question of Trust",
      "Footprints without Feet",
      "The Making of a Scientist",
    ],
  },
  hindi: {
    poetry: [
      "राम-लक्ष्मण-परशुराम संवाद",
      "मीराबाई की पदावली",
      "किरणों का खेल",
      "तोड़ती पत्थर",
      "यह दंतुरित मुसकान",
    ],
    prose: [
      "आत्म-निर्भरता (निबंध)",
      "नमक का दारोगा (कहानी)",
      "अफसर (व्यंग्यात्मक लेख)",
      "न्याय (एकांकी)",
      "तीर्थ-यात्रा (कहानी)",
      "वन-भ्रमण (यात्रा वृत्तांत)",
      "इंटरनेट के खट्टे-मीठे अनुभव (निबंध)",
      "बरगीत",
      "कदम मिलाकर चलना होगा",
      "अमीर खुसरू की भारत भक्ति (निबंध)",
      "अरुणिमा सिन्हा साहस की मिसाल (प्रेरक प्रसंग)",
    ],
  },
};

export default function SyllabusTracker() {
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (key: string) => {
    setCompletedChapters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderChapterList = (chapters: string[], prefix: string) => {
    return chapters.map((chapter, index) => {
      const key = `${prefix}-${index}`;
      const isCompleted = completedChapters[key];

      return (
        <div
          key={key}
          onClick={() => toggleChapter(key)}
          className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-indigo-300"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
          )}
          <span className={`flex-1 ${isCompleted ? "line-through text-gray-500" : "text-gray-800"}`}>
            {chapter}
          </span>
        </div>
      );
    });
  };

  const calculateProgress = (chapters: string[], prefix: string) => {
    const completed = chapters.filter((_, index) => completedChapters[`${prefix}-${index}`]).length;
    return Math.round((completed / chapters.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Complete Syllabus Tracker</h1>
          </div>
          <p className="text-gray-600">Track your progress through all subjects and chapters</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="math" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg mb-8">
            <TabsTrigger value="math">Advanced Math</TabsTrigger>
            <TabsTrigger value="science">Science</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="hindi">Hindi</TabsTrigger>
          </TabsList>

          {/* Advanced Mathematics */}
          <TabsContent value="math">
            <Card className="bg-white shadow-lg p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">Advanced Mathematics</h2>
                  <span className="text-lg font-bold text-indigo-600">
                    {calculateProgress(syllabi.math, "math")}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all"
                    style={{ width: `${calculateProgress(syllabi.math, "math")}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-3">{renderChapterList(syllabi.math, "math")}</div>
            </Card>
          </TabsContent>

          {/* Science */}
          <TabsContent value="science">
            <Card className="bg-white shadow-lg p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">Science</h2>
                  <span className="text-lg font-bold text-indigo-600">
                    {calculateProgress(syllabi.science, "science")}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all"
                    style={{ width: `${calculateProgress(syllabi.science, "science")}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-3">{renderChapterList(syllabi.science, "science")}</div>
            </Card>
          </TabsContent>

          {/* English */}
          <TabsContent value="english">
            <div className="space-y-6">
              <Card className="bg-white shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">Prose</h2>
                    <span className="text-lg font-bold text-indigo-600">
                      {calculateProgress(syllabi.english.prose, "english-prose")}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculateProgress(syllabi.english.prose, "english-prose")}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-3">{renderChapterList(syllabi.english.prose, "english-prose")}</div>
              </Card>

              <Card className="bg-white shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">Poetry</h2>
                    <span className="text-lg font-bold text-indigo-600">
                      {calculateProgress(syllabi.english.poetry, "english-poetry")}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculateProgress(syllabi.english.poetry, "english-poetry")}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-3">{renderChapterList(syllabi.english.poetry, "english-poetry")}</div>
              </Card>

              <Card className="bg-white shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">Supplementary Reader</h2>
                    <span className="text-lg font-bold text-indigo-600">
                      {calculateProgress(syllabi.english.supplementary, "english-supp")}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculateProgress(syllabi.english.supplementary, "english-supp")}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-3">{renderChapterList(syllabi.english.supplementary, "english-supp")}</div>
              </Card>
            </div>
          </TabsContent>

          {/* Hindi */}
          <TabsContent value="hindi">
            <div className="space-y-6">
              <Card className="bg-white shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">काव्य खंड (Poetry)</h2>
                    <span className="text-lg font-bold text-indigo-600">
                      {calculateProgress(syllabi.hindi.poetry, "hindi-poetry")}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculateProgress(syllabi.hindi.poetry, "hindi-poetry")}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-3">{renderChapterList(syllabi.hindi.poetry, "hindi-poetry")}</div>
              </Card>

              <Card className="bg-white shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">गद्य खंड (Prose)</h2>
                    <span className="text-lg font-bold text-indigo-600">
                      {calculateProgress(syllabi.hindi.prose, "hindi-prose")}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculateProgress(syllabi.hindi.prose, "hindi-prose")}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-3">{renderChapterList(syllabi.hindi.prose, "hindi-prose")}</div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
