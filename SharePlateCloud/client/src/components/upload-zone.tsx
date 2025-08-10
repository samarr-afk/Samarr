import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import UploadSuccess from "./upload-success";
import FileProgress from "./file-progress";

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

  // For aborting upload progress simulation on unmount or new uploads
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Here, fetch without progress events; so simulate progress in UI
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

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    },
    onError: (error) => {
      setUploadingFiles([]);
      setUploadProgress({});
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Filter invalid files (> 2GB)
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
      setUploadProgress({});

      // Simulate upload progress for better UX — since fetch API does not support progress events natively
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      progressTimerRef.current = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress: Record<string, number> = {...prev};
          validFiles.forEach(file => {
            const current = newProgress[file.name] || 0;
            if (current < 95) {
              // increase by random 5-10%
              newProgress[file.name] = Math.min(current + 5 + Math.random() * 5, 95);
            }
          });
          return newProgress;
        });
      }, 500);

      uploadMutation.mutate(validFiles);

      // Force progress to 100% after 20 seconds max (fallback)
      setTimeout(() => {
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          setUploadProgress(prev => {
            const newProgress: Record<string, number> = {...prev};
            validFiles.forEach(file => (newProgress[file.name] = 100));
            return newProgress;
          });
        }
      }, 20000);
    },
    [toast, uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 2 * 1024 * 1024 * 1024,
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
          className={`text-center cursor-pointer select-none ${
            isDragActive ? "bg-blue-50" : ""
          }`}
          style={{ userSelect: "none" }}
        >
          <input {...getInputProps()} />
          <div className="mx-auto h-16 w-16 text-slate-400 mb-4">
            <CloudUpload className="w-full h-full" />
          </div>
          <div className="flex justify-center text-lg text-slate-600">
            <button
              type="button"
              onClick={(e) => {
                // Open file dialog programmatically by clicking hidden input
                e.stopPropagation();
                // useRef is possible, but useDropzone provides open()
                openFileDialog();
              }}
              className="font-medium text-brand-blue hover:text-brand-blue-dark underline"
            >
              Choose files to upload
            </button>
            <span className="ml-1"> or drag and drop</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Maximum file size: 2GB each • Multiple files supported
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // open() method is exposed by useDropzone to open dialog programmatically
  function openFileDialog() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getInputProps().ref as any)?.current?.click();
  }
}