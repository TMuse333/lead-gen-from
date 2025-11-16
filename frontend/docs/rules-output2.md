🎯 Testing Action Step 1/10
   Title: Schedule No-Pressure Consultation
   ID: browse-consult-001
   Applicable When: {
  "flow": [
    "browse"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "goal",
          "operator": "includes",
          "value": "buy-future",
          "weight": 8
        },
        {
          "field": "goal",
          "operator": "includes",
          "value": "sell-future",
          "weight": 8
        },
        {
          "field": "goal",
          "operator": "includes",
          "value": "invest",
          "weight": 7
        }
      ]
    }
  ],
  "minMatchScore": 0.4
}

🎯 Calculating match score for item...
   Flow check: item=browse, user=buy
   ❌ Flow mismatch - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 2/10
   Title: Launch Your Listing
   ID: sell-listing-001
   Applicable When: {
  "flow": [
    "sell"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "timeline",
          "operator": "includes",
          "value": "0-3",
          "weight": 10
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "3-6",
          "weight": 9
        }
      ]
    }
  ],
  "minMatchScore": 0.7
}

🎯 Calculating match score for item...
   Flow check: item=sell, user=buy
   ❌ Flow mismatch - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 3/10
   Title: Get Mortgage Pre-Approval
   ID: buy-preapproval-001
   Applicable When: {
  "flow": [
    "buy"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "timeline",
          "operator": "includes",
          "value": "0-3",
          "weight": 10
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "3-6",
          "weight": 9
        }
      ]
    }
  ],
  "minMatchScore": 0.5
}

🎯 Calculating match score for item...
   Flow check: item=buy, user=buy
   📋 Evaluating 1 rule group(s)...
   📋 Evaluating rule group (OR)...
      🔍 Evaluating rule: timeline includes 0-3
         User value: "3-6 months"
         ❌ includes: "3-6 months" includes "0-3"
      🔍 Evaluating rule: timeline includes 3-6
         User value: "3-6 months"
         ✅ includes: "3-6 months" includes "3-6"
   📊 Rule group result: ✅ (1/2 rules matched)
      Weight: 9/19
   📈 Final score: 0.47 (min required: 0.5)
   ❌ Below minimum threshold - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 4/10
   Title: Start Viewing Properties
   ID: buy-viewings-001
   Applicable When: {
  "flow": [
    "buy"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "timeline",
          "operator": "includes",
          "value": "0-3",
          "weight": 10
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "3-6",
          "weight": 9
        }
      ]
    }
  ],
  "minMatchScore": 0.6
}

🎯 Calculating match score for item...
   Flow check: item=buy, user=buy
   📋 Evaluating 1 rule group(s)...
   📋 Evaluating rule group (OR)...
      🔍 Evaluating rule: timeline includes 0-3
         User value: "3-6 months"
         ❌ includes: "3-6 months" includes "0-3"
      🔍 Evaluating rule: timeline includes 3-6
         User value: "3-6 months"
         ✅ includes: "3-6 months" includes "3-6"
   📊 Rule group result: ✅ (1/2 rules matched)
      Weight: 9/19
   📈 Final score: 0.47 (min required: 0.6)
   ❌ Below minimum threshold - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 5/10
   Title: Prepare Your Offer Strategy
   ID: buy-offer-001
   Applicable When: {
  "flow": [
    "buy"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "timeline",
          "operator": "includes",
          "value": "0-3",
          "weight": 10
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "3-6",
          "weight": 8
        }
      ]
    }
  ],
  "minMatchScore": 0.7
}

