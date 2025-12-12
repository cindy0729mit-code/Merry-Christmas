import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleScene } from './components/ParticleScene';
import { Controls } from './components/Controls';
import { ParticleShape, THEME_COLORS, HandData, ShapeColorConfig } from './types';
import { HandTrackingService } from './services/handTracking';
import { ArrowRight, SkipForward, Gift, Sparkles } from 'lucide-react';

// ============================================================================
// 🛡️ 备用素材 (FALLBACK ASSETS)
// ============================================================================
const FALLBACK_ASSETS = {
  introVideo: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
  usagiLeft: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5biZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/Mnt00E9zZKHB6/giphy.gif",
  usagiRight: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5aHZ5biZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/Q6WPVzGY85cnC/giphy.gif",
  backgroundMusic: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cosmic-glow-6703.mp3"
};

// ============================================================================
// 📁 您的自定义配置 (YOUR CONFIGURATION)
// ============================================================================
// 1. 图片：去搜索 "图片转Base64"，将转换后以 "data:image..." 开头的长代码粘贴在下方引号里。
// 2. 视频：请使用网络链接。
// ============================================================================
const MEDIA_ASSETS = {
  // 视频建议保持这个在线链接，或者填入您自己的 HTTPS 视频链接
  introVideo: "https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/video.mp4",
  
  // 在这里粘贴您的左边图片 Base64 代码 (data:image/png;base64,......)
  usagiLeft: "https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/1.png", 
  
  // 在这里粘贴您的右边图片 Base64 代码
  usagiRight: "https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/2.png",
  
  // 🎵 音乐设置 🎵
  // 音乐1：第一首播放的歌
  musicTrack1: "https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/1.mp3",
  
  // 音乐2：第二首播放的歌 (如果留空，会自动重复播放音乐1)
  musicTrack2: "https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/2.mp3", 
};

type AppState = 'intro' | 'form' | 'scene';

