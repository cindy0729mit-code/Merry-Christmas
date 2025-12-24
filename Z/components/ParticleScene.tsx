import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points as PointsClass, AdditiveBlending, Group, Color as ThreeColor } from 'three';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { generateTreePositions } from '../utils/geometry';
import { generateParticleTexture } from '../utils/textures';
import { ParticleShape, HandData, ShapeColorConfig } from '../types';
import { PARTICLE_COUNT, BLOOM_INTENSITY, BLOOM_THRESHOLD } from '../constants';

const Points = 'points' as any;
const BufferGeometry = 'bufferGeometry' as any;
const BufferAttribute = 'bufferAttribute' as any;
const PointsMaterial = 'pointsMaterial' as any;
const Color = 'color' as any;
const PointLight = 'pointLight' as any;
const ThreeGroup = 'group' as any;

// Optional starfield - reduced to let background image shine
const Starfield: React.FC = () => {
  const count = 800;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 90 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <Points>
      <BufferGeometry>
        <BufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </BufferGeometry>
      <PointsMaterial
        size={0.05}
        color="#ffffff"
        transparent={true}
        opacity={0.3}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
};

// Falling drifting snow
const Snowfall: React.FC = () => {
  const count = 1200;
  const pointsRef = useRef<PointsClass>(null);
  const texture = useMemo(() => generateParticleTexture(ParticleShape.SNOW), []);
  
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= 0.04; 
        if (pos[i * 3 + 1] < -40) pos[i * 3 + 1] = 40;
        pos[i * 3] += Math.sin(state.clock.elapsedTime * 0.4 + i) * 0.01;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef}>
      <BufferGeometry>
        <BufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </BufferGeometry>
      <PointsMaterial
        size={0.12}
        map={texture}
        transparent={true}
        opacity={0.4}
        color="#ffffff"
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
};

const NorthernStar: React.FC<{ handData: React.MutableRefObject<HandData> }> = ({ handData }) => {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<PointsClass>(null);
  const outerRef = useRef<PointsClass>(null);
  const lightRef = useRef<any>(null);
  
  // Use a mix of shapes for the star to make it unique
  const starTex = useMemo(() => generateParticleTexture(ParticleShape.STAR), []);
  const orbTex = useMemo(() => generateParticleTexture(ParticleShape.ORB), []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      const { openness, isDetected } = handData.current;
      
      const basePower = isDetected ? 0.9 + openness * 0.6 : 1.0 + Math.sin(t * 1.2) * 0.05;
      
      // Floating animation
      groupRef.current.position.y = 6.2 + Math.sin(t * 1.5) * 0.15;
      groupRef.current.scale.setScalar(basePower);
      
      // Rotation animation
      if (coreRef.current) {
        coreRef.current.rotation.z = t * 0.4;
      }
      if (outerRef.current) {
        outerRef.current.rotation.z = -t * 0.2;
      }

      if (lightRef.current) {
        lightRef.current.intensity = 1.5 * basePower;
      }
    }
  });

  return (
    <ThreeGroup ref={groupRef} position={[0, 6.2, 0]}>
      <PointLight ref={lightRef} color="#FFFBE0" intensity={1.5} distance={7} decay={2.5} />
      
      {/* 1. Inner Spinning core (Fast) */}
      <Points ref={coreRef}>
        <BufferGeometry>
          <BufferAttribute attach="attributes-position" count={1} array={new Float32Array([0,0,0])} itemSize={3} />
        </BufferGeometry>
        <PointsMaterial
          size={3.8}
          map={starTex}
          color="#FFFFFF"
          transparent={true}
          opacity={0.9}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </Points>

      {/* 2. Outer Spinning ring/flare (Slow) */}
      <Points ref={outerRef}>
        <BufferGeometry>
          <BufferAttribute attach="attributes-position" count={1} array={new Float32Array([0,0,0])} itemSize={3} />
        </BufferGeometry>
        <PointsMaterial
          size={8.5}
          map={starTex}
          color="#FFEB8D"
          transparent={true}
          opacity={0.4}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </Points>

      {/* 3. Static glow background */}
      <Points>
        <BufferGeometry>
          <BufferAttribute attach="attributes-position" count={1} array={new Float32Array([0,0,0])} itemSize={3} />
        </BufferGeometry>
        <PointsMaterial
          size={12.0}
          map={orbTex}
          color="#FFD700"
          transparent={true}
          opacity={0.08}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </Points>
    </ThreeGroup>
  );
};

