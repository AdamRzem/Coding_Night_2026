import { describe, expect, it } from 'vitest';
import { seedFromDateString, shuffleSeeded } from './menuOfTheDay';

describe('seedFromDateString', () => {
	it('returns the same seed for the same date string', () => {
		const a = seedFromDateString('2026-03-31');
		const b = seedFromDateString('2026-03-31');
		expect(a).toBe(b);
	});

	it('returns different seeds for different date strings', () => {
		const a = seedFromDateString('2026-03-31');
		const b = seedFromDateString('2026-04-01');
		expect(a).not.toBe(b);
	});
});

describe('shuffleSeeded', () => {
	it('is deterministic with the same seed', () => {
		const items = ['a', 'b', 'c', 'd', 'e'];
		const seed = 12345;

		expect(shuffleSeeded(items, seed)).toEqual(shuffleSeeded(items, seed));
	});

	it('keeps all original elements', () => {
		const items = [1, 2, 3, 4, 5, 6];
		const result = shuffleSeeded(items, 999);

		expect(result).toHaveLength(items.length);
		expect([...result].sort((a, b) => a - b)).toEqual([...items].sort((a, b) => a - b));
	});
});
