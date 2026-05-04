import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export function StudyMaterialsPreview() {
  const [, navigate] = useLocation();
  const { data: materials, isLoading } = trpc.studyMaterials.getPopular.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const displayMaterials = materials?.slice(0, 6) || [];

  if (!materials) {
    return null;
  }

  return (
    <Card className="border-blue-200 hover:shadow-lg transition">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <CardTitle>Study Materials</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/study-materials")}
            className="text-blue-600 hover:text-blue-700"
          >
            View All →
          </Button>
        </div>
        <CardDescription>Popular JEE preparation resources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayMaterials.length > 0 ? (
            displayMaterials.map((material) => (
              <div
                key={material.id}
                className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {material.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {material.author} • {material.category}
                    </p>
                    {material.subject && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {material.subject}
                        </span>
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          {material.difficulty}
                        </span>
                      </div>
                    )}
                  </div>
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">No materials available yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
