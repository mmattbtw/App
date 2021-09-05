export const environment = {
	name: 'production',
	production: true,
	serviceWorker: true,
	origin: '7tv.app',
	api: {
		v1: {
			url: `api.7tv.app/v1`
		},
		v2: {
			url: 'api.7tv.app/v2'
		},

		egvault: {
			url: 'egvault.7tv.app/v1'
		}
	},
	platformApiUrl: (version: Version): string => `https://${environment.api[version].url}`,
	cdnUrl: 'https://cdn.7tv.app',
	wsUrl: 'wss://api.7tv.app',

	// Set to true if the changelog should be disabled for this deployment
	disableChangelog: true
};

type Version = 'v1' | 'v2' | 'egvault';
