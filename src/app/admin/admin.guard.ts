import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { asapScheduler, Observable, scheduled } from 'rxjs';
import { concatAll, defaultIfEmpty, map, take, tap, toArray } from 'rxjs/operators';
import { AuthGuard } from 'src/app/auth.guard';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { UserService } from 'src/app/service/user.service';

@Injectable({
	providedIn: 'root'
})
export class AdminGuard extends AuthGuard implements CanLoad {
	constructor(
		protected clientService: ClientService,
		// tslint:disable:variable-name
		_rs: RestService,
		_us: UserService
		// tslint:enable:variable-name
	) {
		super(clientService);
	}

	canLoad(): Observable<boolean> {
		return scheduled([
			super.canLoad(), // Client is authenticated?

			// Get client's permissions and make sure it's high enough to access admin area
			this.clientService.canAccessAdminArea().pipe(
				take(1),
				defaultIfEmpty(false)
			)
		], asapScheduler).pipe(
			concatAll(),
			take(2),
			toArray(), // Evaluate both values, and only emit true if both are true
			map(a => a[0] === true && a[1] === true)
		);
	}
}
