import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

const SYLLABI = {
  math: [
    { number: 1, name: "Sets" },
    { number: 2, name: "Complex Numbers" },
    { number: 3, name: "Arithmetic of Integers" },
    { number: 4, name: "Quadratic Equation" },
    { number: 5, name: "Application of Common Logarithm" },
    { number: 6, name: "Permutation and Combination" },
    { number: 7, name: "Trigonometry" },
    { number: 8, name: "Plane Geometry" },
    { number: 9, name: "Co-ordinate Geometry" },
  ],
  science: [
    { number: 1, name: "Chemical Reactions and Equations" },
    { number: 2, name: "Acids, Bases and Salts" },
    { number: 3, name: "Metals and Non-metals" },
    { number: 4, name: "Carbon and its Compounds" },
    { number: 5, name: "Periodic Classification of Elements" },
    { number: 6, name: "Life Processes" },
    { number: 7, name: "Control and Coordination" },
    { number: 8, name: "How do Organisms Reproduce?" },
    { number: 9, name: "Heredity and Evolution" },
    { number: 10, name: "Light-Reflection and Refraction" },
    { number: 11, name: "Human Eye and Colourful World" },
    { number: 12, name: "Electricity" },
    { number: 13, name: "Magnetic Effects of Electric Current" },
    { number: 14, name: "Sources of Energy" },
    { number: 15, name: "Our Environment" },
    { number: 16, name: "Management of Natural Resources" },
  ],
  english: {
    prose: [
      { number: 1, name: "A Letter To God", author: "G. L. Fuentes" },
      { number: 2, name: "Nelson Mandela: Long Walk to Freedom", author: "Nelson Rolihlahla Mandela" },
      { number: 3, name: "Glimpses of India", author: "Lokesh Abrol" },
      { number: 4, name: "Madam Rides the Bus", author: "Arup Kumar Datta" },
    ],
    poetry: [
      { number: 1, name: "A Tiger in the Zoo", author: "Leslie Norris" },
      { number: 2, name: "Amanda", author: "Robin Klein" },
      { number: 3, name: "Animals", author: "Walt Whitman" },
      { number: 4, name: "The Ball Poem", author: "John Berryman" },
      { number: 5, name: "The Tale of Custard the Dragon", author: "Ogden Nash" },
    ],
    supplementary: [
      { number: 1, name: "The Midnight Visitor", author: "Robert Arthur" },
      { number: 2, name: "A Question of Trust", author: "Victor Canning" },
      { number: 3, name: "Footprints without Feet", author: "H. G Wells" },
      { number: 4, name: "The Hack Driver", author: "Sinclair Lewis" },
    ],
  },
  hindi: {
    poetry: [
      { number: 1, name: "पद-युग्म", author: "कबीरदास" },
      { number: 2, name: "वन-मार्ग में", author: "गोस्वामी तुलसीदास" },
      { number: 3, name: "किरणों का खेल", author: "मैथिलीशरण गुप्त" },
      { number: 4, name: "तोड़ती पत्थर", author: "सूर्यकांत त्रिपाठी निराला" },
      { number: 5, name: "यह दंतुरित मुसकान", author: "नागार्जुन" },
      { number: 6, name: "बरगीत", author: "श्रीमंत शंकर" },
      { number: 7, name: "कदम मिलाकर चलना होगा", author: "अटल बिहारी वाजपेयी" },
    ],
    prose: [
      { number: 1, name: "आत्म-निर्भरता (निबंध)", author: "आचार्य रामचंद्र शुक्ल" },
      { number: 2, name: "नमक का दारोगा (कहानी)", author: "मुंशी प्रेमचंद" },
      { number: 3, name: "अफसर (व्यंग्यात्मक लेख)", author: "शरद जोशी" },
      { number: 4, name: "न्याय (एकांकी)", author: "विष्णु प्रभाकर" },
      { number: 5, name: "तीर्थ-यात्रा (कहानी)", author: "सुदर्शन" },
      { number: 6, name: "वन-भ्रमण (यात्रा वृत्तांत)", author: "डॉ. प्रणन्यकुमार" },
      { number: 7, name: "इंटरनेट के खट्टे-मीठे अनुभव (निबंध)", author: "अनुराधा" },
      { number: 8, name: "अमीर खुसरू की भारत भक्ति (निबंध)", author: "रामधारी सिंह दिनकर" },
      { number: 9, name: "अरुणिमा सिन्हा साहस की मिसाल (प्रेरक प्रसंग)", author: "अज्ञात" },
    ],
  },
};

export default function SyllabusTracker() {
  const [expandedMath, setExpandedMath] = useState(true);
  const [expandedScience, setExpandedScience] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Complete Syllabus</h1>
          </div>
          <p className="text-gray-600">View all chapters and topics for your HSLC board exam</p>
        </div>

        <Tabs defaultValue="math" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg mb-8">
            <TabsTrigger value="math">Mathematics</TabsTrigger>
            <TabsTrigger value="science">Science</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="hindi">Hindi</TabsTrigger>
          </TabsList>

          {/* Mathematics */}
          <TabsContent value="math">
            <Card className="bg-white shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Advanced Mathematics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(SYLLABI.math as any).map((chapter: any) => (
                  <div key={chapter.number} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {chapter.number}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{chapter.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Science */}
          <TabsContent value="science">
            <Card className="bg-white shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Science (Physics, Chemistry, Biology)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(SYLLABI.science as any).map((chapter: any) => (
                  <div key={chapter.number} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                      {chapter.number}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{chapter.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* English */}
          <TabsContent value="english">
            <div className="space-y-6">
              {/* Prose */}
              <Card className="bg-white shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">First Flight - Prose</h3>
                <div className="space-y-3">
                  {(SYLLABI.english.prose as any).map((item: any) => (
                    <div key={item.number} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
                      <p className="font-semibold text-gray-800">{item.number}. {item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">by {item.author}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Poetry */}
              <Card className="bg-white shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">First Flight - Poetry</h3>
                <div className="space-y-3">
                  {(SYLLABI.english.poetry as any).map((item: any) => (
                    <div key={item.number} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
                      <p className="font-semibold text-gray-800">{item.number}. {item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">by {item.author}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Supplementary */}
              <Card className="bg-white shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Footprints Without Feet - Supplementary Reader</h3>
                <div className="space-y-3">
                  {(SYLLABI.english.supplementary as any).map((item: any) => (
                    <div key={item.number} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
                      <p className="font-semibold text-gray-800">{item.number}. {item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">by {item.author}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Hindi */}
          <TabsContent value="hindi">
            <div className="space-y-6">
              {/* Poetry */}
              <Card className="bg-white shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">काव्य खंड (Poetry)</h3>
                <div className="space-y-3">
                  {(SYLLABI.hindi.poetry as any).map((item: any) => (
                    <div key={item.number} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500">
                      <p className="font-semibold text-gray-800">{item.number}. {item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">- {item.author}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Prose */}
              <Card className="bg-white shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">गद्य खंड (Prose)</h3>
                <div className="space-y-3">
                  {(SYLLABI.hindi.prose as any).map((item: any) => (
                    <div key={item.number} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500">
                      <p className="font-semibold text-gray-800">{item.number}. {item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">- {item.author}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg mt-8 p-6 border-2 border-blue-200">
          <p className="text-gray-700">
            <strong>Note:</strong> This syllabus tracker shows all chapters and topics you need to cover for your HSLC board exam. 
            Use the Subjects Tracker to mark topics as completed and monitor your progress across all subjects.
          </p>
        </Card>
      </div>
    </div>
  );
}
