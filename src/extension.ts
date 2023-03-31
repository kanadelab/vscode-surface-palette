import * as vscode from 'vscode';
import { SurfaceViewerEditorProvider } from './surfacePalette';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(SurfaceViewerEditorProvider.register(context));
}
