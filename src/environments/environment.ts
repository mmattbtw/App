// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	name: 'dev',
	production: false,
	serviceWorker: true,
	origin: 'localhost:4200',
	api: {
		v1: {
			url: 'localhost:3001/v1'
		},
		v2: {
			url: 'localhost:3000/v2'
		},

		egvault: {
			url: 'c5be35bd72de.ngrok.io/v1'
		}
	},
	platformApiUrl: (version: Version): string => `http://${environment.api[version].url}`,
	cdnUrl: 'https://7tv.ams3.digitaloceanspaces.com',
	wsUrl: `ws://localhost:3001`,

	disableChangelog: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

type Version = 'v1' | 'v2' | 'egvault';
