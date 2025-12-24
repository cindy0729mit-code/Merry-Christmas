import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleScene } from './components/ParticleScene';
import { Controls } from './components/Controls';
import { ParticleShape, THEME_COLORS, HandData, ShapeColorConfig } from './types';
import { HandTrackingService } from './services/handTracking';
import { ArrowRight, SkipForward, Gift, Sparkles } from 'lucide-react';

const MEDIA_ASSETS = {
  introVideo: "/video.mp4",
  musicTrack1: "/1.mp3",
  musicTrack2: "/2.mp3", 
  backgroundImage: "bg.png", // Beautiful night winter scene
  usagiLeft: "/1.png", 
  usagiRight: "/2.png"
};
const FALLBACK_ASSETS = {
  introVideo: "/video.mp4", // 如果没有备用视频，留空即可
  backgroundMusic: "/1.mp3", // 默认音乐
  usagiLeft: "/1.png", // 假设使用 public 文件夹里的图片作为备用
  usagiRight: "/2.png" // 假设使用 public 文件夹里的图片作为备用
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
    [ParticleShape.HEART]: '#B0312A', 
    [ParticleShape.SNOW]: '#FFFFFF', 
    [ParticleShape.ORB]: '#1E4027', 
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

// 直接使用资源列表里的音乐
  const playlist = [
    MEDIA_ASSETS.musicTrack1,
    MEDIA_ASSETS.musicTrack2 
  ].filter(url => url && url.length > 1);

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

  const renderNameForm = () => (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/bg1.png')] bg-cover bg-center opacity-40 blur-sm"></div>
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-900/20 via-transparent to-green-900/20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm transform transition-all">
        
        <div className="flex justify-between items-end px-2 -mb-8 relative z-20">
          <img 
            src={MEDIA_ASSETS.usagiLeft}
            alt="Decoration Left" 
            className="w-24 h-24 object-contain animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            style={{ animationDuration: '2s' }}
          />
           <div className="mb-8 animate-pulse text-yellow-300">
             <Sparkles size={32} />
           </div>
          <img 
            src={MEDIA_ASSETS.usagiRight}
            alt="Decoration Right" 
            className="w-24 h-24 object-contain animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            style={{ animationDuration: '2.5s', animationDelay: '0.2s' }}
          />
        </div>

        <div className="bg-black/60 backdrop-blur-xl border-2 border-white/20 p-8 pt-10 rounded-[2rem] shadow-[0_0_50px_rgba(255,0,0,0.2)] text-center relative overflow-hidden">
          
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('/snow.png')]"></div>
          
          <h2 className="font-serif italic text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-green-400 mb-2 drop-shadow-sm">
            Merry Christmas
          </h2>
          <p className="text-white/80 mb-8 text-sm font-medium tracking-wide">
            Welcome to the LuminaFest
          </p>
          
          <form onSubmit={handleEnterExperience} className="flex flex-col gap-4 relative z-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white/10 border-2 border-white/10 rounded-2xl px-4 py-4 text-white placeholder-white/40 text-center text-lg focus:outline-none focus:border-red-400/50 focus:bg-white/20 transition-all shadow-inner"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                <Gift size={20} />
              </div>
            </div>

            <button 
              type="submit"
              disabled={!userName.trim()}
              className="group w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-4 rounded-2xl hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 hover:shadow-red-500/30 hover:-translate-y-0.5"
            >
              <span>START PARTY</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

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
          <video className="w-full h-full object-cover" src={MEDIA_ASSETS.introVideo} autoPlay playsInline muted preload="auto" onEnded={() => setAppState('form')} />
          <button onClick={() => setAppState('form')} className="absolute bottom-12 right-12 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-lg font-medium">Skip Intro</button>
        </div>
      )}

      {appState === 'form' && renderNameForm()}
      
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
