import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
	constructor(
		private restService: RestService
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
		return this.restService.awaitAuth();
	}
}
