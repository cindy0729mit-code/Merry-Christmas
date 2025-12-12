import * as THREE from 'three';
import { ParticleShape } from '../types';

export const generateParticleTexture = (type: ParticleShape): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return new THREE.Texture();

  const cx = size / 2;
  const cy = size / 2;

  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 5;
  ctx.shadowColor = 'white';

  switch (type) {
    case ParticleShape.ORB:
      // Soft glow circle
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case ParticleShape.STAR:
      // 5-pointed star
      ctx.beginPath();
      const outerRadius = size * 0.45;
      const innerRadius = size * 0.2;
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x = cx + Math.cos(angle) * outerRadius;
        const y = cy + Math.sin(angle) * outerRadius;
        ctx.lineTo(x, y);
        const innerAngle = angle + Math.PI / 5;
        const ix = cx + Math.cos(innerAngle) * innerRadius;
        const iy = cy + Math.sin(innerAngle) * innerRadius;
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
      break;

    case ParticleShape.HEART:
      // Heart shape
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(cx, cy + size * 0.2);
      // top left curve
      ctx.bezierCurveTo(
        cx - size / 2, cy - topCurveHeight, 
        cx - size / 2, cy + topCurveHeight / 3, 
        cx, cy + size * 0.45
      );
      // top right curve
      ctx.bezierCurveTo(
        cx + size / 2, cy + topCurveHeight / 3, 
        cx + size / 2, cy - topCurveHeight, 
        cx, cy + size * 0.2
      );
      ctx.fill();
      break;

    case ParticleShape.SNOW:
      // Simple Snowflake
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((i * Math.PI * 2) / 6);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, size * 0.4);
        
        // branches
        ctx.moveTo(0, size * 0.2);
        ctx.lineTo(size * 0.1, size * 0.3);
        ctx.moveTo(0, size * 0.2);
        ctx.lineTo(-size * 0.1, size * 0.3);
        
        ctx.stroke();
        ctx.restore();
      }
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};