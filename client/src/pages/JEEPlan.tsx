import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle, Circle, Play, Target } from "lucide-react";
import { toast } from "sonner";

interface JEEChapter {
  id: number;
  chapterName: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  class: "11" | "12";
  isCompleted: boolean;
  videoUrl?: string;
  topics: string[];
  difficulty: "easy" | "medium" | "hard" | "jeeAdvanced";
}

export default function JEEPlan() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");
  const [selectedClass, setSelectedClass] = useState<"11" | "12">("11");
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());

  // JEE Syllabus Structure
  const jeeSyllabus: Record<string, Record<string, JEEChapter[]>> = {
    Physics: {
      "11": [
        {
          id: 1,
          chapterName: "Units and Measurements",
          subject: "Physics",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["SI Units", "Dimensions", "Significant Figures"],
          difficulty: "easy",
        },
        {
          id: 2,
          chapterName: "Motion in One Dimension",
          subject: "Physics",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Displacement", "Velocity", "Acceleration", "Equations of Motion"],
          difficulty: "easy",
        },
        {
          id: 3,
          chapterName: "Motion in Two Dimensions",
          subject: "Physics",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Projectile Motion", "Circular Motion", "Relative Motion"],
          difficulty: "medium",
        },
        {
          id: 4,
          chapterName: "Laws of Motion",
          subject: "Physics",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Newton's Laws", "Friction", "Normal Force"],
          difficulty: "medium",
        },
        {
          id: 5,
          chapterName: "Work, Energy and Power",
          subject: "Physics",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Work", "Kinetic Energy", "Potential Energy", "Power"],
          difficulty: "medium",
        },
      ],
      "12": [
        {
          id: 6,
          chapterName: "Electrostatics",
          subject: "Physics",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Electric Charge", "Electric Field", "Electric Potential"],
          difficulty: "medium",
        },
        {
          id: 7,
          chapterName: "Current Electricity",
          subject: "Physics",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Current", "Resistance", "EMF", "Circuits"],
          difficulty: "medium",
        },
        {
          id: 8,
          chapterName: "Magnetism",
          subject: "Physics",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Magnetic Field", "Magnetic Force", "Electromagnetic Induction"],
          difficulty: "hard",
        },
        {
          id: 9,
          chapterName: "Modern Physics",
          subject: "Physics",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Photoelectric Effect", "Bohr Model", "Nuclear Physics"],
          difficulty: "hard",
        },
      ],
    },
    Chemistry: {
      "11": [
        {
          id: 11,
          chapterName: "Basic Concepts of Chemistry",
          subject: "Chemistry",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Mole Concept", "Atomic Mass", "Molecular Mass"],
          difficulty: "easy",
        },
        {
          id: 12,
          chapterName: "Atomic Structure",
          subject: "Chemistry",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Electrons", "Protons", "Neutrons", "Quantum Numbers"],
          difficulty: "medium",
        },
        {
          id: 13,
          chapterName: "Periodic Table",
          subject: "Chemistry",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Periodicity", "Trends", "Properties"],
          difficulty: "easy",
        },
        {
          id: 14,
          chapterName: "Chemical Bonding",
          subject: "Chemistry",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Ionic Bond", "Covalent Bond", "Metallic Bond"],
          difficulty: "medium",
        },
      ],
      "12": [
        {
          id: 15,
          chapterName: "Organic Chemistry",
          subject: "Chemistry",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Hydrocarbons", "Functional Groups", "Reactions"],
          difficulty: "hard",
        },
        {
          id: 16,
          chapterName: "Coordination Chemistry",
          subject: "Chemistry",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Complex Ions", "Ligands", "Bonding"],
          difficulty: "hard",
        },
      ],
    },
    Mathematics: {
      "11": [
        {
          id: 21,
          chapterName: "Sets and Relations",
          subject: "Mathematics",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Set Theory", "Relations", "Functions"],
          difficulty: "easy",
        },
        {
          id: 22,
          chapterName: "Trigonometry",
          subject: "Mathematics",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Angles", "Trigonometric Ratios", "Identities"],
          difficulty: "medium",
        },
        {
          id: 23,
          chapterName: "Sequences and Series",
          subject: "Mathematics",
          class: "11",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["AP", "GP", "Summation"],
          difficulty: "medium",
        },
      ],
      "12": [
        {
          id: 24,
          chapterName: "Calculus - Limits and Derivatives",
          subject: "Mathematics",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Limits", "Continuity", "Derivatives"],
          difficulty: "hard",
        },
        {
          id: 25,
          chapterName: "Calculus - Integration",
          subject: "Mathematics",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Indefinite Integral", "Definite Integral", "Applications"],
          difficulty: "hard",
        },
        {
          id: 26,
          chapterName: "Vectors and 3D Geometry",
          subject: "Mathematics",
          class: "12",
          isCompleted: false,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          topics: ["Vectors", "3D Coordinates", "Planes", "Lines"],
          difficulty: "jeeAdvanced",
        },
      ],
    },
  };

  const currentChapters = jeeSyllabus[selectedSubject]?.[selectedClass] || [];
  const completedCount = currentChapters.filter((ch) => ch.isCompleted).length;
  const progress = currentChapters.length > 0 ? Math.round((completedCount / currentChapters.length) * 100) : 0;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">JEE 2028 Preparation Plan</h1>
          </div>
          <p className="text-gray-600">Complete Class 11-12 PCM syllabus with video lectures and tracking</p>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as "Physics" | "Chemistry" | "Mathematics")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as "11" | "12")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <Card className="bg-white shadow-lg mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Progress</h2>
            <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            {completedCount} of {currentChapters.length} chapters completed
          </p>
        </Card>

        {/* Chapters */}
        <div className="space-y-4">
          {currentChapters.map((chapter) => (
            <Card key={chapter.id} className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition">
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {chapter.isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                      <h3 className={`text-lg font-semibold ${chapter.isCompleted ? "text-gray-500 line-through" : "text-gray-900"}`}>
                        {chapter.chapterName}
                      </h3>
                    </div>
                    <div className="flex gap-2 ml-9">
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(chapter.difficulty)}`}>
                        {chapter.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Class {chapter.class}
                      </span>
                    </div>
                  </div>
                  <Checkbox
                    checked={chapter.isCompleted}
                    onChange={(e) => {
                      // Update completion status
                      toast.success(`${chapter.chapterName} ${e ? "completed" : "marked incomplete"}`);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Expanded Content */}
              {expandedChapter === chapter.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {/* Video Player */}
                  {chapter.videoUrl && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Video Lecture
                      </h4>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          src={chapter.videoUrl}
                          title={chapter.chapterName}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Topics */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Topics Covered
                    </h4>
                    <ul className="space-y-2">
                      {chapter.topics.map((topic, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Stay disciplined. Stay focused. Stay consistent. 💪
          </p>
        </div>
      </div>
    </div>
  );
}
