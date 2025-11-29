/**
 * Type definitions for generic LLM output components
 * These types provide structure while remaining flexible for various offer types
 */

/**
 * Primitive value types that can appear in LLM output
 */
export type PrimitiveValue = string | number | boolean | null | undefined;

/**
 * A value that can be nested in LLM output
 */
export type OutputValue = 
  | PrimitiveValue
  | OutputValue[]
  | { [key: string]: OutputValue };

/**
 * Base structure for any LLM output component
 * All offer types should extend this
 */
export interface BaseLlmOutputComponent {
  /** Optional title/heading for the component */
  title?: string;
  /** Optional heading (alternative to title) */
  heading?: string;
  /** Optional content/text */
  content?: string;
  /** Optional text (alternative to content) */
  text?: string;
  /** Optional message */
  message?: string;
  /** Allow additional properties for flexibility */
  [key: string]: OutputValue;
}

/**
 * Type guard to check if a value is a simple content object
 * (has title/heading and content/text/message)
 */
export function isSimpleContent(value: unknown): value is BaseLlmOutputComponent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  const hasTitle = 'title' in obj || 'heading' in obj;
  const hasContent = 'content' in obj || 'text' in obj || 'message' in obj;
  
  // Consider it simple content if it has title/heading and content/text/message
  // and has 3 or fewer top-level keys (to avoid matching complex objects)
  return hasTitle && hasContent && Object.keys(obj).length <= 3;
}

/**
 * Type guard to check if a value is a key-value data structure
 */
export function isKeyValueData(value: unknown): value is Record<string, OutputValue> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  // Must have at least one key
  return Object.keys(obj).length > 0;
}

/**
 * Type guard to check if a value is a valid output component
 */
export function isValidOutputComponent(value: unknown): value is Record<string, OutputValue> {
  return value !== null && 
         value !== undefined && 
         typeof value === 'object' && 
         !Array.isArray(value);
}

/**
 * Format a key from camelCase/PascalCase to readable format
 */
export function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Format a value for display
 */
export function formatValue(value: OutputValue): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    return value.map(v => formatValue(v)).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

