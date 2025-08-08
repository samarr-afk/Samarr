import { useState } from "react";
import { CheckCircle, Link2, Key, Copy, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  originalName: string;
  shareCode: string;
  shareLink: string;
  fileSize: number;
}

interface UploadSuccessProps {
  files: UploadedFile[];
  onUploadMore: () => void;
}

export default function UploadSuccess({ files, onUploadMore }: UploadSuccessProps) {
  const { toast } = useToast();

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type} has been copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // For multiple files, show the first file's sharing options prominently
  const primaryFile = files[0];

  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 text-brand-green mb-4">
            <CheckCircle className="w-full h-full" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Files Uploaded Successfully!
          </h3>
          <p className="text-slate-600">
            {files.length === 1 
              ? "Your file is now ready to share" 
              : `Your ${files.length} files are now ready to share`
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Shareable Link */}
          <div className="bg-slate-50 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
              <Link2 className="h-5 w-5 text-brand-blue mr-2" />
              Shareable Link
            </h4>
            <div className="flex items-center space-x-2">
              <Input
                value={primaryFile.shareLink}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                size="sm"
                onClick={() => handleCopy(primaryFile.shareLink, "Link")}
                className="bg-brand-blue hover:bg-brand-blue-dark"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 6-Character Code */}
          <div className="bg-slate-50 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
              <Key className="h-5 w-5 text-brand-green mr-2" />
              Share Code
            </h4>
            <div className="flex items-center space-x-2">
              <Input
                value={primaryFile.shareCode}
                readOnly
                className="flex-1 text-lg font-mono text-center tracking-widest"
              />
              <Button
                size="sm"
                onClick={() => handleCopy(primaryFile.shareCode, "Code")}
                className="bg-brand-green hover:bg-brand-green-dark"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Easy to share verbally or in text
            </p>
          </div>
        </div>

        {/* Multiple files list */}
        {files.length > 1 && (
          <div className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3">All Uploaded Files:</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-900">{file.originalName}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(file.shareCode, "Code")}
                    >
                      {file.shareCode}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(file.shareLink, "Link")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-200">
          <Button
            onClick={onUploadMore}
            variant="outline"
            className="bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload More Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
