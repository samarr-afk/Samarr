import { useState, useEffect } from "react";
import { Files } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FileProgressProps {
  files: File[];
  progress: Record<string, number>; // target progress values
}

export default function FileProgress({ files, progress }: FileProgressProps) {
  const [displayProgress, setDisplayProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const updated: Record<string, number> = { ...prev };

        for (const file of files) {
          const target = progress[file.name] || 0;
          let current = updated[file.name] || 0;

          if (current < target) {
            let increment;

            if (current < 50) {
              // Fast start
              increment = Math.random() * 2 + 1; // 1–3%
            } else if (current < 90) {
              // Moderate speed
              increment = Math.random() * 1.5 + 0.5; // 0.5–2%
            } else {
              // Very slow near the end
              increment = Math.random() * 0.5 + 0.1; // 0.1–0.6%
            }

            // Random small pauses (like network hiccups)
            if (Math.random() < 0.05) increment = 0;

            updated[file.name] = Math.min(current + increment, target);
          }
        }

        return updated;
      });
    }, 150); // update frequency

    return () => clearInterval(interval);
  }, [progress, files]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Files className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32">
                  <Progress
                    value={displayProgress[file.name] || 0}
                    className="h-2"
                  />
                </div>
                <span className="text-sm font-medium text-slate-600 w-12">
                  {Math.round(displayProgress[file.name] || 0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}