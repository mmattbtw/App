import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { LocalStorageService } from 'src/app/service/localstorage.service';
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
		private localStorage: LocalStorageService,
		@Inject(PLATFORM_ID) private platformId: any,
		private logger: LoggerService
	) { }

	canActivate(route: ActivatedRouteSnapshot): boolean {
		const win = this.windowRef.getNativeWindow();

		// Find params
		this.logger.info(`Received data from redirect query`, route.queryParamMap.get('token'));

		// Set to pending access token. The main window is waiting for this value

		(win
			?.opener as Window)
			?.postMessage({
				type: 'oauthCallback',
				data: {
					token: route.queryParamMap.get('token')
				}
			}, win?.location.origin ?? '');
		this.localStorage.setItem('pending-access-token', route.queryParamMap.get('token') as string);
		win?.close();
		return true;
	}
}
