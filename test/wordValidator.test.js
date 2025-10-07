import { describe, it, expect, beforeEach } from 'vitest';
import { WordValidator } from '../docs/src/wordValidator.js';
import { createGameBoard, GameBoard } from '../docs/src/gameBoard.js';

describe('WordValidator Letter Collection Methods', () => {
  let validator;
  let board;

  beforeEach(() => {
    // Set up DOM for jsdom
    document.body.innerHTML = '<div id="game-board"></div>';
    createGameBoard(6, 7);
    board = new GameBoard('game-board', 6, 7);
    
    validator = new WordValidator(3);
  });

  describe('getColumnLetters', () => {
    it('should collect letters from a column with content', () => {
      // Set up a column with letters
      board.setTileContent(0, 0, 'C');
      board.setTileContent(1, 0, 'A');
      board.setTileContent(2, 0, 'T');
      
      const result = validator.getColumnLetters(board, 0);
      
      expect(result.letters).toBe('CAT   '); // 3 letters + 3 spaces for empty tiles
      expect(result.positions).toHaveLength(6);
      expect(result.positions[0]).toEqual([0, 0]);
      expect(result.positions[1]).toEqual([1, 0]);
      expect(result.positions[2]).toEqual([2, 0]);
    });

    it('should handle empty column', () => {
      const result = validator.getColumnLetters(board, 0);
      
      expect(result.letters).toBe('      '); // 6 spaces for empty tiles
      expect(result.positions).toHaveLength(6);
    });
  });

  describe('getRowLetters', () => {
    it('should collect letters from a row with content', () => {
      // Set up a row with letters
      board.setTileContent(0, 0, 'D');
      board.setTileContent(0, 1, 'O');
      board.setTileContent(0, 2, 'G');
      
      const result = validator.getRowLetters(board, 0);
      
      expect(result.letters).toBe('DOG    '); // 3 letters + 4 spaces
      expect(result.positions).toHaveLength(7);
      expect(result.positions[0]).toEqual([0, 0]);
      expect(result.positions[1]).toEqual([0, 1]);
      expect(result.positions[2]).toEqual([0, 2]);
    });

    it('should handle empty row', () => {
      const result = validator.getRowLetters(board, 0);
      
      expect(result.letters).toBe('       '); // 7 spaces
      expect(result.positions).toHaveLength(7);
    });

    it('should handle mixed content and empty tiles', () => {
      board.setTileContent(3, 1, 'A');
      board.setTileContent(3, 4, 'B');
      
      const result = validator.getRowLetters(board, 3);
      
      expect(result.letters).toBe(' A  B  '); // space, A, 2 spaces, B, 2 spaces
      expect(result.positions).toHaveLength(7);
    });
  });

  describe('getDiagonalLetters', () => {
    describe('main diagonal (top-left to bottom-right)', () => {
      it('should collect letters from main diagonal starting from top-left corner', () => {
        // Set up main diagonal from (0,0)
        board.setTileContent(0, 0, 'M');
        board.setTileContent(1, 1, 'A');
        board.setTileContent(2, 2, 'I');
        board.setTileContent(3, 3, 'N');
        
        const result = validator.getDiagonalLetters(board, 0, 0, 'main');
        
        expect(result.letters).toBe('MAIN   '); // 4 letters + 3 spaces
        expect(result.positions).toHaveLength(7);
        expect(result.positions[0]).toEqual([0, 0]);
        expect(result.positions[1]).toEqual([1, 1]);
        expect(result.positions[2]).toEqual([2, 2]);
        expect(result.positions[3]).toEqual([3, 3]);
      });

      it('should find diagonal start point when called from middle', () => {
        // Set up diagonal and call from middle position
        board.setTileContent(0, 1, 'S');
        board.setTileContent(1, 2, 'U');
        board.setTileContent(2, 3, 'N');
        
        const result = validator.getDiagonalLetters(board, 1, 2, 'main');
        
        expect(result.letters).toBe('SUN    '); // Should start from (0,1)
        expect(result.positions[0]).toEqual([0, 1]);
        expect(result.positions[1]).toEqual([1, 2]);
        expect(result.positions[2]).toEqual([2, 3]);
      });

      it('should handle empty main diagonal', () => {
        const result = validator.getDiagonalLetters(board, 0, 0, 'main');
        
        expect(result.letters).toBe('       '); // All spaces
        expect(result.positions).toHaveLength(7);
      });
    });

    describe('anti diagonal (top-right to bottom-left)', () => {
      it('should collect letters from anti diagonal', () => {
        // Set up anti diagonal from (0,6) going down-left
        board.setTileContent(0, 6, 'A');
        board.setTileContent(1, 5, 'N');
        board.setTileContent(2, 4, 'T');
        board.setTileContent(3, 3, 'I');
        
        const result = validator.getDiagonalLetters(board, 0, 6, 'anti');
        
        expect(result.letters).toBe('ANTI   '); // 4 letters + 3 spaces
        expect(result.positions).toHaveLength(7);
        expect(result.positions[0]).toEqual([0, 6]);
        expect(result.positions[1]).toEqual([1, 5]);
        expect(result.positions[2]).toEqual([2, 4]);
        expect(result.positions[3]).toEqual([3, 3]);
      });

      it('should find anti diagonal start point when called from middle', () => {
        // Set up anti diagonal and call from middle
        board.setTileContent(2, 5, 'F');
        board.setTileContent(3, 4, 'U');
        board.setTileContent(4, 3, 'N');
        
        const result = validator.getDiagonalLetters(board, 3, 4, 'anti');
        
        expect(result.letters).toBe('FUN    '); // Should find correct start
        expect(result.positions[0]).toEqual([2, 5]);
        expect(result.positions[1]).toEqual([3, 4]);
        expect(result.positions[2]).toEqual([4, 3]);
      });

      it('should handle empty anti diagonal', () => {
        const result = validator.getDiagonalLetters(board, 0, 6, 'anti');
        
        expect(result.letters).toBe('       '); // All spaces
        expect(result.positions).toHaveLength(7);
      });
    });

    describe('edge cases', () => {
      it('should handle single tile diagonal', () => {
        board.setTileContent(5, 6, 'X');
        
        const result = validator.getDiagonalLetters(board, 5, 6, 'main');
        
        expect(result.letters).toBe('X');
        expect(result.positions).toHaveLength(1);
        expect(result.positions[0]).toEqual([5, 6]);
      });

      it('should handle diagonal that starts at board edge', () => {
        // Test diagonal starting from right edge
        board.setTileContent(2, 6, 'E');
        board.setTileContent(3, 5, 'D');
        board.setTileContent(4, 4, 'G');
        board.setTileContent(5, 3, 'E');
        
        const result = validator.getDiagonalLetters(board, 2, 6, 'anti');
        
        expect(result.letters).toBe('EDGE');
        expect(result.positions).toHaveLength(4);
      });

      it('should handle mixed content in diagonals', () => {
        // Set up diagonal with gaps
        board.setTileContent(0, 0, 'T');
        // Skip (1,1)
        board.setTileContent(2, 2, 'S');
        board.setTileContent(3, 3, 'T');
        
        const result = validator.getDiagonalLetters(board, 0, 0, 'main');
        
        expect(result.letters).toBe('T ST   '); // T, space, S, T, 3 spaces
        expect(result.positions[0]).toEqual([0, 0]);
        expect(result.positions[1]).toEqual([1, 1]);
        expect(result.positions[2]).toEqual([2, 2]);
        expect(result.positions[3]).toEqual([3, 3]);
      });
    });
  });

  describe('filterSpacesAndPositions', () => {
    it('should return letters and positions unchanged', () => {
      const letters = 'CAT DOG';
      const positions = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]];
      
      const result = validator.filterSpacesAndPositions(letters, positions);
      
      expect(result.letters).toBe(letters);
      expect(result.positions).toBe(positions);
    });

    it('should handle empty input', () => {
      const result = validator.filterSpacesAndPositions('', []);
      
      expect(result.letters).toBe('');
      expect(result.positions).toEqual([]);
    });

    it('should handle spaces only', () => {
      const letters = '   ';
      const positions = [[0, 0], [0, 1], [0, 2]];
      
      const result = validator.filterSpacesAndPositions(letters, positions);
      
      expect(result.letters).toBe(letters);
      expect(result.positions).toBe(positions);
    });
  });
});