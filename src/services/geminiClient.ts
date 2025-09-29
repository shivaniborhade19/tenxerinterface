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

  getAmazingHandInfo(): string {
    return `The Amazing Hand is a revolutionary high-performance humanoid hand that solves two major problems in robotics: sky-high prices and bulky, forearm-mounted actuators.

🔧 **Technical Specifications:**
• 8 degrees of freedom (DOF) - 4-finger hand with 2 DOFs per finger
• Dual hobby-grade servo motors per finger (flexion/extension & abduction/adduction via differential motion)
• Rigid "bones" + soft TPU shells for object-friendly contact
• Fully 3D printable design
• Weight: 400g
• Cost: Less than €200 in off-the-shelf parts

💡 **Key Innovation:**
The Amazing Hand packs 8 degrees of freedom into a fully self-contained, 3D-printed hand that costs less than €200, making advanced robotics accessible to everyone.

🎯 **Inspiration:**
Based on the "ILDA hand" research project which describes an anthropomorphic hand with linear actuators (Kim, U., Jung, D., Jeong, H. et al. 2021).

📋 **Project Goals:**
• Open-source AI and robotics commitment
• Simplified ILDA hand concept to lower entry costs
• Enable experimentation with anthropomorphic hands
• Part of Pollen Robotics' open-source initiatives (following PincOpen gripper release)

💰 **Cost Breakdown:**
The entire hand costs less than €200 using off-the-shelf parts, making it one of the most affordable high-performance robotic hands available.`;
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

    // Check if user is asking about Amazing Hand details
    const amazingHandKeywords = ['amazing hand', 'tell me about amazing', 'details about amazing', 'what is amazing hand', 'amazing hand information'];
    const isAskingAboutAmazingHand = amazingHandKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    );

    // Check if user is asking about Amazing Hand costs specifically
    const costKeywords = ['cost', 'price', 'costing', 'expensive', 'cheap', 'budget', 'money', 'euro', '€', 'dollar', '$'];
    const isAskingAboutCost = costKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    ) && (amazingHandKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    ) || prompt.toLowerCase().includes('hand'));

    // Check if user is asking about making changes to the hand
    const changeKeywords = ['change', 'edit', 'modify', 'customize', 'update', 'code', 'programming'];
    const handKeywords = ['hand', 'finger', 'joint', 'movement'];
    const isAskingAboutChanges = changeKeywords.some(change => 
      prompt.toLowerCase().includes(change.toLowerCase())
    ) && handKeywords.some(hand => 
      prompt.toLowerCase().includes(hand.toLowerCase())
    );

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
- "split": Open split mode (hand + code editor) - USE THIS when users want to make changes, edit, or code
- "next": Move to next page
- "previous": Move to previous page
- "home": Toggle video mode
- "exit": Exit current view

INTERACTION TARGETS:
- "dot-1", "dot-2", "point-1", "point-2", etc.: Click specific dots on interactive hand

SPECIAL HANDLING:
- If user asks about MAKING CHANGES/EDITING the hand: → navigate to "split" and explain they need the code editor
- If user asks about AMAZING HAND DETAILS: → action "info" with detailed project information
- If user asks about AMAZING HAND COSTS: → action "info" with specific cost breakdown and pricing details
- If user wants to go to specific hand pages: → provide encouraging response and navigate there

YOUR TASK: Analyze the user's prompt intelligently and determine:
1. What ACTION they want: "navigate", "interact", or "info"
2. What TARGET (if navigation/interaction)
3. Your CONFIDENCE level (0-100)
4. Your REASONING for this decision
5. A helpful RESPONSE to the user

Be smart about understanding different ways people express the same intent:
- "How do I change this hand?", "edit the hand", "modify movements" → navigate to "split" (code editor)
- "show ruka hand", "go to ruka", "ruka page", "first page" → navigate to "ruka-hand" with parameters.page=0
- "amazing hand details", "tell me about amazing hand" → info with "fetch-amazing-hand"
- "interactive", "dots", "landing" → navigate to "interactive-hand"
- "open code", "split mode", "editor" → navigate to "split"

