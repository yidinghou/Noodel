import { Game } from './src/gameController.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-grid', 6, 7);
  game.init();

  document.getElementById('start-btn').addEventListener('click', () => {
    game.startGame();
  });
});

