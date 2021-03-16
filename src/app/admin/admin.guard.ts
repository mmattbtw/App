import { Injectable } from '@angular/core';
import { UrlTree, CanLoad } from '@angular/router';
import { Constants } from '@typings/src/Constants';
import { asapScheduler, iif, Observable, scheduled } from 'rxjs';
import { concatAll, defaultIfEmpty, map, switchMap, take, toArray } from 'rxjs/operators';
import { AuthGuard } from 'src/app/auth.guard';
import { ClientService } from 'src/app/service/client.service';

@Injectable({
	providedIn: 'root'
})
export class AdminGuard extends AuthGuard implements CanLoad {
	constructor(
		protected clientService: ClientService
	) {
		super(clientService);
	}

	canLoad(): Observable<boolean> {
		return scheduled([
			super.canLoad(), // Client is authenticated?

			// Get client's permissions and make sure it's high enough to access admin area
			this.clientService.getRank().pipe(
				take(1),
				map(rank => rank >= Constants.Users.Rank.MODERATOR),
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
