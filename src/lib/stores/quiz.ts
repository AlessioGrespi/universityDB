import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { QuizAnswers, QuizPriority, QuizScheme, QuizStudyMode } from '$lib/types';

const STORAGE_KEY = 'universitydb-quiz';
const TOTAL_STEPS = 6; // Was 7 — email step disabled

function defaultAnswers(): QuizAnswers {
	return {
		scheme: null,
		subjectClusters: [],
		ucasPoints: null,
		degreeClass: null,
		priorities: [],
		regions: [],
		studyMode: null,
		email: null
	};
}

interface QuizState {
	currentStep: number;
	answers: QuizAnswers;
}

function loadFromStorage(): QuizState {
	if (!browser) return { currentStep: 1, answers: defaultAnswers() };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				currentStep: parsed.currentStep ?? 1,
				answers: { ...defaultAnswers(), ...parsed.answers }
			};
		}
	} catch {
		// ignore
	}
	return { currentStep: 1, answers: defaultAnswers() };
}

const { subscribe, set, update } = writable<QuizState>(loadFromStorage());

if (browser) {
	subscribe((state) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	});
}

export const quiz = { subscribe };

export const quizStep = derived({ subscribe }, ($state) => $state.currentStep);
export const quizAnswers = derived({ subscribe }, ($state) => $state.answers);
export const quizProgress = derived({ subscribe }, ($state) => $state.currentStep / TOTAL_STEPS);
export const totalSteps = TOTAL_STEPS;

export function setScheme(scheme: QuizScheme) {
	update((s) => ({ ...s, answers: { ...s.answers, scheme } }));
}

export function setSubjectClusters(clusters: string[]) {
	update((s) => ({ ...s, answers: { ...s.answers, subjectClusters: clusters } }));
}

export function setUcasPoints(points: number | null) {
	update((s) => ({ ...s, answers: { ...s.answers, ucasPoints: points } }));
}

export function setDegreeClass(degreeClass: string | null) {
	update((s) => ({ ...s, answers: { ...s.answers, degreeClass } }));
}

export function setPriorities(priorities: QuizPriority[]) {
	update((s) => ({ ...s, answers: { ...s.answers, priorities: priorities.slice(0, 3) } }));
}

export function setRegions(regions: string[]) {
	update((s) => ({ ...s, answers: { ...s.answers, regions } }));
}

export function setStudyMode(mode: QuizStudyMode) {
	update((s) => ({ ...s, answers: { ...s.answers, studyMode: mode } }));
}

export function setEmail(email: string | null) {
	update((s) => ({ ...s, answers: { ...s.answers, email } }));
}

export function goToStep(step: number) {
	update((s) => ({ ...s, currentStep: Math.max(1, Math.min(TOTAL_STEPS, step)) }));
}

export function nextStep() {
	update((s) => ({ ...s, currentStep: Math.min(TOTAL_STEPS, s.currentStep + 1) }));
}

export function prevStep() {
	update((s) => ({ ...s, currentStep: Math.max(1, s.currentStep - 1) }));
}

export function resetQuiz() {
	set({ currentStep: 1, answers: defaultAnswers() });
}

/** Serialize answers to URL search params for the results page */
export function answersToParams(answers: QuizAnswers): string {
	const params = new URLSearchParams();
	if (answers.scheme) params.set('scheme', answers.scheme);
	if (answers.subjectClusters.length) params.set('subjects', answers.subjectClusters.join(','));
	if (answers.ucasPoints !== null) params.set('ucas', String(answers.ucasPoints));
	if (answers.degreeClass) params.set('degree', answers.degreeClass);
	if (answers.priorities.length) params.set('priorities', answers.priorities.join(','));
	if (answers.regions.length) params.set('regions', answers.regions.join(','));
	if (answers.studyMode) params.set('mode', answers.studyMode);
	if (answers.email) params.set('email', answers.email);
	return params.toString();
}

/** Deserialize URL search params back to quiz answers */
export function paramsToAnswers(params: URLSearchParams): QuizAnswers {
	return {
		scheme: (params.get('scheme') as QuizScheme) ?? null,
		subjectClusters: params.get('subjects')?.split(',').filter(Boolean) ?? [],
		ucasPoints: params.has('ucas') ? Number(params.get('ucas')) : null,
		degreeClass: params.get('degree') ?? null,
		priorities: (params.get('priorities')?.split(',').filter(Boolean) as QuizPriority[]) ?? [],
		regions: params.get('regions')?.split(',').filter(Boolean) ?? [],
		studyMode: (params.get('mode') as QuizStudyMode) ?? null,
		email: params.get('email') ?? null
	};
}
