import { describe, it, expect } from 'vitest';
import { formatDataRegistry, getFormatData } from './index';
import championMB from './champion-m-b.json';
import { AppConfig } from '../../config/appConfig';

describe('formatDataRegistry & getFormatData', () => {
  it('should register champion-m-b by default', () => {
    expect(formatDataRegistry).toBeDefined();
    expect(formatDataRegistry['champion-m-b']).toBeDefined();
    expect(formatDataRegistry['champion-m-b']).toEqual(championMB);
  });

  it('should return correct format data when matching id is passed', () => {
    const data = getFormatData('champion-m-b');
    expect(data).toBeDefined();
    expect(data).toEqual(championMB);
  });

  it('should fallback to default format data when unknown id is passed', () => {
    const fallback = getFormatData('unknown-season');
    expect(fallback).toBeDefined();
    expect(fallback).toEqual(formatDataRegistry[AppConfig.season.currentSeason]);
  });
});
