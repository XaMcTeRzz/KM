export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

export function sanitizeNumber(input: string): number {
  const sanitized = input.replace(/[^\d.]/g, '');
  return parseFloat(sanitized) || 0;
}