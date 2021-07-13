import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LoggerService } from './logger.service';
import { WindowRef } from './window.service';

@Injectable({
	providedIn: 'root'
})

export class OAuthService {
	windowOpened = new Subject<Window>();
	windowClosed = new Subject<void>();

	staggeredURL = '';
	openedWindow: Window | null = null;

	constructor(
		private windowRef: WindowRef,
		private localStorage: LocalStorageService,
		private logger: LoggerService
	) { }

	// tslint:disable:no-string-literal
	/**
	 * Open an authorization popup that will ask the user
	 * to authorize our application.
	 */
	openAuthorizeWindow<T>(url?: string): Observable<T> {
		return new Observable<T>(observer => {
			// Get the native window (parent) & set the domain
			const nativeWin = this.windowRef.getNativeWindow();
			if (!nativeWin) return observer.complete();

			const listener = (ev: MessageEvent): void => {
				if (ev.data.type !== 'oauthCallback') return undefined;

				this.logger.info(`Received auth message`, ev.data);
				if (ev.data.data.error != null) {
					observer.error(Error(ev.data.data.error));
				}

				this.localStorage.setItem('access_token', ev.data?.data?.token ?? '');
				observer.next(ev.data.data);
				nativeWin.removeEventListener('message', listener);
				return undefined;
			};
			nativeWin.addEventListener('message', listener);

			// Open a new window
			const childWin = nativeWin.open(url || 'about:blank', 'DiscordOAuth2', '_blank, width=850, height=650, menubar=no, location=no');
			if (!childWin) return observer.error(Error('Please allow pop-up windows for this site to sign in'));
			this.windowOpened.next(childWin);
			this.openedWindow = childWin;
			this.stylizeWindow();

			// LocalStorage key found: accept auth
			// Window closes: reject.
			const interval = setInterval(() => {
				const pendingToken = this.localStorage.getItem('pending-access-token');
				if (!pendingToken || (!childWin || !childWin.closed)) return undefined;

				if (!childWin.closed) childWin.close();
				this.windowClosed.next();
				clearInterval(interval);

				observer.next(String(pendingToken) as any);
				this.localStorage.removeItem('pending-access-token');

				setTimeout(() => {
					observer.complete();
				}, 10);

				return undefined;
			}, 200);
		}).pipe(tap(() => {
			this.openedWindow = null;
		}));
	}
	// tslint:enable:no-string-literal

	/**
	 * Set a loading state to the current window
	 */
	stylizeWindow(): void {
		if (!this.openedWindow) return undefined;
		const doc = this.openedWindow.document;
		doc.body.style.backgroundColor = 'black';
		doc.body.style.color = 'white';
		const mainContainer = doc.createElement('div');
		mainContainer.innerText = 'You are being redirected...';
		doc.body.appendChild(mainContainer);
	}

	/**
	 * Navigate the currently opened popup to a url
	 *
	 * @param url The URL to redirect to
	 */
	navigateTo(url: string): void {
		if (!this.openedWindow) {
			this.windowOpened.pipe(first()).subscribe(win => win.location.href = url);
			return undefined;
		}

		this.openedWindow.location.href = url;
	}
}

export namespace OAuthService {
}
