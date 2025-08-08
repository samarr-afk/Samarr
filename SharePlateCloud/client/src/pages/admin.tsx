import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  LogOut, 
  Files, 
  HardDrive, 
  Upload, 
  Link2, 
  Eye, 
  Trash2, 
  Copy,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("POST", "/api/admin/login", { password });
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid password",
        variant: "destructive",
      });
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const { data: filesData } = useQuery({
    queryKey: ["/api/admin/files"],
    enabled: isAuthenticated,
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/files/${fileId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "File deleted",
        description: "File has been successfully deleted",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(password);
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Copied to clipboard",
        description: "Link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTotalStorage = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(1) + ' GB';
  };

  const filteredFiles = (filesData?.files || []).filter((file: any) =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.shareCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-brand-blue hover:text-brand-blue-dark">
              SharePlate
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">Admin Access</h2>
            <p className="text-slate-600 mt-2">Enter admin password to continue</p>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-brand-blue hover:bg-brand-blue-dark"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Access Admin Panel"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-brand-blue hover:text-brand-blue-dark">
              SharePlate
            </Link>
            <Button
              variant="ghost"
              onClick={() => setIsAuthenticated(false)}
              className="text-slate-600 hover:text-slate-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
            <p className="text-slate-600 mt-1">Manage uploaded files and view statistics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Files</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.totalFiles ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Files className="h-6 w-6 text-brand-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Storage</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatTotalStorage(stats?.totalStorage ?? 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="h-6 w-6 text-brand-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Today's Uploads</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.todayUploads ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Links</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.activeLinks ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Link2 className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files Table */}
        <Card>
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Uploaded Files</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Share Code</TableHead>
                  <TableHead>Share Link</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file: any) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Files className="h-4 w-4 text-slate-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {file.originalName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {file.mimeType}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {file.shareCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500 font-mono truncate max-w-xs">
                          {file.shareLink}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(file.shareLink)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatFileSize(file.fileSize)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(file.shareLink)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFileMutation.mutate(file.id)}
                          disabled={deleteFileMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
}
