import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useGameControls() {
  const { 
    gameState, 
    startGame, 
    pauseGame, 
    resumeGame, 
    resetGame,
    moveLeft, 
    moveRight, 
    jump, 
    slide 
  } = useGameStore();
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  
  // Keyboard controls - AZERTY (ZQSD) and QWERTY (WASD) support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys
      if (['z', 'q', 's', 'd', 'w', 'a', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      
      // Start game from menu
      if (gameState === 'menu' && (e.key === ' ' || e.key === 'Enter')) {
        startGame();
        return;
      }
      
      // Pause/Resume
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          resumeGame();
        }
        return;
      }
      
      // Restart on game over
      if (gameState === 'gameOver' && (e.key === ' ' || e.key === 'Enter')) {
        resetGame();
        startGame();
        return;
      }
      
      // Game controls only when playing
      if (gameState !== 'playing') return;
      
      const key = e.key.toLowerCase();
      
      // Left movement: Q (AZERTY) or A (QWERTY) or ArrowLeft
      if (key === 'q' || key === 'a' || key === 'arrowleft') {
        moveLeft();
      }
      
      // Right movement: D (both) or ArrowRight
      if (key === 'd' || key === 'arrowright') {
        moveRight();
      }
      
      // Jump: Z (AZERTY) or W (QWERTY) or ArrowUp or Space
      if (key === 'z' || key === 'w' || key === 'arrowup' || key === ' ') {
        jump();
      }
      
      // Slide/Duck: S (both) or ArrowDown
      if (key === 's' || key === 'arrowdown') {
        slide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame, pauseGame, resumeGame, resetGame, moveLeft, moveRight, jump, slide]);
  
  // Touch/Swipe controls for mobile
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
  }, []);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;
    const deltaTime = Date.now() - (touchStartTime.current || 0);
    
    // Minimum swipe distance
    const minSwipeDistance = 50;
    
    // Start game from menu on tap
    if (gameState === 'menu' && Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      startGame();
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    
    // Restart on game over on tap
    if (gameState === 'gameOver' && Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      resetGame();
      startGame();
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    
    // Pause/Resume on double tap or long press
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance && deltaTime > 500) {
      if (gameState === 'playing') {
        pauseGame();
      } else if (gameState === 'paused') {
        resumeGame();
      }
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    
    // Game controls only when playing
    if (gameState !== 'playing') {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    
    // Horizontal swipe (left/right)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        moveRight();
      } else {
        moveLeft();
      }
    }
    
    // Vertical swipe (up/down)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY < 0) {
        // Swipe up = jump
        jump();
      } else {
        // Swipe down = slide
        slide();
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  }, [gameState, startGame, pauseGame, resumeGame, resetGame, moveLeft, moveRight, jump, slide]);
  
  useEffect(() => {
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
  
  // Return control info for UI
  return {
    isPlaying: gameState === 'playing',
    isPaused: gameState === 'paused',
    isGameOver: gameState === 'gameOver',
    isMenu: gameState === 'menu',
  };
}
