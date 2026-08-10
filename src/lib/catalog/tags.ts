/**
 * URL Replacement Tag System
 * Replaces tags like {{branch}} or {{product_title}} in strings.
 */

export function replaceTags(template: string, context: Record<string, string | number>): string {
  if (!template) return "";
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? String(context[key]) : match;
  });
}

/**
 * Example usage:
 * replaceTags("Hello {{customer_name}}, check out {{product_title}}!", { customer_name: "Ali", product_title: "Headphones" })
 */
