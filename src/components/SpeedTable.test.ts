import { describe, it, expect, beforeEach } from 'vitest';
import { renderSpeedTable } from './SpeedTable';
import { SpeedTableData } from '../types/pokemon';

describe('SpeedTable Component', () => {
  let container: HTMLDivElement;
  const mockData: SpeedTableData = {
    100: [
      {
        id: 1,
        formId: 'test',
        nameZh: '測試',
        nameEn: 'test',
        baseSpeed: 100,
        sprite: 'test.png',
        usageRankSingle: 1,
        usageRankDouble: 1
      }
    ]
  };

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders the core 4 sections structure', () => {
    renderSpeedTable(container, mockData, 'single');

    const table = container.querySelector('.speed-table-container');
    expect(table).toBeTruthy();

    const row = container.querySelector('.speed-table-row');
    expect(row).toBeTruthy();

    // Check for 4 sections
    expect(row?.querySelector('.col-base')).toBeTruthy();
    expect(row?.querySelector('.col-sprites-container')).toBeTruthy();
    expect(row?.querySelector('.col-dynamic')).toBeTruthy();
    expect(row?.querySelector('.col-benchmarks-container')).toBeTruthy();
  });

  it('renders 8 benchmark columns', () => {
    renderSpeedTable(container, mockData, 'single');
    const benchmarks = container.querySelectorAll('.speed-table-row:not(.header) .benchmark-cell');
    expect(benchmarks.length).toBe(8);
  });

  it('renders speed watershed pin divider', () => {
    renderSpeedTable(container, mockData, 'single');
    const divider = container.querySelector('.speed-pin-divider');
    expect(divider).toBeTruthy();
    expect(divider?.querySelector('.pin-badge')).toBeTruthy();
    expect(divider?.querySelector('.pin-tooltip')).toBeTruthy();
  });
});
