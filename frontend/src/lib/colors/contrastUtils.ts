// lib/colors/contrastUtils.ts
// Utilities for determining text color based on background contrast

/**
 * Calculate the relative luminance of a color (0-1)
 * Based on WCAG 2.0 standards
 */
function getLuminance(hex: string): number {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const [rLinear, gLinear, bLinear] = [r, g, b].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 (no contrast) and 21 (maximum contrast)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine the best text color (light or dark) for a given background color
 * Returns a light text color (#ffffff or similar) for dark backgrounds
 * Returns a dark text color (#1e293b or similar) for light backgrounds
 * 
 * @param backgroundColor - Hex color string (e.g., '#ffffff' or '#1e293b')
 * @param lightText - Optional light text color (default: '#ffffff')
 * @param darkText - Optional dark text color (default: '#1e293b')
 * @returns The appropriate text color hex string
 */
export function determineTextColor(
  backgroundColor: string,
  lightText: string = '#ffffff',
  darkText: string = '#1e293b'
): string {
  // Handle CSS variables
  if (backgroundColor.startsWith('var(') || backgroundColor.startsWith('rgba(') || backgroundColor.startsWith('rgb(')) {
    // For CSS variables, we'll need to get the computed value
    // For now, default to a safe choice based on common patterns
    // This is a fallback - ideally we'd resolve the CSS variable
    return darkText;
  }

  // Normalize hex color
  let hex = backgroundColor;
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }

  // Calculate luminance of background
  const luminance = getLuminance(hex);
  
  // WCAG 2.0 recommends a luminance threshold of 0.5
  // If background is light (luminance > 0.5), use dark text
  // If background is dark (luminance <= 0.5), use light text
  return luminance > 0.5 ? darkText : lightText;
}

/**
 * Get text color for a gradient background
 * Since gradients can have varying colors, we check both gradient colors
 * and return the safest option (usually dark text for light gradients, light for dark)
 */
export function determineTextColorForGradient(
  gradientFrom: string,
  gradientTo: string,
  lightText: string = '#ffffff',
  darkText: string = '#1e293b'
): string {
  const lumFrom = getLuminance(gradientFrom);
  const lumTo = getLuminance(gradientTo);
  const avgLuminance = (lumFrom + lumTo) / 2;
  
  return avgLuminance > 0.5 ? darkText : lightText;
}

/**
 * Get a contrasting color that ensures good readability
 * This is useful for borders, outlines, or secondary text on colored backgrounds
 */
export function getContrastingColor(
  backgroundColor: string,
  minContrast: number = 4.5 // WCAG AA standard for normal text
): string {
  const lightText = '#ffffff';
  const darkText = '#1e293b';
  
  const contrastWithLight = getContrastRatio(backgroundColor, lightText);
  const contrastWithDark = getContrastRatio(backgroundColor, darkText);
  
  // Choose the option with better contrast
  if (contrastWithLight >= minContrast && contrastWithLight > contrastWithDark) {
    return lightText;
  } else if (contrastWithDark >= minContrast) {
    return darkText;
  }
  
  // Fallback: return the option with better contrast even if below threshold
  return contrastWithLight > contrastWithDark ? lightText : darkText;
}

