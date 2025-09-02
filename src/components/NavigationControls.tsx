import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  showPrevious: boolean;
  showNext: boolean;
}

export default function NavigationControls({
  onPrevious,
  onNext,
  showPrevious,
  showNext
}: NavigationControlsProps) {
  return (
    <>
      {showPrevious && (
        <Button
          variant="outline"
          size="lg"
          className="absolute left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full border-primary/30 hover:border-primary hover:shadow-interactive transition-all duration-300"
          onClick={onPrevious}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}
      
      {showNext && (
        <Button
          variant="outline"
          size="lg"
          className="absolute right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full border-primary/30 hover:border-primary hover:shadow-interactive transition-all duration-300"
          onClick={onNext}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}