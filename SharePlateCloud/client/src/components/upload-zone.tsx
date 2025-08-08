import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { CloudUpload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FileProgress from "./file-progress";
import UploadSuccess from "./upload-success";

interface UploadedFile {
  id: string;
  originalName: string;
  shareCode: string;
  shareLink: string;
  fileSize: number;
}

export default function UploadZone() {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFiles(data.files);
      setUploadingFiles([]);
      setUploadProgress({});
      toast({
        title: "Upload successful",
        description: `${data.files.length} file(s) uploaded successfully`,
      });
    },
    onError: (error) => {
      setUploadingFiles([]);
      setUploadProgress({});
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file sizes
    const invalidFiles = acceptedFiles.filter(file => file.size > 2 * 1024 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Some files exceed the 2GB limit and were not uploaded",
        variant: "destructive",
      });
    }

    const validFiles = acceptedFiles.filter(file => file.size <= 2 * 1024 * 1024 * 1024);
    if (validFiles.length === 0) return;

    setUploadingFiles(validFiles);
    setUploadedFiles([]);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        validFiles.forEach(file => {
          const currentProgress = newProgress[file.name] || 0;
          if (currentProgress < 90) {
            newProgress[file.name] = Math.min(currentProgress + Math.random() * 20, 90);
          }
        });
        return newProgress;
      });
    }, 500);

    uploadMutation.mutate(validFiles);

    // Clean up interval when upload completes
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        validFiles.forEach(file => {
          newProgress[file.name] = 100;
        });
        return newProgress;
      });
    }, 2000);
  }, [toast, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
  });

  const handleUploadMore = () => {
    setUploadedFiles([]);
    setUploadingFiles([]);
    setUploadProgress({});
  };

  if (uploadedFiles.length > 0) {
    return <UploadSuccess files={uploadedFiles} onUploadMore={handleUploadMore} />;
  }

  if (uploadingFiles.length > 0) {
    return <FileProgress files={uploadingFiles} progress={uploadProgress} />;
  }

  return (
    <Card className="border-2 border-dashed border-slate-300 hover:border-brand-blue transition-colors">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`text-center cursor-pointer ${
            isDragActive ? "bg-blue-50" : ""
          }`}
        >
          <input {...getInputProps()} />
          <div className="mx-auto h-16 w-16 text-slate-400 mb-4">
            <CloudUpload className="w-full h-full" />
          </div>
          <div className="flex justify-center text-lg text-slate-600">
            <span className="font-medium text-brand-blue hover:text-brand-blue-dark">
              Choose files to upload
            </span>
            <span className="ml-1">or drag and drop</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Maximum file size: 2GB each • Multiple files supported
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
