import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const TRACK_LENGTH = 100;
const TRACK_WIDTH = 10;

export function Environment() {
  const groundRef = useRef<THREE.Mesh>(null);
  const { speed, gameState } = useGameStore();
  
  // Create track texture
  const trackTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Dark asphalt background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Lane markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([30, 30]);
    
    // Center lane line
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();
    
    // Side lane lines
    ctx.beginPath();
    ctx.moveTo(85, 0);
    ctx.lineTo(85, 512);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(427, 0);
    ctx.lineTo(427, 512);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 10);
    return texture;
  }, []);
  
  useFrame((_, delta) => {
    if (gameState === 'playing' && trackTexture) {
      trackTexture.offset.y -= speed * delta * 0.1;
    }
  });
  
  return (
    <group>
      {/* Main track */}
      <mesh 
        ref={groundRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, -TRACK_LENGTH / 2 + 20]}
        receiveShadow
      >
        <planeGeometry args={[TRACK_WIDTH, TRACK_LENGTH]} />
        <meshStandardMaterial map={trackTexture} />
      </mesh>
      
      {/* Side walls/barriers */}
      <mesh position={[-TRACK_WIDTH / 2 - 1, 1, -30]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, TRACK_LENGTH]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      <mesh position={[TRACK_WIDTH / 2 + 1, 1, -30]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, TRACK_LENGTH]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      {/* Decorative buildings/structures on sides */}
      <Buildings />
      
      {/* Ground plane below track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -30]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  );
}

function Buildings() {
  const buildings = useMemo(() => {
    const items = [];
    for (let i = 0; i < 20; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (15 + Math.random() * 20);
      const z = -Math.random() * 80;
      const height = 5 + Math.random() * 15;
      const width = 3 + Math.random() * 4;
      const depth = 3 + Math.random() * 4;
      const color = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 5)];
      
      items.push({ x, z, height, width, depth, color });
    }
    return items;
  }, []);
  
  return (
    <group>
      {buildings.map((building, i) => (
        <mesh 
          key={i} 
          position={[building.x, building.height / 2, building.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[building.width, building.height, building.depth]} />
          <meshStandardMaterial color={building.color} />
        </mesh>
      ))}
    </group>
  );
}
