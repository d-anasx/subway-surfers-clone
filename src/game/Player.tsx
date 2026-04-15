import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const LANE_WIDTH = 3;
const JUMP_HEIGHT = 3;
const JUMP_DURATION = 0.6;
const SLIDE_DURATION = 0.8;

export function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { lane, isJumping, isSliding, setIsJumping, setIsSliding, setPlayerY } = useGameStore();
  
  const jumpStartTime = useRef<number | null>(null);
  const slideStartTime = useRef<number | null>(null);
  const targetX = useRef(0);
  
  // Update target X position when lane changes
  useEffect(() => {
    targetX.current = lane * LANE_WIDTH;
  }, [lane]);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const mesh = meshRef.current;
    
    // Smooth lane transition
    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX.current, delta * 10);
    
    // Jump animation
    if (isJumping) {
      if (jumpStartTime.current === null) {
        jumpStartTime.current = state.clock.elapsedTime;
      }
      
      const jumpProgress = (state.clock.elapsedTime - jumpStartTime.current) / JUMP_DURATION;
      
      if (jumpProgress >= 1) {
        setIsJumping(false);
        jumpStartTime.current = null;
        mesh.position.y = 2;
        setPlayerY(2);
      } else {
        // Parabolic jump
        const jumpY = Math.sin(jumpProgress * Math.PI) * JUMP_HEIGHT;
        mesh.position.y = 2 + jumpY;
        setPlayerY(mesh.position.y);
      }
    }
    
    // Slide animation
    if (isSliding) {
      if (slideStartTime.current === null) {
        slideStartTime.current = state.clock.elapsedTime;
      }
      
      const slideProgress = (state.clock.elapsedTime - slideStartTime.current) / SLIDE_DURATION;
      
      if (slideProgress >= 1) {
        setIsSliding(false);
        slideStartTime.current = null;
        mesh.scale.y = 1;
        mesh.position.y = 2;
      } else {
        // Duck down - scale Y and adjust position
        mesh.scale.y = 0.5;
        mesh.position.y = 2;
        setPlayerY(mesh.position.y);
      }
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 2, 0]} castShadow>
      {/* Main body */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#FF6B35" />
      
      {/* Head */}
      <mesh position={[0, 0.8, 0.2]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#FFD93D" />
      </mesh>
      
      {/* Backpack */}
      <mesh position={[0, 0.1, -0.6]} castShadow>
        <boxGeometry args={[0.6, 0.7, 0.3]} />
        <meshStandardMaterial color="#6BCB77" />
      </mesh>
      
      {/* Cap */}
      <mesh position={[0, 1.05, 0.3]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#4D96FF" />
      </mesh>
      <mesh position={[0, 1.05, 0.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial color="#4D96FF" />
      </mesh>
    </mesh>
  );
}
