import { describe, it, expect } from 'vitest';
import { toSmogonRegCode, parseSmogonTable, getSmogonFormatFileName } from './smogon-stats';
import { AppConfig } from '../../src/config/appConfig';

describe('smogon-stats utility functions', () => {
  describe('getSmogonFormatFileName', () => {
    it('builds standard doubles filename using AppConfig defaults', () => {
      const fileName = getSmogonFormatFileName(
        AppConfig.smogon.defaultDoublesPrefix,
        toSmogonRegCode('m-b'),
        AppConfig.smogon.defaultCutoff
      );
      expect(fileName).toBe('gen9championsvgc2026regmb-1500.txt');
    });

    it('builds custom year or format prefix and cutoff correctly', () => {
      const fileName = getSmogonFormatFileName('gen9championsvgc2027', 'regmc', 1760);
      expect(fileName).toBe('gen9championsvgc2027regmc-1760.txt');
    });
  });

  describe('toSmogonRegCode', () => {
    it('correctly converts m-a to regma', () => {
      expect(toSmogonRegCode('m-a')).toBe('regma');
      expect(toSmogonRegCode('champion-m-a')).toBe('regma');
    });

    it('correctly converts m-b to regmb', () => {
      expect(toSmogonRegCode('m-b')).toBe('regmb');
      expect(toSmogonRegCode('champion-m-b')).toBe('regmb');
    });

    it('correctly converts m-c to regmc', () => {
      expect(toSmogonRegCode('m-c')).toBe('regmc');
      expect(toSmogonRegCode('champion-m-c')).toBe('regmc');
    });

    it('preserves codes that already start with reg', () => {
      expect(toSmogonRegCode('regmc')).toBe('regmc');
      expect(toSmogonRegCode('regmd')).toBe('regmd');
    });
  });

  describe('parseSmogonTable', () => {
    it('parses formatted Smogon usage lines', () => {
      const table = `
 + ---- + ------------------ + --------- +
 | Rank | Pokemon            | Usage %   |
 + ---- + ------------------ + --------- +
 | 1    | Kingambit          | 32.510%   |
 | 2    | Flutter Mane       | 28.120%   |
 + ---- + ------------------ + --------- +
      `;
      const map = parseSmogonTable(table);
      expect(map.size).toBe(2);
      expect(map.get('kingambit')).toEqual({
        rank: 1,
        pokemon: 'Kingambit',
        usagePercent: 32.51,
      });
      expect(map.get('fluttermane')).toEqual({
        rank: 2,
        pokemon: 'Flutter Mane',
        usagePercent: 28.12,
      });
    });
  });
});
