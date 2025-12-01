"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface CitationGeneratorProps {
  paperId: string;
  paperData: {
    title: string;
    authors: string[];
  };
}

export default function CitationGenerator({ paperId, paperData }: CitationGeneratorProps) {
  const [citation, setCitation] = useState("");
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<string>("apa");
  const [loading, setLoading] = useState(false);

  const generateCitation = async (selectedStyle: string) => {
    setLoading(true);
    setStyle(selectedStyle);

    try {
      const response = await api.generateCitation(paperId, selectedStyle);
      setCitation(response.citation);
    } catch (error) {
      console.error("Citation generation error:", error);
      setCitation("Failed to generate citation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!citation) return;
    
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-md border rounded-xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Citation Generator
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Style Selector */}
        <div className="grid grid-cols-2 gap-2">
          {["apa", "mla", "ieee", "chicago", "bibtex"].map((s) => (
            <button
              key={s}
              onClick={() => generateCitation(s)}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                style === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Citation Display */}
        <div className="relative">
          <textarea
            className="border p-3 rounded-lg w-full h-32 text-sm bg-gray-50 resize-none"
            readOnly
            value={loading ? "Generating citation..." : citation || "Select a citation style above"}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={!citation || loading}
          className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy Citation"}
        </button>
      </CardContent>
    </Card>
  );
}