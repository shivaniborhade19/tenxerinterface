import { useState, useCallback, useEffect, useRef } from 'react';
import { NavigationCommand, NavigationContext } from '@/types/mcp';
import { MCPServer } from '@/services/mcpServer';

interface NavigationState {
  currentView: string;
  currentIndex: number;
  videoPlaying: boolean;
  selectedPoint: string | null;
}

export const useNavigation = (
  initialState: NavigationState,
  handlers: {
    setViewMode: (mode: string) => void;
    setCurrentIndex: (index: number) => void;
    setVideoPlaying: (playing: boolean) => void;
    setSelectedPoint: (point: any) => void;
    handleDotClick: (index: number) => void;
    handleHomeClick: () => void;
    handleExitClick: () => void;
    handlePointInteraction: (point: any) => void;
  }
) => {
  const [mcpServer] = useState(() => new MCPServer());
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [isGeminiInitialized, setIsGeminiInitialized] = useState(false);
  const navRef = useRef<NavigationState>(initialState);
  useEffect(() => { navRef.current = initialState; }, [initialState]);

  const initializeGemini = useCallback((apiKey: string) => {
    setGeminiApiKey(apiKey);
    mcpServer.initializeGemini(apiKey);
    setIsGeminiInitialized(true);
  }, [mcpServer]);

  const getNavigationContext = useCallback((): NavigationContext => ({
    currentView: navRef.current.currentView,
    currentIndex: navRef.current.currentIndex,
    videoPlaying: navRef.current.videoPlaying,
    selectedPoint: navRef.current.selectedPoint
  }), []);

  const executeNavigationCommand = useCallback((target: string, params?: any) => {
    const t = (target || '').toLowerCase().replace(/\s+/g, '-');
    switch (t) {
      case 'ruka-hand': {
        const page = typeof params?.page === 'number' ? params.page : 0; // 0 = first, 1 = second
        handlers.handleDotClick(Math.min(Math.max(page, 0), 1));
        break;
      }
      case 'amazing-hand':
      case 'amazing-hand-preview':
        handlers.handleDotClick(2);
        break;
      case 'interactive-hand':
      case 'landing':
        handlers.handleDotClick(3);
        break;
      case 'next': {
        const idx = navRef.current.currentIndex;
        if (idx < 3) handlers.handleDotClick(idx + 1);
        break;
      }
      case 'previous':
      case 'back': {
        const idx = navRef.current.currentIndex;
        if (idx > 0) handlers.handleDotClick(idx - 1);
        break;
      }
      case 'home':
      case 'video':
      case 'video-only':
      case 'live-video':
        handlers.handleHomeClick();
        break;
      case 'split':
      case 'code':
      case 'editor': {
        if (params?.point) {
          handlers.handlePointInteraction(params.point);
        } else {
          const defaultPoint = {
            id: 'point-0',
            x: 0,
            y: 0,
            label: 'Editor',
            code: "// You're in split mode. Start editing here.\n",
          };
          handlers.handlePointInteraction(defaultPoint);
        }
        break;
      }
      case 'exit':
        handlers.handleExitClick();
        break;
      default:
        console.warn(`Unknown navigation target: ${target}`);
    }
  }, [handlers]);

  const executeInteractionCommand = useCallback((target: string, params?: any) => {
    if (target.startsWith('dot-') || target.startsWith('point-')) {
      const pointNumber = parseInt(target.split('-')[1]);
      if (!isNaN(pointNumber)) {
        // Simulate clicking a specific dot - you may need to adjust this based on your actual point data
        const mockPoint = {
          id: `point-${pointNumber}`,
          x: 0,
          y: 0,
          label: `Point ${pointNumber}`,
          code: `// Code for point ${pointNumber}\nconsole.log('Point ${pointNumber} activated');`
        };
        handlers.handlePointInteraction(mockPoint);
      }
    }
  }, [handlers]);

  // Set up MCP server callbacks with fresh state on each render
  useEffect(() => {
    mcpServer.setNavigationCallbacks({
      navigate: executeNavigationCommand,
      interact: executeInteractionCommand,
      getContext: getNavigationContext
    });
  }, [mcpServer, executeNavigationCommand, executeInteractionCommand, getNavigationContext]);

  const processPrompt = useCallback(async (prompt: string): Promise<string> => {
    try {
      const result = await mcpServer.processPrompt(prompt);
      
      if (result.command) {
        switch (result.command.action) {
          case 'navigate':
            executeNavigationCommand(result.command.target!, result.command.parameters);
            return result.response || `Navigated to ${result.command.target}`;
          case 'interact':
            executeInteractionCommand(result.command.target!, result.command.parameters);
            return result.response || `Interacted with ${result.command.target}`;
          case 'info':
            return result.response || result.command.parameters?.response || 'Information processed.';
        }
      }
      
      return result.response || 'Command processed successfully.';
    } catch (error) {
      console.error('Error processing prompt:', error);
      return 'Sorry, I encountered an error processing your request. Please try again.';
    }
  }, [mcpServer, executeNavigationCommand, executeInteractionCommand]);

  return {
    processPrompt,
    initializeGemini,
    isGeminiInitialized,
    geminiApiKey,
    mcpServer
  };
};