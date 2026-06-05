import * as vscode from 'vscode';
import { DebugTracker } from '../debug/debugTracker';

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

    // Rafraîchit les variables toutes les secondes pendant le debug
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
    const rows = variables.length === 0
      ? `<tr><td colspan="3" class="empty">No active debug session or no variables found.</td></tr>`
      : variables.map(v => `
          <tr>
            <td>${v.name}</td>
            <td><span class="type">${v.type ?? 'unknown'}</span></td>
            <td class="value">${v.value}</td>
          </tr>
        `).join('');

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
    tr:hover td {
      background: #2a2d2e;
    }
    .type {
      color: #4ec9b0;
      font-size: 0.85em;
    }
    .value {
      color: #ce9178;
    }
    .empty {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 24px;
    }
  </style>
</head>
<body>
  <h2>C++ Debug Visualizer</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
  }
}
