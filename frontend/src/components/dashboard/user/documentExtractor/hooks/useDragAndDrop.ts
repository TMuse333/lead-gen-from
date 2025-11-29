// components/documentExtractor/hooks/useDragAndDrop.ts

import { useEffect } from 'react';

interface UseDragAndDropProps {
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
}

const VALID_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const VALID_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];

export function useDragAndDrop({
  isDragging,
  setIsDragging,
  onFileSelect,
  onError,
}: UseDragAndDropProps) {
  // Prevent default drag behavior globally
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  const validateFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const isValidType = VALID_TYPES.includes(file.type);
    const isValidExt = VALID_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    return isValidType || isValidExt;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];

      if (validateFile(droppedFile)) {
        onFileSelect(droppedFile);
      } else {
        onError('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
      }
    }
  };

  return {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}

