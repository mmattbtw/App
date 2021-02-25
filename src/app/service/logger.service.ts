
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})

export class LoggerService {
	traceEnabled = false;

	constructor(

	) {
		this.info(`Developer console is enabled. Please report any errors`);
	}

	// tslint:disable:no-console

	trace(message: string, ...args: any): void {
		if (!this.traceEnabled) return undefined;
		console.log(`%c[TRACE] %c${message}`, 'color: darkgray;', 'color: gray;');
		if (args) console.log(...args);
	}

	debug(message: string, ...args: any): void {
		console.debug(`%c[DEBUG] %c${message}`, 'color: aqua;', 'color: gray;', ...args);
	}

	info(message: string, ...args: any): void {
		console.info(`%c[INFO] %c${message}`, 'color: lime;', 'color: white;', ...args);
	}

	warn(message: string, ...args: any): void {
		console.warn(`%c[WARN] %c${message}`, 'color: orange;', 'color: orange;', ...args);
	}

	error(message: string, ...args: any): void {
		console.error(`%c[ERROR] %c${message}`, 'color: red;', 'color: red;', ...args);
	}
}
