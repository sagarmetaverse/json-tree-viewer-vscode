# JSON Tree Viewer

A Visual Studio Code extension that provides an interactive tree view for JSON data. This extension allows you to visualize JSON files in a collapsible tree structure, making it easier to navigate and understand complex JSON data.

## Features

- 🌳 **Interactive Tree View**: View JSON data in a collapsible tree structure
- 🎨 **Syntax Highlighting**: Color-coded JSON elements (strings, numbers, booleans, null values)
- 📁 **Expandable Nodes**: Click to expand/collapse objects and arrays
- 🔍 **Context Menu Integration**: Right-click on JSON files or JSON content to open tree viewer
- ⚡ **Fast Rendering**: Efficient tree generation for large JSON files
- 🎯 **VSCode Theme Integration**: Automatically adapts to your VSCode theme

## Usage

### Method 1: From File Explorer
1. Right-click on any `.json` file in the file explorer
2. Select "Open JSON Tree Viewer" from the context menu

### Method 2: From Open JSON Editor
1. Open a JSON file in the editor
2. Right-click in the editor
3. Select "Open JSON Tree Viewer" from the context menu

### Method 3: Using Command Palette
1. Open a JSON file or select JSON content
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the command palette
3. Type "Open JSON Tree Viewer" and press Enter

## Installation

### From VSIX (Development)
1. Download the `.vsix` file
2. Open VSCode
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click on the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

### Development Setup
1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to open a new Extension Development Host window
4. Test the extension with JSON files

## Requirements

- Visual Studio Code 1.74.0 or higher
- Valid JSON content

## Extension Settings

This extension contributes the following commands:

- `jsonTreeViewer.openViewer`: Open JSON Tree Viewer

## Known Issues

- Large JSON files (>1MB) may take a moment to render
- Very deeply nested structures may cause performance issues

## Release Notes

### 0.1.0

Initial release of JSON Tree Viewer:
- Basic tree view functionality
- Context menu integration
- Syntax highlighting
- Expandable/collapsible nodes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Enjoy exploring your JSON data! 🎉**