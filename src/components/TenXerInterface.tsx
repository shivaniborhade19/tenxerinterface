import { useState } from 'react';
import { Button } from '@/components/ui/button';
import RoboticHand from './RoboticHand';
import CodeEditor from './CodeEditor';
import NavigationControls from './NavigationControls';
import AskInput from './AskInput';
import ChatInterface from './ChatInterface';
import { useNavigation } from '@/hooks/useNavigation';
import { Home, ArrowLeft, MessageCircle, X } from 'lucide-react';
import rukaHandImage from '@/assets/rukaa.jpeg';
import extraImage from '@/assets/side bar.jpg';
import previewHandImage from '@/assets/robotic_hand1.jpg';

interface InteractivePoint {
  id: string;
  x: number;
  y: number;
  label: string;
  code: string;
}
 
type ViewMode =
  | 'ruka-hand'
  | 'hand-preview'
  | 'landing'
  | 'split'
  | 'video-only';

export default function TenXerInterface() {
  const [viewMode, setViewMode] = useState<ViewMode>('ruka-hand');
  const [selectedPoint, setSelectedPoint] = useState<InteractivePoint | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [dotsClicked, setDotsClicked] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);
 

  const handlePointInteraction = (point: InteractivePoint) => {
    setSelectedPoint(point);
    setViewMode('split');
    setDotsClicked(true);
  };

  const handleCloseCode = () => {
    setDisableTransition(true);
    setSelectedPoint(null);
    setViewMode('landing');
    setCurrentIndex(3);
    setDotsClicked(false);
    // Re-enable transition after the immediate update
    setTimeout(() => setDisableTransition(false), 50);

  };

  const handleHomeClick = () => {
    if (!videoPlaying) {
      setVideoPlaying(true);
      setViewMode('video-only');
    } else {
      setVideoPlaying(false);
      setViewMode('landing');
      setCurrentIndex(3);
    }
  };

  const handleExitClick = () => {
    setVideoPlaying(false);
    setViewMode('hand-preview');
    setCurrentIndex(2);
  };

  const handleBackFromVideo = () => {
    setVideoPlaying(false);
    setViewMode('ruka-hand');
    setCurrentIndex(0);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    if (index === 0) setViewMode('ruka-hand');
    else if (index === 1) setViewMode('ruka-hand');
    else if (index === 2) setViewMode('hand-preview');
    else setViewMode('landing');
    setDotsClicked(index === 3);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) handleDotClick(currentIndex - 1);
  };
  
  const handleNext = () => {
    if (currentIndex < 3) handleDotClick(currentIndex + 1);
  };

  // Initialize navigation hook
  const { processPrompt, initializeGemini, isGeminiInitialized } = useNavigation(
    {
      currentView: viewMode,
      currentIndex,
      videoPlaying,
      selectedPoint: selectedPoint?.id || null
    },
    {
      setViewMode: (mode: string) => setViewMode(mode as ViewMode),
      setCurrentIndex,
      setVideoPlaying,
      setSelectedPoint,
      handleDotClick,
      handleHomeClick,
      handleExitClick,
      handlePointInteraction
    }
  );

  const handleAskQuestion = async (question: string) => {
    if (isGeminiInitialized) {
      return await processPrompt(question);
    } else {
      console.log('User asked:', question);
      return 'Please setup Gemini API key to enable AI responses.';
    }
  };

  // 🔥 Centralized search bar style
  const getSearchBarStyle = () => ({
    width: '50%',
    maxWidth: '800px',
    left: viewMode === 'split' ? '52%' : '52%',
    transform: 'translateX(-50%)',
    bottom: viewMode === 'split' ? '18px' : '28px',
  });
