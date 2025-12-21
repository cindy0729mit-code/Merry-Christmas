import React from 'react';
import { ParticleShape, THEME_COLORS, ShapeColorConfig } from '../types';
import { Heart, Star, Snowflake, Circle, Maximize2, Minimize2, Video, VideoOff, Music, VolumeX, LayoutGrid, Sparkle, Wind } from 'lucide-react';

interface ControlsProps {
  userName: string;
  colorConfig: ShapeColorConfig;
  setColorForShape: (shape: ParticleShape | 'spiral', color: string) => void;
  editingShape: ParticleShape | 'spiral';
  setEditingShape: (s: ParticleShape | 'spiral') => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isCameraEnabled: boolean;
  toggleCamera: () => void;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  userName,
  colorConfig,
  setColorForShape,
  editingShape,
  setEditingShape,
  isFullscreen,
  toggleFullscreen,
  isCameraEnabled,
  toggleCamera,
  isMusicPlaying,
  toggleMusic
}) => {
  
  const shapeIcons = {
    [ParticleShape.STAR]: <Star size={18} fill="currentColor" />,
    [ParticleShape.HEART]: <Heart size={18} fill="currentColor" />,
    [ParticleShape.SNOW]: <Snowflake size={18} />,
    [ParticleShape.ORB]: <Circle size={18} fill="currentColor" />,
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-10">
      
      <div className="flex justify-between items-start pointer-events-auto">
        {/* Compact Top Left Box */}
        <div className="bg-black/30 backdrop-blur-2xl p-4 px-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-0.5">
          <div className="flex items-center gap-2 opacity-40">
            <Sparkle size={8} className="text-amber-200" />
            <span className="text-white text-[7px] font-bold uppercase tracking-[0.3em]">Gift For</span>
          </div>
          <h1 className="font-serif text-xl md:text-2xl font-bold tracking-wider text-white uppercase leading-tight">
            {userName}
          </h1>
          <div className="mt-1">
            <h2 className="font-serif italic text-sm md:text-base text-amber-100/70 tracking-widest font-medium">
              Merry Christmas
            </h2>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={toggleMusic} className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-2xl rounded-xl text-white border border-white/10 shadow-xl">
            {isMusicPlaying ? <Music size={16} /> : <VolumeX size={16} className="text-white/20" />}
          </button>
           <button onClick={toggleCamera} className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-2xl rounded-xl text-white border border-white/10 shadow-xl">
            {isCameraEnabled ? <Video size={16} /> : <VideoOff size={16} className="text-white/20" />}
          </button>
          <button onClick={toggleFullscreen} className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-2xl rounded-xl text-white border border-white/10 shadow-xl">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Style Selection Controls */}
      <div className="flex flex-col gap-3 pointer-events-auto w-full max-w-sm mx-auto bg-black/70 backdrop-blur-3xl p-5 rounded-[2rem] border border-white/5 shadow-2xl mb-4">
        <div className="flex items-center gap-2 px-1 text-white/30 text-[8px] font-bold uppercase tracking-[0.4em]">
          <LayoutGrid size={12} />
          <span>Style Selection</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {Object.values(ParticleShape).map((shape) => (
            <button
              key={shape}
              onClick={() => setEditingShape(shape)}
              className={`flex items-center justify-center h-10 rounded-xl transition-all ${
                editingShape === shape ? 'bg-white/10 border-white/10' : 'bg-white/5 border-transparent'
              } border`}
              style={{ color: editingShape === shape ? colorConfig[shape] : 'rgba(255,255,255,0.2)' }}
            >
              {shapeIcons[shape]}
            </button>
          ))}
          <button
            onClick={() => setEditingShape('spiral')}
            className={`flex items-center justify-center h-10 rounded-xl transition-all ${
              editingShape === 'spiral' ? 'bg-white/10 border-white/10' : 'bg-white/5 border-transparent'
            } border`}
            style={{ color: editingShape === 'spiral' ? colorConfig.spiral : 'rgba(255,255,255,0.2)' }}
          >
            <Wind size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex flex-1 justify-between items-center gap-1">
            {Object.entries(THEME_COLORS).map(([name, hex]) => (
              <button
                key={name}
                onClick={() => setColorForShape(editingShape, hex)}
                className={`w-6 h-6 rounded-full transition-all ${
                  (editingShape === 'spiral' ? colorConfig.spiral : colorConfig[editingShape as ParticleShape]) === hex 
                    ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-40 hover:opacity-100'
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};