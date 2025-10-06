import { createGameBoard } from './gameBoard.js';
import { GameState } from './gameBoard.js';

document.addEventListener('DOMContentLoaded', () => {
    createGameBoard();   
    const gameState = new GameState('game-board', 6, 7);
    gameState.setTileContent(2, 3, 'A');

    const gameBoardElement = document.getElementById('game-board');

    if (gameBoardElement) {
        gameBoardElement.addEventListener('click', (event) => {
            const tile = event.target.closest('.tile'); // Assumes your tiles have a 'tile' class
            if (tile) {
                const row = parseInt(tile.dataset.row, 10);
                const col = parseInt(tile.dataset.col, 10);

                // Example: Update the clicked tile with a new letter
                const newLetter = 'B'; // Replace with your logic to get a new letter
                gameState.setTileContent(row, col, newLetter);
                console.log(`Clicked on tile at row: ${row}, col: ${col}`);
            }
        });
    }
});