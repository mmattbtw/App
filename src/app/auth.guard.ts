import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, UrlTree } from '@angular/router';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { take, catchError, timeout } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
	constructor(protected clientService: ClientService) {}

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
		if (!localStorage.getItem('access_token')) return of(false);

		return this.clientService.isAuthenticated().pipe(
			filter(isAuth => isAuth === true),
			timeout(2500),
			catchError(err => err instanceof TimeoutError ? of(false) : throwError(err)),
			take(1)
		);
	}
}
