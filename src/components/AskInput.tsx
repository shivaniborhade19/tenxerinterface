import { useState } from 'react';

interface AskInputProps {
  onSubmit: (value: string) => void;
  className?: string;
}

export default function AskInput({ onSubmit, className }: AskInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask something..."
        className={`w-full max-w-4xl rounded-lg px-4 py-3 text-foreground 
            placeholder-gray-500 focus:outline-none focus:ring-2 
            focus:ring-gray-400 bg-gray-200 -ml-16 ${className}`}
      />
    </form>
  );
}
