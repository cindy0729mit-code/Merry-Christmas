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
  gold: '#D4AF37',      
  rose: '#E0115F',      
  emerald: '#043927',   
  diamond: '#B0C4DE',   
  ruby: '#700202',      
  champagne: '#E3D2B4', 
  violet: '#4B0082',    
  mint: '#2F4F4F'       
};