export const environment = {
	name: 'stage',
	production: true,
	serviceWorker: true,
	origin: '7tv.dev',
	api: {
		v1: {
			url: `api.7tv.dev/v1`
		},
		v2: {
			url: 'api.7tv.dev/v2'
		},

		egvault: {
			url: 'egvault.7tv.dev/v1'
		}
	},
	platformApiUrl: (version: Version): string => `https://${environment.api[version].url}`,
	cdnUrl: 'https://7tv.ams3.digitaloceanspaces.com',
	wsUrl: 'wss://api.7tv.dev',

	// Set to true if the changelog should be disabled for this deployment
	disableChangelog: true
};

type Version = 'v1' | 'v2' | 'egvault';
