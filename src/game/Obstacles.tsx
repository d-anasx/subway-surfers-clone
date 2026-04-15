import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const LANE_WIDTH = 3;
const SPAWN_Z = -80;
const DESPAWN_Z = 10;
const SPAWN_INTERVAL = 2; // seconds

interface Obstacle {
  id: number;
  lane: -1 | 0 | 1;
  z: number;
  type: 'barrier' | 'train' | 'barrier_low';
  passed: boolean;
}

interface Coin {
  id: number;
  lane: -1 | 0 | 1;
  z: number;
  collected: boolean;
}

export function Obstacles() {
  const { speed, gameState, lane, isJumping, isSliding, playerY, addScore, addCoin, endGame } = useGameStore();
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const idCounter = useRef(0);
  
  // Spawn obstacles
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const spawnInterval = setInterval(() => {
      const lanes: (-1 | 0 | 1)[] = [-1, 0, 1];
      const numObstacles = Math.random() > 0.7 ? 2 : 1;
      
      // Shuffle lanes
      const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numObstacles; i++) {
        const obstacleLane = shuffledLanes[i];
        const type = Math.random() > 0.6 ? 'train' : (Math.random() > 0.5 ? 'barrier' : 'barrier_low');
        
        const newObstacle: Obstacle = {
          id: idCounter.current++,
          lane: obstacleLane,
          z: SPAWN_Z,
          type,
          passed: false,
        };
        
        setObstacles(prev => [...prev, newObstacle]);
      }
      
      // Spawn coins in remaining lanes
      const remainingLanes = shuffledLanes.slice(numObstacles);
      remainingLanes.forEach(coinLane => {
        if (Math.random() > 0.3) {
          const newCoin: Coin = {
            id: idCounter.current++,
            lane: coinLane,
            z: SPAWN_Z,
            collected: false,
          };
          setCoins(prev => [...prev, newCoin]);
        }
      });
    }, SPAWN_INTERVAL * 1000);
    
    return () => clearInterval(spawnInterval);
  }, [gameState]);
  
  // Move obstacles and check collisions
  useFrame((_, delta) => {
    if (gameState !== 'playing') return;
    
    const moveDistance = speed * delta * 5;
    
    setObstacles(prev => {
      const updated = prev.map(obs => ({
        ...obs,
        z: obs.z + moveDistance
      })).filter(obs => obs.z < DESPAWN_Z);
      
      // Check collisions
      updated.forEach(obs => {
        if (obs.z > -2 && obs.z < 2 && obs.lane === lane) {
          // Collision check based on obstacle type and player state
          let collision = false;
          
          if (obs.type === 'barrier') {
            // Can jump over
            if (!isJumping || playerY < 2) {
              collision = true;
            }
          } else if (obs.type === 'barrier_low') {
            // Can slide under
            if (!isSliding) {
              collision = true;
            }
          } else if (obs.type === 'train') {
            // Train is too tall to jump, must dodge
            collision = true;
          }
          
          if (collision) {
            endGame();
          }
        }
        
        // Add score for passing obstacles
        if (obs.z > 2 && !obs.passed) {
          obs.passed = true;
          addScore(10);
        }
      });
      
      return updated;
    });
    
    // Move coins and check collection
    setCoins(prev => {
      const updated = prev.map(coin => ({
        ...coin,
        z: coin.z + moveDistance
      })).filter(coin => coin.z < DESPAWN_Z && !coin.collected);
      
      // Check collection
      updated.forEach(coin => {
        if (coin.z > -1.5 && coin.z < 1.5 && coin.lane === lane && !coin.collected) {
          coin.collected = true;
          addCoin();
        }
      });
      
      return updated.filter(coin => !coin.collected);
    });
  });
  
  return (
    <group>
      {obstacles.map(obstacle => (
        <ObstacleMesh key={obstacle.id} obstacle={obstacle} />
      ))}
      {coins.map(coin => (
        <CoinMesh key={coin.id} coin={coin} />
      ))}
    </group>
  );
}

function ObstacleMesh({ obstacle }: { obstacle: Obstacle }) {
  const x = obstacle.lane * LANE_WIDTH;
  
  if (obstacle.type === 'barrier') {
    return (
      <mesh position={[x, 1, obstacle.z]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 1]} />
        <meshStandardMaterial color="#E74C3C" />
        {/* Warning stripes */}
        <mesh position={[0, 0, 0.51]}>
          <planeGeometry args={[1.8, 1.8]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      </mesh>
    );
  }
  
  if (obstacle.type === 'barrier_low') {
    return (
      <mesh position={[x, 0.5, obstacle.z]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1, 1]} />
        <meshStandardMaterial color="#9B59B6" />
      </mesh>
    );
  }
  
  // Train
  return (
    <mesh position={[x, 2, obstacle.z]} castShadow receiveShadow>
      <boxGeometry args={[2.8, 4, 12]} />
      <meshStandardMaterial color="#3498DB" />
      {/* Windows */}
      <mesh position={[0, 0.5, 6.01]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[0, 0.5, -6.01]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial color="#87CEEB" />
      </mesh>
    </mesh>
  );
}

function CoinMesh({ coin }: { coin: Coin }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const x = coin.lane * LANE_WIDTH;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 3;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[x, 1.5, coin.z]} castShadow>
      <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
      <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}
