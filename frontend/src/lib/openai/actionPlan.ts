export function buildActionPlanPrompt(
    flow: string,
    userInput: Record<string, string>,
    actionStepMatches: any[],
    agentAdvice: any[]
  ): string {
    const applicableSteps = actionStepMatches.map((match) => match.step);
  
    return `You are generating a personalized Action Plan for a real estate client.
  
  # USER PROFILE
  Flow: ${flow}
  Timeline: ${userInput.timeline || 'Not specified'}
  ${flow === 'sell' ? `Property Type: ${userInput.propertyType || 'Not specified'}
  Selling Reason: ${userInput.sellingReason || 'Not specified'}
  Renovations: ${userInput.renovations || 'None'}` : ''}
  ${flow === 'buy' ? `Property Type: ${userInput.propertyType || 'Not specified'}
  Budget: ${userInput.budget || 'Not specified'}
  Bedrooms: ${userInput.bedrooms || 'Not specified'}
  Buying Reason: ${userInput.buyingReason || 'Not specified'}` : ''}
  ${flow === 'browse' ? `Interest: ${userInput.interest || 'Not specified'}
  Location: ${userInput.location || 'Not specified'}
  Price Range: ${userInput.priceRange || 'Not specified'}
  Goal: ${userInput.goal || 'Not specified'}` : ''}
  
  # APPLICABLE ACTION STEPS
  Based on this user's situation, here are ${applicableSteps.length} action steps that are relevant to them:
  
  ${applicableSteps
    .map(
      (step, idx) => `
  Step ${idx + 1}: ${step.title}
  - Description: ${step.description}
  - Benefit: ${step.benefit || 'N/A'}
  - Default Priority: ${step.defaultPriority}
  - Default Urgency: ${step.defaultUrgency}
  - Default Timeline: ${step.defaultTimeline}
  - Category: ${step.category}
  - Resource: ${
        step.resourceLink
          ? `${step.resourceText} (${step.resourceLink})`
          : 'None'
      }
  - Image: ${step.imageUrl || 'None'}`
    )
    .join('\n')}
  
  # AGENT'S EXPERT ADVICE (for context)
  ${agentAdvice
    .map((advice) => `- ${advice.title}\n  ${advice.advice}`)
    .join('\n')}
  
  # YOUR TASK
  Generate a personalized Action Plan component with these requirements:
  
  1. **Select 3-5 steps** from the applicable steps above that are MOST relevant to this user
     - Consider their timeline urgency (${userInput.timeline})
     - Prioritize steps that match their specific situation
     - Ensure logical flow (don't skip prerequisites)
  
  2. **Personalize each step**:
     - Keep the title, but adjust slightly if needed
     - REWRITE the description to be specific to their situation
     - Enhance the benefit to connect to their goals
     - Adjust urgency level based on their timeline:
       * 0-3 months → "immediate"
       * 3-6 months → "soon"
       * 6+ months → "later"
     - Adjust timeline to fit their context
     - Keep resourceLink, resourceText, and imageUrl as provided
  
  3. **Create section content**:
     - sectionTitle: Make it exciting and personalized (reference their timeline if urgent)
     - introText: 20–35 words introducing the plan
     - closingNote: 15–25 words encouraging action
     - overallUrgency: (0–3mo=high, 3–6mo=medium, 6+mo=low)
  
  4. **Output Format**:
  Return ONLY valid JSON matching this structure:
  {
    "actionPlan": {
      "sectionTitle": "string",
      "introText": "string",
      "steps": [
        {
          "stepNumber": 1,
          "title": "string",
          "description": "string (personalized)",
          "benefit": "string (personalized)",
          "resourceLink": "string or undefined",
          "resourceText": "string or undefined",
          "imageUrl": "string or undefined",
          "priority": number (1-5),
          "urgency": "immediate" | "soon" | "later",
          "timeline": "string (personalized)"
        }
      ],
      "closingNote": "string",
      "overallUrgency": "high" | "medium" | "low"
    }
  }
  
  CRITICAL RULES:
  - Output ONLY valid JSON, no markdown, code blocks, or commentary
  - stepNumber must be sequential (1, 2, 3…)
  - Include ALL fields (use null if not applicable)
  - Order steps by importance
  - Descriptions must feel personal to THIS user
  - Use the agent’s advice to inform tone and recommendations
  
  Generate the Action Plan now:`;
  }