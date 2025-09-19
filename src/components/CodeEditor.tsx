import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Play, Download } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
    console.log("Running code:", code);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-gray-900 border border-border rounded-lg shadow-card flex flex-col">
      {/* Header → only Exit */}
      <div className="flex items-center justify-end p-2 ">
        <div className="flex items-center gap-2">
          
          <button
  onClick={onClose}
  className="text-lg font-semibold text-white hover:underline"
>
  Exit
</button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto p-2">
        <SyntaxHighlighter
          language="python"
          style={oneDark}
          showLineNumbers
          wrapLongLines
          customStyle={{
            backgroundColor: "#1e1e1e",
            borderRadius: "6px",
            padding: "0.5rem",
            margin: 0,
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
