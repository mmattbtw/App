

import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { asapScheduler, BehaviorSubject, Observable, scheduled } from 'rxjs';
import { map, take, zipAll } from 'rxjs/operators';
import { DataService } from 'src/app/service/data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LoggerService } from 'src/app/service/logger.service';
import { UserStructure } from 'src/app/util/user.structure';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class ClientService extends UserStructure {
	private token = '';
	private authState = new BehaviorSubject<boolean>(false);
	private isAuth = false;

	impersonating = new BehaviorSubject<UserStructure | null>(null);
	get isImpersonating(): boolean {
		return this.impersonating.getValue() !== null;
	}

	/**
	 * Get the current actor user, which is the client user unless they are impersonating somebody
	 */
	getActorUser(): Observable<UserStructure> {
		return this.impersonating.asObservable().pipe(
			take(1),
			map(usr => !!usr ? usr : this),
		) as Observable<UserStructure>;
	}

	constructor(
		public localStorage: LocalStorageService,
		public dataService: DataService,
		private cookieService: CookieService,
		private logger: LoggerService,
		private snackBar: MatSnackBar,
	) {
		super(dataService);
	}

	/**
	 * Set User Data onto the client. This will set the client as authenticated
	 * and appear as signed in
	 *
	 * @param data Twitch User data
	 */
	pushData(data: DataStructure.TwitchUser | null): UserStructure {
		super.pushData(data);
		if (!data) {
			return this;
		}

		if (this.isAuth) return this;
		if (!!data?.id) {
			this.setAuthState(!!data);
			this.logger.info(`Signed in as ${data.display_name}.`);
		} else {
			this.logger.info('Signed out.');
		}
		if (Array.isArray(data.editor_in)) {
			this.dataService.add('user', ...data.editor_in);
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

	canAccessAdminArea(): Observable<boolean> {
		return scheduled([
			this.hasPermission('MANAGE_REPORTS'),
			this.hasPermission('MANAGE_ROLES'),
			this.hasPermission('MANAGE_STACK'),
			this.hasPermission('MANAGE_USERS'),
			this.hasPermission('BAN_USERS')
		], asapScheduler).pipe(
			zipAll(),
			map(perms => perms.filter(b => b === true).length > 0)
		);
	}

	openSnackBar(message: string, action: string, opt?: MatSnackBarConfig): void {
		this.snackBar.open(message, action, {
			duration: 5000,
			...opt ?? {}
		});
	}

	/**
	 * Log out the current user. This will set the client as unauthenticated
	 * and appear as signed out
	 */
	logout(): void {
		this.localStorage.removeItem('access_token');
		this.token = '';
		this.cookieService.set('auth', '');
		this.cookieService.deleteAll('auth');
		this.data.next(null);
		this.setAuthState(false);
	}
}
