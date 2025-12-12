import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, AdditiveBlending } from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { generateTreePositions } from '../utils/geometry';
import { generateParticleTexture } from '../utils/textures';
import { ParticleShape, HandData, ShapeColorConfig } from '../types';
import { PARTICLE_COUNT } from '../constants';

interface ParticleSceneProps {
  colorConfig: ShapeColorConfig;
  handData: React.MutableRefObject<HandData>;
}

// A single layer of particles (e.g., just the Stars, or just the Hearts)
const ParticleLayer: React.FC<{
  shape: ParticleShape;
  color: string;
  count: number;
  handData: React.MutableRefObject<HandData>;
}> = ({ shape, color, count, handData }) => {
  const pointsRef = useRef<Points>(null);

  // 1. Generate Geometry for this specific layer
  // Each layer gets its own set of positions forming a "partial tree"
  const initialPositions = useMemo(() => {
    return generateTreePositions(count);
  }, [count]);

  // 2. Generate Texture
  const texture = useMemo(() => {
    return generateParticleTexture(shape);
  }, [shape]);

  // 3. Random offsets for explosion
  const randomOffsets = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for(let i=0; i<arr.length; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 15 + Math.random() * 15; 
        
        arr[i*3] = r * Math.sin(phi) * Math.cos(theta);
        arr[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        arr[i*3+2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  // 4. Mutable current positions
  const currentPositions = useMemo(() => {
    return new Float32Array(initialPositions);
  }, [initialPositions]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const { openness, rotationX, rotationY, isDetected } = handData.current;
    
    const lerpSpeed = 4.0 * delta;
    const activeOpenness = isDetected ? openness : (Math.sin(state.clock.elapsedTime * 0.5) * 0.15 + 0.15);

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const tx = initialPositions[i3];
      const ty = initialPositions[i3 + 1];
      const tz = initialPositions[i3 + 2];

      const rx = randomOffsets[i3];
      const ry = randomOffsets[i3 + 1];
      const rz = randomOffsets[i3 + 2];

      const explosionFactor = Math.pow(activeOpenness, 2); 

      // Unique float phase per layer to add depth
      const time = state.clock.elapsedTime;
      // Use shape length as a pseudo-random seed for phase shift
      const phase = shape.length; 
      const floatX = Math.sin(time * 0.5 + ty * 0.5 + phase) * 0.2;
      const floatY = Math.cos(time * 0.3 + tx * 0.5 + phase) * 0.2;

      const dx = tx + (rx * explosionFactor) + floatX; 
      const dy = ty + (ry * explosionFactor) + floatY;
      const dz = tz + (rz * explosionFactor);

      positions[i3] += (dx - positions[i3]) * lerpSpeed;
      positions[i3 + 1] += (dy - positions[i3 + 1]) * lerpSpeed;
      positions[i3 + 2] += (dz - positions[i3 + 2]) * lerpSpeed;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Sync rotation
    pointsRef.current.rotation.y += (rotationX * 0.8 - pointsRef.current.rotation.y) * delta;
    pointsRef.current.rotation.x += (rotationY * 0.5 - pointsRef.current.rotation.x) * delta;
    
    // Idle spin - vary speed slightly by layer for parallax
    pointsRef.current.rotation.y += delta * (0.05 + (shape.length % 2) * 0.01);
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.6}
        map={texture}
        color={color}
        transparent={true}
        alphaTest={0.01}
        opacity={0.9}
        blending={AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

export const ParticleScene: React.FC<ParticleSceneProps> = ({ colorConfig, handData }) => {
  // Split total particles among the 4 shapes
  const shapes = Object.values(ParticleShape) as ParticleShape[];
  const countPerLayer = Math.floor(PARTICLE_COUNT / shapes.length);

  return (
    <>
      <color attach="background" args={['#050202']} />
      <ambientLight intensity={0.5} />
      
      {shapes.map((shape) => (
        <ParticleLayer
          key={shape}
          shape={shape}
          color={colorConfig[shape]}
          count={countPerLayer}
          handData={handData}
        />
      ))}

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.1} 
          mipmapBlur 
          intensity={0.8} 
          radius={0.5} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
      </EffectComposer>
    </>
  );
};