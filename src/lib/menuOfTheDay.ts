/** Deterministic shuffle from a numeric seed (Fisher–Yates). */
export function shuffleSeeded<T>(items: T[], seed: number): T[] {
	const arr = [...items];
	let s = seed >>> 0;
	function next() {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		return s / 0xffffffff;
	}
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(next() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/** Stable daily seed from YYYY-MM-DD (UTC). */
export function seedFromDateString(yyyyMmDd: string): number {
	let h = 2166136261;
	for (let i = 0; i < yyyyMmDd.length; i++) {
		h ^= yyyyMmDd.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
