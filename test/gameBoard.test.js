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
    it('should return all zeros for an empty board', () => {
      const counts = board.countTilesPerColumn();
      expect(counts).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('should count tiles in columns correctly', () => {
      board.setTileContent(0, 0, 'A');
      board.setTileContent(1, 0, 'B');
      board.setTileContent(0, 1, 'C');
      
      const counts = board.countTilesPerColumn();
      expect(counts).toEqual([2, 1, 0, 0, 0, 0, 0]);
    });

    it('should ignore empty tiles', () => {
      board.setTileContent(0, 2, '   ');
      board.setTileContent(1, 2, '');
      
      const counts = board.countTilesPerColumn();
      expect(counts).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('should count multiple tiles in multiple columns', () => {
      // Column 0: 3 tiles
      board.setTileContent(3, 0, 'A');
      board.setTileContent(4, 0, 'B');
      board.setTileContent(5, 0, 'C');
      
      // Column 2: 2 tiles
      board.setTileContent(4, 2, 'D');
      board.setTileContent(5, 2, 'E');
      
      // Column 6: 1 tile
      board.setTileContent(5, 6, 'F');
      
      const counts = board.countTilesPerColumn();
      expect(counts).toEqual([3, 0, 2, 0, 0, 0, 1]);
    });

    it('should handle a full column', () => {
      // Fill column 3 completely
      for (let row = 0; row < 6; row++) {
        board.setTileContent(row, 3, 'X');
      }
      
      const counts = board.countTilesPerColumn();
      expect(counts).toEqual([0, 0, 0, 6, 0, 0, 0]);
    });
  });
});
