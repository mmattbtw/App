import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { LoggerService } from 'src/app/service/logger.service';
import { ThemingService } from 'src/app/service/theming.service';
import { UserService } from 'src/app/service/user.service';
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
	isClientUser = false;

	constructor(
		private route: ActivatedRoute,
		private userService: UserService,
		private loggerService: LoggerService,
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
			switchMap(id => this.userService.getOne(id)),
			tap(user => this.isClientUser = user.getSnapshot()?.id === this.clientService.getSnapshot()?.id),
			tap(user => this.user.next(user))
		).subscribe({
			error: (err) => this.loggerService.error('Couldn\'t fetch user', err)
		});
	}

	ngOnDestroy(): void {

	}
}