Return ONLY valid JSON with this exact structure:
{
  "action": "navigate",
  "target": "split",
  "confidence": 95,
  "reasoning": "User wants to make changes to the hand, which requires the code editor",
  "response": "To make changes to the hand, you'll need the code editor. Opening split mode now!"
}`;

    try {
      let enrichedPrompt = prompt;
      
      // If asking about Amazing Hand, include detailed project data
      if (isAskingAboutAmazingHand) {
        const amazingHandInfo = this.getAmazingHandInfo();
        enrichedPrompt += `\n\nAmazing Hand Project Details: ${amazingHandInfo}`;
      }

      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: `Analyze this user prompt: "${enrichedPrompt}"` }
      ]);

      const responseText = result.response.text().trim();
      
      // Try to extract JSON from the response
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Enhance response for specific cases
        if (isAskingAboutChanges && analysis.action === 'navigate' && analysis.target === 'split') {
          analysis.response = "To make changes to the hand, you'll need to access the code editor. Let me open split mode where you can see the hand and edit its code simultaneously!";
        }
        
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

    // Check for specific UI questions and provide contextual responses
    const lowerPrompt = prompt.toLowerCase();
    
    // Handle cost-specific queries about Amazing Hand
    const costKeywords = ['cost', 'price', 'costing', 'expensive', 'cheap', 'budget', 'money', 'euro', '€', 'dollar', '$'];
    const isAskingAboutCost = costKeywords.some(keyword => lowerPrompt.includes(keyword));
    const isAboutAmazingHand = lowerPrompt.includes('amazing hand') || lowerPrompt.includes('amazing');
    
    if (isAskingAboutCost && isAboutAmazingHand) {
      return `💰 **Amazing Hand Cost Breakdown:**

• **Total Cost: Less than €200** using off-the-shelf parts
• **Servo Motors:** Dual hobby-grade servos per finger (8 servos total for 8 DOF)
• **3D Printing Materials:** TPU for soft shells, rigid materials for "bones"
• **Hardware:** Standard bolts, screws, and mechanical components

**Key Cost Advantages:**
✅ No expensive custom actuators (uses hobby servos)
✅ Fully 3D printable design (no machined parts)
✅ Off-the-shelf components only
✅ Open-source design (no licensing fees)

This makes it one of the most affordable high-performance robotic hands available, compared to commercial alternatives that cost thousands of euros!

Would you like to see the Amazing Hand preview? Just say "go to amazing hand"!`;
    }
    
    if (lowerPrompt.includes('change') && (lowerPrompt.includes('hand') || lowerPrompt.includes('finger'))) {
      return "To make changes to the robotic hand, you'll need to access the code editor. Say 'open split mode' or 'open code editor' to get started with editing the hand's behavior and movements!";
    }
    
    // Enhanced detection for Amazing Hand queries
    if (lowerPrompt.includes('amazing hand') || 
        (lowerPrompt.includes('amazing') && lowerPrompt.includes('hand')) ||
        lowerPrompt.includes('amazing hand project') ||
        lowerPrompt.includes('amazing hand hugging face')) {
      try {
        console.log('Providing detailed Amazing Hand information...');
        const amazingHandInfo = this.getAmazingHandInfo();
        return `Here's what I found about the Amazing Hand project:\n\n${amazingHandInfo}\n\nWould you like to see the Amazing Hand preview? Just say "go to amazing hand" or "show amazing hand"!`;
      } catch (error) {
        console.error('Error fetching Amazing Hand info:', error);
        return "I found references to the Amazing Hand project but couldn't fetch the details right now. It's an advanced robotic prosthetic with dexterous fingers and precise control capabilities. Would you like to see the preview? Say 'go to amazing hand'!";
      }
    }

    const systemPrompt = `
You are an AI assistant for a robotic hand interface called TenXer. You help users navigate and understand the interface.

AVAILABLE PAGES:
- Ruka Hand (pages 0-1): Advanced robotic hand demonstrations
- Amazing Hand Preview (page 2): Showcase of amazing hand technology
- Interactive Hand (page 3): Interactive dots for exploration

GUIDANCE FOR COMMON QUESTIONS:
- Making changes/editing: Guide users to open split mode or code editor
- Navigation: Help users understand how to move between pages
- Technical info: Provide helpful explanations about robotic hands

Be encouraging, helpful, and provide clear next steps. If they want to navigate somewhere, suggest specific commands like "go to amazing hand" or "open split mode".

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