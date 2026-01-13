// components/dashboard/shared/HeadshotUpload.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  User,
  Loader2,
  Camera,
  Check,
} from 'lucide-react';

interface HeadshotUploadProps {
  /** Current headshot URL */
  currentHeadshot?: string;
  /** Agent's name for placeholder */
  agentName?: string;
  /** Callback when headshot is uploaded */
  onUpload: (url: string) => void;
  /** Callback when headshot is removed */
  onRemove: () => void;
  /** Optional className */
  className?: string;
}

/**
 * Drag & drop headshot upload component
 */
export function HeadshotUpload({
  currentHeadshot,
  agentName,
  onUpload,
  onRemove,
  className = '',
}: HeadshotUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-headshot', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUpload(data.url);
      setPreviewUrl(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch('/api/upload-headshot', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }

      onRemove();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to remove');
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || currentHeadshot;

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Your Headshot
      </label>

      <div className="flex items-start gap-6">
        {/* Preview / Upload Area */}
        <div
          className={`
            relative w-32 h-32 rounded-full overflow-hidden
            border-2 border-dashed transition-all cursor-pointer
            ${isDragging
              ? 'border-cyan-500 bg-cyan-500/10'
              : displayUrl
                ? 'border-slate-600'
                : 'border-slate-600 hover:border-cyan-500 hover:bg-slate-800/50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-slate-800"
              >
                <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
              </motion.div>
            ) : displayUrl ? (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full group"
              >
                <img
                  src={displayUrl}
                  alt={agentName || 'Headshot'}
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-slate-500"
              >
                <User className="h-10 w-10 mb-1" />
                <span className="text-xs text-center px-2">
                  {isDragging ? 'Drop here' : 'Upload'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Instructions & Actions */}
        <div className="flex-1 pt-2">
          <p className="text-sm text-slate-400 mb-3">
            Drag & drop an image or click to upload.
            <br />
            <span className="text-slate-500 text-xs">
              Recommended: Square image, at least 200x200px, max 5MB
            </span>
          </p>

          {displayUrl && !isUploading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Remove photo
            </button>
          )}

          {uploadError && (
            <p className="text-sm text-red-400 mt-2">
              {uploadError}
            </p>
          )}

          {currentHeadshot && !previewUrl && !isUploading && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Photo uploaded
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
