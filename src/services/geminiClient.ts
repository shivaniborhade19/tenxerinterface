import { GoogleGenerativeAI } from '@google/generative-ai';
import { NavigationCommand, NavigationContext } from '@/types/mcp';

export class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash-latest which is the correct model name
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async analyzeNavigationIntent(prompt: string, context: NavigationContext): Promise<{
    action: 'navigate' | 'interact' | 'info';
    target?: string;
    parameters?: Record<string, any>;
    confidence: number;
    reasoning: string;
    response: string;
  }> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please provide API key.');
    }

    const systemPrompt = `You are an intelligent navigation assistant for a robotic hand interface called TenXer. 

CURRENT CONTEXT:
- Current view: ${context.currentView}
- Current page index: ${context.currentIndex} (0=Ruka Hand (first), 1=Ruka Hand (second), 2=Amazing Hand Preview, 3=Interactive Hand with dots)
- Video playing: ${context.videoPlaying}
- Selected point: ${context.selectedPoint || 'none'}

AVAILABLE NAVIGATION TARGETS:
- "ruka-hand" (page 0 or 1 via parameters.page): Shows the Ruka Hand image
- "amazing-hand" (page 2): Shows Amazing Hand preview image  
- "interactive-hand" (page 3): Shows interactive hand with clickable dots
- "split": Open split mode (hand + code editor)
- "next": Move to next page
- "previous": Move to previous page
- "home": Toggle video mode
- "exit": Exit current view

INTERACTION TARGETS:
- "dot-1", "dot-2", "point-1", "point-2", etc.: Click specific dots on interactive hand

YOUR TASK: Analyze the user's prompt intelligently and determine:
1. What ACTION they want: "navigate", "interact", or "info"
2. What TARGET (if navigation/interaction)
3. Your CONFIDENCE level (0-100)
4. Your REASONING for this decision
5. A helpful RESPONSE to the user

Be smart about understanding different ways people express the same intent:
- "show ruka hand", "go to ruka", "ruka page", "first page", "page 0" → navigate to "ruka-hand" with parameters.page=0
- "ruka second", "second page" → navigate to "ruka-hand" with parameters.page=1
- "amazing hand", "preview", "page 2" → navigate to "amazing-hand"  
- "interactive", "dots", "landing", "page 3" → navigate to "interactive-hand"
- "play video", "demo", "start video", "home", "open live video" → navigate to "home"
- "open code", "split mode", "editor", "how to edit" → navigate to "split"
- "next", "forward", "go forward" → navigate to "next"
- "back", "previous", "go back" → navigate to "previous"
- "click dot 1", "point 2", "interact with dot", "select point" → interact with specific point
- Questions about robotics, hands, technology → info with helpful response

Return ONLY valid JSON with this exact structure:
{
  "action": "navigate",
  "target": "ruka-hand",
  "confidence": 95,
  "reasoning": "User clearly wants to go to the ruka hand page",
  "response": "Navigating to the Ruka Hand page"
}`;

    try {
      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: `Analyze this user prompt: "${prompt}"` }
      ]);

      const responseText = result.response.text().trim();
      
      // Try to extract JSON from the response
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          action: analysis.action || 'info',
          target: analysis.target || undefined,
          parameters: analysis.parameters || undefined,
          confidence: analysis.confidence || 50,
          reasoning: analysis.reasoning || 'AI analysis performed',
          response: analysis.response || responseText
        };
      }

      // Fallback if JSON parsing fails
      return {
        action: 'info',
        confidence: 30,
        reasoning: 'Failed to parse AI response as structured data',
        response: responseText || 'I analyzed your request but couldn\'t determine a specific action.'
      };
    } catch (error) {
      console.error('Error analyzing navigation intent:', error);
      return {
        action: 'info',
        confidence: 0,
        reasoning: 'Error occurred during AI analysis',
        response: 'I encountered an error while analyzing your request. Please try rephrasing your question.'
      };
    }
  }

  async parseNavigationIntent(prompt: string, context: NavigationContext): Promise<NavigationCommand | null> {
    const analysis = await this.analyzeNavigationIntent(prompt, context);
    
    if (analysis.action === 'navigate' && analysis.target && analysis.confidence >= 60) {
      return {
        action: 'navigate',
        target: analysis.target,
        parameters: { response: analysis.response }
      };
    } else if (analysis.action === 'interact' && analysis.target && analysis.confidence >= 60) {
      return {
        action: 'interact',
        target: analysis.target,
        parameters: { response: analysis.response }
      };
    } else {
      return {
        action: 'info',
        target: 'general',
        parameters: { response: analysis.response }
      };
    }
  }

  async getGeneralResponse(prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please provide API key.');
    }

    const systemPrompt = `
You are an AI assistant for a robotic hand interface called TenXer. You can help with:
1. Navigation commands (but prioritize returning navigation JSON)
2. Information about robotic hands, technology, and automation
3. General questions about the interface
4. Technical explanations

Keep responses concise and helpful. If the user asks about navigation, guide them on available commands.

User question: "${prompt}"
`;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting general response:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }
}