export const environment = {
	name: 'stage',
	production: true,
	serviceWorker: true,
	origin: 'stage.7tv.app',
	api: {
		v1: {
			url: `api-stage.7tv.app/v1`
		},
		v2: {
			url: 'api-stage.7tv.app/v2'
		},

		egvault: {
			url: 'egvault-stage.7tv.app/v1'
		}
	},
	platformApiUrl: (version: Version): string => `https://${environment.api[version].url}`,
	cdnUrl: 'https://7tv.ams3.digitaloceanspaces.com',
	wsUrl: 'wss://api-stage.7tv.app',

	// Set to true if the changelog should be disabled for this deployment
	disableChangelog: true
};

type Version = 'v1' | 'v2' | 'egvault';
