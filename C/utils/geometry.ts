import * as THREE from 'three';

export const generateTreePositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const vec = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Conical Spiral Tree Structure
    // t goes from 0 (top) to 1 (bottom)
    // CHANGED: Reduced power from 0.8 to 0.5. 
    // This pushes the distribution significantly towards 1 (the bottom), 
    // reducing the particle clustering/brightness singularity at the tip of the cone.
    const t = Math.pow(Math.random(), 0.5); 
    
    // Height mapping: Top at +5, Bottom at -5 (Total height 10)
    const y = (1 - t) * 10 - 5; 

    // Radius increases as we go down
    const radiusBase = t * 4.0; 
    const radiusVariation = Math.random() * 1.5 * t; // More variation at bottom
    const radius = radiusBase + radiusVariation;

    // Spiral angle
    const angle = t * Math.PI * 25 + (Math.random() * 0.5); 

    vec.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );

    // Add general volume noise
    vec.x += (Math.random() - 0.5) * 0.5;
    vec.y += (Math.random() - 0.5) * 0.5;
    vec.z += (Math.random() - 0.5) * 0.5;

    positions[i3] = vec.x;
    positions[i3 + 1] = vec.y;
    positions[i3 + 2] = vec.z;
  }

  return positions;
};