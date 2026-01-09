// lib/colors/colorUtils.ts
// Utilities for working with color themes

import { ColorTheme, DEFAULT_THEME } from './defaultTheme';
import { determineTextColor, determineTextColorForGradient } from './contrastUtils';

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Generate CSS variables from a color theme
 * Includes auto-calculated contrast text colors for accessibility
 */
export function generateCSSVariables(theme: ColorTheme): string {
  // Auto-calculate text colors for optimal contrast
  const textOnBackground = determineTextColor(theme.background);
  const textOnSurface = determineTextColor(theme.surface);
  const textOnPrimary = determineTextColor(theme.primary);
  const textOnGradient = determineTextColorForGradient(theme.gradientFrom, theme.gradientTo);

  // Secondary text (dimmed) versions
  const textOnBackgroundDim = textOnBackground === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)';
  const textOnSurfaceDim = textOnSurface === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)';

  return `
    :root {
      --color-primary: ${theme.primary};
      --color-primary-rgb: ${hexToRgb(theme.primary)};
      --color-secondary: ${theme.secondary};
      --color-secondary-rgb: ${hexToRgb(theme.secondary)};
      --color-background: ${theme.background};
      --color-background-rgb: ${hexToRgb(theme.background)};
      --color-surface: ${theme.surface};
      --color-surface-rgb: ${hexToRgb(theme.surface)};
      --color-text: ${theme.text};
      --color-text-rgb: ${hexToRgb(theme.text)};
      --color-text-secondary: ${theme.textSecondary};
      --color-text-secondary-rgb: ${hexToRgb(theme.textSecondary)};
      --color-border: ${theme.border};

      /* Auto-contrast text colors - use these for text on colored backgrounds */
      --color-text-on-background: ${textOnBackground};
      --color-text-on-background-dim: ${textOnBackgroundDim};
      --color-text-on-surface: ${textOnSurface};
      --color-text-on-surface-dim: ${textOnSurfaceDim};
      --color-text-on-primary: ${textOnPrimary};
      --color-text-on-gradient: ${textOnGradient};

      /* Placeholder color */
      --color-placeholder: rgba(${hexToRgb(theme.textSecondary)}, 0.5);
      --color-success: ${theme.success};
      --color-error: ${theme.error};
      --color-warning: ${theme.warning};
      --color-accent: ${theme.accent};
      --color-button-hover: ${theme.buttonHover};
      --color-gradient-from: ${theme.gradientFrom};
      --color-gradient-to: ${theme.gradientTo};
    }

    /* Global placeholder styling */
    input::placeholder,
    textarea::placeholder {
      color: var(--color-placeholder) !important;
    }
  `;
}

/**
 * Get theme from config or return default
 */
export function getTheme(colorConfig: ColorTheme | null | undefined): ColorTheme {
  if (!colorConfig) {
    return DEFAULT_THEME;
  }
  return colorConfig;
}

/**
 * Derive a color palette from base colors for UI components
 */
export function deriveColorPalette(
  colors: { textColor: string; baseBgColor: string; mainColor: string; bgLayout?: unknown },
  _type?: string
) {
  return {
    accentColor: colors.mainColor,
    lightAccent: colors.mainColor,
    darkAccent: colors.mainColor,
    textColor: colors.textColor,
  };
}

/**
 * Generate an animated gradient background CSS value
 */
export function useAnimatedGradient(
  bgLayout: { type?: string; colors?: string[]; direction?: string },
  colors: { lightAccent?: string; darkAccent?: string }
) {
  if (bgLayout.type === 'gradient' && bgLayout.colors?.length) {
    const direction = bgLayout.direction || 'to right';
    return `linear-gradient(${direction}, ${bgLayout.colors.join(', ')})`;
  }
  if (colors.lightAccent && colors.darkAccent) {
    return `linear-gradient(135deg, ${colors.lightAccent}, ${colors.darkAccent})`;
  }
  return 'transparent';
}

/**
 * Inject CSS variables into the document
 */
export function injectColorTheme(theme: ColorTheme) {
  if (typeof window === 'undefined') return;
  
  const styleId = 'bot-color-theme';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = generateCSSVariables(theme);
}

