import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { DataService } from 'src/app/service/data.service';
import { LoggerService } from 'src/app/service/logger.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { RoleStructure } from 'src/app/util/role.structure';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit, OnDestroy {
	destroyed = new Subject<any>().pipe(take(1)) as Subject<void>;
	user = new BehaviorSubject<UserStructure | null>(null);

	constructor(
		private route: ActivatedRoute,
		private loggerService: LoggerService,
		private restService: RestService,
		private dataService: DataService,
		public clientService: ClientService,
		public themingService: ThemingService
	) { }

	getRole(): Observable<RoleStructure> {
		return this.user.pipe(
			switchMap(user => !user ? throwError(Error('Missing User')) : of(user)),
			switchMap(user => (user as UserStructure).getRole())
		);
	}

	ngOnInit(): void {
		this.route.paramMap.pipe(
			map(params => params.get('user') as string),
			switchMap(id => this.restService.v2.GetUser(id).pipe(
				map(res => this.dataService.add('user', res.user)[0])
			)),
			tap(user => this.user.next(user))
		).subscribe({
			error: (err) => this.loggerService.error('Couldn\'t fetch user', err)
		});
	}

	ngOnDestroy(): void {
		this.destroyed.next();
		this.destroyed.complete();
	}
}