const App: React.FC = () => {
  // --- Global State ---
  const [appState, setAppState] = useState<AppState>('intro');
  const [userName, setUserName] = useState('');
  
  // --- Audio State ---
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Particle/Game State ---
  const [colorConfig, setColorConfig] = useState<ShapeColorConfig>({
    [ParticleShape.STAR]: THEME_COLORS.gold,
    [ParticleShape.HEART]: THEME_COLORS.red,
    [ParticleShape.SNOW]: THEME_COLORS.white,
    [ParticleShape.ORB]: THEME_COLORS.green 
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

  // --- Helper: Asset Resolution ---
  const getAsset = (custom: string, fallback: string) => {
    return custom && custom.length > 10 ? custom : fallback;
  };

  // --- Playlist Logic ---
  const playlist = [
    getAsset(MEDIA_ASSETS.musicTrack1, FALLBACK_ASSETS.backgroundMusic),
    // Only add track 2 if it exists, otherwise just repeat track 1 logic or use fallback if explicitly requested but failed
    getAsset(MEDIA_ASSETS.musicTrack2, "") 
  ].filter(url => url !== ""); // Remove empty tracks

  // --- Hand Tracking Logic ---
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

    return () => {
      if (handTracker.current) {
        handTracker.current.stop();
        handTracker.current = null;
      }
    };
  }, [isCameraEnabled, handleHandResults, appState]);

  // --- Audio Effects ---
  // When track index changes, if music was playing, ensure the new track starts
  useEffect(() => {
    if (isMusicPlaying && audioRef.current) {
      // Small timeout to allow the src to update
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(e => console.warn("Auto-switch play prevented:", e));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentTrackIndex, isMusicPlaying]);

  // --- Actions ---

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

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleTrackEnd = () => {
    // Move to next track, loop back to 0 if at end
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const handleEnterExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setAppState('scene');
    
    // Start music
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {});
    }
  };

  // --- Helper: Fallback Handlers ---
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackUrl: string) => {
    if (e.currentTarget.src !== window.location.href) { 
       console.warn(`Custom image failed to load, using fallback.`);
    }
    e.currentTarget.src = fallbackUrl;
    e.currentTarget.onerror = null; 
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn(`Custom video failed to load, using fallback.`);
    e.currentTarget.src = FALLBACK_ASSETS.introVideo;
    e.currentTarget.load();
    e.currentTarget.play();
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.warn(`Audio track failed to load, skipping to next/fallback.`);
    // If a track fails, try to move to the next one automatically
    // or if we are already fallback, just stop.
    if (playlist.length > 1) {
       handleTrackEnd(); 
    } else {
       // Final fallback if everything fails
       e.currentTarget.src = FALLBACK_ASSETS.backgroundMusic;
       if(isMusicPlaying) e.currentTarget.play();
    }
  };

  // --- Render Functions ---
  
  const renderIntroVideo = () => (
    <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
      <video
        className="w-full h-full object-cover opacity-80"
        src={getAsset(MEDIA_ASSETS.introVideo, FALLBACK_ASSETS.introVideo)}
        autoPlay
        playsInline
        muted
        onEnded={() => setAppState('form')}
        onError={handleVideoError}
      />
      <div className="absolute bottom-10 right-10">
        <button 
          onClick={() => setAppState('form')}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
        >
          Skip <SkipForward size={16} />
        </button>
      </div>
    </div>
  );

  const renderNameForm = () => (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://github.com/cindy0729mit-code/Merry-Christmas/raw/refs/heads/main/assets/3.png')] bg-cover bg-center opacity-40 blur-sm"></div>
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-900/20 via-transparent to-green-900/20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm transform transition-all">
        
        <div className="flex justify-between items-end px-2 -mb-8 relative z-20">
          <img 
            src={getAsset(MEDIA_ASSETS.usagiLeft, FALLBACK_ASSETS.usagiLeft)}
            alt="Decoration Left" 
            className="w-24 h-24 object-contain animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            style={{ animationDuration: '2s' }}
            onError={(e) => handleImgError(e, FALLBACK_ASSETS.usagiLeft)}
          />
           <div className="mb-8 animate-pulse text-yellow-300">
             <Sparkles size={32} />
           </div>
          <img 
            src={getAsset(MEDIA_ASSETS.usagiRight, FALLBACK_ASSETS.usagiRight)}
            alt="Decoration Right" 
            className="w-24 h-24 object-contain animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            style={{ animationDuration: '2.5s', animationDelay: '0.2s' }}
            onError={(e) => handleImgError(e, FALLBACK_ASSETS.usagiRight)}
          />
        </div>

        <div className="bg-black/60 backdrop-blur-xl border-2 border-white/20 p-8 pt-10 rounded-[2rem] shadow-[0_0_50px_rgba(255,0,0,0.2)] text-center relative overflow-hidden">
          
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/snow.png')]"></div>
          
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
    <div className="relative w-full h-full bg-black overflow-hidden font-sans">
      
      {/* 
         🎵 Audio Element Changes:
         1. Removed 'loop' attribute so we can detect when a song ends.
         2. Added 'onEnded' to switch to the next track in the playlist.
         3. src is now dynamic based on currentTrackIndex.
      */}
      <audio 
        ref={audioRef} 
        src={playlist[currentTrackIndex]}
        onEnded={handleTrackEnd}
        onError={handleAudioError}
      />

      {/* Hidden Video Element for Hand Tracking (Only active in scene) */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none"
        playsInline
        muted
        autoPlay
      />

      {/* State Rendering */}
      {appState === 'intro' && renderIntroVideo()}
      {appState === 'form' && renderNameForm()}
      
      {appState === 'scene' && (
        <div className="w-full h-full animate-in fade-in duration-1000">
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
            userName={userName}
            colorConfig={colorConfig}
            setColorForShape={setColorForShape}
            editingShape={editingShape}
            setEditingShape={setEditingShape}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            isCameraEnabled={isCameraEnabled}
            toggleCamera={() => setIsCameraEnabled(!isCameraEnabled)}
            isMusicPlaying={isMusicPlaying}
            toggleMusic={toggleMusic}
          />
        </div>
      )}

    </div>
  );
};

export default App;
