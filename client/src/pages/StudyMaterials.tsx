import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = [
  "PW Modules",
  "Cengage Series",
  "Coaching Materials",
  "Physics Resources",
  "Chemistry Resources",
  "Mathematics Resources",
  "Previous Year Questions",
  "Mock Tests",
];

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

export default function StudyMaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const { data: allMaterials = [] } = trpc.studyMaterials.getAll.useQuery();
  const { data: popularMaterials = [] } = trpc.studyMaterials.getPopular.useQuery();

  const filteredMaterials = useMemo(() => {
    return allMaterials.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.author?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || material.category === selectedCategory;
      const matchesSubject = !selectedSubject || material.subject === selectedSubject;

      return matchesSearch && matchesCategory && matchesSubject;
    });
  }, [allMaterials, searchQuery, selectedCategory, selectedSubject]);

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "googleDrive":
        return "📁";
      case "telegram":
        return "📱";
      case "website":
        return "🌐";
      case "pdf":
        return "📄";
      case "video":
        return "🎥";
      default:
        return "📚";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Study Materials</h1>
          <p className="text-gray-600">
            Access comprehensive JEE preparation resources curated from top coaching institutes
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search materials, authors, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter by Category
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Filter by Subject</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSubject === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubject(null)}
                >
                  All Subjects
                </Button>
                {SUBJECTS.map((subject) => (
                  <Button
                    key={subject}
                    variant={selectedSubject === subject ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Materials ({filteredMaterials.length})</TabsTrigger>
            <TabsTrigger value="popular">Popular ({popularMaterials.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredMaterials.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500">No materials found matching your criteria</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((material) => (
                  <Card key={material.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                          {material.author && (
                            <CardDescription className="text-sm mt-1">
                              by {material.author}
                            </CardDescription>
                          )}
                        </div>
                        <span className="text-2xl">{getResourceTypeIcon(material.resourceType)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {material.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{material.category}</Badge>
                        {material.subject && <Badge variant="outline">{material.subject}</Badge>}
                        {material.difficulty && (
                          <Badge className={getDifficultyColor(material.difficulty)}>
                            {material.difficulty}
                          </Badge>
                        )}
                      </div>

                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <a href={material.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Access Resource
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            {popularMaterials.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500">No popular materials yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularMaterials.map((material) => (
                  <Card key={material.id} className="hover:shadow-lg transition-shadow border-2 border-yellow-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                            <Badge className="bg-yellow-500 text-white">⭐ Popular</Badge>
                          </div>
                          {material.author && (
                            <CardDescription className="text-sm mt-1">
                              by {material.author}
                            </CardDescription>
                          )}
                        </div>
                        <span className="text-2xl">{getResourceTypeIcon(material.resourceType)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {material.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{material.category}</Badge>
                        {material.subject && <Badge variant="outline">{material.subject}</Badge>}
                        {material.difficulty && (
                          <Badge className={getDifficultyColor(material.difficulty)}>
                            {material.difficulty}
                          </Badge>
                        )}
                      </div>

                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <a href={material.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Access Resource
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
