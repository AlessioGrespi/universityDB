import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry } from '@sentry/sveltekit';

Sentry.init({
	dsn: import.meta.env.PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
	integrations: [
		Sentry.replayIntegration({
			maskAllText: false,
			blockAllMedia: false
		})
	],
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
	enableLogs: true
});

export const handleError = handleErrorWithSentry();
