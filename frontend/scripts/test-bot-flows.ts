#!/usr/bin/env npx tsx
/**
 * Bot Flow Test Script
 *
 * Tests the chatbot question flow by hitting the real API endpoints.
 * Two modes: predefined scenarios for regression, freestyle for ad-hoc testing.
 *
 * Usage:
 *   npx tsx scripts/test-bot-flows.ts                  # All predefined scenarios
 *   npx tsx scripts/test-bot-flows.ts --scenario 1     # Single scenario
 *   npx tsx scripts/test-bot-flows.ts --verbose         # Full API responses
 *   npx tsx scripts/test-bot-flows.ts --url https://chatbot.focusflowsoftware.com
 *
 *   # Freestyle: free-text answers
 *   npx tsx scripts/test-bot-flows.ts --freestyle buy \
 *     "I don't have the time" "somewhere in Toronto" "around 500k" "not sure yet"
 *
 *   # Freestyle: mix buttons and text with --button <id>
 *   npx tsx scripts/test-bot-flows.ts --freestyle sell \
 *     --button relocate "Denver area" --button b3 --button soon
 */

// ── Types ──────────────────────────────────────────────────────────────

interface CustomButtonOption {
  id: string;
  label: string;
  value: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  label?: string;
  order: number;
  inputType: 'buttons' | 'text' | 'email' | 'phone' | 'number';
  mappingKey?: string;
  buttons?: CustomButtonOption[];
  placeholder?: string;
  required?: boolean;
}

interface SmartChatPayload {
  questionConfig: {
    id: string;
    text: string;
    question: string;
    mappingKey: string;
    buttons?: CustomButtonOption[];
  };
  nextQuestionConfig: {
    id: string;
    text: string;
    question: string;
    mappingKey: string;
    buttons?: CustomButtonOption[];
  } | null;
  selectedOffer: string;
  currentIntent: string;
  currentQuestionId: string;
  userInput: Record<string, string>;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  clientIdentifier: string;
  // Button click
  buttonId?: string;
  buttonValue?: string;
  buttonLabel?: string;
  // Free text
  freeText?: string;
}

interface SmartChatResponse {
  reply?: string;
  extracted?: { mappingKey: string; value: string };
  nextQuestion?: any;
  progress?: number;
  isComplete?: boolean;
  error?: string;
}

type StepInput =
  | { type: 'button'; buttonId: string }
  | { type: 'text'; text: string };

interface Scenario {
  name: string;
  flow: 'buy' | 'sell';
  /** Generate step inputs given the fetched questions */
  steps: (questions: CustomQuestion[]) => StepInput[];
}

// ── ANSI colors ────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color: string, label: string, msg: string) {
  console.log(`${color}${c.bold}[${label}]${c.reset} ${msg}`);
}

// ── CLI parsing ────────────────────────────────────────────────────────

interface CliArgs {
  mode: 'scenarios' | 'freestyle';
  scenarioIndex?: number;
  freestyleFlow?: 'buy' | 'sell';
  freestyleInputs?: StepInput[];
  verbose: boolean;
  baseUrl: string;
  clientId: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2); // strip node + script path
  let mode: 'scenarios' | 'freestyle' = 'scenarios';
  let scenarioIndex: number | undefined;
  let freestyleFlow: 'buy' | 'sell' | undefined;
  let freestyleInputs: StepInput[] = [];
  let verbose = false;
  let baseUrl = 'http://localhost:3000';
  let clientId = 'chris crowell';

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--url') {
      baseUrl = args[++i];
    } else if (arg === '--client') {
      clientId = args[++i];
    } else if (arg === '--scenario') {
      const num = parseInt(args[++i], 10);
      if (isNaN(num)) {
        console.error(`${c.red}Invalid scenario number${c.reset}`);
        process.exit(1);
      }
      scenarioIndex = num;
    } else if (arg === '--freestyle') {
      mode = 'freestyle';
      const flow = args[++i];
      if (flow !== 'buy' && flow !== 'sell') {
        console.error(`${c.red}--freestyle requires 'buy' or 'sell'${c.reset}`);
        process.exit(1);
      }
      freestyleFlow = flow;
    } else if (arg === '--button') {
      freestyleInputs.push({ type: 'button', buttonId: args[++i] });
    } else if (!arg.startsWith('--')) {
      freestyleInputs.push({ type: 'text', text: arg });
    }
    i++;
  }

  return { mode, scenarioIndex, freestyleFlow, freestyleInputs, verbose, baseUrl, clientId };
}

