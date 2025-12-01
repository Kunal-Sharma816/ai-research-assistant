"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface RelatedPaper {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  year: number;
}

interface RelatedPapersProps {
  papers: RelatedPaper[];
}

export default function RelatedPapers({ papers }: RelatedPapersProps) {
  if (!papers || papers.length === 0) {
    return (
      <Card className="shadow-md border rounded-xl p-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Related Papers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No related papers found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border rounded-xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Related Papers
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {papers.slice(0, 5).map((paper, i) => (
          <a
            key={i}
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1 border p-3 rounded-lg hover:bg-gray-50 transition group"
          >
            <div className="flex justify-between items-start gap-2">
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                {paper.title}
              </h4>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
            </div>
            
            <p className="text-xs text-gray-500">
              {paper.authors.slice(0, 3).join(", ")}
              {paper.authors.length > 3 && ", et al."}
            </p>
            
            {paper.year && (
              <p className="text-xs text-gray-400">{paper.year}</p>
            )}
          </a>
        ))}
      </CardContent>
    </Card>
  );
}