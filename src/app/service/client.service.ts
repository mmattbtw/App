

import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LoggerService } from 'src/app/service/logger.service';
import { UserStructure } from 'src/app/util/user.structure';

@Injectable({providedIn: 'root'})
export class ClientService extends UserStructure {
	private token = '';
	private authState = new BehaviorSubject<boolean>(false);
	private isAuth = false;

	constructor(
		public localStorage: LocalStorageService,
		private logger: LoggerService
	) {
		super();
	}

	/**
	 * Set User Data onto the client. This will set the client as authenticated
	 * and appear as signed in
	 *
	 * @param data Twitch User data
	 */
	pushData(data: Partial<DataStructure.TwitchUser> | null): UserStructure {
		super.pushData(data);

		if (this.isAuth) return this;
		if (!!data?._id) {
			this.setAuthState(!!data);
			this.logger.info(`Signed in as ${data.display_name}.`);
		} else {
			this.logger.info('Signed out.');
		}

		return this;
	}

	setToken(token: string | null): void {
		this.localStorage.setItem('access_token', token ?? '');

		this.token = token ?? '';
	}
	getToken(): string {
		return this.token;
	}

	/**
	 * Change the authentication state (if true client will appear as signed in)
	 */
	private setAuthState(state: boolean): void {
		this.isAuth = state;
		this.authState.next(state);
	}
	/**
	 * Whether or not the client is connected
	 */
	isAuthenticated(): Observable<boolean> {
		return this.authState;
	}

	/**
	 * Log out the current user. This will set the client as unauthenticated
	 * and appear as signed out
	 */
	logout(): void {
		this.localStorage.removeItem('access_token');
		this.data.next(null);
	}
}
