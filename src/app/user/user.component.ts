import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AppService } from 'src/app/service/app.service';
import { ClientService } from 'src/app/service/client.service';
import { DataService } from 'src/app/service/data.service';
import { LoggerService } from 'src/app/service/logger.service';
import { RestService } from 'src/app/service/rest.service';
import { RestV2 } from 'src/app/service/rest/rest-v2.structure';
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

	addingEditor = false;
	editorControl = new FormControl('');

	constructor(
		private route: ActivatedRoute,
		private appService: AppService,
		private loggerService: LoggerService,
		private restService: RestService,
		private dataService: DataService,
		private cdr: ChangeDetectorRef,
		public clientService: ClientService,
		public themingService: ThemingService
	) { }

	getRole(): Observable<RoleStructure> {
		return this.user.pipe(
			switchMap(user => !user ? throwError(Error('Missing User')) : of(user)),
			switchMap(user => (user as UserStructure).getRole())
		);
	}

	openTwitchChannel(): void {
		window.open(`https://twitch.tv/${this.user.getValue()?.getSnapshot()?.login}`, '_blank');
	}

	getEditors(): Observable<UserStructure[]> {
		return this.user.pipe(
			switchMap(user => user?.getEditors() ?? of([]))
		);
	}

	canEdit(): Observable<boolean> {
		return this.user.pipe(
			filter(user => !!user),
			switchMap(user => (this.clientService.hasPermission('MANAGE_USERS')).pipe(
				map(isMod => ({ isMod, user }))
			)),
			map(({ isMod, user }) => isMod || (!!user && user.getSnapshot()?.id === this.clientService.getSnapshot()?.id))
		);
	}

	/**
	 * This method makes the editor addition box appear
	 */
	addEditor(): void {
		const channelID = this.user.getValue()?.id;
		if (!channelID) return;

		this.addingEditor = false;
		this.restService.v2.GetUser(this.editorControl.value).pipe(
			filter(u => !!u.user),
			switchMap(u => this.restService.v2.AddChannelEditor(channelID, u.user.id, '')),
			switchMap(u => this.dataService.add('user', u.user))
		).subscribe({
			complete: () => {
				this.cdr.markForCheck();
				this.editorControl.reset();
			},
			error: (err: RestV2.ErrorGQL) => this.clientService.openSnackBar(err.error.errors[0].message, '')
		});
	}

	removeEditor(user: UserStructure): void {
		const channelID = this.user.getValue()?.id;
		if (!channelID) return;

		this.restService.v2.RemoveChannelEditor(channelID, user.id, '').pipe(
			tap(u => this.dataService.add('user', u.user))
		).subscribe({
			complete: () => this.cdr.markForCheck()
		});
	}

	ngOnInit(): void {
		this.route.paramMap.pipe(
			map(params => params.get('user') as string),
			switchMap(id => this.restService.v2.GetUser(id, { includeEditors: true, includeOwnedEmotes: true, includeFullEmotes: true }).pipe(
				map(res => this.dataService.add('user', res.user)[0])
			)),
			tap(user => this.user.next(user)),
			tap(user => {
				this.appService.pageTitleAttr.next([ // Update page title
					{ name: 'User', value: user.getSnapshot()?.display_name ?? '' }
				]);
			})
		).subscribe({
			error: (err) => this.loggerService.error('Couldn\'t fetch user', err)
		});
	}

	ngOnDestroy(): void {
		this.destroyed.next();
		this.destroyed.complete();
	}
}
