import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  title: string;
  onClose: () => void;
}

export default function CodeEditor({ title, onClose }: CodeEditorProps) {
  return (
    <div className="h-full bg-gray-900 border border-border rounded-lg shadow-card flex flex-col">
      {/* Header → only Exit */}
      <div className="flex items-center justify-end p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-lg font-semibold text-white hover:underline"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div className="flex-1 overflow-auto p-2">
        <iframe
          src="https://epyipc.tenxerlabs.com/code-server/"
          className="w-full h-full rounded-lg"
          
        />
      </div>
    </div>
  );
}
