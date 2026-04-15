import { create } from 'zustand';

export type Lane = -1 | 0 | 1; // left, center, right
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

interface GameStore {
  // Game state
  gameState: GameState;
  score: number;
  coins: number;
  speed: number;
  distance: number;
  
  // Player state
  lane: Lane;
  isJumping: boolean;
  isSliding: boolean;
  playerY: number;
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Player actions
  moveLeft: () => void;
  moveRight: () => void;
  jump: () => void;
  slide: () => void;
  setPlayerY: (y: number) => void;
  setIsJumping: (jumping: boolean) => void;
  setIsSliding: (sliding: boolean) => void;
  
  // Game updates
  addScore: (points: number) => void;
  addCoin: () => void;
  increaseSpeed: () => void;
  updateDistance: (delta: number) => void;
}

const INITIAL_SPEED = 10;
const MAX_SPEED = 30;
const SPEED_INCREMENT = 0.5;

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: 'menu',
  score: 0,
  coins: 0,
  speed: INITIAL_SPEED,
  distance: 0,
  lane: 0,
  isJumping: false,
  isSliding: false,
  playerY: 0,
  
  // Game state actions
  startGame: () => set({ 
    gameState: 'playing', 
    score: 0, 
    coins: 0, 
    speed: INITIAL_SPEED,
    distance: 0,
    lane: 0,
    isJumping: false,
    isSliding: false,
    playerY: 0
  }),
  
  pauseGame: () => set({ gameState: 'paused' }),
  resumeGame: () => set({ gameState: 'playing' }),
  endGame: () => set({ gameState: 'gameOver' }),
  
  resetGame: () => set({ 
    gameState: 'menu',
    score: 0,
    coins: 0,
    speed: INITIAL_SPEED,
    distance: 0,
    lane: 0,
    isJumping: false,
    isSliding: false,
    playerY: 0
  }),
  
  // Player movement
  moveLeft: () => set((state) => ({ 
    lane: Math.max(-1, state.lane - 1) as Lane 
  })),
  
  moveRight: () => set((state) => ({ 
    lane: Math.min(1, state.lane + 1) as Lane 
  })),
  
  jump: () => {
    const { isJumping, isSliding } = get();
    if (!isJumping && !isSliding) {
      set({ isJumping: true });
    }
  },
  
  slide: () => {
    const { isJumping, isSliding } = get();
    if (!isJumping && !isSliding) {
      set({ isSliding: true });
    }
  },
  
  setPlayerY: (y) => set({ playerY: y }),
  setIsJumping: (jumping) => set({ isJumping: jumping }),
  setIsSliding: (sliding) => set({ isSliding: sliding }),
  
  // Game updates
  addScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  
  addCoin: () => set((state) => ({ 
    coins: state.coins + 1,
    score: state.score + 10
  })),
  
  increaseSpeed: () => set((state) => ({ 
    speed: Math.min(MAX_SPEED, state.speed + SPEED_INCREMENT) 
  })),
  
  updateDistance: (delta) => set((state) => ({ 
    distance: state.distance + delta * state.speed 
  })),
}));
