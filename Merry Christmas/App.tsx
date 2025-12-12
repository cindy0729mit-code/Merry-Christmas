import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleScene } from './components/ParticleScene';
import { Controls } from './components/Controls';
import { ParticleShape, THEME_COLORS, HandData, ShapeColorConfig } from './types';
import { HandTrackingService } from './services/handTracking';

const App: React.FC = () => {
  // Initialize with a festive mix
  const [colorConfig, setColorConfig] = useState<ShapeColorConfig>({
    [ParticleShape.STAR]: THEME_COLORS.gold,
    [ParticleShape.HEART]: THEME_COLORS.red,
    [ParticleShape.SNOW]: THEME_COLORS.white,
    [ParticleShape.ORB]: THEME_COLORS.blue
  });
  
  const [editingShape, setEditingShape] = useState<ParticleShape>(ParticleShape.STAR);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const handTracker = useRef<HandTrackingService | null>(null);
  
  const handDataRef = useRef<HandData>({
    isOpen: false,
    openness: 0,
    rotationX: 0,
    rotationY: 0,
    isDetected: false
  });

  const handleHandResults = useCallback((data: HandData) => {
    const prev = handDataRef.current;
    const alpha = 0.2; 
    
    handDataRef.current = {
      isOpen: data.isOpen,
      openness: prev.openness + (data.openness - prev.openness) * alpha,
      rotationX: prev.rotationX + (data.rotationX - prev.rotationX) * alpha,
      rotationY: prev.rotationY + (data.rotationY - prev.rotationY) * alpha,
      isDetected: data.isDetected
    };
  }, []);

  useEffect(() => {
    if (!isCameraEnabled) {
      if (handTracker.current) {
        handTracker.current.stop();
        handTracker.current = null;
      }
      return;
    }

    if (videoRef.current && !handTracker.current) {
      const tracker = new HandTrackingService(handleHandResults);
      tracker.initialize(videoRef.current);
      handTracker.current = tracker;
    }

    return () => {
      if (handTracker.current) {
        handTracker.current.stop();
        handTracker.current = null;
      }
    };
  }, [isCameraEnabled, handleHandResults]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const setColorForShape = (shape: ParticleShape, color: string) => {
    setColorConfig(prev => ({
      ...prev,
      [shape]: color
    }));
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans">
      
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none"
        playsInline
        muted
        autoPlay
      />

      <Canvas
        camera={{ position: [0, 0, 25], fov: 45 }}
        dpr={[1, 2]} 
        gl={{ antialias: false, alpha: false }} 
      >
        <ParticleScene 
          colorConfig={colorConfig}
          handData={handDataRef}
        />
      </Canvas>

      <Controls
        colorConfig={colorConfig}
        setColorForShape={setColorForShape}
        editingShape={editingShape}
        setEditingShape={setEditingShape}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        isCameraEnabled={isCameraEnabled}
        toggleCamera={() => setIsCameraEnabled(!isCameraEnabled)}
      />

    </div>
  );
};

export default App;