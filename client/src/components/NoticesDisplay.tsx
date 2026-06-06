import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Megaphone, Zap, Calendar } from "lucide-react";

type NoticeType = "announcement" | "important" | "update" | "event";

interface Notice {
  id: number;
  title: string;
  content: string;
  type: NoticeType | null;
  priority: number | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean | null;
  createdBy: number;
}

const getNoticeIcon = (type: NoticeType | null) => {
  switch (type) {
    case "important":
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case "announcement":
      return <Megaphone className="w-5 h-5 text-blue-600" />;
    case "update":
      return <Zap className="w-5 h-5 text-yellow-600" />;
    case "event":
      return <Calendar className="w-5 h-5 text-purple-600" />;
    default:
      return <Megaphone className="w-5 h-5 text-gray-600" />;
  }
};

const getNoticeColor = (type: NoticeType | null) => {
  switch (type) {
    case "important":
      return "bg-red-50 border-red-200";
    case "announcement":
      return "bg-blue-50 border-blue-200";
    case "update":
      return "bg-yellow-50 border-yellow-200";
    case "event":
      return "bg-purple-50 border-purple-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getNoticeBadgeColor = (type: NoticeType | null) => {
  switch (type) {
    case "important":
      return "bg-red-100 text-red-800";
    case "announcement":
      return "bg-blue-100 text-blue-800";
    case "update":
      return "bg-yellow-100 text-yellow-800";
    case "event":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function NoticesDisplay() {
  const { data: notices, isLoading, error } = trpc.notices.getActive.useQuery();
  const [displayNotices, setDisplayNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (notices) {
      setDisplayNotices(notices);
    }
  }, [notices]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Notices & Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            Failed to Load Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700">
            Unable to load notices at this time. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Empty state - don't show card if there are no notices
  if (!displayNotices || displayNotices.length === 0) {
    return null;
  }

  // Display notices
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Notices & Announcements
        </CardTitle>
        <CardDescription>Latest updates and important information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayNotices.slice(0, 5).map((notice) => (
            <div
              key={notice.id}
              className={`border-l-4 rounded-lg p-4 ${getNoticeColor(notice.type)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getNoticeIcon(notice.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 break-words">
                        {notice.title}
                      </h4>
                      <Badge className={`text-xs capitalize ${getNoticeBadgeColor(notice.type)}`}>
                        {notice.type || "announcement"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {notice.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notice.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {displayNotices.length > 5 && (
            <p className="text-sm text-gray-500 text-center pt-2">
              +{displayNotices.length - 5} more notices
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
