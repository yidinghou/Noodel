import { describe, it, expect, beforeEach } from 'vitest';
import { WordValidator } from '../../docs/src/wordValidator.js';

describe('WordValidator - Segment Extraction', () => {
  let validator;

  beforeEach(() => {
    validator = new WordValidator(3);
  });

  describe('extractContinuousSegments', () => {
    it('should extract single continuous segment without trailing spaces', () => {
      const letters = 'HAT  ';
      const positions = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ];

      const result = validator.extractContinuousSegments(letters, positions);

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('HAT');
      expect(result[0].positions).toEqual([
        [0, 0],
        [0, 1],
        [0, 2],
      ]);
    });

    it('should extract multiple segments separated by single space', () => {
      const letters = 'HAT CAT';
      const positions = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
      ];

      const result = validator.extractContinuousSegments(letters, positions);

      expect(result).toHaveLength(2);
      expect(result[0].letters).toBe('HAT');
      expect(result[0].positions).toEqual([
        [0, 0],
        [0, 1],
        [0, 2],
      ]);
      expect(result[1].letters).toBe('CAT');
      expect(result[1].positions).toEqual([
        [0, 4],
        [0, 5],
        [0, 6],
      ]);
    });

    it('should extract segments separated by multiple spaces', () => {
      const letters = 'HAT   CAT';
      const positions = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [0, 7],
        [0, 8],
      ];

      const result = validator.extractContinuousSegments(letters, positions);

      expect(result).toHaveLength(2);
      expect(result[0].letters).toBe('HAT');
      expect(result[0].positions).toEqual([
        [0, 0],
        [0, 1],
        [0, 2],
      ]);
      expect(result[1].letters).toBe('CAT');
      expect(result[1].positions).toEqual([
        [0, 6],
        [0, 7],
        [0, 8],
      ]);
    });

    it('should handle leading spaces', () => {
      const letters = '  CAT';
      const positions = [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
      ];

      const result = validator.extractContinuousSegments(letters, positions);

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('CAT');
      expect(result[0].positions).toEqual([
        [1, 2],
        [1, 3],
        [1, 4],
      ]);
    });

    it('should handle single letter segments', () => {
      const letters = 'A B C';
      const positions = [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
      ];

      const result = validator.extractContinuousSegments(letters, positions);

      expect(result).toHaveLength(3);
      expect(result[0].letters).toBe('A');
      expect(result[0].positions).toEqual([[2, 0]]);
      expect(result[1].letters).toBe('B');
      expect(result[1].positions).toEqual([[2, 2]]);
      expect(result[2].letters).toBe('C');
      expect(result[2].positions).toEqual([[2, 4]]);
    });

    it('should handle mixed length segments', () => {
      const letters = 'A  DOG   X';
      const positions = [
        [3, 0],
        [3, 1],
        [3, 2],
        [3, 3],
        [3, 4],
        [3, 5],
        [3, 6],
        [3, 7],
        [3, 8],
        [3, 9],
      ];

      const result = validator.extractContinuousSegments(letters, positions);

      expect(result).toHaveLength(3);
      expect(result[0].letters).toBe('A');
      expect(result[0].positions).toEqual([[3, 0]]);
      expect(result[1].letters).toBe('DOG');
      expect(result[1].positions).toEqual([
        [3, 3],
        [3, 4],
        [3, 5],
      ]);
      expect(result[2].letters).toBe('X');
      expect(result[2].positions).toEqual([[3, 9]]);
    });

    it('should return empty array for string with only spaces', () => {
      const letters = '     ';
      const positions = [
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
      ];

      const result = validator.extractContinuousSegments(letters, positions);

      expect(result).toHaveLength(0);
    });

    it('should handle empty string', () => {
      const letters = '';
      const positions = [];

      const result = validator.extractContinuousSegments(letters, positions);

      expect(result).toHaveLength(0);
    });
  });
});
