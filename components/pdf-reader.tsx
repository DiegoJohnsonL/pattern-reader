"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CounterCard } from "@/components/counter-card";
import { useLocalStorage } from "usehooks-ts";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Counter {
  id: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PdfReaderProps {
  file: File;
  onClose: () => void;
}

export function PdfReader({ file, onClose }: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageWidth, setPageWidth] = useState<number>(0);

  // Counter state with localStorage persistence
  const [counters, setCounters] = useLocalStorage<Counter[]>(
    `counters-${file.name}`,
    []
  );

  useState(() => {
    const updateWidth = () => {
      const width = Math.min(window.innerWidth * 0.8, 800);
      setPageWidth(width);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useState(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  });

  // Counter management functions
  const addCounter = () => {
    const newCounter: Counter = {
      id: `counter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      value: 0,
      x: Math.max(50, window.innerWidth / 2 - 96 + counters.length * 20),
      y: Math.max(100, window.innerHeight / 2 - 80 + counters.length * 20),
      width: 192,
      height: 160,
    };
    setCounters([...counters, newCounter]);
  };

  const updateCounter = (id: string, updates: Partial<Counter>) => {
    setCounters(
      counters.map((counter) =>
        counter.id === id ? { ...counter, ...updates } : counter
      )
    );
  };

  const removeCounter = (id: string) => {
    setCounters(counters.filter((counter) => counter.id !== id));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Controls */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="flex items-center justify-between p-3 md:p-4 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 rounded-xl hover:bg-secondary"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close reader</span>
            </Button>
            <h2 className="text-sm md:text-base font-medium truncate text-foreground">
              {file.name}
            </h2>
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={scale <= 0.6}
              className="rounded-xl hover:bg-secondary"
            >
              <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
              <span className="sr-only">Zoom out</span>
            </Button>
            <span className="text-xs md:text-sm font-medium text-muted-foreground min-w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={scale >= 2.5}
              className="rounded-xl hover:bg-secondary"
            >
              <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
              <span className="sr-only">Zoom in</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="rounded-xl hover:bg-secondary"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
              <span className="sr-only">Download PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={addCounter}
              className="rounded-xl hover:bg-secondary"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="sr-only">Add Counter</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="rounded-xl hover:bg-secondary"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
              )}
              <span className="sr-only">Toggle fullscreen</span>
            </Button>
          </div>
        </div>
      </header>

      {/* PDF Document Container - Infinite Scroll */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col items-center py-4 md:py-8 px-2 md:px-4 gap-4 md:gap-6">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground">
                    Loading your cozy document...
                  </p>
                </div>
              </div>
            }
            error={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-2">
                  <p className="text-destructive font-medium">
                    Failed to load PDF
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please try uploading a different file
                  </p>
                </div>
              </div>
            }
            className="w-full"
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="mb-4 md:mb-6 last:mb-0 flex justify-center"
              >
                <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    width={pageWidth || 800}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="flex items-center justify-center min-h-[400px] bg-muted/20">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    }
                    className="max-w-full"
                  />
                </div>
              </div>
            ))}
          </Document>
        </div>
      </div>

      {/* Floating Counter Cards */}
      {counters.map((counter) => (
        <CounterCard
          key={counter.id}
          counter={counter}
          onUpdate={updateCounter}
          onRemove={removeCounter}
        />
      ))}
    </div>
  );
}
