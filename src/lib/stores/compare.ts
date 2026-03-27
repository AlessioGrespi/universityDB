import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'universitydb-compare';
const MAX_COMPARE = 4;

function loadFromStorage(): string[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

const { subscribe, set, update } = writable<string[]>(loadFromStorage());

if (browser) {
	subscribe((slugs) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
	});
}

export const compareList = { subscribe };

export const compareCount = derived({ subscribe }, ($slugs) => $slugs.length);

export function addToCompare(slug: string): boolean {
	let added = false;
	update((slugs) => {
		if (slugs.includes(slug)) return slugs;
		if (slugs.length >= MAX_COMPARE) return slugs;
		added = true;
		return [...slugs, slug];
	});
	return added;
}

export function removeFromCompare(slug: string) {
	update((slugs) => slugs.filter((s) => s !== slug));
}

export function toggleCompare(slug: string): boolean {
	let isNowIn = false;
	update((slugs) => {
		if (slugs.includes(slug)) {
			return slugs.filter((s) => s !== slug);
		}
		if (slugs.length >= MAX_COMPARE) return slugs;
		isNowIn = true;
		return [...slugs, slug];
	});
	return isNowIn;
}

export function isInCompare(slug: string): boolean {
	let result = false;
	subscribe((slugs) => {
		result = slugs.includes(slug);
	})();
	return result;
}

export function clearCompare() {
	set([]);
}