const handleBackgroundClick = () => {
  setVideoPlaying(true);
  setViewMode('video-only');
};

  // === Split view (Hand + Code side-by-side) ===
  if (viewMode === 'split' && selectedPoint) {
    return (
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center p-16">
        <div className="flex w-full max-w-6xl h-[90vh] gap-6">
          {/* Left Card: Hand */}
          <div
        className="bg-white rounded-[20px] shadow-md relative overflow-hidden transition-all duration-500"
        style={{
          width: '30%',
          minWidth: '220px',
          height: '100%',
          transform: dotsClicked ? 'translateX(-80px)' : 'translateX(0)',
          transition: 'transform 0.5s ease',
        }}
      >
        {/* Header */}
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-foreground">TenXer</h1>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-foreground">Amazing Hand</span>
          </div>
        </div>

        <iframe
          src={import.meta.env.VITE_VIDEO_STREAM_URL}
          className="absolute rounded-[20px]"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: '100%',
          }}
          allow="camera;microphone;autoplay;fullscreen"
        />

  {/* Overlay for interaction */}
  <div
    className="absolute inset-0"
    onClick={handleBackgroundClick}
  >
    <RoboticHand
      onInteraction={handlePointInteraction}
      isInteractive
    />
  </div>

  {/* Search bar overlay */}
  <div className="absolute z-30" style={getSearchBarStyle()}>
    <AskInput
      onSubmit={handleAskQuestion}
      onApiKeySubmit={initializeGemini}
      isGeminiInitialized={isGeminiInitialized}
      isSplitMode={true}
    />
  </div>

            {/* AI Chat Toggle - Removed since chat is now integrated in search bar */}
          </div>

          {/* Right Card: Code */}
          <div
            className="rounded-[20px] shadow-md transition-all duration-500"
            style={{
              width: dotsClicked ? '75%' : '45%',
              marginLeft: '-70px',
              marginRight: '-90px',
             
              transition: 'all 0.5s ease',
            }}
            
          >
            <CodeEditor
              
              title={selectedPoint.label}
              onClose={handleCloseCode}
            />
          </div>
        </div>

        {/* Removed separate AI Chat Interface - now integrated in search bars */}
      </div>
    );
  }

  // === Main Pages (Ruka → Preview → Landing/Hand with dots) ===
  // === Main Pages (Ruka → Preview → Landing/Hand with dots) ===
  return (
    <div className="min-h-screen bg-yellow-100 flex items-center justify-center p-8 relative">
      <div className="relative w-full max-w-7xl h-[90vh] overflow-hidden">
        {/* Slider container */}
        <div
          className={`flex w-full h-full ${!disableTransition ? 'transition-transform duration-500' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {/* Page 0: New Ruka Hand Page */}
          <div className="w-full flex-none h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col justify-between relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-foreground">Ruka Hand</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
            <iframe 
            src={import.meta.env.VITE_VIDEO_STREAM_URL}
            className='w-full h-full ' 
            allow='camera;microphone;autoplay;fullscreen'
            />
            </div>
            <div className="absolute" style={getSearchBarStyle()}>
              <AskInput 
                onSubmit={handleAskQuestion}
                onApiKeySubmit={initializeGemini}
                isGeminiInitialized={isGeminiInitialized}
              />
            </div>
          </div>

          {/* Page 1: Original Ruka Hand */}
          <div className="w-full flex-none h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col justify-between relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-foreground">Ruka Hand</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img
                src={rukaHandImage}
                className="w-full max-w-2xl h-auto object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="absolute" style={getSearchBarStyle()}>
              <AskInput 
                onSubmit={handleAskQuestion}
                onApiKeySubmit={initializeGemini}
                isGeminiInitialized={isGeminiInitialized}
              />
            </div>
          </div>

          {/* Page 2: Amazing Hand Preview */}
          <div className="w-full flex-none h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col justify-between relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-foreground">Amazing Hand</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
               <div
                
                onClick={() => {
                  setDisableTransition(true);
                  setCurrentIndex(3);
                  setViewMode('landing');
                  setDotsClicked(true);
                  // Re-enable transition after the immediate update
                  setTimeout(() => setDisableTransition(false), 50);
                }}
              >
                <img
                  src={previewHandImage}
                  className="w-full max-w-2xl h-auto object-contain"
                />
              </div>
            </div>
            <div className="absolute z-50" style={getSearchBarStyle()}>
  <AskInput 
    onSubmit={handleAskQuestion}
    onApiKeySubmit={initializeGemini}
    isGeminiInitialized={isGeminiInitialized}
  />
</div>
          </div>
{/* Page 3: Landing (Hand with dots) */}
<div className="w-full flex-none h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col relative">
  {/* Header */}
  <div className="absolute top-4 left-4 z-30"> {/* Increased z-index for visibility */}
    <div className="flex items-center gap-2">
      <h1 className="text-sm font-bold text-foreground">TenXer</h1>
      <span className="text-muted-foreground">|</span>
      <span className="text-sm text-foreground">Amazing Hand</span>
    </div>
  </div>

   {/* Hand + Extra Image Container */}
   <div className="flex-1 flex flex-col relative">
    
    {/* Full-size container for video, click handler, and dots (New structure) */}
    <div className="absolute inset-0 w-full h-full rounded-[20px] overflow-hidden">
    {/* Hand Image (Landing click → Video) */}
    {/* 1. Video Frame - Base Layer (z-index: 1) */}
    <iframe 
        src={import.meta.env.VITE_VIDEO_STREAM_URL} 
        className='w-full h-full' // Remove rounded-[20px] as parent handles it
        allow='camera;microphone;autoplay;fullscreen'
        style={{ zIndex: 1 }}
      />
    {/* 2. Background Click Handler (Overlay) - Handles click to full-screen video (z-index: 5) */}
      {/* This MUST be placed BEFORE RoboticHand so dots are on top. Dots' click will NOT bubble to this due to stopPropagation in RoboticHand.tsx */}
      <div 
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleBackgroundClick}   // ✅ click anywhere not covered by dots starts video
        style={{ zIndex: 5 }} 
      />

      {/* 3. Robotic Hand (Dots) - Top Layer (z-index: 10) */}
      {/* This div acts as a wrapper to place the dots on top of the background click handler. */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}> 
        <RoboticHand
          onInteraction={handlePointInteraction} // ✅ dots → split mode
          isInteractive
        />
      </div>
      </div>

    {/* Extra Image - Positioned absolutely at the bottom to remain visible */}
    {/* Changed to absolute positioning to not interfere with the full-screen absolute video/dot container */}
    <div className="mt-4 mb-24 self-center absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20">
      <img
        src={extraImage}
        alt="Extra Hand"
        className="w-64 h-auto rounded-lg shadow-md"
      />
    </div>
  </div>

            {/* Exit Button */}
            <div className="absolute top-4 right-4 z-40">
                <Button
                  onClick={handleExitClick}
                  variant="outline"
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-0"
                >
                  Exit
                </Button>
              </div>

            {/* Home Button */}
            <div className="absolute bottom-16 right-28 z-40">
                <Button
                  onClick={handleHomeClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 border-gray-300 text-white "
                >
                  <Home className="w-5 h-5" /> Home
                </Button>
              </div>

            {/* Search Bar */}
<div className="absolute z-50 pointer-events-auto" style={getSearchBarStyle()}>
  <AskInput 
    onSubmit={handleAskQuestion}
    onApiKeySubmit={initializeGemini}
    isGeminiInitialized={isGeminiInitialized}
  />
</div>
          </div>
        </div>

        {/* Navigation arrows */}
        <NavigationControls
          onPrevious={handlePrevious}
          onNext={handleNext}
          showPrevious={currentIndex > 0}
          showNext={currentIndex !== 2 && currentIndex < 3}
        />

        {/* Page Dots (Always visible) */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-30">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentIndex ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Video overlay */}
        {viewMode === 'video-only' && (
          <div className="absolute inset-0 flex flex-col justify-between bg-white rounded-[20px] py-6">
            <div className="absolute top-4 left-4 z-20">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-foreground">Amazing Hand</span>
              </div>
            </div>
            <iframe 
             src={import.meta.env.VITE_VIDEO_STREAM_URL}
            className='w-full h-full rounded-[20px]' 
            allow='camera;microphone;autoplay;fullscreen'
            />
            <div className="absolute top-4 right-4 z-20">
              <Button
                onClick={handleExitClick}
                variant="outline"
                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-0"
              >
                Exit
              </Button>
            </div>
            <div className="absolute bottom-16 right-28">
              <Button
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white font-bold hover:bg-gray-500 focus:ring-0"
              >
                <Home className="w-5 h-5" /> Home
              </Button>
            </div>
            <div className="absolute top-1/2 left-2 -translate-y-1/2 z-20">
  <button
    onClick={handleBackFromVideo}
    className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow hover:bg-gray-200 transition"
  >
    <ArrowLeft className="w-5 h-5 text-gray-700" />
  </button>
</div>
            <div className="absolute" style={getSearchBarStyle()}>
              <AskInput 
                onSubmit={handleAskQuestion}
                onApiKeySubmit={initializeGemini}
                isGeminiInitialized={isGeminiInitialized}
              />
            </div>
          </div>
        )}

        {/* Removed separate AI Chat Interface - now integrated in search bars */}
      </div>
    </div>
  );
}
