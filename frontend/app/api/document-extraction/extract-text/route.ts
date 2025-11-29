// app/api/document-extraction/extract-text/route.ts
// Non-LLM text extraction from uploaded files

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/document-extraction/extractors';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text based on file type
    const result = await extractTextFromFile(
      buffer,
      file.type,
      file.name
    );

    return NextResponse.json({
      success: true,
      text: result.text,
      type: result.type,
      size: result.size,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract text from file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

