// app/api/document-extraction/process/route.ts
// LLM processing of extracted text with user context

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import OpenAI from 'openai';
import { createBaseTrackingObject, updateTrackingWithResponse } from '@/lib/tokenUsage/createTrackingObject';
import { trackUsageAsync } from '@/lib/tokenUsage/trackUsage';
import type { DocumentExtractionUsage } from '@/types/tokenUsage.types';
import { chunkText } from '@/lib/document-extraction/extractors';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedItem {
  title: string;
  advice: string;
  confidence: number;
  source?: string; // Which part of doc it came from
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      text,
      contextPrompt,
      flows,
      documentType,
      documentSize,
    } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Use default prompt if none provided
    const effectivePrompt = contextPrompt?.trim() || 'Extract relevant advice and knowledge from this document. Focus on actionable, practical recommendations suitable for a knowledge base.';

    // Determine if we need to chunk
    const needsChunking = text.length > 50000;
    const chunks = needsChunking ? chunkText(text, 10000, 2000) : [text];
    const allItems: ExtractedItem[] = [];

    const startTime = Date.now();

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkPrompt = `You are extracting structured advice/knowledge from a document.

USER'S CONTEXT/REQUEST:
"${effectivePrompt}"

DOCUMENT TEXT (chunk ${i + 1}/${chunks.length}):
${chunk}

TASK:
Extract relevant advice items based on the user's context. Each item should be:
- A standalone piece of advice/knowledge
- Relevant to the user's request
- Clear and actionable
- Suitable for a real estate knowledge base

Return ONLY valid JSON with this structure:
{
  "items": [
    {
      "title": "Short descriptive title (3-8 words)",
      "advice": "Full advice text (2-4 sentences, actionable)",
      "confidence": 0.0-1.0,
      "source": "Brief note about where in document this came from (optional)"
    }
  ]
}

RULES:
- Extract 3-8 items per chunk (focus on quality, not quantity)
- Only extract items relevant to the user's context
- Make titles specific and descriptive
- Make advice actionable and clear
- Confidence should reflect how certain you are this is good advice
- If no relevant items found, return empty array
- Output ONLY JSON, no markdown, no explanations`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: chunkPrompt }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0].message.content?.trim() || '{}';
      try {
        const parsed = JSON.parse(content);
        if (parsed.items && Array.isArray(parsed.items)) {
          allItems.push(...parsed.items);
        }
      } catch (parseError) {
        console.error('Failed to parse LLM response:', content);
        // Continue with other chunks
      }
    }

    const endTime = Date.now();

    // Track usage
    const baseTracking = createBaseTrackingObject({
      userId: session.user.id,
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiType: 'chat',
      startTime,
    });

    const usage: DocumentExtractionUsage = {
      ...updateTrackingWithResponse(baseTracking, {
        inputTokens: 0, // Will be calculated from all chunks
        outputTokens: 0, // Will be calculated from all chunks
        contentLength: allItems.reduce((sum, item) => sum + item.advice.length, 0),
        endTime,
      }),
      feature: 'documentExtraction',
      apiType: 'chat',
      model: 'gpt-4o-mini',
      featureData: {
        documentType: documentType || 'other',
        documentSize: documentSize || 0,
        extractedTextLength: text.length,
        contextPrompt: effectivePrompt,
        itemsExtracted: allItems.length,
        itemsValidated: 0, // Will be updated after user validation
        itemsWithRules: 0, // Will be updated after user adds rules
        processingMethod: needsChunking ? 'chunked' : 'full',
        chunksProcessed: chunks.length,
      },
    };

    // Calculate total tokens from all chunks (approximate)
    // In production, you'd track this per chunk
    const estimatedInputTokens = Math.ceil(text.length / 4); // Rough estimate
    const estimatedOutputTokens = Math.ceil(
      allItems.reduce((sum, item) => sum + item.advice.length + item.title.length, 0) / 4
    );

    usage.tokens.input = estimatedInputTokens;
    usage.tokens.output = estimatedOutputTokens;
    usage.tokens.total = estimatedInputTokens + estimatedOutputTokens;

    trackUsageAsync(usage);

    // Deduplicate similar items (simple title-based deduplication)
    const uniqueItems = allItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.title.toLowerCase() === item.title.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      items: uniqueItems,
      totalExtracted: uniqueItems.length,
      chunksProcessed: chunks.length,
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      {
        error: 'Failed to process document',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

