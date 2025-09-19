import { useState } from 'react';
import { Button } from '@/components/ui/button';
import RoboticHand from './RoboticHand';
import CodeEditor from './CodeEditor';
import NavigationControls from './NavigationControls';
import AskInput from './AskInput';
import { Home, ArrowLeft } from 'lucide-react';

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

  const handlePointInteraction = (point: InteractivePoint) => {
    setSelectedPoint(point);
    setViewMode('split');
    setDotsClicked(true);
  };

  const handleCloseCode = () => {
    setSelectedPoint(null);
    setViewMode('landing');
    setCurrentIndex(2);
    setDotsClicked(false);
  };

  const handleHomeClick = () => {
    if (!videoPlaying) {
      setVideoPlaying(true);
      setViewMode('video-only');
    } else {
      setVideoPlaying(false);
      setViewMode('landing');
      setCurrentIndex(2);
    }
  };

  const handleExitClick = () => {
    setVideoPlaying(false);
    setViewMode('hand-preview');
    setCurrentIndex(1);
  };

  const handleBackFromVideo = () => {
    setVideoPlaying(false);
    setViewMode('ruka-hand');
    setCurrentIndex(0);
  };

  const handleAskQuestion = (question: string) => {
    console.log('User asked:', question);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    if (index === 0) setViewMode('ruka-hand');
    else if (index === 1) setViewMode('hand-preview');
    else setViewMode('landing');
    setDotsClicked(index === 2);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) handleDotClick(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < 2) handleDotClick(currentIndex + 1);
  };

  // 🔥 Centralized search bar style
  const getSearchBarStyle = () => ({
    width: '50%',
    maxWidth: '800px',
    left: viewMode === 'split' ? '70%' : '60%',
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
            className="bg-white rounded-[20px] shadow-md p-6 relative transition-all duration-500"
            style={{
              width: dotsClicked ? '30%' : '55%',
              minWidth: '220px',
            }}
          >
            {/* Header */}
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-foreground">Amazing Hand</span>
              </div>
            </div>

            {/* Hand */}
           {/* Hand */}
          <div className="h-full flex items-center justify-center">
            <div
  className="cursor-pointer w-full h-full flex items-center justify-center"
  onClick={handleBackgroundClick}   // ✅ click anywhere → video
>
  <RoboticHand
    onInteraction={handlePointInteraction} // ✅ dots → code
    isInteractive
  />
</div>

          </div>

            {/* Search bar */}
            <div className="absolute" style={getSearchBarStyle()}>
              <AskInput onSubmit={handleAskQuestion} />
            </div>
          </div>

          {/* Right Card: Code */}
          <div
            className="rounded-[20px] shadow-md transition-all duration-500"
            style={{
              width: dotsClicked ? '70%' : '45%',
            }}
          >
            <CodeEditor
              code={selectedPoint.code}
              title={selectedPoint.label}
              onClose={handleCloseCode}
            />
          </div>
        </div>
      </div>
    );
  }

  // === Main Pages (Ruka → Preview → Landing/Hand with dots) ===
  return (
    <div className="min-h-screen bg-yellow-100 flex items-center justify-center p-8 relative">
      <div className="relative w-full max-w-7xl h-[90vh] overflow-hidden">
        {/* Slider container */}
        <div
          className="flex w-[300%] h-full"
          style={{ transform: `translateX(-${currentIndex * 33.3333}%)` }}
        >
          {/* Page 0: Ruka Hand */}
          <div className="w-[33.3333%] flex-shrink-0 h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col justify-between relative">
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
              <AskInput onSubmit={handleAskQuestion} />
            </div>
          </div>

          {/* Page 1: Amazing Hand Preview */}
          <div className="w-[33.3333%] flex-shrink-0 h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col justify-between relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-foreground">Amazing Hand</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div
                className="transition-transform duration-500 hover:scale-105 cursor-pointer"
                onClick={() => handleDotClick(2)}
              >
                <img
                  src={previewHandImage}
                  className="w-full max-w-2xl h-auto object-contain"
                />
              </div>
            </div>
            <div className="absolute" style={getSearchBarStyle()}>
              <AskInput onSubmit={handleAskQuestion} />
            </div>
          </div>
{/* Page 2: Landing (Hand with dots) */}
<div className="w-[33.3333%] flex-shrink-0 h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col relative">
  {/* Header */}
  <div className="absolute top-4 left-4 z-10">
    <div className="flex items-center gap-2">
      <h1 className="text-sm font-bold text-foreground">TenXer</h1>
      <span className="text-muted-foreground">|</span>
      <span className="text-sm text-foreground">Amazing Hand</span>
    </div>
  </div>

  {/* Hand + Extra Image */}
  <div className="flex-1 flex flex-col items-center justify-end relative">
    {/* Hand Image (Landing click → Video) */}
    <div
      className="cursor-pointer transition-transform duration-500 hover:scale-105"
      onClick={handleBackgroundClick}   // ✅ click here starts video
    >
      <RoboticHand
        onInteraction={handlePointInteraction} // ✅ dots → split mode
        isInteractive
      />
    </div>

    {/* Extra Image */}
    <div className="mt-4 mb-24">
      <img
        src={extraImage}
        alt="Extra Hand"
        className="w-64 h-auto rounded-lg shadow-md"
      />
    </div>
  </div>


            {/* Exit Button */}
            <div className="absolute top-4 right-4 z-20">
              <Button
                onClick={handleExitClick}
                variant="outline"
                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-0"
              >
                Exit
              </Button>
            </div>

            {/* Home Button */}
            <div className="absolute bottom-16 right-28">
              <Button
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 border-gray-300 text-white "
              >
                <Home className="w-5 h-5" /> Home
              </Button>
            </div>

            {/* Search Bar */}
            <div className="absolute" style={getSearchBarStyle()}>
              <AskInput onSubmit={handleAskQuestion} />
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <NavigationControls
          onPrevious={handlePrevious}
          onNext={handleNext}
          showPrevious={currentIndex > 0}
          showNext={currentIndex !== 1 && currentIndex < 2}
        />

        {/* Page Dots (Always visible) */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-30">
          {[0, 1].map((index) => (
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
          <div className="absolute inset-0 flex flex-col justify-between bg-white rounded-[20px] p-6">
            <div className="absolute top-4 left-4 z-20">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-foreground">Amazing Hand</span>
              </div>
            </div>
            <video
              className="w-full h-full object-cover rounded-[20px]"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/myvideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
            <div className="absolute top-1/2 left-6 -translate-y-1/2 z-20">
  <button
    onClick={handleBackFromVideo}
    className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow hover:bg-gray-200 transition"
  >
    <ArrowLeft className="w-5 h-5 text-gray-700" />
  </button>
</div>
            <div className="absolute" style={getSearchBarStyle()}>
              <AskInput onSubmit={handleAskQuestion} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
