#!/usr/bin/env npx tsx
/**
 * Bot On-Script Test
 *
 * Tests whether the chatbot stays on script by:
 * 1. Loading questions from MongoDB
 * 2. Simulating a conversation flow
 * 3. Checking if responses match expected questions
 *
 * Usage:
 *   npx tsx scripts/test-bot-on-script.ts [clientId] [flow]
 *   npx tsx scripts/test-bot-on-script.ts chris-crowell-real-estate buy
 *   npx tsx scripts/test-bot-on-script.ts chris-crowell-real-estate sell
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface Question {
  id: string;
  question: string;
  order: number;
  inputType: 'buttons' | 'text';
  mappingKey: string;
  buttons?: { id: string; label: string; value: string }[];
}

interface TestResult {
  step: number;
  questionId: string;
  expectedQuestion: string;
  actualResponse: string;
  onScript: boolean;
  answeredWith: string;
}

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset);
}

async function fetchQuestions(clientId: string, flow: string): Promise<Question[]> {
  const url = `${BASE_URL}/api/custom-questions?flow=${flow}&clientId=${encodeURIComponent(clientId)}`;
  log('dim', `Fetching: ${url}`);

  const response = await fetch(url);
  const data = await response.json();

  if (!data.success || !data.questions?.length) {
    throw new Error(`No questions found for ${clientId} / ${flow}`);
  }

  return data.questions.sort((a: Question, b: Question) => a.order - b.order);
}

async function simulateChat(
  clientId: string,
  flow: string,
  questions: Question[]
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  let conversationId: string | null = null;
  const userInput: Record<string, string> = { intent: flow };

  // Create conversation
  const convResponse = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientIdentifier: clientId,
      intent: flow,
      source: 'test-script',
    }),
  });
  const convData = await convResponse.json();
  conversationId = convData.conversationId || convData._id;
  log('dim', `Created conversation: ${conversationId}`);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const isLastQuestion = i === questions.length - 1;

    // Determine answer (use first button or sample text)
    let answer: string;
    let buttonId: string | undefined;
    let buttonValue: string | undefined;

    if (q.inputType === 'buttons' && q.buttons?.length) {
      const btn = q.buttons[0];
      answer = btn.label;
      buttonId = btn.id;
      buttonValue = btn.value;
    } else {
      // Sample text answers based on mapping key
      const textAnswers: Record<string, string> = {
        location: 'Toronto, Ontario',
        budget: '$500,000',
        timeline: '3-6 months',
        default: 'Test answer',
      };
      answer = textAnswers[q.mappingKey] || textAnswers.default;
    }

    // Call the chat API
    const chatPayload: any = {
      selectedOffer: 'real-estate-timeline',
      currentIntent: flow,
      currentQuestionId: `q_${q.id}`,
      userInput,
      questionConfig: q,
      clientIdentifier: clientId,
      conversationId,
    };

    if (buttonId && buttonValue) {
      chatPayload.buttonId = buttonId;
      chatPayload.buttonValue = buttonValue;
    } else {
      chatPayload.freeText = answer;
    }

    log('dim', `\nStep ${i + 1}: Answering "${q.mappingKey}" with "${buttonValue || answer}"`);

    const chatResponse = await fetch(`${BASE_URL}/api/chat/smart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatPayload),
    });

    const chatData = await chatResponse.json();

    // Record answer
    userInput[q.mappingKey] = buttonValue || answer;

    // Check if response mentions next question (if not last)
    const nextQ = questions[i + 1];
    let onScript = true;
    let actualResponse = chatData.reply || chatData.error || 'No response';

    if (chatData.error) {
      onScript = false;
      log('red', `  ❌ API Error: ${chatData.error}`);
    } else if (nextQ && !isLastQuestion) {
      // Check if the reply seems related to the flow
      // A good response acknowledges the answer and may hint at next topic
      const reply = (chatData.reply || '').toLowerCase();

      // Check for off-script indicators
      const offScriptIndicators = [
        'i don\'t understand',
        'could you clarify',
        'i\'m not sure what you mean',
        'let me help you with something else',
        'is there anything else',
      ];

      for (const indicator of offScriptIndicators) {
        if (reply.includes(indicator)) {
          onScript = false;
          break;
        }
      }
    }

    results.push({
      step: i + 1,
      questionId: q.id,
      expectedQuestion: q.question,
      actualResponse: actualResponse.slice(0, 150) + (actualResponse.length > 150 ? '...' : ''),
      onScript,
      answeredWith: buttonValue || answer,
    });

    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}

function printResults(questions: Question[], results: TestResult[], flow: string, clientId: string) {
  console.log('\n');
  log('bold', '═'.repeat(70));
  log('cyan', `  BOT ON-SCRIPT TEST RESULTS`);
  log('dim', `  Client: ${clientId} | Flow: ${flow.toUpperCase()}`);
  log('bold', '═'.repeat(70));

  console.log('\n');
  log('yellow', '📋 QUESTIONS LOADED FROM MONGODB:');
  log('dim', '─'.repeat(50));

  for (const q of questions) {
    const type = q.inputType === 'buttons' ? `[${q.buttons?.length} buttons]` : '[text]';
    console.log(`  ${colors.cyan}#${q.order}${colors.reset} ${q.mappingKey} ${colors.dim}${type}${colors.reset}`);
    console.log(`      "${q.question}"`);
    if (q.buttons?.length) {
      console.log(`      ${colors.dim}Options: ${q.buttons.map(b => b.label).join(' | ')}${colors.reset}`);
    }
  }

  console.log('\n');
  log('yellow', '🤖 CONVERSATION FLOW:');
  log('dim', '─'.repeat(50));

  let onScriptCount = 0;
  for (const r of results) {
    const status = r.onScript ? `${colors.green}✓ ON SCRIPT${colors.reset}` : `${colors.red}✗ OFF SCRIPT${colors.reset}`;
    if (r.onScript) onScriptCount++;

    console.log(`\n  ${colors.bold}Step ${r.step}:${colors.reset} ${r.questionId}`);
    console.log(`  ${colors.dim}Expected:${colors.reset} "${r.expectedQuestion.slice(0, 60)}..."`);
    console.log(`  ${colors.dim}Answered:${colors.reset} "${r.answeredWith}"`);
    console.log(`  ${colors.dim}Response:${colors.reset} "${r.actualResponse}"`);
    console.log(`  ${status}`);
  }

  console.log('\n');
  log('bold', '═'.repeat(70));

  const percentage = Math.round((onScriptCount / results.length) * 100);
  const summary = `  SCORE: ${onScriptCount}/${results.length} steps on script (${percentage}%)`;

  if (percentage === 100) {
    log('green', summary);
    log('green', '  ✓ Bot stayed perfectly on script!');
  } else if (percentage >= 80) {
    log('yellow', summary);
    log('yellow', '  ⚠ Bot mostly on script, some deviations');
  } else {
    log('red', summary);
    log('red', '  ✗ Bot went off script frequently');
  }

  log('bold', '═'.repeat(70));
  console.log('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const clientId = args[0] || 'chris-crowell-real-estate';
  const flow = args[1] || 'buy';

  if (!['buy', 'sell'].includes(flow)) {
    console.error('Flow must be "buy" or "sell"');
    process.exit(1);
  }

  console.log('\n');
  log('cyan', '🧪 Starting Bot On-Script Test...');
  log('dim', `   Client: ${clientId}`);
  log('dim', `   Flow: ${flow}`);
  log('dim', `   Base URL: ${BASE_URL}`);

  try {
    // Step 1: Load questions
    log('yellow', '\n📥 Loading questions from MongoDB...');
    const questions = await fetchQuestions(clientId, flow);
    log('green', `   ✓ Loaded ${questions.length} questions`);

    // Step 2: Simulate conversation
    log('yellow', '\n💬 Simulating conversation...');
    const results = await simulateChat(clientId, flow, questions);

    // Step 3: Print results
    printResults(questions, results, flow, clientId);

  } catch (error) {
    log('red', '\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
