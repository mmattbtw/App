

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoggerService } from '../service/logger.service';
import { WindowRef } from '../service/window.service';

@Injectable()
export class CallbackGuard implements CanActivate {
	/**
	 * A Guard which is meant to handle a 301 Redirect to the /callback route
	 * from a child window
	 *
	 */
	constructor(
		private windowRef: WindowRef,
		private router: Router,
		private logger: LoggerService
	) { }

	canActivate(): boolean {
		if (!this.windowRef.getNativeWindow().opener) { // If this isn't a child window nav to home
			this.router.navigate(['/']);
			return true;
		}

		// Find params
		const params = new URLSearchParams(this.windowRef.getNativeWindow().location.search);
		this.logger.info(`Received data from redirect query`, params.get('token'));

		// Send message back to parent window
		(this.windowRef.getNativeWindow()
			.opener as Window)
			?.postMessage({
				type: 'oauthCallback',
				data: {
					token: params.get('token')
				}
			}, this.windowRef.getNativeWindow().location.origin);

		// Close this child window
		this.windowRef.getNativeWindow().close();
		return false;
	}
}
