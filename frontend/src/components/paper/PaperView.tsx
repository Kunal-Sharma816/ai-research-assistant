"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface PaperViewProps {
  fileUrl?: string;
}

export default function PaperView({ fileUrl }: PaperViewProps) {
  return (
    <Card className="shadow-md border rounded-xl p-4 h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center gap-2">
        <FileText className="w-5 h-5" />
        <CardTitle className="text-xl font-semibold">Paper Viewer</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 border rounded-lg overflow-hidden bg-gray-100">
        {fileUrl ? (
          <iframe
            src={fileUrl}
            className="w-full h-full rounded-lg"
            title="PDF Viewer"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No PDF uploaded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
