import { MCPRequest, MCPResponse, MCPError, Tool, Resource, NavigationCommand, NavigationContext } from '@/types/mcp';
import { GeminiClient } from './geminiClient';

export class MCPServer {
  private tools: Tool[] = [];
  private resources: Resource[] = [];
  private geminiClient: GeminiClient;
  private navigationCallbacks: {
    navigate: (target: string, params?: any) => void;
    interact: (target: string, params?: any) => void;
    getContext: () => NavigationContext;
  } | null = null;

  constructor() {
    this.geminiClient = new GeminiClient();
    this.initializeTools();
    this.initializeResources();
  }

  initializeGemini(apiKey: string) {
    this.geminiClient.initialize(apiKey);
  }

  setNavigationCallbacks(callbacks: {
    navigate: (target: string, params?: any) => void;
    interact: (target: string, params?: any) => void;
    getContext: () => NavigationContext;
  }) {
    this.navigationCallbacks = callbacks;
  }

  private initializeTools() {
    this.tools = [
      {
        name: 'navigate',
        description: 'Navigate to different pages in the interface',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'string',
              enum: ['ruka-hand', 'amazing-hand', 'interactive-hand', 'next', 'previous', 'back', 'home', 'exit', 'split', 'video', 'video-only', 'live-video']
            },
            parameters: {
              type: 'object'
            }
          },
          required: ['target']
        }
      },
      {
        name: 'interact',
        description: 'Interact with elements in the interface',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'string'
            },
            parameters: {
              type: 'object'
            }
          },
          required: ['target']
        }
      },
      {
        name: 'get_info',
        description: 'Get information about the interface or general topics',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string'
            }
          },
          required: ['query']
        }
      }
    ];
  }

  private initializeResources() {
    this.resources = [
      {
        uri: 'tenxer://navigation/context',
        name: 'Navigation Context',
        description: 'Current navigation state and context',
        mimeType: 'application/json'
      },
      {
        uri: 'tenxer://interface/help',
        name: 'Interface Help',
        description: 'Available commands and interface guide',
        mimeType: 'text/plain'
      }
    ];
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'tools/list':
          return {
            id: request.id,
            result: { tools: this.tools }
          };

        case 'resources/list':
          return {
            id: request.id,
            result: { resources: this.resources }
          };

        case 'tools/call':
          return await this.handleToolCall(request);

        case 'resources/read':
          return await this.handleResourceRead(request);

        default:
          return {
            id: request.id,
            error: {
              code: -32601,
              message: `Method not found: ${request.method}`
            }
          };
      }
    } catch (error) {
      return {
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private async handleToolCall(request: MCPRequest): Promise<MCPResponse> {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'navigate':
        if (this.navigationCallbacks) {
          this.navigationCallbacks.navigate(args.target, args.parameters);
          return {
            id: request.id,
            result: { success: true, message: `Navigated to ${args.target}` }
          };
        }
        break;

      case 'interact':
        if (this.navigationCallbacks) {
          this.navigationCallbacks.interact(args.target, args.parameters);
          return {
            id: request.id,
            result: { success: true, message: `Interacted with ${args.target}` }
          };
        }
        break;

      case 'get_info':
        const response = await this.geminiClient.getGeneralResponse(args.query);
        return {
          id: request.id,
          result: { response }
        };
    }

    return {
      id: request.id,
      error: {
        code: -32602,
        message: 'Invalid params'
      }
    };
  }

  private async handleResourceRead(request: MCPRequest): Promise<MCPResponse> {
    const { uri } = request.params;

    switch (uri) {
      case 'tenxer://navigation/context':
        const context = this.navigationCallbacks?.getContext();
        return {
          id: request.id,
          result: { 
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(context, null, 2)
            }]
          }
        };

      case 'tenxer://interface/help':
        const helpText = `
TenXer Interface Navigation Commands:

BASIC NAVIGATION:
- "go to ruka hand" - Navigate to Ruka Hand page
- "go to amazing hand" - Navigate to Amazing Hand preview  
- "go to interactive hand" - Navigate to interactive hand with dots
- "next page" / "previous page" - Navigate between pages
- "home" - Play video mode
- "exit" - Exit current mode

INTERACTION:
- "click dot [number]" - Interact with specific dot on hand
- "show code for [feature]" - Display code for hand features

GENERAL:
- Ask any question about robotics, automation, or the interface
        `;
        return {
          id: request.id,
          result: {
            contents: [{
              uri,
              mimeType: 'text/plain',
              text: helpText
            }]
          }
        };

      default:
        return {
          id: request.id,
          error: {
            code: -32602,
            message: `Resource not found: ${uri}`
          }
        };
    }
  }

  async processPrompt(prompt: string): Promise<{ command?: NavigationCommand; response?: string }> {
    if (!this.navigationCallbacks) {
      throw new Error('Navigation callbacks not set');
    }

    const context = this.navigationCallbacks.getContext();

    // Check if this is likely a UI/navigation command vs general question
    const navigationKeywords = [
      'go', 'open', 'show', 'navigate', 'switch', 'next', 'back', 'previous', 
      'ruka', 'rukka', 'amazing', 'interactive', 'hand', 'video', 'live', 'split', 'code', 'editor',
      'dot', 'point', 'click', 'page', 'home', 'exit', 'close'
    ];
    
    const isLikelyNavigation = navigationKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );

    // Lightweight local intent parser as a resilient fallback
    const localParse = (): { command?: NavigationCommand; response?: string } | null => {
      const p = prompt.toLowerCase().trim();

      // Interactions like "dot 1" / "point 2"
      const match = p.match(/(?:dot|point)\s*(\d+)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (!isNaN(idx)) {
          return {
            command: { action: 'interact', target: `dot-${idx}` },
            response: `Interacting with dot ${idx}`
          };
        }
      }

      const has = (...keys: string[]) => keys.some(k => p.includes(k));

      // Back/Next
      if (has('back', 'previous', 'prev', 'go back', 'back page', 'last page')) {
        return { command: { action: 'navigate', target: 'previous' }, response: 'Going back to previous page.' };
      }
      if (has('next', 'forward', 'go next', 'next page')) {
        return { command: { action: 'navigate', target: 'next' }, response: 'Moving to next page.' };
      }

      // Ruka pages (first/second)
      if (has('ruka', 'rukka')) {
        const page = has('second', '2', 'two') ? 1 : 0;
        return { command: { action: 'navigate', target: 'ruka-hand', parameters: { page } }, response: `Opening Ruka Hand ${page === 0 ? 'first' : 'second'} page.` };
      }

      // Amazing hand preview
      if (has('amazing', 'preview')) {
        return { command: { action: 'navigate', target: 'amazing-hand' }, response: 'Opening Amazing Hand.' };
      }

      // Interactive landing with dots
      if (has('interactive', 'dots', 'landing')) {
        return { command: { action: 'navigate', target: 'interactive-hand' }, response: 'Opening Interactive Hand.' };
      }

      // Video/Home
      if (has('home', 'video', 'play video', 'demo', 'live video', 'open live video')) {
        return { command: { action: 'navigate', target: 'home' }, response: 'Opening video.' };
      }

      // Split/Editor/Code
      if (has('split', 'code', 'editor', 'open code', 'show code', 'edit code', 'where i edit')) {
        return { command: { action: 'navigate', target: 'split' }, response: 'Opening split view with code.' };
      }

      if (has('exit', 'close')) {
        return { command: { action: 'navigate', target: 'exit' }, response: 'Exiting.' };
      }

      return null;
    };

    try {
      // First try local parsing for quick navigation commands
      const local = localParse();
      if (local) return local;

      if (isLikelyNavigation) {
        // For navigation-related prompts, use AI analysis
        try {
          const analysis = await this.geminiClient.analyzeNavigationIntent(prompt, context);
          console.log('AI Analysis:', analysis);

          if (analysis.confidence >= 50) {
            if (analysis.action === 'navigate' && analysis.target) {
              return { 
                command: { action: 'navigate', target: analysis.target, parameters: analysis.parameters },
                response: analysis.response
              };
            }
            if (analysis.action === 'interact' && analysis.target) {
              return { 
                command: { action: 'interact', target: analysis.target, parameters: analysis.parameters },
                response: analysis.response
              };
            }
            return { response: analysis.response };
          }
        } catch (navError) {
          console.error('Navigation analysis error:', navError);
          // Fall through to general response for navigation errors
        }
      }

      // For general questions or failed navigation analysis, use general response
      try {
        const generalResponse = await this.geminiClient.getGeneralResponse(prompt);
        return { response: generalResponse };
      } catch (generalError) {
        console.error('General response error:', generalError);
        // Fall through to fallback
      }

      // Final fallback
      if (isLikelyNavigation) {
        return { 
          response: "I understand you want to navigate. You can say: 'go to ruka hand', 'open amazing hand', 'next page', 'back', 'open split mode', or 'show live video'." 
        };
      } else {
        return {
          response: "I'm an AI assistant for this robotic hand interface. I can help you navigate between pages or answer questions about robotics and AI. What would you like to know?"
        };
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
      return { response: 'Sorry, I encountered an error processing your request. Please try again.' };
    }
  }
}