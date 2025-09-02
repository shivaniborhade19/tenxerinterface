import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Copy, Play, Download } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  title: string;
  onClose: () => void;
}

export default function CodeEditor({ code, title, onClose }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    // Placeholder for code execution
    console.log('Running code:', code);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-gradient-card border border-border rounded-lg shadow-card animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30 rounded-t-lg">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">Robotic Control System</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            className="text-xs"
          >
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 h-full overflow-auto">
        <pre className="text-sm text-foreground font-mono leading-relaxed whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-secondary/20 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Python • AI Robotics Framework</span>
          <span>TenXer Advanced Prosthetics</span>
        </div>
      </div>
    </div>
  );
}