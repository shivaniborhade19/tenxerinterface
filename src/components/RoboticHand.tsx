import { useState } from 'react';
import roboticHandImage from '@/assets/robotic-hand.jpg';

interface InteractivePoint {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
  code: string;
}

interface RoboticHandProps {
  onInteraction: (point: InteractivePoint) => void;
  isInteractive: boolean;
}

const interactivePoints: InteractivePoint[] = [
  {
    id: 'finger-1',
    x: 45,
    y: 20,
    label: 'Index Finger Motor',
    code: `# Index Finger Control System
class FingerMotor:
    def __init__(self, pin_number):
        self.pin = pin_number
        self.position = 0
        self.max_force = 100
    
    def move_to_position(self, target_pos):
        """Move finger to target position with safety checks"""
        if 0 <= target_pos <= 180:
            self.position = target_pos
            return self.apply_motion()
        return False
    
    def apply_force(self, force_level):
        """Apply measured force for object interaction"""
        safe_force = min(force_level, self.max_force)
        return self.execute_grip(safe_force)`
  },
  {
    id: 'thumb',
    x: 25,
    y: 45,
    label: 'Thumb Actuator',
    code: `# Thumb Opposition System
import numpy as np

class ThumbActuator:
    def __init__(self):
        self.base_rotation = 0
        self.flex_angle = 0
        self.sensors = SensorArray()
    
    def opposition_grip(self, target_object):
        """Execute precision grip with thumb opposition"""
        object_size = self.sensors.measure_object()
        optimal_angle = self.calculate_grip_angle(object_size)
        
        return self.execute_opposition(optimal_angle)
    
    def calculate_grip_angle(self, size):
        # Biomechanical grip optimization
        return np.arctan(size / 2) * 180 / np.pi`
  },
  {
    id: 'palm',
    x: 40,
    y: 60,
    label: 'Palm Sensor Array',
    code: `# Palm Pressure Distribution System
class PalmSensorArray:
    def __init__(self):
        self.pressure_matrix = np.zeros((8, 8))
        self.temperature_sensors = []
        self.haptic_feedback = HapticEngine()
    
    def read_pressure_map(self):
        """Generate real-time pressure distribution"""
        raw_data = self.sample_sensors()
        processed = self.filter_noise(raw_data)
        return self.normalize_pressure(processed)
    
    def provide_feedback(self, pressure_map):
        """Send haptic feedback based on grip analysis"""
        grip_quality = self.analyze_grip(pressure_map)
        return self.haptic_feedback.generate_response(grip_quality)`
  },
  {
    id: 'wrist',
    x: 50,
    y: 85,
    label: 'Wrist Rotation Module',
    code: `# Wrist Articulation Control
class WristController:
    def __init__(self):
        self.rotation_axis = {'x': 0, 'y': 0, 'z': 0}
        self.motion_limits = {'flex': 85, 'extend': 70, 'rotate': 180}
        self.stabilization = GyroStabilizer()
    
    def execute_movement(self, target_orientation):
        """Smooth wrist movement with stabilization"""
        if self.validate_movement(target_orientation):
            self.stabilization.compensate()
            return self.move_to_orientation(target_orientation)
        
    def adaptive_positioning(self, task_requirements):
        """AI-driven wrist positioning for optimal task execution"""
        optimal_pose = self.ai_model.predict(task_requirements)
        return self.execute_movement(optimal_pose)`
  }
];

export default function RoboticHand({ onInteraction, isInteractive }: RoboticHandProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative max-w-2xl animate-float">
        <img
          src={roboticHandImage}
          alt="Advanced Robotic Prosthetic Hand"
          className="w-full h-auto rounded-lg shadow-card"
        />
        
        {isInteractive && (
          <div className="absolute inset-0">
            {interactivePoints.map((point) => (
              <button
                key={point.id}
                className={`absolute w-6 h-6 rounded-full border-2 border-primary transition-all duration-300 ${
                  hoveredPoint === point.id
                    ? 'bg-primary scale-150 shadow-glow animate-pulse-glow'
                    : 'bg-primary/20 hover:bg-primary/40 hover:scale-125'
                }`}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredPoint(point.id)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => onInteraction(point)}
              >
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
              </button>
            ))}
            
            {hoveredPoint && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-card">
                  <p className="text-sm text-foreground font-medium">
                    {interactivePoints.find(p => p.id === hoveredPoint)?.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}