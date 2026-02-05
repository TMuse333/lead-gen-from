// src/lib/text/chunker.ts
/**
 * Text Chunking Utilities
 *
 * Splits text into manageable chunks for embedding and storage.
 * Uses overlap to maintain context continuity between chunks.
 */

export interface ChunkOptions {
  /** Target chunk size in characters (default: 600) */
  chunkSize?: number;
  /** Overlap between chunks in characters (default: 100) */
  overlap?: number;
  /** Minimum chunk size - chunks smaller than this will be merged with previous (default: 100) */
  minChunkSize?: number;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  chunkSize: 600,
  overlap: 100,
  minChunkSize: 100,
};

/**
 * Split text into chunks with overlap for context continuity
 *
 * Strategy:
 * 1. Try to split at paragraph boundaries first
 * 2. Fall back to sentence boundaries
 * 3. Final fallback to word boundaries
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { chunkSize, overlap, minChunkSize } = { ...DEFAULT_OPTIONS, ...options };

  // Normalize whitespace
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

  if (normalizedText.length <= chunkSize) {
    return [normalizedText];
  }

  const chunks: string[] = [];
  let currentPosition = 0;

  while (currentPosition < normalizedText.length) {
    // Calculate end position for this chunk
    let endPosition = Math.min(currentPosition + chunkSize, normalizedText.length);

    // If we're not at the end, try to find a good break point
    if (endPosition < normalizedText.length) {
      const searchStart = currentPosition + chunkSize - 150; // Look back 150 chars
      const searchEnd = endPosition;
      const searchText = normalizedText.slice(searchStart, searchEnd);

      // Try to break at paragraph (double newline)
      let breakIndex = searchText.lastIndexOf('\n\n');

      // Try sentence break (. ! ?)
      if (breakIndex === -1) {
        const sentenceMatch = searchText.match(/[.!?]\s+[A-Z]/g);
        if (sentenceMatch) {
          breakIndex = searchText.lastIndexOf(sentenceMatch[sentenceMatch.length - 1][0]) + 1;
        }
      }

      // Try single newline
      if (breakIndex === -1) {
        breakIndex = searchText.lastIndexOf('\n');
      }

      // Try word break (space)
      if (breakIndex === -1) {
        breakIndex = searchText.lastIndexOf(' ');
      }

      if (breakIndex !== -1) {
        endPosition = searchStart + breakIndex + 1;
      }
    }

    // Extract chunk
    const chunk = normalizedText.slice(currentPosition, endPosition).trim();

    if (chunk.length >= minChunkSize || chunks.length === 0) {
      chunks.push(chunk);
    } else if (chunks.length > 0) {
      // Merge small final chunk with previous
      chunks[chunks.length - 1] = chunks[chunks.length - 1] + ' ' + chunk;
    }

    // Move position forward, accounting for overlap
    currentPosition = endPosition - overlap;

    // Avoid infinite loop for very small remaining text
    if (currentPosition >= normalizedText.length - minChunkSize) {
      break;
    }
  }

  return chunks;
}

/**
 * Calculate estimated chunk count for preview
 */
export function estimateChunkCount(text: string, options: ChunkOptions = {}): number {
  const { chunkSize, overlap } = { ...DEFAULT_OPTIONS, ...options };
  const textLength = text.trim().length;

  if (textLength <= chunkSize) {
    return 1;
  }

  // Estimate: (total length - overlap) / (chunk size - overlap)
  const effectiveChunkSize = chunkSize - overlap;
  return Math.ceil(textLength / effectiveChunkSize);
}

/**
 * Generate a hash-based ID for deduplication
 */
export function generateContentHash(text: string): string {
  // Simple hash function for deduplication
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
