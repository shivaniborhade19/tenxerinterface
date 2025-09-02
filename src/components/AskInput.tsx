import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface AskInputProps {
  onSubmit: (question: string) => void;
  placeholder?: string;
}

export default function AskInput({ onSubmit, placeholder = "Ask Anything" }: AskInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          className="pr-12 h-12 bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:shadow-interactive text-base"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0"
          disabled={!question.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}