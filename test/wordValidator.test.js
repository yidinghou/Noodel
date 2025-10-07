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
    it('should collect letters and positions from column 0 with "CAT" pattern', () => {
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

    it('should return all spaces and correct positions for empty column', () => {
      const result = validator.getColumnLetters(board, 0);

      expect(result.letters).toBe('      '); // 6 spaces for empty tiles
      expect(result.positions).toHaveLength(6);
    });
  });

  describe('getRowLetters', () => {
    it('should collect letters and positions from row 0 with "DOG" pattern', () => {
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
    describe('topToBottom diagonal (top-left to bottom-right)', () => {
      it('should collect letters from topToBottom diagonal starting from top-left corner', () => {
        // Set up main diagonal from (0,0)
        board.setTileContent(0, 0, 'M');
        board.setTileContent(1, 1, 'A');
        board.setTileContent(2, 2, 'I');
        board.setTileContent(3, 3, 'N');

        const result = validator.getDiagonalLetters(board, 0, 0, 'topToBottom');

        expect(result.letters).toBe('MAIN  '); // 4  letters + 2 spaces
        expect(result.positions).toHaveLength(6);
        expect(result.positions[0]).toEqual([0, 0]);
        expect(result.positions[1]).toEqual([1, 1]);
        expect(result.positions[2]).toEqual([2, 2]);
        expect(result.positions[3]).toEqual([3, 3]);
      });

      it('should return consistent results when called from different points on same diagonal', () => {
        // Set up diagonal: (0,1) 'S', (1,2) 'U', (2,3) 'N'
        board.setTileContent(0, 1, 'S');
        board.setTileContent(1, 2, 'U');
        board.setTileContent(2, 3, 'N');

        const result = validator.getDiagonalLetters(board, 1, 2, 'topToBottom');
        const result2 = validator.getDiagonalLetters(board, 2, 3, 'topToBottom');

        expect(result.letters).toBe(result2.letters);
        expect(result.positions).toEqual(result2.positions);
      });

      it('should handle empty topToBottom diagonal', () => {
        const result = validator.getDiagonalLetters(board, 0, 0, 'topToBottom');

        expect(result.letters).toBe('      '); // All spaces
        expect(result.positions).toHaveLength(6);
      });
    });

    describe('bottomToTop diagonal (bottom-left to top-right)', () => {
      it('should collect letters from bottomToTop diagonal with "ANTI" pattern', () => {
        // Set up anti diagonal from (0,6) going down-left
        board.setTileContent(3, 3, 'A');
        board.setTileContent(2, 4, 'N');
        board.setTileContent(1, 5, 'T');
        board.setTileContent(0, 6, 'I');

        const result = validator.getDiagonalLetters(board, 0, 6, 'bottomToTop');

        expect(result.letters).toBe('  ANTI'); // 4 letters + 3 spaces
        expect(result.positions).toHaveLength(6);
        expect(result.positions[0]).toEqual([5, 1]);
        expect(result.positions[1]).toEqual([4, 2]);
        expect(result.positions[2]).toEqual([3, 3]);
        expect(result.positions[3]).toEqual([2, 4]);
        expect(result.positions[4]).toEqual([1, 5]);
        expect(result.positions[5]).toEqual([0, 6]);
      });

      it('should find bottomToTop diagonal regardless of which positions are called', () => {
        // Set up anti diagonal and call from middle
        board.setTileContent(4, 3, 'F');
        board.setTileContent(3, 4, 'U');
        board.setTileContent(2, 5, 'N');

        const result = validator.getDiagonalLetters(board, 3, 4, 'bottomToTop');
        const result2 = validator.getDiagonalLetters(board, 5, 2, 'bottomToTop');

        expect(result.letters).toBe(result2.letters);
        expect(result.positions).toEqual(result2.positions);

        expect(result.letters).toBe(' FUN '); 
        expect(result.positions[0]).toEqual([5, 2]);
        expect(result.positions[1]).toEqual([4, 3]);
        expect(result.positions[2]).toEqual([3, 4]);
        expect(result.positions[3]).toEqual([2, 5]);
        expect(result.positions[4]).toEqual([1, 6]);
      });

      it('should handle empty bottomToTop diagonal', () => {
        const result = validator.getDiagonalLetters(board, 0, 6, 'bottomToTop');

        expect(result.letters).toBe('      '); // All spaces
        expect(result.positions).toHaveLength(6);
      });
    });

    describe('edge cases', () => {
      it('should handle diagonal with only one tile', () => {
        board.setTileContent(5, 6, 'X');

        const result = validator.getDiagonalLetters(board, 5, 6, 'bottomToTop');

        expect(result.letters).toBe('X');
        expect(result.positions).toHaveLength(1);
        expect(result.positions[0]).toEqual([5, 6]);
      });

      it('should collect letters from diagonal starting at board edge', () => {
        // Test diagonal starting from right edge
        board.setTileContent(2, 6, 'E');
        board.setTileContent(4, 4, 'D');
        board.setTileContent(3, 5, 'G');
        board.setTileContent(5, 3, 'E');

        const result = validator.getDiagonalLetters(board, 2, 6, 'bottomToTop');

        expect(result.letters).toBe('EDGE');
        expect(result.positions).toHaveLength(4);
      });

      it('should handle mixed content in diagonals', () => {
        // Set up diagonal with gaps
        board.setTileContent(0, 0, 'T');
        // Skip (1,1)
        board.setTileContent(2, 2, 'S');
        board.setTileContent(3, 3, 'T');

        const result = validator.getDiagonalLetters(board, 0, 0, 'topToBottom');

        expect(result.letters).toBe('T ST  '); // T, space, S, T, 3 spaces
        expect(result.positions[0]).toEqual([0, 0]);
        expect(result.positions[1]).toEqual([1, 1]);
        expect(result.positions[2]).toEqual([2, 2]);
        expect(result.positions[3]).toEqual([3, 3]);
      });
    });
  });

  describe('extractContinuousSegments', () => {
    it('should extract single continuous segment without trailing spaces', () => {
      const letters = 'HAT  ';
      const positions = [[0,0], [0,1], [0,2], [0,3], [0,4]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('HAT');
      expect(result[0].positions).toEqual([[0,0], [0,1], [0,2]]);
    });

    it('should extract multiple segments separated by single space', () => {
      const letters = 'HAT CAT';
      const positions = [[0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(2);
      expect(result[0].letters).toBe('HAT');
      expect(result[0].positions).toEqual([[0,0], [0,1], [0,2]]);
      expect(result[1].letters).toBe('CAT');
      expect(result[1].positions).toEqual([[0,4], [0,5], [0,6]]);
    });

    it('should extract segments separated by multiple spaces', () => {
      const letters = 'HAT   CAT';
      const positions = [[0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6], [0,7], [0,8]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(2);
      expect(result[0].letters).toBe('HAT');
      expect(result[0].positions).toEqual([[0,0], [0,1], [0,2]]);
      expect(result[1].letters).toBe('CAT');
      expect(result[1].positions).toEqual([[0,6], [0,7], [0,8]]);
    });

    it('should handle leading spaces', () => {
      const letters = '  CAT';
      const positions = [[1,0], [1,1], [1,2], [1,3], [1,4]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('CAT');
      expect(result[0].positions).toEqual([[1,2], [1,3], [1,4]]);
    });

    it('should handle single letter segments', () => {
      const letters = 'A B C';
      const positions = [[2,0], [2,1], [2,2], [2,3], [2,4]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(3);
      expect(result[0].letters).toBe('A');
      expect(result[0].positions).toEqual([[2,0]]);
      expect(result[1].letters).toBe('B');
      expect(result[1].positions).toEqual([[2,2]]);
      expect(result[2].letters).toBe('C');
      expect(result[2].positions).toEqual([[2,4]]);
    });

    it('should handle mixed length segments', () => {
      const letters = 'A  DOG   X';
      const positions = [[3,0], [3,1], [3,2], [3,3], [3,4], [3,5], [3,6], [3,7], [3,8], [3,9]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(3);
      expect(result[0].letters).toBe('A');
      expect(result[0].positions).toEqual([[3,0]]);
      expect(result[1].letters).toBe('DOG');
      expect(result[1].positions).toEqual([[3,3], [3,4], [3,5]]);
      expect(result[2].letters).toBe('X');
      expect(result[2].positions).toEqual([[3,9]]);
    });

    it('should return empty array for string with only spaces', () => {
      const letters = '     ';
      const positions = [[4,0], [4,1], [4,2], [4,3], [4,4]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(0);
    });

    it('should handle empty string', () => {
      const letters = '';
      const positions = [];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(0);
    });

    it('should handle string with no spaces', () => {
      const letters = 'HELLO';
      const positions = [[0,0], [0,1], [0,2], [0,3], [0,4]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('HELLO');
      expect(result[0].positions).toEqual([[0,0], [0,1], [0,2], [0,3], [0,4]]);
    });

    it('should preserve position coordinates correctly', () => {
      const letters = 'AB  CD';
      const positions = [[5,2], [5,3], [5,4], [5,5], [5,6], [5,7]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(2);
      expect(result[0].letters).toBe('AB');
      expect(result[0].positions).toEqual([[5,2], [5,3]]);
      expect(result[1].letters).toBe('CD');
      expect(result[1].positions).toEqual([[5,6], [5,7]]);
    });

    it('should handle complex diagonal positions', () => {
      const letters = 'CAT DOG';
      const positions = [[0,0], [1,1], [2,2], [3,3], [4,4], [5,5], [6,6]];
      
      const result = validator.extractContinuousSegments(letters, positions);
      
      expect(result).toHaveLength(2);
      expect(result[0].letters).toBe('CAT');
      expect(result[0].positions).toEqual([[0,0], [1,1], [2,2]]);
      expect(result[1].letters).toBe('DOG');
      expect(result[1].positions).toEqual([[4,4], [5,5], [6,6]]);
    });
  });
});
