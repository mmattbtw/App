import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad } from '@angular/router';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { take, catchError, timeout, tap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
	constructor(
		protected clientService: ClientService
	) {}

	canActivate(): Observable<boolean> {
		return this.isAuth();
	}
	canActivateChild(): Observable<boolean> {
		return this.isAuth();
	}

	canLoad(): Observable<boolean> {
		return this.isAuth();
	}

	private isAuth(): Observable<boolean> {
		return this.clientService.isAuthenticated().pipe(
			filter(isAuth => isAuth === true),
			timeout(2500),
			catchError(err => err instanceof TimeoutError ? of(false) : throwError(err)),
			take(1)
		);
	}
}
