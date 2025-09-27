import { useState } from "react";

interface InteractivePoint {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
}

interface RoboticHandProps {
  isInteractive?: boolean;
  onInteraction?: (point: InteractivePoint) => void;
  onBackgroundClick?: () => void;
}

const interactivePoints: InteractivePoint[] = [
  {
    id: "finger-3",
    x: 65,
    y: 40,
    label: "Ring Finger Motor",
  },
  {
    id: "thumb",
    x: 40,
    y: 55,
    label: "Thumb Actuator",
  },
  {
    id: "palm",
    x: 50,
    y: 50,
    label: "Palm Sensor Array",
  },
  {
    id: "wrist",
    x: 65,
    y: 50,
    label: "Wrist Rotation Module",
  },
];

export default function RoboticHand({ onInteraction, isInteractive }: RoboticHandProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  return (
    <div className="absolute inset-0">
      {isInteractive && (
        <div className="absolute inset-0">
          {interactivePoints.map((point) => (
            <button
              key={point.id}
              className={`absolute w-9 h-9 rounded-full border-2 border-red-500
 transition-all duration-300 ${
                hoveredPoint === point.id ? "scale-150" : "hover:scale-125"
              }`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredPoint(point.id)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={(e) => {
                e.stopPropagation();
                onInteraction?.(point);
              }}
            />
          ))}

          {hoveredPoint && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-card">
                <p className="text-sm text-foreground font-medium">
                  {interactivePoints.find((p) => p.id === hoveredPoint)?.label}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
