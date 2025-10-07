import { Game } from './gameController.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('game-board', 6, 7);
  game.init();
});
