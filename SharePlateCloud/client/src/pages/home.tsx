import { useState } from "react";
import { Link } from "wouter";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadZone from "@/components/upload-zone";
import FileRetrieve from "@/components/file-retrieve";

export default function Home() {
  const [activeSection, setActiveSection] =
    useState<"upload" | "retrieve">("upload");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setActiveSection("upload")}
                className="text-2xl font-bold text-brand-blue hover:text-brand-blue-dark transition-colors"
              >
                SharePlate
              </button>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <span className="text-slate-600 text-sm">
                    Secure file sharing made simple
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={activeSection === "retrieve" ? "default" : "ghost"}
                onClick={() => setActiveSection("retrieve")}
                className="text-slate-600 hover:text-brand-blue transition-colors"
                type="button"
              >
                <Download className="h-4 w-4 mr-2" />
                Retrieve Files
              </Button>

              <Link href="/admin">
                <Button
                  className="bg-brand-blue text-white hover:bg-brand-blue-dark"
                  type="button"
                >
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeSection === "upload" ? (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Share Your Files Securely
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Upload files up to 2GB each and share them instantly with a
                simple link or code. No registration required.
              </p>
            </div>
            <UploadZone />
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Retrieve Your Files
              </h2>
              <p className="text-xl text-slate-600">
                Enter a share link or 6-character code to access your files
              </p>
            </div>
            <FileRetrieve />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-xs text-slate-400 mt-2">
              SharePlate - Secure file sharing platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeSection === "upload" ? (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Share Your Files Securely
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Upload files up to 2GB each and share them instantly with a
                simple link or code. No registration required.
              </p>
            </div>
            <UploadZone />
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Retrieve Your Files
              </h2>
            <p className="text-xl text-slate-600">
                Enter a share link or 6-character code to access your files
              </p>
            </div>
            <FileRetrieve />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-xs text-slate-400 mt-2">
              SharePlate - Secure file sharing platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
