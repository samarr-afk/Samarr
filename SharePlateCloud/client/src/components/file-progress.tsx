import { Files } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";

interface FileProgressProps {
  files: File[];
  progress: Record<string, number>;
}

interface SpeedData {
  startTime: number;
  lastLoaded: number;
  speedMBps: number;
  timeRemaining: string;
}

export default function FileProgress({ files, progress }: FileProgressProps) {
  const [speedInfo, setSpeedInfo] = useState<Record<string, SpeedData>>({});
  const fileSizesRef = useRef<Record<string, number>>({});

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    files.forEach(file => {
      if (!speedInfo[file.name]) {
        fileSizesRef.current[file.name] = file.size;
        setSpeedInfo(prev => ({
          ...prev,
          [file.name]: {
            startTime: Date.now(),
            lastLoaded: 0,
            speedMBps: 0,
            timeRemaining: "--:--",
          }
        }));
      } else {
        const totalSize = fileSizesRef.current[file.name] || file.size;
        const uploadedPercent = progress[file.name] || 0;
        const uploadedBytes = (uploadedPercent / 100) * totalSize;
        const elapsedSeconds = (Date.now() - speedInfo[file.name].startTime) / 1000;
        const speedMBps = uploadedBytes / (1024 * 1024) / elapsedSeconds;

        let timeRemaining = "--:--";
        if (speedMBps > 0) {
          const remainingBytes = totalSize - uploadedBytes;
          const remainingSeconds = remainingBytes / (speedMBps * 1024 * 1024);
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = Math.floor(remainingSeconds % 60);
          timeRemaining = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }

        setSpeedInfo(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            speedMBps,
            timeRemaining
          }
        }));
      }
    });
  }, [progress, files]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Files className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {speedInfo[file.name]?.speedMBps.toFixed(2) || 0} MB/s • ETA:{" "}
                    {speedInfo[file.name]?.timeRemaining || "--:--"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32">
                  <Progress value={progress[file.name] || 0} className="h-2" />
                </div>
                <span className="text-sm font-medium text-slate-600 w-12">
                  {Math.round(progress[file.name] || 0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}