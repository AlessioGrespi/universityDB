import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'universitydb-shortlist';

export interface ShortlistItem {
	slug: string;
	title: string;
	universityName: string;
	universitySlug: string;
	qualification: string;
	studyMode: string;
	addedAt: number;
}

function loadFromStorage(): ShortlistItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

const { subscribe, set, update } = writable<ShortlistItem[]>(loadFromStorage());

if (browser) {
	subscribe((items) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	});
}

export const shortlist = { subscribe };

export const shortlistCount = derived({ subscribe }, ($items) => $items.length);

export function toggleShortlist(course: Omit<ShortlistItem, 'addedAt'>) {
	update((items) => {
		const idx = items.findIndex((i) => i.slug === course.slug);
		if (idx >= 0) {
			return items.filter((_, i) => i !== idx);
		}
		return [...items, { ...course, addedAt: Date.now() }];
	});
}

export function isShortlisted(slug: string): boolean {
	let result = false;
	subscribe((items) => {
		result = items.some((i) => i.slug === slug);
	})();
	return result;
}

export function removeFromShortlist(slug: string) {
	update((items) => items.filter((i) => i.slug !== slug));
}

export function clearShortlist() {
	set([]);
}
