import { useState } from 'react';
import { Button } from '@/components/ui/button';
import RoboticHand from './RoboticHand';
import CodeEditor from './CodeEditor';
import NavigationControls from './NavigationControls';
import AskInput from './AskInput';
import { Home } from 'lucide-react';

interface InteractivePoint {
  id: string;
  x: number;
  y: number;
  label: string;
  code: string;
}

type ViewMode = 'landing' | 'interactive' | 'video-hand' | 'hand-only' | 'split';

export default function TenXerInterface() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [selectedPoint, setSelectedPoint] = useState<InteractivePoint | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleEnterInteractive = () => {
    setViewMode('video-hand');
  };

  const handleExitInteractive = () => {
    setViewMode('landing');
    setSelectedPoint(null);
  };

  const handlePointInteraction = (point: InteractivePoint) => {
    setSelectedPoint(point);
    setViewMode('split');
  };

  const handleCloseCode = () => {
    setViewMode('hand-only');
    setSelectedPoint(null);
  };

  const handleHomeClick = () => {
    if (viewMode === 'video-hand') {
      setViewMode('hand-only');
    } else if (viewMode === 'hand-only') {
      setViewMode('video-hand');
    }
  };

  const handleAskQuestion = (question: string) => {
    console.log('User asked:', question);
    // Here you would implement the AI response logic
  };

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
  };

  if (viewMode === 'split' && selectedPoint) {
    return (
      <div className="min-h-screen bg-gradient-bg flex">
        {/* Left side - Hand */}
        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">TenXer</h1>
              <span className="text-muted-foreground">|</span>
              <span className="text-foreground">Amazing Hand</span>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 z-10">
            <Button variant="outline" onClick={handleCloseCode}>
              Exit
            </Button>
          </div>

          <div className="h-full p-8 flex items-center justify-center">
            <RoboticHand 
              onInteraction={handlePointInteraction}
              isInteractive={true}
            />
          </div>
        </div>

        {/* Right side - Code Editor */}
        <div className="flex-1 p-4">
          <CodeEditor
            code={selectedPoint.code}
            title={selectedPoint.label}
            onClose={handleCloseCode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">TenXer</h1>
          <span className="text-muted-foreground">|</span>
          <span className="text-foreground">Amazing Hand</span>
        </div>
      </div>

      {(viewMode === 'video-hand' || viewMode === 'hand-only') && (
        <div className="absolute top-4 right-4 z-10">
          <Button variant="outline" onClick={handleExitInteractive}>
            Exit
          </Button>
        </div>
      )}

      {/* Navigation Controls - only show on landing page */}
      {viewMode === 'landing' && (
        <NavigationControls
          onPrevious={handlePrevious}
          onNext={handleNext}
          showPrevious={currentIndex > 0}
          showNext={true}
        />
      )}

      {/* Main Content */}
      {viewMode === 'landing' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
            <div className="text-center space-y-8">
              <div 
                className="cursor-pointer transition-transform duration-500 hover:scale-105"
                onClick={handleEnterInteractive}
              >
                <RoboticHand 
                  onInteraction={handlePointInteraction}
                  isInteractive={false}
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  Advanced Prosthetic Control System
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Click on the robotic hand to explore interactive components and view the underlying control algorithms
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Input */}
          <div className="w-full max-w-2xl mb-8">
            <AskInput onSubmit={handleAskQuestion} />
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-2 mb-4">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary shadow-glow' 
                    : 'bg-muted hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
        </div>
      ) : viewMode === 'video-hand' ? (
        <div className="min-h-screen flex">
          {/* Left Side - Video */}
          <div className="flex-1 relative overflow-hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/your-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Right Side - Interactive Hand */}
          <div className="flex-1 relative flex flex-col items-center justify-center p-8">
            <div className="flex-1 flex items-center justify-center">
              <RoboticHand 
                onInteraction={handlePointInteraction}
                isInteractive={true}
              />
            </div>
            
            {/* Home Button */}
            <div className="absolute bottom-8 right-8">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-6 py-3"
              >
                <Home className="w-5 h-5" />
                Home
              </Button>
            </div>
          </div>
        </div>
      ) : viewMode === 'hand-only' ? (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="relative">
            <RoboticHand 
              onInteraction={handlePointInteraction}
              isInteractive={true}
            />
            
            {/* Home Button */}
            <div className="absolute -bottom-16 right-0">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-6 py-3"
              >
                <Home className="w-5 h-5" />
                Home
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}