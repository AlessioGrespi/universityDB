import { sentryHandle, handleErrorWithSentry } from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = sequence(sentryHandle());
export const handleError = handleErrorWithSentry();
