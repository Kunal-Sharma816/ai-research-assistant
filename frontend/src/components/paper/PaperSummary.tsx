"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Users, Tag } from "lucide-react";

interface PaperSummaryProps {
  summary: string;
  title: string;
  authors: string[];
  keywords: string[];
}

export default function PaperSummary({
  summary,
  title,
  authors,
  keywords,
}: PaperSummaryProps) {
  return (
    <Card className="shadow-md border rounded-xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Paper Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
        </div>

        {/* Authors */}
        {authors && authors.length > 0 && (
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Authors</p>
              <p className="text-sm text-gray-600">{authors.join(", ")}</p>
            </div>
          </div>
        )}

        {/* Keywords */}
        {keywords && keywords.length > 0 && (
          <div className="flex items-start gap-2">
            <Tag className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
          <div className="prose prose-sm max-w-none">
            <p className="leading-relaxed text-gray-700 whitespace-pre-line">
              {summary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}