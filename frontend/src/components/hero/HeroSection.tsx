"use client";

import { useState } from "react";
import { BookOpen, Upload, Loader2, FileText } from "lucide-react";
import { api } from "@/lib/api";

interface HeroSectionProps {
  onUpload: (paper: any, fileUrl: string) => void;
}

export default function HeroSection({ onUpload }: HeroSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: any) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      // Upload to backend
      const response = await api.uploadPaper(formData);
      
      // Create local URL for PDF viewing
      const fileUrl = URL.createObjectURL(file);
      
      onUpload(response.paper, fileUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || "Failed to upload paper");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Research Assistant
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Upload a research paper and let AI extract summaries, citations, and
            insights.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="relative">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 bg-white shadow-lg transition-all ${
              dragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300"
            } ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleChange}
              disabled={uploading}
            />

            <div className="flex flex-col items-center space-y-4">
              {uploading ? (
                <>
                  <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
                  <p className="text-lg font-semibold text-slate-700">
                    Processing your paper...
                  </p>
                  <p className="text-sm text-slate-500">
                    This may take a minute while we analyze the content
                  </p>
                </>
              ) : (
                <>
                  {dragActive ? (
                    <FileText className="w-16 h-16 text-blue-600" />
                  ) : (
                    <Upload className="w-16 h-16 text-blue-600" />
                  )}

                  <p className="text-xl font-semibold text-slate-700">
                    {dragActive ? "Drop your PDF here" : "Upload Research Paper"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Drag and drop or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}