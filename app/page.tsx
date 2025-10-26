"use client";

import type React from "react";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfReader } from "@/components/pdf-reader";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
  };

  if (pdfFile) {
    return <PdfReader file={pdfFile} onClose={handleReset} />;
  }

  return (
    <main className="h-screen flex items-center justify-center p-6 md:p-12 bg-paper relative overflow-hidden">
      <div className="w-full max-w-2xl space-y-12 text-center relative z-10">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-balance text-foreground tracking-tight leading-tight">
              Your Pattern Reading Space
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed max-w-xl mx-auto font-light">
              Upload your crochet, knitting, or craft pattern PDFs and enjoy
              them in a distraction-free, full-screen reading experience
              designed for makers
            </p>
          </div>
        </div>

        <div className="pt-8">
          <label htmlFor="pdf-upload">
            <div className="relative cursor-pointer">
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <Button
                size="lg"
                className="w-full max-w-sm h-14 text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                asChild
              >
                <span>
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Your PDF
                </span>
              </Button>
            </div>
          </label>
        </div>
      </div>
    </main>
  );
}