🎯 Calculating match score for item...
   Flow check: item=buy, user=buy
   📋 Evaluating 1 rule group(s)...
   📋 Evaluating rule group (OR)...
      🔍 Evaluating rule: timeline includes 0-3
         User value: "3-6 months"
         ❌ includes: "3-6 months" includes "0-3"
      🔍 Evaluating rule: timeline includes 3-6
         User value: "3-6 months"
         ✅ includes: "3-6 months" includes "3-6"
   📊 Rule group result: ✅ (1/2 rules matched)
      Weight: 8/18
   📈 Final score: 0.44 (min required: 0.7)
   ❌ Below minimum threshold - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 6/10
   Title: Prepare Your Home for Market
   ID: sell-prep-001
   Applicable When: {
  "flow": [
    "sell"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "timeline",
          "operator": "includes",
          "value": "0-3",
          "weight": 10
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "3-6",
          "weight": 9
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "6-12",
          "weight": 7
        }
      ]
    }
  ],
  "minMatchScore": 0.5
}

🎯 Calculating match score for item...
   Flow check: item=sell, user=buy
   ❌ Flow mismatch - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 7/10
   Title: Get Professional Home Valuation
   ID: sell-valuation-001
   Applicable When: {
  "flow": [
    "sell"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "timeline",
          "operator": "includes",
          "value": "0-3",
          "weight": 10
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "3-6",
          "weight": 8
        }
      ]
    }
  ],
  "minMatchScore": 0.5
}

🎯 Calculating match score for item...
   Flow check: item=sell, user=buy
   ❌ Flow mismatch - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 8/10
   Title: Review Current Market Report
   ID: browse-report-001
   Applicable When: {
  "flow": [
    "browse"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "interest",
          "operator": "includes",
          "value": "market-trends",
          "weight": 10
        },
        {
          "field": "interest",
          "operator": "includes",
          "value": "investment",
          "weight": 8
        }
      ]
    }
  ],
  "minMatchScore": 0.5
}

🎯 Calculating match score for item...
   Flow check: item=browse, user=buy
   ❌ Flow mismatch - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 9/10
   Title: Schedule Professional Photography
   ID: sell-photo-001
   Applicable When: {
  "flow": [
    "sell"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "timeline",
          "operator": "includes",
          "value": "0-3",
          "weight": 10
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "3-6",
          "weight": 8
        }
      ]
    }
  ],
  "minMatchScore": 0.6
}

🎯 Calculating match score for item...
   Flow check: item=sell, user=buy
   ❌ Flow mismatch - returning 0

   📊 FINAL SCORE: 0.00
============================================================


============================================================
🎯 Testing Action Step 10/10
   Title: Define Your Home Criteria
   ID: buy-criteria-001
   Applicable When: {
  "flow": [
    "buy"
  ],
  "ruleGroups": [
    {
      "logic": "OR",
      "rules": [
        {
          "field": "timeline",
          "operator": "includes",
          "value": "0-3",
          "weight": 10
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "3-6",
          "weight": 8
        },
        {
          "field": "timeline",
          "operator": "includes",
          "value": "6-12",
          "weight": 6
        }
      ]
    }
  ],
  "minMatchScore": 0.5
}

🎯 Calculating match score for item...
   Flow check: item=buy, user=buy
   📋 Evaluating 1 rule group(s)...
   📋 Evaluating rule group (OR)...
      🔍 Evaluating rule: timeline includes 0-3
         User value: "3-6 months"
         ❌ includes: "3-6 months" includes "0-3"
      🔍 Evaluating rule: timeline includes 3-6
         User value: "3-6 months"
         ✅ includes: "3-6 months" includes "3-6"
      🔍 Evaluating rule: timeline includes 6-12
         User value: "3-6 months"
         ❌ includes: "3-6 months" includes "6-12"
   📊 Rule group result: ✅ (1/3 rules matched)
      Weight: 8/24
   📈 Final score: 0.33 (min required: 0.5)
   ❌ Below minimum threshold - returning 0

   📊 FINAL SCORE: 0.00
============================================================


📊 ===== SUMMARY =====
Total steps tested: 10
Steps that matched: 0
Top 5 scores:
  1. Schedule No-Pressure Consultation: 0.00
  2. Launch Your Listing: 0.00
  3. Get Mortgage Pre-Approval: 0.00
  4. Start Viewing Properties: 0.00
  5. Prepare Your Offer Strategy: 0.00