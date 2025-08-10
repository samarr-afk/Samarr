import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const invalidFiles = acceptedFiles.filter(file => file.size > 2 * 1024 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Some files exceed the 2GB limit",
        variant: "destructive",
      });
    }

    const validFiles = acceptedFiles.filter(file => file.size <= 2 * 1024 * 1024 * 1024);
    if (validFiles.length === 0) return;

    setUploadingFiles(validFiles);
    setUploadedFiles([]);
    setUploadProgress({});

    validFiles.forEach(file => {
      const formData = new FormData();
      formData.append("files", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      // Track progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          setUploadedFiles(prev => [...prev, ...res.files]);
          toast({
            title: "Upload successful",
            description: `${file.name} uploaded successfully`,
          });
        } else {
          toast({
            title: "Upload failed",
            description: xhr.statusText || "Unknown error",
            variant: "destructive",
          });
        }
      };

      xhr.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Network error",
          variant: "destructive",
        });
      };

      xhr.send(formData);
    });
  }, [toast]);

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
        <div {...useDropzone({ onDrop, multiple: true, maxSize: 2 * 1024 * 1024 * 1024 }).getRootProps()} className="text-center cursor-pointer">
          <input {...useDropzone({ onDrop }).getInputProps()} />
          <div className="mx-auto h-16 w-16 text-slate-400 mb-4">
            <CloudUpload className="w-full h-full" />
          </div>
          <div className="flex justify-center text-lg text-slate-600">
            <span className="font-medium text-brand-blue hover:text-brand-blue-dark">Choose files to upload</span>
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