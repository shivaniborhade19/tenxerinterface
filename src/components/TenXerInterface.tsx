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
  const [dotsClicked, setDotsClicked] = useState(false); // Track if dot was clicked

  const handlePointInteraction = (point: InteractivePoint) => {
    setSelectedPoint(point);
    setViewMode('split');
  };

  const handleCloseCode = () => {
    setSelectedPoint(null);
    setViewMode('hand-preview');
    setCurrentIndex(1);
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

    // Shrink search bar only if landing page dot is clicked
    setDotsClicked(index === 2);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) handleDotClick(currentIndex - 1);
  };
  const handleNext = () => {
    if (currentIndex < 2) handleDotClick(currentIndex + 1);
  };

  // Determine search bar style
  const getSearchBarStyle = () => {
    if (viewMode === 'ruka-hand' || viewMode === 'hand-preview' || viewMode === 'video-only') {
      return { width: '60%', left: '50%', transform: 'translateX(-50%)' };
    } else if (viewMode === 'landing') {
      // Landing page always long & centered like first page
      return { width: '60%', left: '50%', transform: 'translateX(-50%)' };
    } else if (viewMode === 'split') {
      return { width: '40%', left: '10%', transform: 'translateX(0%)' };
    }
    return { width: '60%', left: '50%', transform: 'translateX(-50%)' };
  };

  // Split view
  if (viewMode === 'split' && selectedPoint) {
    return (
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center p-8">
        <div className="relative overflow-hidden bg-white rounded-[20px] shadow-md w-full max-w-4xl h-[90vh] p-6 flex">
          <div className="flex-1 relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-foreground">Amazing Hand</span>
              </div>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <Button variant="outline" onClick={handleCloseCode}>Exit</Button>
            </div>
            <div className="h-full flex items-center justify-center">
              <RoboticHand onInteraction={handlePointInteraction} isInteractive />
            </div>
          </div>
          <div className="flex-1 p-4">
            <CodeEditor code={selectedPoint.code} title={selectedPoint.label} onClose={handleCloseCode} />
          </div>

          {/* Search bar small left for split/code */}
          <div className="absolute bottom-4" style={getSearchBarStyle()}>
            <AskInput onSubmit={handleAskQuestion} />
          </div>
        </div>
      </div>
    );
  }

  // Main pages
  return (
    <div className="min-h-screen bg-yellow-100 flex items-center justify-center p-8 relative">
      <div className="relative w-full max-w-4xl h-[90vh] overflow-hidden">
        <div className="flex w-[300%] h-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 33.3333}%)` }}>
          {/* Page 0 */}
          <div className="w-[33.3333%] flex-shrink-0 h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col justify-between relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-foreground">Ruka Hand</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img src={rukaHandImage} className="w-full max-w-2xl h-auto object-contain transition-transform duration-500 hover:scale-105" />
            </div>
            <div className="absolute bottom-8" style={getSearchBarStyle()}>
              <AskInput onSubmit={handleAskQuestion} />
            </div>
          </div>

          {/* Page 1 */}
          <div className="w-[33.3333%] flex-shrink-0 h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col justify-between relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-foreground">Amazing Hand</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="transition-transform duration-500 hover:scale-105 cursor-pointer" onClick={() => handleDotClick(2)}>
                <img src={previewHandImage} className="w-full max-w-2xl h-auto object-contain" />
              </div>
            </div>
            <div className="absolute bottom-8" style={getSearchBarStyle()}>
              <AskInput onSubmit={handleAskQuestion} />
            </div>
          </div>

          {/* Page 2 */}
          <div className="w-[33.3333%] flex-shrink-0 h-full bg-white rounded-[20px] shadow-md p-6 flex flex-col justify-between relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">TenXer</h1>
                <span className="text-muted-foreground">|</span>
                <span className="text-foreground">Amazing Hand</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center hand-container">
              <RoboticHand onInteraction={handlePointInteraction} isInteractive />
            </div>

            {/* Exit button */}
            <div className="absolute top-4 right-4 z-20">
              <Button onClick={handleExitClick} variant="outline">Exit</Button>
            </div>

            {/* Home button slightly above search bar */}
            <div className="absolute bottom-20 right-6">
              <Button onClick={handleHomeClick} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold">
                <Home className="w-5 h-5" /> Home
              </Button>
            </div>

            {/* Search bar long & centered like first page */}
            <div className="absolute bottom-8" style={getSearchBarStyle()}>
              <AskInput onSubmit={handleAskQuestion} />
            </div>

            {/* Extra image below search bar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <img src={extraImage} alt="Extra Hand" className="w-64 h-auto rounded-lg shadow-md" />
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <NavigationControls onPrevious={handlePrevious} onNext={handleNext} showPrevious={currentIndex > 0} showNext={currentIndex < 2} />

        {/* Page dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((index) => (
            <div key={index} onClick={() => handleDotClick(index)} className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentIndex ? 'bg-primary' : 'bg-gray-300'}`} />
          ))}
        </div>

        {/* Video overlay */}
        {viewMode === 'video-only' && (
  <div className="absolute inset-0 flex flex-col justify-between bg-white rounded-[20px] p-6">
    {/* Header */}
    <div className="absolute top-4 left-4 z-20">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-foreground">TenXer</h1>
        <span className="text-muted-foreground">|</span>
        <span className="text-foreground">Amazing Hand</span>
      </div>
    </div>

    <video className="w-full h-full object-cover rounded-[20px]" autoPlay loop muted playsInline>
      <source src="/myvideo.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

            {/* Exit button */}
            <div className="absolute top-4 right-4 z-20">
              <Button onClick={handleExitClick} variant="outline">Exit</Button>
            </div>

            {/* Home button slightly above search bar */}
            <div className="absolute bottom-20 right-6">
              <Button onClick={handleHomeClick} className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white font-bold">
                <Home className="w-5 h-5" /> Home
              </Button>
            </div>

            {/* Back arrow left middle */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <Button onClick={handleBackFromVideo} variant="outline">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            {/* Search bar */}
            <div className="absolute bottom-8" style={getSearchBarStyle()}>
              <AskInput onSubmit={handleAskQuestion} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}