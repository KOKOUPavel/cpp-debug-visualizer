import * as vscode from 'vscode';

export class DebugTracker {
  private session: vscode.DebugSession | undefined;

  constructor(private context: vscode.ExtensionContext) {}

  register() {
    // Détecte quand une session de debug démarre
    this.context.subscriptions.push(
      vscode.debug.onDidStartDebugSession((session) => {
        this.session = session;
        console.log(`[CppDebugVisualizer] Debug session started: ${session.name}`);
      })
    );

    // Détecte quand la session s'arrête
    this.context.subscriptions.push(
      vscode.debug.onDidTerminateDebugSession(() => {
        this.session = undefined;
        console.log('[CppDebugVisualizer] Debug session terminated');
      })
    );
  }

  // Récupère les variables du stack frame actuel
  async getVariables(): Promise<any[]> {
    if (!this.session) return [];

    try {
      const threads = await this.session.customRequest('threads');
      const threadId = threads.threads[0]?.id;
      if (!threadId) return [];

      const stackTrace = await this.session.customRequest('stackTrace', { threadId });
      const frameId = stackTrace.stackFrames[0]?.id;
      if (!frameId) return [];

      const scopes = await this.session.customRequest('scopes', { frameId });
      const locals = scopes.scopes.find((s: any) => s.name === 'Locals');
      if (!locals) return [];

      const variables = await this.session.customRequest('variables', {
        variablesReference: locals.variablesReference
      });

      return variables.variables;
    } catch (err) {
      console.error('[CppDebugVisualizer] Error fetching variables:', err);
      return [];
    }
  }

  getSession() {
    return this.session;
  }
}
