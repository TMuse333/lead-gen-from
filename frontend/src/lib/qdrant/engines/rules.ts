// src/lib/qdrant/engines/ruleEngine.ts

import type { RuleGroup, ConditionRule } from '@/types';

export type UserInput = Record<string, string>;

export interface ApplicableItem {
  applicableWhen: {
    flow?: ('sell' | 'buy' | 'browse')[];
    ruleGroups?: RuleGroup[];
    minMatchScore?: number;
  };
}

// 1. Evaluate a single condition
function evaluateRule(rule: ConditionRule, userInput: UserInput): { matched: boolean; weight: number } {
  const userValue = userInput[rule.field];
  const weight = rule.weight || 1;
  
  console.log(`      🔍 Evaluating rule: ${rule.field} ${rule.operator} ${rule.value}`);
  console.log(`         User value: "${userValue}"`);
  
  if (!userValue) {
    console.log(`         ❌ User doesn't have field "${rule.field}"`);
    return { matched: false, weight };
  }

  let matched = false;
  
  switch (rule.operator) {
    case 'equals':
      matched = userValue === rule.value;
      console.log(`         ${matched ? '✅' : '❌'} equals: "${userValue}" === "${rule.value}"`);
      break;
      
    case 'not_equals':
      matched = userValue !== rule.value;
      console.log(`         ${matched ? '✅' : '❌'} not_equals: "${userValue}" !== "${rule.value}"`);
      break;
      
    case 'includes':
      if (Array.isArray(rule.value)) {
        matched = rule.value.includes(userValue);
        console.log(`         ${matched ? '✅' : '❌'} includes: [${rule.value.join(', ')}] includes "${userValue}"`);
      } else {
        matched = userValue.includes(rule.value as string);
        console.log(`         ${matched ? '✅' : '❌'} includes: "${userValue}" includes "${rule.value}"`);
      }
      break;
      
    case 'greater_than': {
      const a = parseFloat(userValue);
      const b = parseFloat(rule.value as string);
      matched = !isNaN(a) && !isNaN(b) && a > b;
      console.log(`         ${matched ? '✅' : '❌'} greater_than: ${a} > ${b}`);
      break;
    }
    
    case 'less_than': {
      const a = parseFloat(userValue);
      const b = parseFloat(rule.value as string);
      matched = !isNaN(a) && !isNaN(b) && a < b;
      console.log(`         ${matched ? '✅' : '❌'} less_than: ${a} < ${b}`);
      break;
    }
    
    case 'between': {
      if (Array.isArray(rule.value) && rule.value.length === 2) {
        const val = parseFloat(userValue);
        const min = parseFloat(rule.value[0]);
        const max = parseFloat(rule.value[1]);
        matched = !isNaN(val) && val >= min && val <= max;
        console.log(`         ${matched ? '✅' : '❌'} between: ${val} in [${min}, ${max}]`);
      } else {
        console.log(`         ❌ Invalid between value: ${rule.value}`);
      }
      break;
    }
    
    default:
      console.log(`         ❌ Unknown operator: ${rule.operator}`);
  }
  
  return { matched, weight };
}

// 2. Recursively evaluate rule groups
function evaluateRuleGroup(group: RuleGroup, userInput: UserInput): { matched: boolean; totalWeight: number; matchedWeight: number } {
  console.log(`   📋 Evaluating rule group (${group.logic})...`);
  
  let matchedCount = 0;
  let ruleCount = 0;
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const rule of group.rules) {
    if ('logic' in rule) {
      const nested = evaluateRuleGroup(rule as RuleGroup, userInput);
      ruleCount++;
      totalWeight += nested.totalWeight;
      matchedWeight += nested.matchedWeight;
      if (nested.matched) matchedCount++;
    } else {
      ruleCount++;
      const result = evaluateRule(rule as ConditionRule, userInput);
      totalWeight += result.weight;
      if (result.matched) {
        matchedWeight += result.weight;
        matchedCount++;
      }
    }
  }

  const matched = group.logic === 'AND' ? matchedCount === ruleCount : matchedCount > 0;
  
  // For OR logic, if matched, return full score
  if (group.logic === 'OR' && matched) {
    totalWeight = matchedWeight; // Make score = 1.0
  }
  
  console.log(`   📊 Rule group result: ${matched ? '✅' : '❌'} (${matchedCount}/${ruleCount} rules matched)`);
  console.log(`      Weight: ${matchedWeight}/${totalWeight}`);
  
  return { matched, totalWeight, matchedWeight };
}

// 3. Main public function
export function calculateMatchScore<T extends ApplicableItem>(
  item: T,
  userInput: UserInput,
  flow: 'sell' | 'buy' | 'browse'
): number {
  const { applicableWhen } = item;
  
  console.log(`\n🎯 Calculating match score for item...`);
  console.log(`   Flow check: item=${applicableWhen.flow?.join(', ') || 'any'}, user=${flow}`);

  // Flow check
  if (applicableWhen.flow && !applicableWhen.flow.includes(flow)) {
    console.log(`   ❌ Flow mismatch - returning 0`);
    return 0;
  }

  // No rules → universal match
  if (!applicableWhen.ruleGroups || applicableWhen.ruleGroups.length === 0) {
    console.log(`   ✅ No rule groups - universal match (score: 1.0)`);
    return 1.0;
  }

  console.log(`   📋 Evaluating ${applicableWhen.ruleGroups.length} rule group(s)...`);
  
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const group of applicableWhen.ruleGroups) {
    const result = evaluateRuleGroup(group, userInput);
    totalWeight += result.totalWeight;
    matchedWeight += result.matchedWeight;
  }

  const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;
  const minScore = applicableWhen.minMatchScore || 0;
  
  console.log(`   📈 Final score: ${score.toFixed(2)} (min required: ${minScore})`);
  
  if (score < minScore) {
    console.log(`   ❌ Below minimum threshold - returning 0`);
    return 0;
  }
  
  console.log(`   ✅ Score: ${score.toFixed(2)}`);
  return score;
}

// Optional: full applicability check
export function isApplicable<T extends ApplicableItem>(
  item: T,
  flow: string,
  userInput: UserInput
): { applicable: boolean; matchScore: number } {
  const score = calculateMatchScore(item, userInput, flow as any);
  return { applicable: score > 0, matchScore: score };
}