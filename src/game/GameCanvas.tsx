import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Player } from './Player';
import { Environment } from './Environment';
import { Obstacles } from './Obstacles';
import { useGameControls } from '@/hooks/useGameControls';
import { useGameStore } from '@/store/gameStore';
import { useEffect } from 'react';

export function GameCanvas() {
  useGameControls();
  const { gameState, speed, increaseSpeed, updateDistance } = useGameStore();
  
  // Increase speed over time
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      increaseSpeed();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [gameState, increaseSpeed]);
  
  // Update distance
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let lastTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      updateDistance(delta);
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState, speed, updateDistance]);
  
  return (
    <div className="w-full h-screen relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={60} />
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#1a1a2e', 20, 80]} />
        
        <Player />
        <Environment />
        <Obstacles />
      </Canvas>
      
      <GameUI />
    </div>
  );
}

function GameUI() {
  const { gameState, score, coins, speed, distance, startGame, resetGame } = useGameStore();
  
  // Format distance
  const formattedDistance = Math.floor(distance).toString().padStart(5, '0');
  
  return (
    <>
      {/* HUD - Always visible except in menu */}
      {gameState !== 'menu' && (
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
          {/* Score */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
            <div className="text-xs text-gray-300 uppercase tracking-wider">Score</div>
            <div className="text-2xl font-bold font-mono">{score.toLocaleString()}</div>
          </div>
          
          {/* Distance */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
            <div className="text-xs text-gray-300 uppercase tracking-wider">Distance</div>
            <div className="text-2xl font-bold font-mono">{formattedDistance}m</div>
          </div>
          
          {/* Coins */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-800 text-xs font-bold">
              $
            </div>
            <div className="text-xl font-bold font-mono">{coins}</div>
          </div>
        </div>
      )}
      
      {/* Speed indicator */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white pointer-events-none">
          <div className="text-xs text-gray-300 uppercase tracking-wider">Speed</div>
          <div className="text-lg font-bold font-mono">{Math.floor(speed * 10)} km/h</div>
        </div>
      )}
      
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-6xl font-black mb-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
              SUBWAY RUNNER
            </h1>
            <p className="text-xl text-gray-400 mb-8">3D Endless Runner</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-center">How to Play</h2>
            
            <div className="space-y-4 mb-8">
              {/* AZERTY Controls */}
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">Q</kbd>
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">D</kbd>
                </div>
                <span className="text-gray-300">Move Left / Right (AZERTY)</span>
              </div>
              
              {/* QWERTY Controls */}
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">A</kbd>
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">D</kbd>
                </div>
                <span className="text-gray-300">Move Left / Right (QWERTY)</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">Z</kbd>
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">W</kbd>
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">↑</kbd>
                </div>
                <span className="text-gray-300">Jump</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">S</kbd>
                  <kbd className="px-3 py-2 bg-gray-700 rounded-lg font-mono text-sm">↓</kbd>
                </div>
                <span className="text-gray-300">Slide / Duck</span>
              </div>
              
              <div className="border-t border-white/20 pt-4 mt-4">
                <p className="text-center text-gray-400 text-sm mb-2">Mobile Controls</p>
                <p className="text-center text-gray-300">Swipe Left/Right to move • Swipe Up to Jump • Swipe Down to Slide</p>
              </div>
            </div>
            
            <button 
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold text-xl transition-all transform hover:scale-105 active:scale-95"
            >
              TAP TO START
            </button>
          </div>
        </div>
      )}
      
      {/* Pause Screen */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
          <h2 className="text-5xl font-bold mb-8">PAUSED</h2>
          <p className="text-xl text-gray-300">Press ESC or P to resume</p>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white">
          <h2 className="text-6xl font-black mb-2 text-red-500">GAME OVER</h2>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 mt-8">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center">
                <div className="text-sm text-gray-400 uppercase tracking-wider">Final Score</div>
                <div className="text-3xl font-bold font-mono">{score.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 uppercase tracking-wider">Distance</div>
                <div className="text-3xl font-bold font-mono">{formattedDistance}m</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 uppercase tracking-wider">Coins</div>
                <div className="text-3xl font-bold font-mono text-yellow-400">{coins}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 uppercase tracking-wider">Max Speed</div>
                <div className="text-3xl font-bold font-mono">{Math.floor(speed * 10)} km/h</div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                resetGame();
              }}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-xl transition-all transform hover:scale-105 active:scale-95"
            >
              PLAY AGAIN
            </button>
            
            <button 
              onClick={resetGame}
              className="w-full mt-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Controls Hint */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs pointer-events-none md:hidden">
          <p>Swipe to move, jump & slide</p>
        </div>
      )}
    </>
  );
}