const ParticleLayer: React.FC<{
  positions: Float32Array;
  color: string;
  shape: ParticleShape;
  handData: React.MutableRefObject<HandData>;
  isSpiral?: boolean;
}> = ({ positions, color, shape, handData, isSpiral }) => {
  const pointsRef = useRef<PointsClass>(null);
  const texture = useMemo(() => generateParticleTexture(shape), [shape]);
  const initialPositions = useMemo(() => new Float32Array(positions), [positions]);

  const randomDirs = useMemo(() => {
    const arr = new Float32Array(positions.length);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - 0.5) * 12;
    return arr;
  }, [positions]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const { openness, rotationX, rotationY, isDetected } = handData.current;
    const posAttr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const activeOpenness = isDetected ? openness : (Math.sin(state.clock.elapsedTime * 0.45) * 0.05 + 0.05);
    const lerp = 3.5 * delta;
    // 获取材质对象
    const material = pointsRef.current.material as any;
    
    // 如果材质存在，就修改它的大小
    if (material) {
        // 1. 设置基础大小：平时就很大 (1.2 ~ 1.5)
        let baseSize = isSpiral ? 1.5 : 1.2; 
        
        // 雪花线条细，再额外大一点
        if (shape === ParticleShape.SNOW) baseSize *= 1.5;

        // 2. 设置动态散开：手张开时，大小增加 6.0 倍
        material.size = baseSize + (activeOpenness * 6.0); 
    }
    for (let i = 0; i < posAttr.length / 3; i++) {
      const i3 = i * 3;
      const tx = initialPositions[i3];
      const ty = initialPositions[i3+1];
      const tz = initialPositions[i3+2];
      
      const explosion = Math.pow(activeOpenness, 2.0);
      const sway = Math.sin(state.clock.elapsedTime * 0.5 + ty * 0.4) * 0.05;
      
      const dx = tx + (randomDirs[i3] * explosion) + sway;
      const dy = ty + (randomDirs[i3+1] * explosion);
      const dz = tz + (randomDirs[i3+2] * explosion);

      posAttr[i3] += (dx - posAttr[i3]) * lerp;
      posAttr[i3+1] += (dy - posAttr[i3+1]) * lerp;
      posAttr[i3+2] += (dz - posAttr[i3+2]) * lerp;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * (isSpiral ? 0.08 : 0.03);
    pointsRef.current.rotation.y += (rotationX * 0.08 - pointsRef.current.rotation.y) * delta;
    pointsRef.current.rotation.x += (rotationY * 0.05 - pointsRef.current.rotation.x) * delta;
  });

  return (
    <Points ref={pointsRef} frustumCulled={false}>
      <BufferGeometry>
        <BufferAttribute attach="attributes-position" count={positions.length / 3} array={new Float32Array(positions)} itemSize={3} />
      </BufferGeometry>
      <PointsMaterial
        size={isSpiral ? 0.32 : 0.45}
        map={texture}
        color={color}
        transparent={true}
        opacity={isSpiral ? 0.45 : 0.4}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
};

interface ParticleSceneProps {
  colorConfig: ShapeColorConfig;
  handData: React.MutableRefObject<HandData>;
}

export const ParticleScene: React.FC<ParticleSceneProps> = ({ colorConfig, handData }) => {
  const treeGeom = useMemo(() => generateTreePositions(PARTICLE_COUNT), []);
  const shapes = Object.values(ParticleShape) as ParticleShape[];
  
  const coreLayers = useMemo(() => {
    const layers = [];
    const countPerShape = Math.floor(treeGeom.core.length / 3 / shapes.length);
    for (let i = 0; i < shapes.length; i++) {
      const start = i * countPerShape * 3;
      const end = (i + 1) * countPerShape * 3;
      layers.push({
        shape: shapes[i],
        positions: treeGeom.core.slice(start, end)
      });
    }
    return layers;
  }, [treeGeom.core, shapes]);

  return (
    <>
      {/* Background is handled in App.tsx CSS to allow for easy image replacement */}
      
      <Starfield />
      <Snowfall />

      {/* Moved group up even further to y=-0.8 from -1.5 */}
      <ThreeGroup position={[0, -0.8, 0]} scale={[1.3, 1.3, 1.3]}>
        {coreLayers.map((layer, idx) => (
          <ParticleLayer
            key={idx}
            shape={layer.shape}
            color={colorConfig[layer.shape]}
            positions={layer.positions}
            handData={handData}
          />
        ))}

        <ParticleLayer
          shape={ParticleShape.STAR}
          color={colorConfig.spiral}
          positions={treeGeom.spiral}
          handData={handData}
          isSpiral={true}
        />

        <NorthernStar handData={handData} />
      </ThreeGroup>

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={BLOOM_THRESHOLD} intensity={BLOOM_INTENSITY} mipmapBlur />
        <Vignette darkness={1.1} offset={0.3} />
        <Noise opacity={0.012} />
      </EffectComposer>
    </>
  );
};