// ── API helpers ────────────────────────────────────────────────────────

/**
 * Try to resolve a clientId by checking /api/client/{id}.
 * If the exact name fails, tries common variations (hyphenated, with "real estate", etc.).
 * Returns the working businessName or null.
 */
async function resolveClientId(baseUrl: string, clientId: string): Promise<string | null> {
  // Generate candidate names to try
  const candidates = new Set<string>();
  candidates.add(clientId);

  // Hyphenated version: "chris crowell" → "chris-crowell"
  candidates.add(clientId.replace(/\s+/g, '-'));
  // Lowercase hyphenated
  candidates.add(clientId.toLowerCase().replace(/\s+/g, '-'));
  // With "-real-estate" suffix
  candidates.add(`${clientId.replace(/\s+/g, '-')}-real-estate`);
  candidates.add(`${clientId.toLowerCase().replace(/\s+/g, '-')}-real-estate`);
  // Original with " Real Estate" suffix
  candidates.add(`${clientId} Real Estate`);
  candidates.add(`${clientId} real estate`);

  for (const name of candidates) {
    try {
      const res = await fetch(`${baseUrl}/api/client/${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return data.config.businessName as string;
        }
      }
    } catch {
      // Network error, skip this candidate
    }
  }
  return null;
}

async function fetchQuestions(
  baseUrl: string,
  flow: string,
  clientId: string,
): Promise<CustomQuestion[]> {
  const url = `${baseUrl}/api/custom-questions?flow=${flow}&clientId=${encodeURIComponent(clientId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(`No questions for flow '${flow}': ${data.error || 'unknown'}`);
  }
  const questions: CustomQuestion[] = data.questions;
  questions.sort((a, b) => a.order - b.order);
  return questions;
}

async function sendStep(
  baseUrl: string,
  payload: SmartChatPayload,
): Promise<SmartChatResponse> {
  const res = await fetch(`${baseUrl}/api/chat/smart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ── Build payload helper ───────────────────────────────────────────────

function buildPayload(
  questions: CustomQuestion[],
  stepIndex: number,
  input: StepInput,
  flow: 'buy' | 'sell',
  clientId: string,
  userInput: Record<string, string>,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): SmartChatPayload {
  const q = questions[stepIndex];
  const nextQ = stepIndex + 1 < questions.length ? questions[stepIndex + 1] : null;

  const questionConfig = {
    id: q.id,
    text: q.question,
    question: q.question,
    mappingKey: q.mappingKey || q.id,
    buttons: q.buttons,
  };

  const nextQuestionConfig = nextQ
    ? {
        id: nextQ.id,
        text: nextQ.question,
        question: nextQ.question,
        mappingKey: nextQ.mappingKey || nextQ.id,
        buttons: nextQ.buttons,
      }
    : null;

  const base: SmartChatPayload = {
    questionConfig,
    nextQuestionConfig,
    selectedOffer: 'real-estate-timeline',
    currentIntent: flow,
    currentQuestionId: q.id,
    userInput: { ...userInput },
    messages: [...messages],
    clientIdentifier: clientId,
  };

  if (input.type === 'button') {
    const btn = q.buttons?.find((b) => b.id === input.buttonId);
    if (!btn) {
      // Fall back to first button if id not found
      const fallback = q.buttons?.[0];
      if (!fallback) {
        throw new Error(`Question '${q.id}' has no buttons but got a button input`);
      }
      log(c.yellow, 'WARN', `Button id '${input.buttonId}' not found on '${q.id}', using first button '${fallback.id}'`);
      base.buttonId = fallback.id;
      base.buttonValue = fallback.value;
      base.buttonLabel = fallback.label;
    } else {
      base.buttonId = btn.id;
      base.buttonValue = btn.value;
      base.buttonLabel = btn.label;
    }
  } else {
    base.freeText = input.text;
  }

  return base;
}

// ── Run a single flow ──────────────────────────────────────────────────

interface RunResult {
  passed: boolean;
  stepsRun: number;
  stepsTotal: number;
  errors: string[];
}

async function runFlow(
  baseUrl: string,
  clientId: string,
  flow: 'buy' | 'sell',
  inputs: StepInput[],
  verbose: boolean,
  label: string,
): Promise<RunResult> {
  console.log(`\n${c.cyan}${'─'.repeat(70)}${c.reset}`);
  log(c.cyan, 'RUN', `${c.bold}${label}${c.reset} (flow: ${flow})`);
  console.log(`${c.cyan}${'─'.repeat(70)}${c.reset}`);

  let questions: CustomQuestion[];
  try {
    questions = await fetchQuestions(baseUrl, flow, clientId);
  } catch (err: any) {
    log(c.red, 'FAIL', err.message);
    return { passed: false, stepsRun: 0, stepsTotal: 0, errors: [err.message] };
  }

  log(c.blue, 'INFO', `Fetched ${questions.length} questions for '${flow}' flow`);
  questions.forEach((q, i) => {
    const btns = q.buttons?.length ? ` [${q.buttons.map((b) => b.id).join(', ')}]` : '';
    console.log(`  ${c.dim}${i + 1}. ${q.id} (${q.inputType})${btns}${c.reset}`);
  });

  const userInput: Record<string, string> = {};
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  const errors: string[] = [];
  let inputIdx = 0;

  for (let stepIdx = 0; stepIdx < questions.length; stepIdx++) {
    if (inputIdx >= inputs.length) {
      log(c.yellow, 'STOP', `Ran out of inputs at step ${stepIdx + 1}/${questions.length}`);
      break;
    }

    const q = questions[stepIdx];
    const input = inputs[inputIdx];
    const inputLabel =
      input.type === 'button'
        ? `button:${input.buttonId}`
        : `"${input.text.length > 40 ? input.text.slice(0, 40) + '...' : input.text}"`;

    console.log('');
    log(c.magenta, `STEP ${stepIdx + 1}/${questions.length}`, `${q.question}`);
    log(c.dim, 'INPUT', inputLabel);

    const payload = buildPayload(questions, stepIdx, input, flow, clientId, userInput, messages);
    let response: SmartChatResponse;
    try {
      response = await sendStep(baseUrl, payload);
    } catch (err: any) {
      log(c.red, 'ERROR', `Network error: ${err.message}`);
      errors.push(`Step ${stepIdx + 1}: ${err.message}`);
      inputIdx++;
      continue;
    }

    if (verbose) {
      console.log(`  ${c.dim}Response: ${JSON.stringify(response, null, 2)}${c.reset}`);
    }

    if (response.error) {
      log(c.red, 'ERROR', response.error);
      errors.push(`Step ${stepIdx + 1}: ${response.error}`);
      inputIdx++;
      continue;
    }

    // Check for rephrase (no extracted = rephrase)
    if (!response.extracted) {
      log(c.yellow, 'REPHRASE', `No extracted value — LLM asked user to clarify`);
      if (response.reply) {
        log(c.dim, 'REPLY', response.reply);
      }
      // Add to messages and consume the input, but don't advance the question
      messages.push(
        { role: 'user', content: input.type === 'text' ? input.text : `[button:${input.buttonId}]` },
        { role: 'assistant', content: response.reply || '' },
      );
      inputIdx++;
      stepIdx--; // retry this question with next input
      continue;
    }

    // Successful extraction
    const key = response.extracted.mappingKey;
    const val = response.extracted.value;
    userInput[key] = val;
    log(c.green, 'EXTRACTED', `${key} = "${val}"`);

    if (response.reply) {
      log(c.dim, 'REPLY', response.reply);
    }

    if (response.progress !== undefined) {
      log(c.blue, 'PROGRESS', `${response.progress}%`);
    }

    const isLast = stepIdx === questions.length - 1;
    if (isLast) {
      if (response.isComplete) {
        log(c.green, 'COMPLETE', 'Flow marked as complete');
      } else {
        log(c.yellow, 'WARN', 'Last step but isComplete is not true');
      }
    }

    messages.push(
      { role: 'user', content: input.type === 'text' ? input.text : (payload.buttonLabel || val) },
      { role: 'assistant', content: response.reply || '' },
    );
    inputIdx++;
  }

  const stepsRun = Math.min(inputIdx, questions.length);
  const passed = errors.length === 0;
  const statusColor = passed ? c.green : c.red;
  const statusLabel = passed ? 'PASS' : 'FAIL';
  log(statusColor, statusLabel, `${stepsRun}/${questions.length} steps completed, ${errors.length} errors`);

  return { passed, stepsRun, stepsTotal: questions.length, errors };
}

// ── Predefined scenarios ───────────────────────────────────────────────

function getScenarios(): Scenario[] {
  return [
    {
      name: '1. Buy — All buttons (happy path)',
      flow: 'buy',
      steps: (questions) =>
        questions.map((q) => {
          if (q.buttons?.length) {
            return { type: 'button', buttonId: q.buttons[0].id };
          }
          return { type: 'text', text: 'Toronto, Ontario' };
        }),
    },
    {
      name: '2. Sell — All buttons (happy path)',
      flow: 'sell',
      steps: (questions) =>
        questions.map((q) => {
          if (q.buttons?.length) {
            return { type: 'button', buttonId: q.buttons[0].id };
          }
          return { type: 'text', text: 'Denver, Colorado' };
        }),
    },
    {
      name: '3. Buy — All free text (LLM classification)',
      flow: 'buy',
      steps: (questions) =>
        questions.map((q) => {
          const sampleTexts: Record<string, string> = {
            timeline: "I'm thinking within the next 3 months",
            location: 'somewhere in downtown Toronto',
            budget: 'around 500 thousand dollars',
            preApproval: "yes I've been pre-approved",
            propertyType: 'I want a detached house',
            bedrooms: 'at least 3 bedrooms',
            firstTimeBuyer: "yes it's my first time",
          };
          const key = q.mappingKey || q.id;
          return { type: 'text' as const, text: sampleTexts[key] || "I'm not sure, what do you recommend?" };
        }),
    },
    {
      name: '4. Buy — Mixed buttons and text',
      flow: 'buy',
      steps: (questions) =>
        questions.map((q, i) => {
          if (i % 2 === 0 && q.buttons?.length) {
            return { type: 'button' as const, buttonId: q.buttons[0].id };
          }
          const fallbackTexts = [
            'about 6 months from now',
            'in the Toronto area',
            'around 600k',
            'yes definitely',
            'a condo would be nice',
          ];
          return { type: 'text' as const, text: fallbackTexts[i % fallbackTexts.length] };
        }),
    },
    {
      name: '5. Buy — Off-topic then recover',
      flow: 'buy',
      steps: (questions) => {
        const result: StepInput[] = [];
        // First step: off-topic text (should trigger rephrase)
        result.push({ type: 'text', text: 'What is the weather like in Paris today?' });
        // Then a real answer for the first question
        if (questions[0]?.buttons?.length) {
          result.push({ type: 'button', buttonId: questions[0].buttons[0].id });
        } else {
          result.push({ type: 'text', text: 'within the next few months' });
        }
        // Remaining questions: first button
        for (let i = 1; i < questions.length; i++) {
          if (questions[i].buttons?.length) {
            result.push({ type: 'button', buttonId: questions[i].buttons![0].id });
          } else {
            result.push({ type: 'text', text: 'Toronto, Ontario' });
          }
        }
        return result;
      },
    },
    // ── State Machine Scenarios ──────────────────────────────────────
    {
      name: '6. Buy — Multi-answer extraction (state machine)',
      flow: 'buy',
      steps: (_questions) => [
        // Single message that provides multiple answers at once
        { type: 'text', text: "I want to buy a house in Toronto for around 500k, I'm a first-time buyer" },
        // Remaining questions should be asked by the bot; answer with buttons
        ..._questions.slice(1).map((q) => {
          if (q.buttons?.length) {
            return { type: 'button' as const, buttonId: q.buttons[0].id };
          }
          return { type: 'text' as const, text: "I'm not sure yet" };
        }),
      ],
    },
    {
      name: '7. Buy — Objection then recovery (state machine)',
      flow: 'buy',
      steps: (questions) => {
        const result: StepInput[] = [];
        // First question: objection
        result.push({ type: 'text', text: "I don't want to share that information" });
        // Then provide the answer after objection counter
        if (questions[0]?.buttons?.length) {
          result.push({ type: 'button', buttonId: questions[0].buttons[0].id });
        } else {
          result.push({ type: 'text', text: 'fine, about 3 months from now' });
        }
        // Rest: normal answers
        for (let i = 1; i < questions.length; i++) {
          if (questions[i].buttons?.length) {
            result.push({ type: 'button', buttonId: questions[i].buttons![0].id });
          } else {
            result.push({ type: 'text', text: 'around 500k' });
          }
        }
        return result;
      },
    },
    {
      name: '8. Buy — Multi-field single message (state machine state skipping)',
      flow: 'buy',
      steps: (questions) => {
        const result: StepInput[] = [];
        // First message covers multiple fields — should skip states
        result.push({
          type: 'text',
          text: 'Toronto, 500k budget, first time buyer, looking for a detached home within 3 months',
        });
        // Fill any remaining questions the bot still asks
        for (let i = 0; i < questions.length; i++) {
          if (questions[i].buttons?.length) {
            result.push({ type: 'button', buttonId: questions[i].buttons![0].id });
          } else {
            result.push({ type: 'text', text: 'yes' });
          }
        }
        return result;
      },
    },
  ];
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  const cli = parseArgs(process.argv);

  console.log(`\n${c.bold}Bot Flow Test Script${c.reset}`);
  console.log(`${c.dim}Base URL: ${cli.baseUrl}${c.reset}`);
  console.log(`${c.dim}Client:   ${cli.clientId}${c.reset}`);
  console.log(`${c.dim}Mode:     ${cli.mode}${c.reset}`);

  // Resolve the actual businessName in the database
  log(c.blue, 'INIT', `Resolving client "${cli.clientId}"...`);
  const resolved = await resolveClientId(cli.baseUrl, cli.clientId);
  if (!resolved) {
    log(c.red, 'FAIL', `Could not find client "${cli.clientId}" (also tried hyphenated and "real-estate" variants)`);
    log(c.yellow, 'HINT', `Use --client <exactBusinessName> with the exact businessName from MongoDB`);
    process.exit(1);
  }
  if (resolved !== cli.clientId) {
    log(c.green, 'RESOLVED', `"${cli.clientId}" → "${resolved}"`);
  } else {
    log(c.green, 'RESOLVED', `Client found: "${resolved}"`);
  }
  cli.clientId = resolved;

  if (cli.mode === 'freestyle') {
    if (!cli.freestyleFlow || !cli.freestyleInputs?.length) {
      console.error(`\n${c.red}Freestyle mode requires a flow and at least one input.${c.reset}`);
      console.error(`Example: npx tsx scripts/test-bot-flows.ts --freestyle buy "answer1" "answer2"`);
      process.exit(1);
    }

    const result = await runFlow(
      cli.baseUrl,
      cli.clientId,
      cli.freestyleFlow,
      cli.freestyleInputs,
      cli.verbose,
      `Freestyle ${cli.freestyleFlow}`,
    );
    process.exit(result.passed ? 0 : 1);
  }

  // Predefined scenarios
  const scenarios = getScenarios();
  const toRun = cli.scenarioIndex !== undefined
    ? [scenarios[cli.scenarioIndex - 1]].filter(Boolean)
    : scenarios;

  if (toRun.length === 0) {
    console.error(`\n${c.red}Invalid scenario index. Available: 1-${scenarios.length}${c.reset}`);
    process.exit(1);
  }

  const results: { name: string; result: RunResult }[] = [];

  for (const scenario of toRun) {
    // Fetch questions to generate inputs
    let questions: CustomQuestion[];
    try {
      questions = await fetchQuestions(cli.baseUrl, scenario.flow, cli.clientId);
    } catch (err: any) {
      log(c.red, 'FAIL', `${scenario.name}: ${err.message}`);
      results.push({ name: scenario.name, result: { passed: false, stepsRun: 0, stepsTotal: 0, errors: [err.message] } });
      continue;
    }

    const inputs = scenario.steps(questions);
    const result = await runFlow(
      cli.baseUrl,
      cli.clientId,
      scenario.flow,
      inputs,
      cli.verbose,
      scenario.name,
    );
    results.push({ name: scenario.name, result });
  }

  // Summary
  console.log(`\n\n${c.bold}${'═'.repeat(70)}${c.reset}`);
  console.log(`${c.bold}  SUMMARY${c.reset}`);
  console.log(`${c.bold}${'═'.repeat(70)}${c.reset}\n`);

  let allPassed = true;
  for (const { name, result } of results) {
    const icon = result.passed ? `${c.green}PASS${c.reset}` : `${c.red}FAIL${c.reset}`;
    console.log(`  ${icon}  ${name} (${result.stepsRun}/${result.stepsTotal} steps)`);
    if (result.errors.length > 0) {
      allPassed = false;
      result.errors.forEach((e) => console.log(`        ${c.red}${e}${c.reset}`));
    }
  }

  console.log(`\n${allPassed ? c.green : c.red}${allPassed ? 'All scenarios passed.' : 'Some scenarios failed.'}${c.reset}\n`);
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error(`\n${c.red}Fatal error: ${err.message}${c.reset}`);
  process.exit(1);
});
