

import { Injectable } from '@angular/core';
import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LoggerService } from 'src/app/service/logger.service';

@Injectable({providedIn: 'root'})
export class ClientService {
	private token = '';
	private authState = new BehaviorSubject<boolean>(false);
	private data = new BehaviorSubject<DataStructure.TwitchUser | null>(null);

	constructor(
		private logger: LoggerService
	) {}

	getID(): Observable<string | null> {
		return this.data.pipe(
			map(data => !!data?._id  ? String(data._id) : null)
		);
	}

	/**
	 * Get the username of the client user
	 */
	getUsername(): Observable<string | null> {
		return this.data.pipe(
			map(data => data?.display_name ?? null)
		);
	}

	/**
	 * Get an URL to the avatar of the client user
	 */
	getAvatarURL(): Observable<string | null> {
		return this.data.pipe(
			map(data => data?.profile_image_url ?? null)
		);
	}

	/**
	 * Set User Data onto the client. This will set the client as authenticated
	 * and appear as signed in
	 *
	 * @param data Twitch User data
	 */
	pushData(data: DataStructure.TwitchUser | null): void {
		if (!!data?._id) {
			this.data.next(data);
			this.setAuthState(!!data);
			this.logger.info(`Signed in as ${data.display_name}.`);
		} else {
			this.logger.info('Signed out.');
		}
	}

	setToken(token: string | null): void {
		localStorage.setItem('access_token', token ?? '');

		this.token = token ?? '';
	}
	getToken(): string {
		return this.token;
	}

	/**
	 * Get the user's rank
	 */
	getRank(): Observable<Constants.Users.Rank> {
		return this.data.pipe(
			map(data => data?.rank ?? Constants.Users.Rank.DEFAULT)
		);
	}

	/**
	 * Change the authentication state (if true client will appear as signed in)
	 */
	private setAuthState(state: boolean): void {
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
		this.data.next(null);
	}
}
