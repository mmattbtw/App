import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { asapScheduler, noop, Observable, scheduled } from 'rxjs';
import { concatAll, defaultIfEmpty, map, take, tap, toArray } from 'rxjs/operators';
import { AuthGuard } from 'src/app/auth.guard';
import { ClientService } from 'src/app/service/client.service';

@Injectable({
	providedIn: 'root'
})
export class AdminGuard extends AuthGuard implements CanLoad {
	constructor(
		protected clientService: ClientService,
		private router: Router,
	) {
		super(clientService);
	}

	canActivate(): Observable<boolean> {
		return this.runGuard();
	}

	canLoad(): Observable<boolean> {
		return this.runGuard();
	}

	private runGuard(): Observable<boolean> {
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
			map(a => a[0] === true && a[1] === true),
			tap(b => b === false ? this.router.navigate(['/']) : noop())
		);
	}
}
