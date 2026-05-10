"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  accept?: string | Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onFilesSelected?: (files: File[]) => void;
  onFilesChange?: (files: File[]) => void;
  previews?: string[];
  onRemovePreview?: (index: number) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function FileUploader({
  accept = "image/*",
  multiple = false,
  maxFiles,
  maxSizeMB = 5,
  onFilesSelected,
  onFilesChange,
  previews = [],
  onRemovePreview,
  label,
  description,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): File[] => {
    const maxSize = maxSizeMB * 1024 * 1024;
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds ${maxSizeMB}MB limit`);
      } else {
        valid.push(file);
      }
    }

    if (maxFiles && valid.length > maxFiles) {
      errors.push(`Only ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`);
    }

    const limited = maxFiles ? valid.slice(0, maxFiles) : valid;

    if (errors.length > 0) setError(errors.join(", "));
    else setError(null);

    return limited;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const fileArray = Array.from(files);
      const valid = validateFiles(fileArray);
      if (valid.length > 0) {
        onFilesSelected?.(valid);
        onFilesChange?.(valid);
      }
    },
    [onFilesSelected, onFilesChange, maxSizeMB, maxFiles]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const acceptString =
    typeof accept === "string" ? accept : Object.keys(accept).join(",");
  const isImageAccept = acceptString.includes("image");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptString}
          multiple={maxFiles ? maxFiles > 1 : multiple}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <motion.div
          animate={{ scale: isDragging ? 1.1 : 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="p-4 rounded-full bg-primary/10">
            {isImageAccept ? (
              <ImageIcon className="h-8 w-8 text-primary" />
            ) : (
              <FileText className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {label || <>Drop files here or <span className="text-primary">browse</span></>}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {description || `${acceptString === "image/*" ? "PNG, JPG, WebP" : acceptString} • Max ${maxSizeMB}MB`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span className="text-xs">or drag and drop</span>
          </div>
        </motion.div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <div className={cn("grid gap-3", multiple ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1")}>
            {previews.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                {isImageAccept ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="150px" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="text-xs truncate">{src}</span>
                  </div>
                )}

                {onRemovePreview && (
                  <button
                    type="button"
                    onClick={() => onRemovePreview(i)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
