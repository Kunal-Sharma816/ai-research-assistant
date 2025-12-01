"use client";

import React, { useRef, useState } from "react";
import { Upload, FileUp, Loader2 } from "lucide-react";

interface PDFUploaderProps {
  onUpload: (url: string) => void;
}

export default function PDFUploader({ onUpload }: PDFUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }

    setLoading(true);
    setFileName(file.name);

    const url = URL.createObjectURL(file);

    setTimeout(() => {
      setLoading(false);
      onUpload(url);
    }, 800);
  };

  return (
    <div className="border-2 border-dashed border-gray-400 p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      {!loading ? (
        <>
          <Upload className="w-10 h-10 text-gray-500 mb-2" />
          <p className="text-gray-600">Click or drag & drop to upload PDF</p>

          {fileName && (
            <p className="mt-2 text-sm text-blue-600 font-medium">{fileName}</p>
          )}

          <button
            onClick={() => inputRef.current?.click()}
            className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <FileUp className="w-4 h-4" />
            Choose File
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
}
