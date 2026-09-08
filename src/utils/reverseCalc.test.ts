import { describe, it, expect } from 'vitest';
import { calcRequiredEvsLv50 } from './reverseCalc';

describe('reverseCalc', () => {
  it('finds neutral nature 0 EVs if target is low', () => {
    const result = calcRequiredEvsLv50(100, 100);
    expect(result.possible).toBe(true);
    expect(result.evsNeeded).toBe(0);
    expect(result.natureNeeded).toBe(1.0);
  });

  it('finds neutral nature with some EVs', () => {
    // 100 base speed, neutral, 0 EVs -> 120
    // 100 base speed, neutral, 32 EVs -> 152
    const result = calcRequiredEvsLv50(100, 152);
    expect(result.possible).toBe(true);
    expect(result.evsNeeded).toBe(32);
    expect(result.natureNeeded).toBe(1.0);
  });

  it('finds positive nature when neutral is not enough', () => {
    // 100 base speed, neutral, 32 EVs -> 152
    // 100 base speed, positive, 32 EVs -> 167
    const result = calcRequiredEvsLv50(100, 160);
    expect(result.possible).toBe(true);
    // Needs positive nature. Let's see how many EVs
    // At 100 base, positive, to reach 160.
    expect(result.natureNeeded).toBe(1.1);
  });

  it('returns impossible if target is too high', () => {
    const result = calcRequiredEvsLv50(100, 200);
    expect(result.possible).toBe(false);
  });
});
