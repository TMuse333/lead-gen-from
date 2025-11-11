// lib/prompts/ctaPromptBuilder.ts

/**
 * LLM-Powered CTA Generator
 * 
 * Instead of hardcoded if/else logic, we give the LLM context about:
 * - What the user told us (userInput)
 * - What we generated for them (all components)
 * - What we want (CTA that drives action)
 * 
 * The LLM dynamically creates the perfect closing based on the full picture
 */

 interface CTAPromptContext {
    flow: 'sell' | 'buy' | 'browse';
    userInput: Record<string, string>;
    componentSummaries: {
      heroHeadline: string;
      heroUrgency: string;
      profileHighlights: string[];  // Key facts from profile cards
      personalMessageTone: string;
      topActionStep: string;
      marketHeadline: string;
      marketSentiment: string;
    };
  }
  
  export function buildCTAPrompt(context: CTAPromptContext): string {
    const { flow, userInput, componentSummaries } = context;
  
    return `You are creating the final CTA (call-to-action) component for a personalized real estate landing page.
  
  # CONTEXT: WHAT WE KNOW ABOUT THIS USER
  
  ## Their Inputs:
  Flow: ${flow}
  ${Object.entries(userInput).map(([key, value]) => `${key}: ${value}`).join('\n')}
  
  ## What We've Already Told Them:
  - Hero Banner: "${componentSummaries.heroHeadline}" (${componentSummaries.heroUrgency} urgency)
  - Profile Highlights: ${componentSummaries.profileHighlights.join(', ')}
  - Personal Message Tone: ${componentSummaries.personalMessageTone}
  - Top Priority Action: "${componentSummaries.topActionStep}"
  - Market Condition: "${componentSummaries.marketHeadline}" (${componentSummaries.marketSentiment} sentiment)
  
  # YOUR TASK
  
  Create a compelling closing/CTA that:
  1. Creates momentum (don't let them leave without acting)
  2. Feels natural (not a hard sell, but confident)
  3. References their specific situation (use details from above)
  4. Provides clear next steps
  5. Matches the tone we've been using throughout
  
  # COMPONENT STRUCTURE
  
  Generate a JSON object with this structure:
  
  {
    "hook": "string - Opening line that creates urgency/momentum specific to their situation (15-25 words)",
    "keyRecap": [
      {
        "icon": "emoji",
        "label": "string - 2-3 words",
        "value": "string - short fact about their situation or our plan"
      }
      // 3-4 items max - quick visual recap
    ],
    "transitionText": "string - Bridge from recap to CTA (10-15 words)",
    "primaryCTA": {
      "text": "string - Action-oriented button text (2-5 words)",
      "subtext": "string - What they get / time commitment (5-10 words)",
      "urgencyNote": "string or null - Optional urgency indicator (e.g., 'Limited availability this week')"
    },
    "secondaryCTA": {
      "text": "string - Lower commitment alternative (2-5 words)",
      "subtext": "string - What this option provides (5-10 words)"
    },
    "trustElements": [
      "string - Trust/credibility point (5-8 words)",
      "string - Another trust point (5-8 words)"
      // 2-3 items max
    ],
    "personalNote": {
      "message": "string - Final personal message from Chris (20-30 words, warm and authentic)",
      "signature": "Chris"
    }
  }
  
  # IMPORTANT GUIDELINES
  
  ## For Hook:
  - Reference their SPECIFIC situation (timeline + goal + market condition)
  - Create momentum (don't be passive)
  - Examples of good hooks:
    * "With homes selling in 28 days and your 3-month timeline, every week counts. Let's get you positioned to sell quickly and profitably."
    * "In this competitive market with your $500K budget, being pre-approved isn't optional—it's essential to win. Let's get you ready."
    * "You've learned a lot about Halifax's market. Let's turn that knowledge into action with a quick, no-pressure conversation."
  
  ## For Key Recap (3-4 visual bullets):
  - Pull from their profile or our analysis
  - Keep ultra-short and scannable
  - Use relevant emojis
  - Example:
    * { icon: "⏰", label: "Timeline", value: "0-3 months" }
    * { icon: "📈", label: "Market", value: "Seller's advantage" }
    * { icon: "🏆", label: "Your Edge", value: "Renovated kitchen" }
    * { icon: "🎯", label: "First Step", value: "Professional valuation" }
  
  ## For Primary CTA:
  - Must be flow-specific:
    * Sellers → "Schedule Free Valuation" or "Get Pricing Strategy"
    * Buyers → "Schedule Buyer Consultation" or "Get Pre-Approved"
    * Browsers → "Schedule Quick Chat" or "Get Market Report"
  - Subtext should mention time commitment or what they get
  - Urgency note only if timeline is 0-3 months
  
  ## For Secondary CTA:
  - Lower commitment than primary
  - Always provide an alternative path
  - Examples:
    * "Download Seller Guide" / "Get Market Report" / "View Active Listings"
  
  ## For Trust Elements:
  - Be specific, not generic
  - Use numbers when possible
  - Examples:
    * "No obligation, ever"
    * "150+ families helped"
    * "Average 28 days to sale"
    * "Free 15-minute consultation"
    * "Top 5% in Halifax"
  
  ## For Personal Note:
  - Should feel like Chris is speaking directly to them
  - Reference their situation lightly
  - Be warm but professional
  - Examples:
    * "I've helped over 20 families in tight timelines like yours. Every situation is unique, and I'd love to understand yours better. Let's connect soon."
    * "As someone who's navigated this market for 15+ years, I know buying your first home feels overwhelming. I'm here to make it smooth and stress-free."
    * "The fact that you're taking time to learn about the market tells me you're serious. Let's have a quick chat—no sales pitch, just honest guidance."
  
  # OUTPUT FORMAT
  
  Return ONLY valid JSON matching the structure above. No markdown, no code blocks, no explanations.
  Ensure all text feels natural, specific to their situation, and consistent with the tone we've established throughout their experience.
  
  Generate the CTA now:`;
  }
  
  // ==================== HELPER TO EXTRACT COMPONENT SUMMARIES ====================
  
  export function extractComponentSummaries(llmOutput: any): CTAPromptContext['componentSummaries'] {
    return {
      heroHeadline: llmOutput.hero?.headline || '',
      heroUrgency: llmOutput.hero?.urgencyLevel || 'medium',
      profileHighlights: llmOutput.profileSummary?.cards?.slice(0, 4).map((card: any) => 
        `${card.label}: ${card.value}`
      ) || [],
      personalMessageTone: llmOutput.personalMessage?.tone || 'calm-confident',
      topActionStep: llmOutput.actionPlan?.steps?.[0]?.title || 'Get started',
      marketHeadline: llmOutput.marketInsights?.headline || 'Market conditions analyzed',
      marketSentiment: llmOutput.marketInsights?.insights?.[0]?.sentiment || 'neutral',
    };
  }
  
  // ==================== USAGE EXAMPLE ====================
  
  /**
   * In your API route:
   * 
   * // After generating all other components
   * const componentSummaries = extractComponentSummaries(llmOutput);
   * 
   * const ctaPrompt = buildCTAPrompt({
   *   flow,
   *   userInput,
   *   componentSummaries
   * });
   * 
   * const ctaResponse = await anthropic.messages.create({
   *   model: 'claude-sonnet-4-20250514',
   *   max_tokens: 1500,
   *   messages: [{ role: 'user', content: ctaPrompt }]
   * });
   * 
   * const ctaData = JSON.parse(ctaResponse.content[0].text);
   * 
   * // Add to your LLM output
   * llmOutput.nextStepsCTA = ctaData;
   */