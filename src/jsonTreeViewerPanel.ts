import * as vscode from 'vscode';

export class JsonTreeViewerPanel {
    public static currentPanel: JsonTreeViewerPanel | undefined;
    public static readonly viewType = 'jsonTreeViewer';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, jsonContent: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (JsonTreeViewerPanel.currentPanel) {
            JsonTreeViewerPanel.currentPanel._panel.reveal(column);
            JsonTreeViewerPanel.currentPanel._updateContent(jsonContent);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            JsonTreeViewerPanel.viewType,
            'JSON Tree Viewer',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media')
                ]
            }
        );

        JsonTreeViewerPanel.currentPanel = new JsonTreeViewerPanel(panel, extensionUri);
        JsonTreeViewerPanel.currentPanel._updateContent(jsonContent);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._updateContent('{}');

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        JsonTreeViewerPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _updateContent(jsonContent: string) {
        this._panel.webview.html = this._getHtmlForWebview(jsonContent);
    }

    private _getHtmlForWebview(jsonContent: string): string {
        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonContent);
        } catch (error) {
            return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>JSON Tree Viewer</title>
                    <style>
                        body { font-family: var(--vscode-font-family); background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 20px; }
                        .error { color: var(--vscode-errorForeground); }
                    </style>
                </head>
                <body>
                    <h1>JSON Tree Viewer</h1>
                    <div class="error">Error: Invalid JSON content</div>
                    <pre>${this._escapeHtml(error instanceof Error ? error.message : 'Unknown error')}</pre>
                </body>
                </html>
            `;
        }

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>JSON Tree Viewer</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        background: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 20px;
                        line-height: 1.6;
                    }
                    
                    .json-tree {
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                    }
                    
                    .json-key {
                        color: var(--vscode-symbolIcon-propertyForeground, #9CDCFE);
                        font-weight: bold;
                    }
                    
                    .json-string {
                        color: var(--vscode-symbolIcon-stringForeground, #CE9178);
                    }
                    
                    .json-number {
                        color: var(--vscode-symbolIcon-numberForeground, #B5CEA8);
                    }
                    
                    .json-boolean {
                        color: var(--vscode-symbolIcon-booleanForeground, #569CD6);
                    }
                    
                    .json-null {
                        color: var(--vscode-symbolIcon-nullForeground, #569CD6);
                    }
                    
                    .json-object, .json-array {
                        margin-left: 20px;
                    }
                    
                    .json-toggle {
                        cursor: pointer;
                        user-select: none;
                        display: inline-block;
                        width: 12px;
                        color: var(--vscode-symbolIcon-arrayForeground, #CCCCCC);
                    }
                    
                    .json-toggle:before {
                        content: '▶';
                    }
                    
                    .json-toggle.expanded:before {
                        content: '▼';
                    }
                    
                    .json-content {
                        display: none;
                    }
                    
                    .json-content.expanded {
                        display: block;
                    }
                    
                    .json-line {
                        margin: 2px 0;
                    }
                    
                    .json-comma {
                        color: var(--vscode-editor-foreground);
                    }
                    
                    h1 {
                        color: var(--vscode-titleBar-activeForeground);
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <h1>JSON Tree Viewer</h1>
                <div class="json-tree">
                    ${this._generateTree(parsedJson)}
                </div>
                
                <script>
                    document.addEventListener('click', function(e) {
                        if (e.target.classList.contains('json-toggle')) {
                            const content = e.target.nextElementSibling;
                            if (content && content.classList.contains('json-content')) {
                                e.target.classList.toggle('expanded');
                                content.classList.toggle('expanded');
                            }
                        }
                    });
                    
                    // Auto-expand first level
                    document.querySelectorAll('.json-toggle').forEach((toggle, index) => {
                        if (index < 5) { // Expand first 5 items
                            toggle.click();
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }

    private _generateTree(obj: any, key?: string, level: number = 0): string {
        const indent = '  '.repeat(level);
        
        if (obj === null) {
            const keyPart = key ? `<span class="json-key">"${this._escapeHtml(key)}"</span>: ` : '';
            return `${indent}<div class="json-line">${keyPart}<span class="json-null">null</span></div>`;
        }
        
        if (typeof obj === 'string') {
            const keyPart = key ? `<span class="json-key">"${this._escapeHtml(key)}"</span>: ` : '';
            return `${indent}<div class="json-line">${keyPart}<span class="json-string">"${this._escapeHtml(obj)}"</span></div>`;
        }
        
        if (typeof obj === 'number') {
            const keyPart = key ? `<span class="json-key">"${this._escapeHtml(key)}"</span>: ` : '';
            return `${indent}<div class="json-line">${keyPart}<span class="json-number">${obj}</span></div>`;
        }
        
        if (typeof obj === 'boolean') {
            const keyPart = key ? `<span class="json-key">"${this._escapeHtml(key)}"</span>: ` : '';
            return `${indent}<div class="json-line">${keyPart}<span class="json-boolean">${obj}</span></div>`;
        }
        
        if (Array.isArray(obj)) {
            const keyPart = key ? `<span class="json-key">"${this._escapeHtml(key)}"</span>: ` : '';
            if (obj.length === 0) {
                return `${indent}<div class="json-line">${keyPart}[]</div>`;
            }
            
            let result = `${indent}<div class="json-line">${keyPart}<span class="json-toggle"></span>[</div>`;
            result += `${indent}<div class="json-content json-array">`;
            
            obj.forEach((item, index) => {
                result += this._generateTree(item, undefined, level + 1);
                if (index < obj.length - 1) {
                    result += `<span class="json-comma">,</span>`;
                }
                result += '\n';
            });
            
            result += `${indent}]</div>`;
            return result;
        }
        
        if (typeof obj === 'object') {
            const keyPart = key ? `<span class="json-key">"${this._escapeHtml(key)}"</span>: ` : '';
            const keys = Object.keys(obj);
            
            if (keys.length === 0) {
                return `${indent}<div class="json-line">${keyPart}{}</div>`;
            }
            
            let result = `${indent}<div class="json-line">${keyPart}<span class="json-toggle"></span>{</div>`;
            result += `${indent}<div class="json-content json-object">`;
            
            keys.forEach((objKey, index) => {
                result += this._generateTree(obj[objKey], objKey, level + 1);
                if (index < keys.length - 1) {
                    result += `<span class="json-comma">,</span>`;
                }
                result += '\n';
            });
            
            result += `${indent}}</div>`;
            return result;
        }
        
        return `${indent}<div class="json-line">Unknown type</div>`;
    }

    private _escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}