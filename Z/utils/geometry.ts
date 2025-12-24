import * as THREE from 'three';

export interface TreeGeometry {
  core: Float32Array;
  spiral: Float32Array;
}

export const generateTreePositions = (count: number): TreeGeometry => {
  const spiralCount = Math.floor(count * 0.12); 
  const coreCount = count - spiralCount;

  const corePositions = new Float32Array(coreCount * 3);
  const spiralPositions = new Float32Array(spiralCount * 3);
  const vec = new THREE.Vector3();

  // 1. 🎄 核心树体 (Core)
  for (let i = 0; i < coreCount; i++) {
    // 🔴 关键修改 1：把指数从 0.75 改成 0.4
    // 越小的值(如0.4)，会让越多的粒子分布在底部宽阔的区域，缓解顶部密集的问题
    const t = Math.pow(Math.random(), 0.4); 
    
    const y = (1 - t) * 12 - 6;
    
    // 稍微放松一点顶部的半径限制，让它不那么尖锐
    const baseRadius = t * 5.0; 
    const angle = Math.random() * Math.PI * 2;
    
    // 保持体积感
    const r = Math.sqrt(Math.random()) * baseRadius;
    const jitter = (Math.random() - 0.5) * 0.5; // 稍微增加一点抖动让分布更自然
    
    vec.set(
      Math.cos(angle) * r, 
      y + jitter, 
      Math.sin(angle) * r
    );
    
    corePositions[i * 3] = vec.x;
    corePositions[i * 3 + 1] = vec.y;
    corePositions[i * 3 + 2] = vec.z;
  }

  // 2. 🌀 螺旋线条 (Spiral)
  for (let i = 0; i < spiralCount; i++) {
    const tLinear = i / spiralCount;
    
    // 🔴 关键修改 2：给螺旋线也加上权重分布
    // 以前是线性的(t=tLinear)，导致顶部圈小点多，底部圈大点少。
    // 现在用平方根(0.5)，能让点在螺旋线上均匀分布（抵消半径变化的影响）
    const t = Math.pow(tLinear, 0.55);

    const y = (1 - t) * 12 - 6;
    const angle = t * Math.PI * 15; // 稍微减少一点圈数让它不那么缠绕
    const radius = t * 5.8 + 0.3; 
    
    vec.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    spiralPositions[i * 3] = vec.x;
    spiralPositions[i * 3 + 1] = vec.y;
    spiralPositions[i * 3 + 2] = vec.z;
  }

  return { core: corePositions, spiral: spiralPositions };
};
