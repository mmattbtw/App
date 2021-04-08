import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
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
		private cookieService: CookieService
	) { }

	canActivate(route: ActivatedRouteSnapshot): boolean {
		const win = this.windowRef.getNativeWindow();

		(win
			?.opener as Window)
			?.postMessage({
				type: 'oauthCallback',
				data: {
					token: route.queryParamMap.get('token')
						?? this.cookieService.get('auth')
				}
			}, win?.location.origin ?? '');
		this.localStorage.setItem('pending-access-token', route.queryParamMap.get('token') as string);
		win?.close();
		return true;
	}
}
