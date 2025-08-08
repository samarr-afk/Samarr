import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Download, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RetrievedFile {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadLink: string;
}

export default function FileRetrieve() {
  const [identifier, setIdentifier] = useState("");
  const [retrievedFile, setRetrievedFile] = useState<RetrievedFile | null>(null);
  const { toast } = useToast();

  const retrieveMutation = useMutation({
    mutationFn: async (identifier: string) => {
      const response = await apiRequest("POST", "/api/retrieve", { identifier });
      return response.json();
    },
    onSuccess: (data) => {
      setRetrievedFile(data.file);
      toast({
        title: "File found",
        description: "File is ready for download",
      });
    },
    onError: (error) => {
      setRetrievedFile(null);
      toast({
        title: "File not found",
        description: error instanceof Error ? error.message : "Failed to retrieve file",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a share code or link",
        variant: "destructive",
      });
      return;
    }
    retrieveMutation.mutate(identifier.trim());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const handleDownload = () => {
    if (retrievedFile?.downloadLink) {
      window.open(retrievedFile.downloadLink, '_blank');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="retrieve-input" className="block text-sm font-medium text-slate-700 mb-2">
                Share Link or Code
              </label>
              <Input
                id="retrieve-input"
                type="text"
                placeholder="Paste link or enter 6-character code"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-blue hover:bg-brand-blue-dark"
              disabled={retrieveMutation.isPending}
            >
              <Search className="h-4 w-4 mr-2" />
              {retrieveMutation.isPending ? "Searching..." : "Retrieve Files"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Retrieved File Display */}
      {retrievedFile && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Available File</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Files className="h-6 w-6 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{retrievedFile.originalName}</p>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(retrievedFile.fileSize)} • Uploaded {formatDate(retrievedFile.uploadedAt)}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDownload}
                className="bg-brand-green hover:bg-brand-green-dark"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
