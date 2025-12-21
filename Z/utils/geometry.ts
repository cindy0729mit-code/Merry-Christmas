import * as THREE from 'three';

export interface TreeGeometry {
  core: Float32Array;
  spiral: Float32Array;
}

export const generateTreePositions = (count: number): TreeGeometry => {
  const spiralCount = Math.floor(count * 0.12); // Slightly thinner but brighter spiral
  const coreCount = count - spiralCount;

  const corePositions = new Float32Array(coreCount * 3);
  const spiralPositions = new Float32Array(spiralCount * 3);
  const vec = new THREE.Vector3();

  // 1. Generate DENSE volumetric core
  for (let i = 0; i < coreCount; i++) {
    // Bias towards the vertical center and bottom for a "weighted" feel
    const t = Math.pow(Math.random(), 0.75); 
    const y = (1 - t) * 12 - 6;
    
    // Tighten the cone radius slightly for more density concentration
    const baseRadius = t * 4.8;
    const angle = Math.random() * Math.PI * 2;
    
    // Volumetric distribution
    const r = Math.sqrt(Math.random()) * baseRadius;
    
    // Very subtle jitter
    const jitter = (Math.random() - 0.5) * 0.15;
    
    vec.set(
      Math.cos(angle) * r, 
      y + jitter, 
      Math.sin(angle) * r
    );
    
    corePositions[i * 3] = vec.x;
    corePositions[i * 3 + 1] = vec.y;
    corePositions[i * 3 + 2] = vec.z;
  }

  // 2. Generate LUXURIOUS outer spiral
  for (let i = 0; i < spiralCount; i++) {
    const t = i / spiralCount;
    const y = (1 - t) * 12 - 6;
    const angle = t * Math.PI * 16; // More turns for a more intricate ribbon
    const radius = t * 5.5 + 0.4; // Wrapped tighter to the core
    
    vec.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    spiralPositions[i * 3] = vec.x;
    spiralPositions[i * 3 + 1] = vec.y;
    spiralPositions[i * 3 + 2] = vec.z;
  }

  return { core: corePositions, spiral: spiralPositions };
};