import * as vscode from 'vscode';
import { DebugTracker } from '../debug/debugTracker';
import { isArrayLike, parseArrayValue, renderArrayHtml } from '../views/arrayRenderer';

export class VisualizerPanel {
  private panel: vscode.WebviewPanel | undefined;
  private tracker: DebugTracker;

  constructor(
    private context: vscode.ExtensionContext,
    tracker: DebugTracker
  ) {
    this.tracker = tracker;
  }

  open() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'cppDebugVisualizer',
      'C++ Debug Visualizer',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    this.panel.webview.html = this.getHtml([]);

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    const interval = setInterval(async () => {
      if (!this.panel) {
        clearInterval(interval);
        return;
      }
      const variables = await this.tracker.getVariables();
      this.panel.webview.html = this.getHtml(variables);
    }, 1000);
  }

  private getHtml(variables: any[]): string {
    const arrays: string[] = [];
    const scalars: any[] = [];

    for (const v of variables) {
      if (isArrayLike(v)) {
        const elements = parseArrayValue(v.value);
        arrays.push(renderArrayHtml(v.name, v.type ?? 'array', elements));
      } else {
        scalars.push(v);
      }
    }

    const scalarRows = scalars.length === 0
      ? `<tr><td colspan="3" class="empty">No scalar variables.</td></tr>`
      : scalars.map(v => `
          <tr>
            <td>${v.name}</td>
            <td><span class="type">${v.type ?? 'unknown'}</span></td>
            <td class="value">${v.value}</td>
          </tr>
        `).join('');

    const emptyMessage = variables.length === 0
      ? `<div class="empty-state">No active debug session or no variables found.</div>`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body {
      font-family: monospace;
      padding: 16px;
      background: #1e1e1e;
      color: #d4d4d4;
    }
    h2 {
      color: #569cd6;
      margin-bottom: 16px;
      border-bottom: 1px solid #333;
      padding-bottom: 8px;
    }
    h3 {
      color: #4ec9b0;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      text-align: left;
      padding: 8px;
      background: #2d2d2d;
      color: #9cdcfe;
      border-bottom: 1px solid #444;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #2d2d2d;
    }
    .type {
      color: #4ec9b0;
      font-size: 0.85em;
    }
    .value {
      color: #ce9178;
    }
    .empty, .empty-state {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 24px;
    }
    .array-container {
      margin: 16px 0;
      padding: 12px;
      background: #252526;
      border-radius: 6px;
      border-left: 3px solid #569cd6;
    }
    .array-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      font-size: 0.9em;
    }
    .array-name {
      color: #9cdcfe;
      font-weight: bold;
    }
    .array-type {
      color: #4ec9b0;
      font-size: 0.85em;
    }
    .array-size {
      color: #999;
      font-size: 0.8em;
      margin-left: auto;
    }
    .array-cells {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .array-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 50px;
      border: 1px solid #444;
      border-radius: 4px;
      overflow: hidden;
      transition: transform 0.15s;
    }
    .array-cell:hover {
      transform: translateY(-2px);
      border-color: #569cd6;
    }
    .array-value {
      padding: 8px 12px;
      background: #2d2d30;
      color: #ce9178;
      font-weight: bold;
    }
    .array-index {
      padding: 2px 6px;
      background: #1e1e1e;
      color: #666;
      font-size: 0.75em;
    }
  </style>
</head>
<body>
  <h2>C++ Debug Visualizer</h2>
  ${emptyMessage}
  ${arrays.length > 0 ? '<h3>Arrays & Vectors</h3>' + arrays.join('') : ''}
  ${scalars.length > 0 ? `
    <h3>Variables</h3>
    <table>
      <thead>
        <tr><th>Name</th><th>Type</th><th>Value</th></tr>
      </thead>
      <tbody>${scalarRows}</tbody>
    </table>
  ` : ''}
</body>
</html>`;
  }
}
