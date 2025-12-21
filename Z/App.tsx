import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleScene } from './components/ParticleScene';
import { Controls } from './components/Controls';
import { ParticleShape, THEME_COLORS, HandData, ShapeColorConfig } from './types';
import { HandTrackingService } from './services/handTracking';
import { ArrowRight, SkipForward, Gift, Sparkles } from 'lucide-react';

const FALLBACK_ASSETS = {
  introVideo: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
  backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cosmic-glow-6703.mp3"
};

const MEDIA_ASSETS = {
  introVideo: "https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/video.mp4",
  musicTrack1: "https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/1.mp3",
  musicTrack2: "https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/2.mp3", 
  backgroundImage: "https://images.unsplash.com/photo-1543589923-78e35f728335?q=80&w=2070&auto=format&fit=crop" // Beautiful night winter scene
};

type AppState = 'intro' | 'form' | 'scene';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('intro');
  const [userName, setUserName] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [colorConfig, setColorConfig] = useState<ShapeColorConfig>({
    [ParticleShape.STAR]: THEME_COLORS.gold,
    [ParticleShape.HEART]: THEME_COLORS.ruby, 
    [ParticleShape.SNOW]: THEME_COLORS.diamond, 
    [ParticleShape.ORB]: THEME_COLORS.emerald, 
    spiral: THEME_COLORS.champagne 
  });
  
  const [editingShape, setEditingShape] = useState<ParticleShape | 'spiral'>(ParticleShape.STAR);
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

  const getAsset = (custom: string, fallback: string) => {
    return custom && custom.length > 10 ? custom : fallback;
  };

  const playlist = [
    getAsset(MEDIA_ASSETS.musicTrack1, FALLBACK_ASSETS.backgroundMusic),
    getAsset(MEDIA_ASSETS.musicTrack2, "") 
  ].filter(url => url !== ""); 

  const handleHandResults = useCallback((data: HandData) => {
    const prev = handDataRef.current;
    const alpha = 0.25; 
    handDataRef.current = {
      isOpen: data.isOpen,
      openness: prev.openness + (data.openness - prev.openness) * alpha,
      rotationX: prev.rotationX + (data.rotationX - prev.rotationX) * alpha,
      rotationY: prev.rotationY + (data.rotationY - prev.rotationY) * alpha,
      isDetected: data.isDetected
    };
  }, []);

  useEffect(() => {
    if (appState !== 'scene' || !isCameraEnabled) {
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
  }, [isCameraEnabled, handleHandResults, appState]);

  useEffect(() => {
    const attemptAutoplay = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.4;
          await audioRef.current.play();
          setIsMusicPlaying(true);
        } catch (e) {}
      }
    };
    attemptAutoplay();
  }, []);

  const ensureMusicPlays = () => {
    if (!isMusicPlaying && audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }
  };

  const handleEnterExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    ensureMusicPlays();
    setAppState('scene');
  };

  return (
    <div 
      className="relative w-full h-full bg-[#010105] overflow-hidden font-sans select-none"
      style={{
        backgroundImage: appState === 'scene' ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${MEDIA_ASSETS.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <audio ref={audioRef} src={playlist[currentTrackIndex]} onEnded={() => setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)} />
      <video ref={videoRef} className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none" playsInline muted autoPlay />

      {appState === 'intro' && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center cursor-pointer" onClick={ensureMusicPlays}>
          <video className="w-full h-full object-cover" src={getAsset(MEDIA_ASSETS.introVideo, FALLBACK_ASSETS.introVideo)} autoPlay playsInline muted onEnded={() => setAppState('form')} />
          <button onClick={() => setAppState('form')} className="absolute bottom-12 right-12 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-lg font-medium">Skip Intro</button>
        </div>
      )}

      {appState === 'form' && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center p-8 overflow-hidden" onClick={ensureMusicPlays}>
          <div className="relative z-10 w-full max-w-2xl text-center">
            <h2 className="font-serif italic text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">Merry Christmas</h2>
            <form onSubmit={handleEnterExperience} className="flex flex-col gap-6 max-w-md mx-auto">
              <input type="text" placeholder="YOUR NAME" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-center text-xl tracking-widest focus:outline-none focus:border-white/30 transition-all" autoFocus />
              <button type="submit" disabled={!userName.trim()} className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-20 tracking-widest">ENTER EXPERIENCE</button>
            </form>
          </div>
        </div>
      )}
      
      {appState === 'scene' && (
        <div className="w-full h-full animate-in fade-in duration-1000 relative">
          <Canvas camera={{ position: [0, 6, 30], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <ParticleScene colorConfig={colorConfig} handData={handDataRef} />
          </Canvas>

          <Controls
            userName={userName}
            colorConfig={colorConfig}
            setColorForShape={(s, c) => setColorConfig(prev => ({...prev, [s]: c}))}
            editingShape={editingShape}
            setEditingShape={setEditingShape}
            isFullscreen={isFullscreen}
            toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            isCameraEnabled={isCameraEnabled}
            toggleCamera={() => setIsCameraEnabled(!isCameraEnabled)}
            isMusicPlaying={isMusicPlaying}
            toggleMusic={() => {
              if (audioRef.current) {
                isMusicPlaying ? audioRef.current.pause() : audioRef.current.play();
                setIsMusicPlaying(!isMusicPlaying);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;