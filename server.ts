import 'zone.js/node';
import 'reflect-metadata';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import * as compression from 'compression';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { generateMetaTags } from './src/server/meta';
import { existsSync, readFile } from 'fs';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
	const server = express();
	const distFolder = join(process.cwd(), 'dist/seventv-app/browser');
	const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

	// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
	server.engine('html', ngExpressEngine({
		bootstrap: AppServerModule,
	}));

	server.set('view engine', 'html');
	server.set('views', distFolder);
	server.use(compression());

	// Example Express Rest API endpoints
	// server.get('/api/**', (req, res) => { });
	// Serve static files from /browser
	server.get('*.*', express.static(distFolder, {
		maxAge: '1y'
	}));

	generateMetaTags(server);

	// All regular routes use the Universal engine
	server.get('*', async (_, res) => {
		readFile(`${distFolder}/index.html`, (err, data) => {
			if (err) {
				return res.send(err.message);
			}

			const file = data.toString('utf8');
			return res.header('Content-Type', 'text/html; charset=utf-8').send(insertMetaTags(file, res.locals.tags ?? defaultTags));
		});

		return undefined;
	});

	const defaultTags = `
		<meta name="theme-color" content="#1976d2">
		<meta name="description"
			content="7TV is an emote service and extension for Twitch, providing custom emotes at no fee and supporting new formats such as animated wide emotes">
	`;
	return server;
}

function insertMetaTags(indexFile: string, replaceWith: string): string {
	const replaceTag = '<metalist></metalist>';
	indexFile = indexFile.replace(replaceTag, replaceWith);

	return indexFile;
}

function run(): void {
	const port = process.env.PORT || 4000;

	// Start up the Node server
	const server = app();
	server.listen(port, () => {
		console.log(`Node Express server listening on http://localhost:${port}`);
	});
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
	run();
}

export * from './src/main.server';
