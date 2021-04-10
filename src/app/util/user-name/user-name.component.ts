import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, take, takeUntil, tap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';
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
	@Input() size: [number, number] = [2, .75];

	role = new BehaviorSubject<DataStructure.Role | null>(null);

	constructor(
		public clientService: ClientService,
		public themingService: ThemingService
	) {}

	/**
	 * Get the user targeted in this component. If it was not specified, default to client user
	 */
	get target(): UserStructure {
		return this.user ?? this.clientService;
	}

	getRoleColor(): Observable<string> {
		return this.role.pipe(
			takeUntil(this.destroyed),
			map(role => `#${role?.color.toString(16)}` ?? '')
		);
	}

	ngOnInit(): void {
		this.target.getRole().pipe(
			take(1),
			tap(role => this.role.next(role))
		).subscribe();
	}

	ngOnDestroy(): void {
		this.destroyed.next(undefined);
	}

}
