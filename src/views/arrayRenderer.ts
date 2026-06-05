// Renders C++ arrays/vectors as visual blocks

export interface ArrayElement {
  index: number;
  value: string;
}

export function isArrayLike(variable: any): boolean {
  if (!variable) return false;
  const type = (variable.type ?? '').toLowerCase();
  // Detect std::vector, std::array, C arrays, etc.
  return (
    type.includes('vector') ||
    type.includes('array') ||
    /\[\d+\]/.test(type) ||
    (variable.value ?? '').startsWith('{')
  );
}

export function parseArrayValue(value: string): ArrayElement[] {
  // Parses values like "{1, 2, 3, 4, 5}" into elements
  const match = value.match(/\{(.+)\}/);
  if (!match) return [];

  const inner = match[1];
  const parts = inner.split(',').map(p => p.trim());

  return parts.map((value, index) => ({ index, value }));
}

export function renderArrayHtml(name: string, type: string, elements: ArrayElement[]): string {
  if (elements.length === 0) {
    return `<div class="array-empty">Empty array</div>`;
  }

  const cells = elements.map(el => `
    <div class="array-cell">
      <div class="array-value">${el.value}</div>
      <div class="array-index">[${el.index}]</div>
    </div>
  `).join('');

  return `
    <div class="array-container">
      <div class="array-header">
        <span class="array-name">${name}</span>
        <span class="array-type">${type}</span>
        <span class="array-size">size: ${elements.length}</span>
      </div>
      <div class="array-cells">${cells}</div>
    </div>
  `;
}
