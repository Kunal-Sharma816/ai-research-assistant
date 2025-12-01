"use client";

import React, { useState } from "react";
import HeroSection from "@/components/hero/HeroSection";
import PaperView from "@/components/paper/PaperView";
import PaperSummary from "@/components/paper/PaperSummary";
import ChatInterface from "@/components/paper/ChatInterface";
import RelatedPapers from "@/components/paper/RelatedPapers";
import CitationGenerator from "@/components/paper/CitationGenerator";

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  summary: string;
  keywords: string[];
  relatedPapers: any[];
}

export default function Page() {
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handlePaperUpload = (paper: Paper, fileUrl: string) => {
    setCurrentPaper(paper);
    setPdfUrl(fileUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {!currentPaper ? (
        <HeroSection onUpload={handlePaperUpload} />
      ) : (
        <div className="p-6 flex flex-col gap-10">
          {/* Main 3-column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <PaperView fileUrl={pdfUrl ?? undefined} />
              <PaperSummary 
                summary={currentPaper.summary}
                title={currentPaper.title}
                authors={currentPaper.authors}
                keywords={currentPaper.keywords}
              />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <ChatInterface paperId={currentPaper.id} />
              <RelatedPapers papers={currentPaper.relatedPapers} />
              <CitationGenerator paperId={currentPaper.id} paperData={currentPaper} />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setCurrentPaper(null);
                setPdfUrl(null);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Upload New Paper
            </button>
          </div>
        </div>
      )}
    </div>
  );
}