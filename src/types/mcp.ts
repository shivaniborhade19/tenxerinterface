// MCP Server Types and Interfaces
export interface MCPRequest {
    id: string;
    method: string;
    params?: any;
  }
  
  export interface MCPResponse {
    id: string;
    result?: any;
    error?: MCPError;
  }
  
  export interface MCPError {
    code: number;
    message: string;
    data?: any;
  }
  
  export interface NavigationCommand {
    action: 'navigate' | 'interact' | 'info';
    target?: string;
    parameters?: Record<string, any>;
  }
  
  export interface NavigationContext {
    currentView: string;
    currentIndex: number;
    videoPlaying: boolean;
    selectedPoint: string | null;
  }
  
  export interface Tool {
    name: string;
    description: string;
    inputSchema: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  }
  
  export interface Resource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
  }