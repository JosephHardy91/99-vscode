import * as vscode from 'vscode';
import { Point, Range } from '../types';

export interface FunctionInfo {
  functionRange: Range;
  bodyRange: Range;
  name: string;
}

export interface LanguageService {
  detectFunction(document: vscode.TextDocument, position: Point): FunctionInfo | null;
}

class TypeScriptLanguageService implements LanguageService {
  detectFunction(document: vscode.TextDocument, position: Point): FunctionInfo | null {
    const text = document.getText();
    const lines = text.split('\n');
    
    // Find the function containing the cursor position
    // This is a simplified implementation - a real one would use tree-sitter or the TS language service
    let functionStart = -1;
    let braceDepth = 0;
    let functionEnd = -1;
    let bodyStart = -1;
    let functionName = '';

    // Scan backwards to find function start
    for (let i = position.row; i >= 0; i--) {
      const line = lines[i];
      const functionMatch = line.match(/^\s*(export\s+)?(async\s+)?function\s+(\w+)|^\s*(\w+)\s*\([^)]*\)\s*{|^\s*(\w+)\s*:\s*\([^)]*\)\s*=>/);
      
      if (functionMatch) {
        functionStart = i;
        functionName = functionMatch[3] || functionMatch[4] || functionMatch[5] || 'anonymous';
        break;
      }
      
      // Also check for arrow functions and methods
      const arrowMatch = line.match(/^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
      if (arrowMatch) {
        functionStart = i;
        functionName = arrowMatch[1];
        break;
      }
    }

    if (functionStart === -1) {
      return null;
    }

    // Find the body start (first opening brace)
    for (let i = functionStart; i < lines.length; i++) {
      const line = lines[i];
      const braceIndex = line.indexOf('{');
      if (braceIndex !== -1) {
        bodyStart = i;
        braceDepth = 1;
        break;
      }
    }

    if (bodyStart === -1) {
      return null;
    }

    // Find the function end (matching closing brace)
    for (let i = bodyStart + 1; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            functionEnd = i;
            break;
          }
        }
      }
      if (braceDepth === 0) {
        break;
      }
    }

    if (functionEnd === -1) {
      functionEnd = lines.length - 1;
    }

    return {
      functionRange: {
        start: { row: functionStart, col: 0 },
        end: { row: functionEnd, col: lines[functionEnd].length },
      },
      bodyRange: {
        start: { row: bodyStart, col: lines[bodyStart].indexOf('{') + 1 },
        end: { row: functionEnd, col: lines[functionEnd].indexOf('}') },
      },
      name: functionName,
    };
  }
}

class LuaLanguageService implements LanguageService {
  detectFunction(document: vscode.TextDocument, position: Point): FunctionInfo | null {
    const text = document.getText();
    const lines = text.split('\n');
    
    let functionStart = -1;
    let functionEnd = -1;
    let functionName = '';

    // Scan backwards to find function start
    for (let i = position.row; i >= 0; i--) {
      const line = lines[i];
      const functionMatch = line.match(/^\s*(?:local\s+)?function\s+(\w+)|^\s*(\w+)\s*=\s*function/);
      
      if (functionMatch) {
        functionStart = i;
        functionName = functionMatch[1] || functionMatch[2] || 'anonymous';
        break;
      }
    }

    if (functionStart === -1) {
      return null;
    }

    // Find the function end
    let depth = 1;
    for (let i = functionStart + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('function')) {
        depth++;
      } else if (line === 'end' || line.startsWith('end ')) {
        depth--;
        if (depth === 0) {
          functionEnd = i;
          break;
        }
      }
    }

    if (functionEnd === -1) {
      functionEnd = lines.length - 1;
    }

    return {
      functionRange: {
        start: { row: functionStart, col: 0 },
        end: { row: functionEnd, col: lines[functionEnd].length },
      },
      bodyRange: {
        start: { row: functionStart + 1, col: 0 },
        end: { row: functionEnd - 1, col: lines[functionEnd - 1].length },
      },
      name: functionName,
    };
  }
}

export class LanguageServiceManager {
  private services: Map<string, LanguageService> = new Map();

  constructor() {
    this.services.set('typescript', new TypeScriptLanguageService());
    this.services.set('javascript', new TypeScriptLanguageService());
    this.services.set('lua', new LuaLanguageService());
  }

  getService(languageId: string): LanguageService | null {
    return this.services.get(languageId) || null;
  }

  detectFunction(document: vscode.TextDocument, position: Point): FunctionInfo | null {
    const service = this.getService(document.languageId);
    if (!service) {
      return null;
    }
    return service.detectFunction(document, position);
  }
}

export const languageServiceManager = new LanguageServiceManager();
