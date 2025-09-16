import * as vscode from 'vscode';
import { JsonTreeViewerPanel } from './jsonTreeViewerPanel';

export function activate(context: vscode.ExtensionContext) {
    // Register command to open JSON tree viewer
    const disposable = vscode.commands.registerCommand('jsonTreeViewer.openViewer', async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found. Please open a JSON file first.');
            return;
        }

        // Get the document text
        const document = editor.document;
        const text = document.getText();

        // Check if it's a JSON file or has JSON content
        if (document.languageId !== 'json' && !isValidJSON(text)) {
            vscode.window.showErrorMessage('Please open a valid JSON file or select JSON content.');
            return;
        }

        // Create and show the JSON tree viewer panel
        JsonTreeViewerPanel.createOrShow(context.extensionUri, text);
    });

    context.subscriptions.push(disposable);
}

function isValidJSON(text: string): boolean {
    try {
        JSON.parse(text);
        return true;
    } catch {
        return false;
    }
}

export function deactivate() {}