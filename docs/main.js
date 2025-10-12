import { Game } from "./src/gameController.js";

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();

  const startBtn = document.getElementsByClassName('start-btn')[0];
  if (startBtn) {
    startBtn.addEventListener('click', function handleStart() {
      // Start game logic
      console.log('Game started!');
      game.startButtonAction();

      // Change button to "Reset"
      startBtn.textContent = 'Reset';
      // Remove this handler
      startBtn.removeEventListener('click', handleStart);

      // Add reset handler
      startBtn.addEventListener('click', function handleReset() {
        // Reset game logic here
        console.log('Game reset!');
        game.resetButtonAction();
      });
    });
  }
});