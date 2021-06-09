import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
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
	@Input() contextMenu: MatMenu | null = null;
	@ViewChild(MatMenuTrigger) contextMenuTrigger: MatMenuTrigger | undefined;
	@Output() openContext = new EventEmitter<UserStructure>();

	/** [avatar size, font size]  */
	@Input() size: [number, number] = [2, 1];

	constructor(
		private router: Router,
		public themingService: ThemingService
	) {}

	/**
	 * Get the user targeted in this component. If it was not specified, default to client user
	 */
	get target(): UserStructure | null {
		return this.user ?? null;
	}

	onClick(): void {
		if (!this.clickable) return undefined;
		if (!this.target) return undefined;

		this.target.getID().pipe(
			takeUntil(this.destroyed),
			tap(id => this.router.navigate(['/user', id]))
		).subscribe();
	}

	/**
	 * On Right Click: open quick actions menu
	 */
	 @HostListener('contextmenu', ['$event'])
	 onRightClick(ev: MouseEvent): void {
		 ev.preventDefault(); // Stop the default context menu from opening

		 if (!!this.user) this.openContext.next(this.user);
		 this.contextMenuTrigger?.openMenu();
	 }

	ngOnInit(): void {}

	ngOnDestroy(): void {
		this.destroyed.next(undefined);
	}

}
