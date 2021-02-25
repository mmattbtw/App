

import { Injectable } from '@angular/core';
import { API } from '@typings/API';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggerService } from 'src/app/service/logger.service';

@Injectable({providedIn: 'root'})
export class ClientService {
	private authState = new BehaviorSubject<boolean>(false);
	private data = new BehaviorSubject<API.TwitchUser | null>(null);

	constructor(
		private logger: LoggerService
	) {}

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
	pushData(data: API.TwitchUser): void {
		this.data.next(data);
		this.setAuthState(true);

		this.logger.info(`Signed in as ${data.display_name}`);
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
		this.setAuthState(false);
	}
}
