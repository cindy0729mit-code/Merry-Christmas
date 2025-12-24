export enum ParticleShape {
  STAR = 'Star',
  HEART = 'Heart',
  SNOW = 'Snow',
  ORB = 'Orb'
}

export type ShapeColorConfig = {
  [key in ParticleShape]: string;
} & {
  spiral: string; // New independent spiral color
};

export interface HandData {
  isOpen: boolean;
  openness: number;
  rotationX: number;
  rotationY: number;
  isDetected: boolean;
}

export const THEME_COLORS = {
  gold: '#B8860B',      
  rose: '#C82033',      
  emerald: '#1D4C2A',   
  diamond: '#FFFFFF',   
  ruby: '#9A0403',      
  champagne: '#FBF0DC', 
  violet: '#C0B6F9',    
  mint: '#1B7837'       
};
