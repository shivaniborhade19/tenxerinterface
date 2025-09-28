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
        // General Q&A disabled: return guidance instead of calling Gemini
        return {
          id: request.id,
          result: { response: "General Q&A is disabled for this demo. Use navigation commands like 'go to ruka hand', 'next page', 'open split', 'home', or 'click dot 1'." }
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
      'go to', 'open', 'show me', 'navigate', 'switch', 'next', 'back', 'previous', 
      'click', 'page', 'home', 'exit', 'close', 'split', 'editor'
    ];
    
    const informationKeywords = [
      'what is', 'tell me about', 'information about', 'explain', 'describe', 'how does', 'why'
    ];
    
    const isLikelyNavigation = navigationKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    
    const isInformationRequest = informationKeywords.some(keyword =>
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

      // Ruka pages (first/second) - only for explicit navigation
      if (has('go to ruka', 'open ruka', 'show ruka', 'navigate ruka') || (has('ruka', 'rukka') && (has('go', 'open', 'show', 'navigate')))) {
        const page = has('first', '1', 'one') ? 0 : 1;
        return { command: { action: 'navigate', target: 'ruka-hand', parameters: { page } }, response: `Opening Ruka Hand ${page === 0 ? 'first' : 'second'} page.` };
      }

      // Amazing hand preview - only for explicit navigation
      if (has('go to amazing', 'open amazing', 'show me amazing', 'navigate amazing') || (has('amazing') && (has('go', 'open', 'show me', 'navigate')))) {
        return { command: { action: 'navigate', target: 'amazing-hand' }, response: 'Opening Amazing Hand.' };
      }

      // Interactive landing with dots - only for explicit navigation
      if (has('go to interactive', 'open interactive', 'show interactive', 'navigate interactive') || (has('interactive', 'dots', 'landing') && (has('go', 'open', 'show', 'navigate')))) {
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

      // If it's clearly an information request, skip navigation analysis
      if (isInformationRequest) {
        try {
          const generalResponse = await this.geminiClient.getGeneralResponse(prompt);
          return { response: generalResponse };
        } catch (generalError) {
          console.error('General response error:', generalError);
          // Fall through to fallback
        }
      }

      if (isLikelyNavigation && !isInformationRequest) {
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

      // Try to get a general response from Gemini for information requests
      try {
        const generalResponse = await this.geminiClient.getGeneralResponse(prompt);
        return { response: generalResponse };
      } catch (generalError) {
        console.error('General response error:', generalError);
        return { response: "I'm sorry, I couldn't process your question right now. You can also try navigation commands like: 'go to ruka hand', 'amazing hand', 'interactive hand', etc." };
      }

      // Final fallback
      if (isLikelyNavigation) {
        return { 
          response: "I understand you want to navigate. You can say: 'go to ruka hand', 'open amazing hand', 'next page', 'back', 'open split mode', or 'show live video'." 
        };
      } else {
        return {
          response: "This assistant is for UI navigation only. Try: 'go to ruka hand', 'amazing hand', 'interactive hand', 'next', 'back', 'home', 'open split', or 'click dot 1'."
        };
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
      return { response: 'Sorry, I encountered an error processing your request. Please try again.' };
    }
  }
}