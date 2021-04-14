import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';
import { RoleStructure } from 'src/app/util/role.structure';
import { UserStructure } from 'src/app/util/user.structure';


@Component({
	selector: 'app-user-name',
	templateUrl: './user-name.component.html',
	styleUrls: ['./user-name.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserNameComponent implements OnInit, OnDestroy {
	private destroyed = new Subject<void>().pipe(take(1)) as Subject<void>;
	@Input() user: UserStructure | undefined | null;
	@Input() showAvatar = true;
	@Input() avatarBorder = true;
	@Input() showUsername: boolean | null = true;
	@Input() clickable = true;
	@Input() maxWidth = 110;

	/** [avatar size, font size]  */
	@Input() size: [number, number] = [2, 1];

	constructor(
		private router: Router,
		public clientService: ClientService,
		public themingService: ThemingService
	) {}

	/**
	 * Get the user targeted in this component. If it was not specified, default to client user
	 */
	get target(): UserStructure {
		return this.user ?? this.clientService;
	}

	onClick(): void {
		if (!this.clickable) return undefined;

		this.target.getUsername().pipe(
			takeUntil(this.destroyed),
			tap(username => this.router.navigate(['/user', username]))
		).subscribe();
	}

	getRoleColor(): Observable<string> {
		return this.target.getRole().pipe(
			takeUntil(this.destroyed),
			take(1),
			switchMap(role => (role as RoleStructure).getHexColor())
		);
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		this.destroyed.next(undefined);
	}

}
