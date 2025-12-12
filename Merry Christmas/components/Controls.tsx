import React from 'react';
import { ParticleShape, THEME_COLORS, ShapeColorConfig } from '../types';
import { Heart, Star, Snowflake, Circle, Maximize2, Minimize2, Video, VideoOff, Palette } from 'lucide-react';

interface ControlsProps {
  colorConfig: ShapeColorConfig;
  setColorForShape: (shape: ParticleShape, color: string) => void;
  editingShape: ParticleShape;
  setEditingShape: (s: ParticleShape) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isCameraEnabled: boolean;
  toggleCamera: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  colorConfig,
  setColorForShape,
  editingShape,
  setEditingShape,
  isFullscreen,
  toggleFullscreen,
  isCameraEnabled,
  toggleCamera
}) => {
  
  const shapeIcons = {
    [ParticleShape.STAR]: <Star size={24} fill="currentColor" className="opacity-100" />,
    [ParticleShape.HEART]: <Heart size={24} fill="currentColor" className="opacity-100" />,
    [ParticleShape.SNOW]: <Snowflake size={24} />,
    [ParticleShape.ORB]: <Circle size={24} fill="currentColor" className="opacity-100" />,
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            LUMINAFEST
          </h1>
          <p className="text-white/60 text-xs mt-1">
            {isCameraEnabled ? "Gesture Control Active" : "Camera Disabled - Auto Mode"}
          </p>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={toggleCamera}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
          >
            {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Guide Toast */}
      {isCameraEnabled && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none w-full flex justify-center">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/80 text-sm flex gap-6 shadow-xl">
             <span className="flex items-center gap-2"><span className="text-lg">✊</span> Tree</span>
             <span className="flex items-center gap-2"><span className="text-lg">✋</span> Scatter</span>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex flex-col gap-4 pointer-events-auto w-full max-w-md mx-auto bg-black/50 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl">
        
        <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
          <Palette size={12} />
          <span>Mixer</span>
        </div>

        {/* Shape Selectors */}
        <div className="flex justify-between gap-3">
          {Object.values(ParticleShape).map((shape) => (
            <button
              key={shape}
              onClick={() => setEditingShape(shape)}
              className={`relative flex-1 flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                editingShape === shape 
                  ? 'bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-white/30 transform -translate-y-1' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/5'
              }`}
            >
              {/* Shape Icon with its current color */}
              <div 
                className="transition-colors duration-300 drop-shadow-lg"
                style={{ color: colorConfig[shape] }}
              >
                {shapeIcons[shape]}
              </div>
              
              <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${editingShape === shape ? 'text-white' : 'text-white/40'}`}>
                {shape}
              </span>

              {/* Active Indicator Dot */}
              {editingShape === shape && (
                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Color Palette for Selected Shape */}
        <div className="bg-black/30 rounded-xl p-3 flex flex-wrap justify-center gap-3 border border-white/5">
          {Object.entries(THEME_COLORS).map(([name, hex]) => (
            <button
              key={name}
              onClick={() => setColorForShape(editingShape, hex)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                colorConfig[editingShape] === hex 
                  ? 'border-white scale-110 shadow-[0_0_10px_' + hex + ']' 
                  : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: hex }}
              aria-label={`Set ${editingShape} to ${name}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};