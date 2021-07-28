import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { noop, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { AuthGuard } from 'src/app/auth.guard';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';

@Injectable({
	providedIn: 'root'
})
export class AdminGuard extends AuthGuard implements CanLoad {
	constructor(
		restService: RestService,
		private clientService: ClientService,
		private router: Router
	) {
		super(restService);
	}

	canActivate(): Observable<boolean> {
		return this.runGuard();
	}

	canActivateChild(): Observable<boolean> {
		return this.runGuard();
	}

	canLoad(): Observable<boolean> {
		return this.runGuard();
	}

	private runGuard(): Observable<boolean> {
		return super.canLoad().pipe(
			switchMap(() => this.clientService.canAccessAdminArea()),
			tap(ok => ok ? noop() : this.router.navigate(['/'], {replaceUrl: true})),
			take(1)
		);
	}
}
