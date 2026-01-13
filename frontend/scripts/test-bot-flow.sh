#!/bin/bash

# Test Bot Flow Script
# Usage: ./scripts/test-bot-flow.sh [clientId] [flow]
# Example: ./scripts/test-bot-flow.sh "bob real estate" buy

CLIENT_ID="${1:-bob real estate}"
FLOW="${2:-buy}"
BASE_URL="http://localhost:3000"

# URL encode the client ID
CLIENT_ID_ENCODED=$(echo "$CLIENT_ID" | sed 's/ /%20/g')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🧪 BOT FLOW TEST SCRIPT${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "  Client: ${YELLOW}$CLIENT_ID${NC}"
echo -e "  Flow:   ${YELLOW}$FLOW${NC}"
echo ""

# Check if server is running
echo -e "${CYAN}[1/3] Checking if server is running...${NC}"
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
  echo -e "${RED}❌ Server not running at $BASE_URL${NC}"
  echo -e "   Run: ${YELLOW}npm run dev${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Check MongoDB config
echo -e "${CYAN}[2/3] Checking MongoDB config...${NC}"
echo -e "  URL: $BASE_URL/api/offer-config?clientId=$CLIENT_ID_ENCODED"
echo ""

CONFIG=$(curl -s "$BASE_URL/api/offer-config?clientId=$CLIENT_ID_ENCODED")

# Check for actual API error (not color config "error" field)
if echo "$CONFIG" | jq -e '.error' > /dev/null 2>&1 && [ "$(echo "$CONFIG" | jq -r '.success')" != "true" ]; then
  echo -e "${RED}❌ Config not found for client: $CLIENT_ID${NC}"
  echo -e "${RED}Response: $(echo "$CONFIG" | jq -r '.error')${NC}"
  exit 1
fi

if [ "$(echo "$CONFIG" | jq -r '.success')" != "true" ]; then
  echo -e "${RED}❌ Unexpected response:${NC}"
  echo "$CONFIG" | head -c 500
  exit 1
fi

echo -e "${GREEN}✅ Config loaded${NC}"
echo ""

# Check if customPhases exists
HAS_PHASES=$(echo "$CONFIG" | jq -r '.config.customPhases != null')
if [ "$HAS_PHASES" = "true" ]; then
  echo -e "${GREEN}✅ customPhases exists in MongoDB${NC}"

  # Show phases for the flow
  echo ""
  echo -e "${YELLOW}Phases for flow '$FLOW':${NC}"
  echo "$CONFIG" | jq -r ".config.customPhases.$FLOW[]? | \"  • \(.name)\"" 2>/dev/null || echo "  (none found for this flow)"

  echo ""
  echo -e "${YELLOW}Steps with inlineExperience (advice):${NC}"
  ADVICE_STEPS=$(echo "$CONFIG" | jq -r ".config.customPhases.$FLOW[]?.actionableSteps[]? | select(.inlineExperience != null) | \"  ✅ \(.title)\"" 2>/dev/null)

  if [ -z "$ADVICE_STEPS" ]; then
    echo -e "  ${RED}❌ No steps have inlineExperience set!${NC}"
    echo -e "  ${YELLOW}This is why you're seeing fallback advice.${NC}"
  else
    echo "$ADVICE_STEPS"
  fi

  echo ""
  echo -e "${YELLOW}Steps WITHOUT inlineExperience:${NC}"
  echo "$CONFIG" | jq -r ".config.customPhases.$FLOW[]?.actionableSteps[]? | select(.inlineExperience == null) | \"  ❌ \(.title)\"" 2>/dev/null || echo "  (all steps have advice)"
else
  echo -e "${RED}❌ No customPhases in MongoDB - using default templates${NC}"
fi

echo ""

# Run timeline generation test
echo -e "${CYAN}[3/3] Running timeline generation (check server terminal for detailed logs)...${NC}"
echo ""

RESULT=$(curl -s -X POST "$BASE_URL/api/test-timeline" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"userInput\": {
      \"flow\": \"$FLOW\",
      \"location\": \"Halifax\",
      \"budget\": \"\$400,000-\$600,000\",
      \"timeline\": \"3-6 months\",
      \"isFirstTimeBuyer\": true
    }
  }")

if echo "$RESULT" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Timeline generated successfully${NC}"
  echo ""
  echo -e "${YELLOW}Generated phases:${NC}"
  echo "$RESULT" | jq -r '.timeline.phases[] | "  • \(.name) - \(.agentAdvice | length) advice items"'

  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✅ TEST COMPLETE - Check server terminal for detailed logs${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
else
  echo -e "${RED}❌ Timeline generation failed${NC}"
  echo "$RESULT" | jq '.'
fi

echo ""
