import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, Star, Download, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface StudyResource {
  id: number;
  title: string;
  description: string | null;
  url: string;
  resourceType: string;
  subject: string | null;
  class: string | null;
  difficulty: string | null;
  platform: string | null;
  isFree: boolean | null;
  rating: number | string | null;
  reviewCount: number | null;
  accessCount: number | null;
  isVerified: boolean | null;
}

export default function StudyResourcesBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // Fetch resources based on filters
  const { data: resources = [], isLoading } = trpc.internetStudyResources.getAll.useQuery(
    {
      resourceType: selectedType !== "all" ? selectedType : undefined,
      subject: selectedSubject !== "all" ? selectedSubject : undefined,
      isFree: showFreeOnly ? true : undefined,
      limit: 50,
    },
    { enabled: !searchQuery }
  );

  // Search resources
  const { data: searchResults = [] } = trpc.internetStudyResources.search.useQuery(
    { query: searchQuery, limit: 50 },
    { enabled: searchQuery.length > 2 }
  );

  const incrementAccessMutation = trpc.internetStudyResources.incrementAccess.useMutation();

  const displayResources = searchQuery.length > 2 ? searchResults : resources;

  const resourceTypes = [
    { value: "website", label: "Websites", icon: "🌐" },
    { value: "youtube", label: "YouTube", icon: "▶️" },
    { value: "pdf", label: "PDFs", icon: "📄" },
    { value: "mockTest", label: "Mock Tests", icon: "📝" },
    { value: "pyq", label: "Previous Year Q", icon: "📚" },
    { value: "book", label: "Books", icon: "📖" },
    { value: "course", label: "Courses", icon: "🎓" },
    { value: "community", label: "Communities", icon: "👥" },
  ];

  const subjects = [
    { value: "Physics", label: "Physics" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Mathematics", label: "Mathematics" },
  ];

  const getResourceIcon = (type: string) => {
    const typeObj = resourceTypes.find((t) => t.value === type);
    return typeObj?.icon || "📚";
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

  const handleResourceClick = (resourceId: number, url: string) => {
    incrementAccessMutation.mutate({ resourceId });
    window.open(url, "_blank");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Study Resources</h2>
        <p className="text-sm text-muted-foreground">
          Access curated study materials, YouTube channels, mock tests, and more for JEE and board exams
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Resource Type Filter */}
        <div>
          <p className="text-sm font-semibold mb-2">Resource Type</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              All Resources
            </Button>
            {resourceTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
              >
                {type.icon} {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <p className="text-sm font-semibold mb-2">Subject</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSubject === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject("all")}
            >
              All Subjects
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject.value}
                variant={selectedSubject === subject.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject.value)}
              >
                {subject.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Free Only Filter */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="freeOnly"
            checked={showFreeOnly}
            onChange={(e) => setShowFreeOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="freeOnly" className="text-sm cursor-pointer">
            Free Resources Only
          </label>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading resources...</div>
        ) : displayResources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No resources found. Try adjusting your filters.
          </div>
        ) : (
          displayResources.map((resource: StudyResource) => (
            <Card
              key={resource.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleResourceClick(resource.id, resource.url)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getResourceIcon(resource.resourceType)}</span>
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {resource.title}
                    </h3>
                    {resource.isVerified && (
                      <Badge variant="secondary" className="ml-auto">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>

                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {resource.subject && (
                      <Badge variant="outline" className="text-xs">
                        {resource.subject}
                      </Badge>
                    )}
                    {resource.class && (
                      <Badge variant="outline" className="text-xs">
                        {resource.class}
                      </Badge>
                    )}
                    {resource.difficulty && (
                      <Badge className={`text-xs ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </Badge>
                    )}
                    {resource.isFree && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Free
                      </Badge>
                    )}
                    {resource.platform && (
                      <Badge variant="outline" className="text-xs">
                        {resource.platform}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                    {resource.rating && Number(resource.rating) > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{Number(resource.rating).toFixed(1)}</span>
                        {resource.reviewCount && resource.reviewCount > 0 && (
                          <span>({resource.reviewCount} reviews)</span>
                        )}
                      </div>
                    )}
                    {resource.accessCount && resource.accessCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{resource.accessCount} accessed</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResourceClick(resource.id, resource.url);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Results Count */}
      {displayResources.length > 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          Showing {displayResources.length} resources
        </div>
      )}
    </div>
  );
}
