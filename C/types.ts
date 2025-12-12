export enum ParticleShape {
  STAR = 'Star',
  HEART = 'Heart',
  SNOW = 'Snow',
  ORB = 'Orb'
}

// Map each shape to a specific color
export type ShapeColorConfig = {
  [key in ParticleShape]: string;
};

export interface HandData {
  isOpen: boolean; // True = Open Hand (Explode), False = Fist (Contract)
  openness: number; // 0 to 1
  rotationX: number; // Hand rotation for scene control
  rotationY: number;
  isDetected: boolean;
}

export const THEME_COLORS = {
  gold: '#d4af37',
  red: '#ef4444', // Brighter red
  green: '#1b7837', // Changed from dark green (#0f3d2e) to a bright Christmas green for better bloom
  pink: '#ff69b4',
  white: '#fff4e0',
  blue: '#00bfff',
  purple: '#9b59b6',
  orange: '#e67e22'
};