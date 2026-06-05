import * as vscode from 'vscode';
import { DebugTracker } from './debug/debugTracker';

export function activate(context: vscode.ExtensionContext) {
  console.log('[CppDebugVisualizer] Extension activated');

  const tracker = new DebugTracker(context);
  tracker.register();

  const command = vscode.commands.registerCommand(
    'cpp-debug-visualizer.openPanel',
    () => {
      vscode.window.showInformationMessage('C++ Debug Visualizer is ready!');
    }
  );

  context.subscriptions.push(command);
}

export function deactivate() {}
