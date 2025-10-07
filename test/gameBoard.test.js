import { describe, it, expect, beforeEach } from 'vitest';
import { createGameBoard, GameBoard } from '../docs/src/gameBoard.js';

describe('GameBoard', () => {
  let board;

  beforeEach(() => {
    // Set up DOM for jsdom
    document.body.innerHTML = '<div id="game-board"></div>';
    createGameBoard(6, 7);
    board = new GameBoard('game-board', 6, 7);
  });

  describe('countTilesPerColumn', () => {
    it('should return 0 for an empty column', () => {
      const count = board.countTilesPerColumn(0);
      expect(count).toBe(0);
    });

    it('should count tiles in a specific column correctly', () => {
      board.setTileContent(0, 0, 'A');
      board.setTileContent(1, 0, 'B');
      board.setTileContent(0, 1, 'C');
      
      expect(board.countTilesPerColumn(0)).toBe(2);
      expect(board.countTilesPerColumn(1)).toBe(1);
      expect(board.countTilesPerColumn(2)).toBe(0);
    });

    it('should ignore empty tiles', () => {
      board.setTileContent(0, 2, '   ');
      board.setTileContent(1, 2, '');
      
      const count = board.countTilesPerColumn(2);
      expect(count).toBe(0);
    });

    it('should count multiple tiles in a column', () => {
      // Column 0: 3 tiles
      board.setTileContent(3, 0, 'A');
      board.setTileContent(4, 0, 'B');
      board.setTileContent(5, 0, 'C');
      
      expect(board.countTilesPerColumn(0)).toBe(3);
    });

    it('should handle a full column', () => {
      // Fill column 3 completely
      for (let row = 0; row < 6; row++) {
        board.setTileContent(row, 3, 'X');
      }
      
      expect(board.countTilesPerColumn(3)).toBe(6);
    });

    it('should count tiles independently for each column', () => {
      // Column 2: 2 tiles
      board.setTileContent(4, 2, 'D');
      board.setTileContent(5, 2, 'E');
      
      // Column 6: 1 tile
      board.setTileContent(5, 6, 'F');
      
      expect(board.countTilesPerColumn(2)).toBe(2);
      expect(board.countTilesPerColumn(6)).toBe(1);
      expect(board.countTilesPerColumn(4)).toBe(0);
    });
  });
});
