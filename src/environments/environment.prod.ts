export const environment = {
	name: 'production',
	production: true,
	serviceWorker: true,
	origin: '7tv.app',
	apiUrl: 'api.7tv.app',
	platformApiUrl: (platform: 'browser' | 'server') => `${platform === 'server' ? 'http' : 'https'}://${environment.apiUrl}`,
	cdnUrl: 'https://cdn.7tv.app',
	wsUrl: 'wss://api.7tv.app'
};
