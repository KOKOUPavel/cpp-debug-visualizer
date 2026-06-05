import * as vscode from 'vscode';
import { DebugTracker } from './debug/debugTracker';
import { VisualizerPanel } from './panels/visualizerPanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('[CppDebugVisualizer] Extension activated');

  const tracker = new DebugTracker(context);
  tracker.register();

  const panel = new VisualizerPanel(context, tracker);

  const command = vscode.commands.registerCommand(
    'cpp-debug-visualizer.openPanel',
    () => panel.open()
  );

  context.subscriptions.push(command);
}

export function deactivate() {}
