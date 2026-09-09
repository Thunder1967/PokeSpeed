import { describe, it, expect } from 'vitest';
import { searchPokemon, getAllPokemon } from './pokemonSearch';
import { PokemonSpeedData, SpeedTableData } from '../types/pokemon';

describe('searchPokemon', () => {
  const mockPokemon: PokemonSpeedData[] = [
    {
      id: 6,
      formId: 'charizard-mega-y',
      nameZh: '超級噴火龍 Y',
      nameEn: 'Charizard-Mega-Y',
      baseSpeed: 100,
      sprite: 'charizard.png',
      usageRankSingle: 15,
      usageRankDouble: 4
    },
    {
      id: 6,
      formId: 'charizard',
      nameZh: '噴火龍',
      nameEn: 'Charizard',
      baseSpeed: 100,
      sprite: 'charizard.png',
      usageRankSingle: 20,
      usageRankDouble: 12
    },
    {
      id: 987,
      formId: 'flutter-mane',
      nameZh: '振翼髮',
      nameEn: 'Flutter Mane',
      baseSpeed: 135,
      sprite: 'flutter-mane.png',
      usageRankSingle: 1,
      usageRankDouble: 2
    },
    {
      id: 10,
      formId: 'caterpie',
      nameZh: '綠毛蟲',
      nameEn: 'Caterpie',
      baseSpeed: 45,
      sprite: 'caterpie.png',
      usageRankSingle: 100,
      usageRankDouble: 100
    },
    {
      id: 428,
      formId: 'lopunny-mega',
      nameZh: '超級長耳兔',
      nameEn: 'Lopunny-Mega',
      baseSpeed: 135,
      sprite: 'lopunny.png',
      usageRankSingle: 5,
      usageRankDouble: 30
    },
    {
      id: 25,
      formId: 'pikachu',
      nameZh: '皮卡丘',
      nameEn: 'Pikachu',
      baseSpeed: 90,
      sprite: 'pikachu.png',
      usageRankSingle: 50,
      usageRankDouble: 50
    }
  ];

  it('returns empty array when query is empty or only whitespace', () => {
    expect(searchPokemon(mockPokemon, '', true)).toEqual([]);
    expect(searchPokemon(mockPokemon, '   ', false)).toEqual([]);
  });

  it('searches by Chinese name partial match', () => {
    const results = searchPokemon(mockPokemon, '噴火', true);
    expect(results.length).toBe(2);
    expect(results.map(p => p.formId)).toContain('charizard');
    expect(results.map(p => p.formId)).toContain('charizard-mega-y');
  });

  it('searches by English name case-insensitively', () => {
    const results = searchPokemon(mockPokemon, 'FLUTTER', true);
    expect(results.length).toBe(1);
    expect(results[0].formId).toBe('flutter-mane');

    const resultsLower = searchPokemon(mockPokemon, 'mane', true);
    expect(resultsLower.length).toBe(1);
    expect(resultsLower[0].formId).toBe('flutter-mane');
  });

  it('searches by exact base speed match', () => {
    const results = searchPokemon(mockPokemon, '100', true);
    expect(results.length).toBe(2);
    expect(results[0].formId).toBe('charizard-mega-y');
    expect(results[1].formId).toBe('charizard');
  });

  it('searches by prefix base speed match', () => {
    // "13" should match baseSpeed 135 (Flutter Mane & Mega Lopunny)
    const results = searchPokemon(mockPokemon, '13', true);
    expect(results.length).toBe(2);
    expect(results.every(p => p.baseSpeed === 135)).toBe(true);
  });

  it('sorts matches according to double battle usage rank when isDouble is true', () => {
    // For baseSpeed 135: Flutter Mane (double: #2) vs Mega Lopunny (double: #30)
    const results = searchPokemon(mockPokemon, '135', true);
    expect(results[0].formId).toBe('flutter-mane');
    expect(results[1].formId).toBe('lopunny-mega');
  });

  it('sorts matches according to single battle usage rank when isDouble is false', () => {
    // For baseSpeed 135: Flutter Mane (single: #1) vs Mega Lopunny (single: #5)
    // If we compare Charizard (single: #20) vs Mega Charizard Y (single: #15)
    const results = searchPokemon(mockPokemon, '100', false);
    expect(results[0].formId).toBe('charizard-mega-y'); // single rank 15
    expect(results[1].formId).toBe('charizard');        // single rank 20
  });

  it('respects the limit argument', () => {
    const results = searchPokemon(mockPokemon, 'a', true, 1);
    expect(results.length).toBe(1);
  });

  it('returns empty array when no Pokemon matches', () => {
    const results = searchPokemon(mockPokemon, '超夢XYZ999', true);
    expect(results).toEqual([]);
  });
});

describe('getAllPokemon', () => {
  it('correctly flattens speed table data from all base speed tiers', () => {
    const testTableData: SpeedTableData = {
      100: [
        {
          id: 6,
          formId: 'charizard',
          nameZh: '噴火龍',
          nameEn: 'Charizard',
          baseSpeed: 100,
          sprite: '',
          usageRankSingle: 20,
          usageRankDouble: 12
        }
      ],
      135: [
        {
          id: 987,
          formId: 'flutter-mane',
          nameZh: '振翼髮',
          nameEn: 'Flutter Mane',
          baseSpeed: 135,
          sprite: '',
          usageRankSingle: 1,
          usageRankDouble: 2
        }
      ]
    };

    const flat = getAllPokemon(testTableData);
    expect(flat.length).toBe(2);
    expect(flat.map(p => p.formId)).toContain('charizard');
    expect(flat.map(p => p.formId)).toContain('flutter-mane');
  });

  it('returns an empty array for empty table data', () => {
    expect(getAllPokemon({})).toEqual([]);
  });
});

