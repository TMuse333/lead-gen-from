# Flow Configs & Result-Page Architecture

> **Project:** Real-estate lead-capture (Sell / Buy / Browse)  
> **Goal:** 3 distinct landing pages that share ~70% of the code, driven by a single configuration object.

---

## 1. High-Level Overview

| Flow | URL (example) | Core Purpose | Unique Result Section |
|------|---------------|--------------|-----------------------|
| `sell` | `/sell` | Home valuation + seller lead | **Estimated Value** |
| `buy`  | `/buy`  | Dream-home finder + buyer lead | **Best Neighborhoods / Financing Tips** |
| `browse` | `/browse` | Market-intel report | **Highlights / Suggested Filters** |

All three pages share:

* Header / Footer
* Hero section
* Market-trends chart
* Agent-advice carousel
* Next-steps + CTA
* Conditional sections toggled by `resultConfig`

---

## 2. `flowConfigs` – The Single Source of Truth

File: `src/data/flowConfig.ts`

```ts
export const flowConfigs: Record<FlowType, FlowConfig> = { … }