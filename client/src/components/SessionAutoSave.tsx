import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SessionData {
  materialId: string;
  materialTitle: string;
  startTime: number;
  lastSavedTime: number;
  completionPercentage: number;
  notes: string;
}

/**
 * SessionAutoSave Component
 * Automatically saves study session progress at regular intervals
 * Allows users to resume sessions from where they left off
 */
export function useSessionAutoSave(materialId: string, materialTitle: string) {
  const { user } = useAuth();
  const sessionRef = useRef<SessionData | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  // tRPC mutations and queries for saving sessions
  const saveSessionMutation = trpc.sessions.save.useMutation({
    onSuccess: () => {
      // Silent save - no toast to avoid interrupting user
    },
    onError: (error: any) => {
      console.error("Failed to save session:", error);
    },
  });

  const { data: lastSessionData } = trpc.sessions.getLastSession.useQuery(
    { materialId },
    { enabled: !!user && !!materialId }
  );

  // Initialize session
  useEffect(() => {
    if (!user || !materialId) return;

    // Load last session if exists
    if (lastSessionData && lastSessionData.completionPercentage > 0) {
      sessionRef.current = {
        materialId,
        materialTitle,
        startTime: Date.now(),
        lastSavedTime: Date.now(),
        completionPercentage: lastSessionData.completionPercentage || 0,
        notes: lastSessionData.notes || "",
      };
      setCompletionPercentage(lastSessionData.completionPercentage || 0);
      toast.success(`Resumed: ${materialTitle} (${lastSessionData.completionPercentage}% complete)`);
    } else {
      // Start new session
      sessionRef.current = {
        materialId,
        materialTitle,
        startTime: Date.now(),
        lastSavedTime: Date.now(),
        completionPercentage: 0,
        notes: "",
      };
    }
  }, [user, materialId, materialTitle, lastSessionData]);

  // Auto-save session every 30 seconds
  useEffect(() => {
    if (!user || !sessionRef.current) return;

    saveIntervalRef.current = setInterval(() => {
      if (sessionRef.current) {
        const now = Date.now();
        const sessionDuration = Math.floor((now - sessionRef.current.startTime) / 1000); // in seconds

        saveSessionMutation.mutate({
          userId: user.id,
          materialId: sessionRef.current.materialId,
          materialTitle: sessionRef.current.materialTitle,
          completionPercentage: sessionRef.current.completionPercentage,
          sessionDuration,
          notes: sessionRef.current.notes,
        });

        sessionRef.current.lastSavedTime = now;
      }
    }, 30000); // Save every 30 seconds

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [user]);

  // Track session time
  useEffect(() => {
    if (!sessionRef.current) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionRef.current!.startTime) / 1000);
      setSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionRef.current && user) {
        const sessionDuration = Math.floor((Date.now() - sessionRef.current.startTime) / 1000);
        
        // Use sendBeacon for reliable saving on page unload
        const data = JSON.stringify({
          userId: user.id,
          materialId: sessionRef.current.materialId,
          materialTitle: sessionRef.current.materialTitle,
          completionPercentage: sessionRef.current.completionPercentage,
          sessionDuration: sessionDuration,
          notes: sessionRef.current.notes,
        });

        const blob = new Blob([data], { type: "application/json" });
        navigator.sendBeacon("/api/trpc/sessions.save", blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  // Update completion percentage
  const updateCompletion = (percentage: number) => {
    if (sessionRef.current) {
      sessionRef.current.completionPercentage = Math.min(100, Math.max(0, percentage));
      setCompletionPercentage(sessionRef.current.completionPercentage);
    }
  };

  // Update notes
  const updateNotes = (notes: string) => {
    if (sessionRef.current) {
      sessionRef.current.notes = notes;
    }
  };

  // Format session time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return {
    completionPercentage,
    sessionTime,
    formattedTime: formatTime(sessionTime),
    updateCompletion,
    updateNotes,
  };
}

/**
 * Component to display session progress and auto-save status
 */
export function SessionProgressBar({ completionPercentage, sessionTime }: { completionPercentage: number; sessionTime: number }) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Study Progress</span>
        <span className="text-xs text-gray-600">Session Time: {formatTime(sessionTime)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-600">{completionPercentage}% Complete</span>
        <span className="text-xs text-green-600">✓ Auto-saving...</span>
      </div>
    </div>
  );
}
