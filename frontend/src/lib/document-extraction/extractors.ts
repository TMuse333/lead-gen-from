// lib/document-extraction/extractors.ts
// Optimized text extraction from various document formats
// Using pdf2json for better Next.js compatibility

import mammoth from 'mammoth';

export interface ExtractedText {
  text: string;
  type: 'pdf' | 'docx' | 'txt' | 'other';
  size: number; // bytes
}

/**
 * Extract text from PDF using pdf2json
 * This library works better in serverless/Next.js environments
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for Next.js compatibility
    const PDFParser = (await import('pdf2json')).default;
    
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData.parserError));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          let text = '';
          
          // Extract text from all pages
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  if (textItem.R) {
                    for (const textRun of textItem.R) {
                      if (textRun.T) {
                        // Decode URI component to get actual text
                        text += decodeURIComponent(textRun.T) + ' ';
                      }
                    }
                  }
                }
                text += '\n'; // New line after each page
              }
            }
          }
          
          resolve(text.trim());
        } catch (error) {
          reject(error);
        }
      });
      
      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from DOCX using mammoth
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from plain text file
 */
export function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

/**
 * Detect file type from buffer and MIME type
 */
function detectFileType(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): 'pdf' | 'docx' | 'txt' | 'other' {
  // Check PDF
  if (
    mimeType === 'application/pdf' ||
    fileName?.endsWith('.pdf') ||
    buffer.toString('utf-8', 0, 4) === '%PDF'
  ) {
    return 'pdf';
  }

  // Check DOCX
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    fileName?.endsWith('.docx') ||
    fileName?.endsWith('.doc')
  ) {
    return 'docx';
  }

  // Check TXT
  if (mimeType === 'text/plain' || fileName?.endsWith('.txt')) {
    return 'txt';
  }

  return 'other';
}

/**
 * Extract text from file based on MIME type with optimized detection
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<ExtractedText> {
  const size = buffer.length;
  const type = detectFileType(buffer, mimeType, fileName);
  let text: string;

  switch (type) {
    case 'pdf':
      text = await extractTextFromPDF(buffer);
      break;

    case 'docx':
      text = await extractTextFromDOCX(buffer);
      break;

    case 'txt':
      text = extractTextFromTXT(buffer);
      break;

    default:
      // Try to extract as text as fallback
      try {
        text = buffer.toString('utf-8');
      } catch (error) {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
  }

  return {
    text: text.trim(),
    type,
    size,
  };
}

/**
 * Chunk text for processing large documents with smart boundary detection
 */
export function chunkText(
  text: string,
  chunkSize: number = 10000,
  overlap: number = 2000
): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // Try to break at natural boundaries if not at end
    if (end < text.length) {
      // Look for sentence endings (.!?) followed by space or newline
      const sentencePattern = /[.!?][\s\n]/g;
      const matches = [...chunk.matchAll(sentencePattern)];
      
      if (matches.length > 0) {
        // Get the last sentence boundary in the preferred range (70%+)
        const preferredBreak = chunkSize * 0.7;
        const lastMatch = matches
          .filter(m => m.index && m.index >= preferredBreak)
          .pop() || matches[matches.length - 1];
        
        if (lastMatch && lastMatch.index !== undefined) {
          const breakPoint = lastMatch.index + 1;
          chunk = chunk.slice(0, breakPoint);
          start += breakPoint - overlap;
        } else {
          start += chunkSize - overlap;
        }
      } else {
        // Fall back to paragraph or word boundary
        const lastNewline = chunk.lastIndexOf('\n');
        const lastSpace = chunk.lastIndexOf(' ');
        const breakPoint = Math.max(lastNewline, lastSpace);

        if (breakPoint > chunkSize * 0.5) {
          chunk = chunk.slice(0, breakPoint);
          start += breakPoint - overlap;
        } else {
          start += chunkSize - overlap;
        }
      }
    } else {
      start = text.length;
    }

    chunks.push(chunk.trim());
  }

  return chunks;
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  fileName?: string
): { valid: boolean; error?: string } {
  const validMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
  const fileNameLower = fileName?.toLowerCase() || '';

  const isValidMime = validMimeTypes.includes(mimeType);
  const isValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));

  if (!isValidMime && !isValidExt) {
    return {
      valid: false,
      error: 'Invalid file type. Supported types: PDF, DOCX, DOC, TXT',
    };
  }

  return { valid: true };
}
