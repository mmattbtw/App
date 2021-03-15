import { Injectable } from '@angular/core';
import { UrlTree, CanLoad } from '@angular/router';
import { Constants } from '@typings/src/Constants';
import { Observable } from 'rxjs';
import { defaultIfEmpty, map, take } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';

@Injectable({
	providedIn: 'root'
})
export class AdminGuard implements CanLoad {
	constructor(
		private clientService: ClientService
	) {}

	canLoad(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.clientService.getRank().pipe(
			take(1),
			map(rank => rank >= Constants.Users.Rank.MODERATOR),
			defaultIfEmpty(false)
		);
	}
}
