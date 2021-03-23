import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@typings/src/Constants';
import { asyncScheduler, BehaviorSubject, EMPTY, from, iif, Observable, of, scheduled, Subject, timer } from 'rxjs';
import { catchError, concatMap, filter, map, mapTo, mergeAll, mergeMap, switchMap, takeUntil, tap, toArray } from 'rxjs/operators';
import { EmoteRenameDialogComponent } from 'src/app/emotes/emote/rename-emote-dialog.component';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { EmoteStructure } from 'src/app/util/emote.structure';
import * as Color from 'color';
import { HttpErrorResponse } from '@angular/common/http';
import { UserStructure } from 'src/app/util/user.structure';
import { UserService } from 'src/app/service/user.service';
import { ErrorDialogComponent } from 'src/app/util/dialog/error-dialog/error-dialog.component';
import { EmoteOwnershipDialogComponent } from 'src/app/emotes/emote/transfer-emote-dialog.component';
import { AppService } from 'src/app/service/app.service';
import { EmoteDeleteDialogComponent } from 'src/app/emotes/emote/delete-emote-dialog.component';
import { DataStructure } from '@typings/typings/DataStructure';
import { Meta } from '@angular/platform-browser';
import { AppComponent } from 'src/app/app.component';
import { DOCUMENT } from '@angular/common';

@Component({
	selector: 'app-emote',
	templateUrl: './emote.component.html',
	styleUrls: ['./emote.component.scss'],
	animations: [
		trigger('open', [
			transition(':enter', [
				animate(500, keyframes([
					style({ opacity: 0, offset: 0 }),
					style({ opacity: 0, offset: .75 }),
					style({ opacity: 1, offset: 1 })
				]))
			])
		])
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmoteComponent implements OnInit {
	/** The maximum height an emote can be. This tells where the scope text should be placed */
	MAX_HEIGHT = 128;

	channels = new BehaviorSubject<UserStructure[]>([]);
	emote: EmoteStructure | undefined;
	sizes = new BehaviorSubject<EmoteComponent.SizeResult[]>([]);
	audit = new BehaviorSubject<EmoteComponent.AuditEntry[]>([]);
	interactError = new Subject<string>().pipe(
		mergeMap(x => scheduled([
			of(!!x ? 'ERROR: ' + x : ''),
			timer(5000).pipe(
				takeUntil(this.interactError),
				mapTo('')
			)
		], asyncScheduler).pipe(mergeAll()))
	) as Subject<string>;

	/**
	 * A list of interaction buttons to be rendered
	 */
	interactions = [
		{ // Add to channel
			label: 'add to channel', color: this.themingService.colors.twitch_purple, icon: 'add_circle',
			condition: this.clientService.getEmotes().pipe(
				switchMap(emotes => this.emote?.isGlobal().pipe(map(isGlobal => ({ isGlobal, emotes }))) ?? EMPTY),
				map(({ emotes, isGlobal }) => !isGlobal && !emotes.includes(this.emote?.getID() as string))
			),
			click: emote => emote.addToChannel()
		},
		{ // Remove from channel
			label: 'remove from channel', color: this.themingService.warning.desaturate(0.4).negate(), icon: 'remove_circle',
			condition: this.clientService.getEmotes().pipe(
				map(emotes => emotes.includes(this.emote?.getID() as string))
			),
			click: emote => emote.removeFromChannel()
		},
		{
			label: 'make private',
			icon: 'lock', color: this.themingService.bg.darken(0.35),
			condition: this.clientService.getID().pipe(
				switchMap(id => this.clientService.getRank().pipe(map(rank => ({ rank, id })))),
				switchMap(({ id, rank }) => this.emote?.canEdit(String(id), rank) ?? EMPTY),
				switchMap(canEdit => canEdit ? this.emote?.isPrivate().pipe(map(isPrivate => !isPrivate)) ?? EMPTY : of(false))
			),
			click: emote => emote.edit({ private: true })
		},
		{
			label: 'make public',
			icon: 'lock_open', color: this.themingService.bg.lighten(3),
			condition: this.clientService.getID().pipe(
				switchMap(id => this.clientService.getRank().pipe(map(rank => ({ rank, id })))),
				switchMap(({ id, rank }) => this.emote?.canEdit(String(id), rank) ?? EMPTY),
				switchMap(canEdit => canEdit ? this.emote?.isPrivate() ?? EMPTY : of(false))
			),
			click: emote => emote.edit({ private: false })
		},
		{ // Make this emote global (Moderator only)
			label: 'make global', color: this.themingService.accent, icon: 'star',
			condition: this.clientService.getRank().pipe(
				switchMap(rank => (this.emote?.isGlobal() ?? EMPTY).pipe(map(isGlobal => ({ isGlobal, rank })))),
				map(({ isGlobal, rank }) => !isGlobal && rank >= Constants.Users.Rank.MODERATOR)
			),
			click: (emote) => emote.edit({ global: true })
		},
		{ // Remove this emote's global status (Moderator only)
			label: 'revoke global', color: this.themingService.accent.negate(), icon: 'star_half',
			condition: this.clientService.getRank().pipe(
				switchMap(rank => (this.emote?.isGlobal() ?? EMPTY).pipe(map(isGlobal => ({ isGlobal, rank })))),
				map(({ isGlobal, rank }) => isGlobal && rank >= Constants.Users.Rank.MODERATOR)
			),
			click: (emote) => emote.edit({ global: false })
		},
		{
			label: 'Transfer Ownership', color: this.themingService.primary.lighten(0.1).negate(),
			icon: 'swap_horiz',
			condition: this.clientService.getRank().pipe(
				switchMap(rank => this.emote?.canEdit(String(this.clientService.getSnapshot()?._id), rank) ?? EMPTY)
			),
			click: emote => {
				const dialogRef = this.dialog.open(EmoteOwnershipDialogComponent, {
					data: { emote }
				});

				return dialogRef.afterClosed().pipe(
					filter(newOwner => newOwner !== null),
					switchMap(newOwner => this.userService.getOne(newOwner).pipe(switchMap(user => user.getID()))),
					switchMap(newOwnerID => this.emote?.edit({ owner: newOwnerID }) ?? EMPTY)
				);
			}
		},
		{ // Delete this emote
			label: 'Delete', color: this.themingService.warning, icon: 'delete',
			condition: this.clientService.getID().pipe(
				switchMap(id => this.clientService.getRank().pipe(map(rank => ({ rank, id })))),
				switchMap(({ id, rank }) => this.emote?.canEdit(String(id), rank) ?? EMPTY)
			),

			click: emote => {
				const dialogRef = this.dialog.open(EmoteDeleteDialogComponent, {
					data: { emote }
				});

				return dialogRef.afterClosed().pipe(
					filter(reason => reason !== null && typeof reason === 'string'),
					switchMap(reason => this.emote?.delete(reason) ?? EMPTY),
					tap(() => this.router.navigate(['/emotes']))
				);
			}
		}
	] as EmoteComponent.InteractButton[];

	constructor(
		@Inject(DOCUMENT) private document: Document,
		private metaService: Meta,
		private restService: RestService,
		private route: ActivatedRoute,
		private router: Router,
		private cdr: ChangeDetectorRef,
		private dialog: MatDialog,
		private userService: UserService,
		private appService: AppService,
		public themingService: ThemingService,
		public clientService: ClientService
	) { }

	/**
	 * Get all sizes of the current emote
	 */
	getSizes(): Observable<EmoteComponent.SizeResult[]> {
		return from([1, 2, 3, 4]).pipe(
			map(s => ({
				scope: s,
				url: this.restService.CDN.Emote(String(this.emote?.getID()), s)
			} as EmoteComponent.SizeResult)),
			toArray()
		);
	}

	/**
	 * Method called when the client user interacts with a button
	 */
	onInteract(interaction: EmoteComponent.InteractButton): void {
		if (typeof interaction.click === 'function' && !!this.emote) {
			interaction.click(this.emote).pipe(
				switchMap(() => iif(() => interaction.label === 'add to channel' || interaction.label === 'remove from channel',
					this.getChannels().pipe(mapTo(undefined)),
					of(undefined)
				))
			).subscribe({
				complete: () => this.interactError.next(''),
				error: (err: HttpErrorResponse) => this.interactError.next(err.error.error ?? err.error)
			});
		}
	}

	/**
	 * Bring up a dialog to the current emote
	 */
	rename(): void {
		const dialogRef = this.dialog.open(EmoteRenameDialogComponent, {
			data: { emote: this.emote, happening: 'Rename' },
		});

		dialogRef.afterClosed().pipe(
			filter(data => !!data && data.name !== null),
			switchMap(data => this.emote?.edit({ name: data.name }, data.reason) ?? EMPTY),
		).subscribe();
	}

	/**
	 * Get the channels that this emote is added to
	 */
	getChannels(): Observable<UserStructure[]> {
		if (!this.emote) return of([]);

		return this.restService.Emotes.GetChannels(this.emote.getID() as string).pipe(
			RestService.onlyResponse(),
			map(res => res.body?.users.map(user => this.userService.new(user)) ?? []),
			tap(users => this.channels.next(users))
		);
	}

	readAuditActivity(): Observable<DataStructure.AuditLog.Entry[]> {
		return this.emote?.getAuditActivity().pipe(
			// Get action user
			concatMap(entry => this.userService.getOne(String(entry.action_user)).pipe(
				tap(user => (entry as EmoteComponent.AuditEntry).action_user_instance = user),
				mapTo(entry)
			)),

			toArray()
		) ?? of([]);
	}

	canEdit(): Observable<boolean> {
		if (!this.emote) return of(false);

		return this.clientService.getID().pipe(
			switchMap(id => this.clientService.getRank().pipe(map(rank => ({ id, rank })))),
			switchMap(({ id, rank }) => this.emote?.canEdit(id as string, rank) ?? EMPTY)
		);
	}

	hasTags(): Observable<boolean> {
		if (!this.emote) return of(false);

		return this.emote.getTags().pipe(
			map(a => (a ?? []).length > 0)
		);
	}

	isProcessing(): Observable<boolean> {
		return this.emote?.getStatus().pipe(
			map(status => status === Constants.Emotes.Status.PROCESSING)
		) ?? of(true);
	}

	isPendingOrDisabled(): Observable<boolean> {
		return this.emote?.getStatus().pipe(
			map(status => status === Constants.Emotes.Status.PENDING || status === Constants.Emotes.Status.DISABLED)
		) ?? of(false);
	}

	getEmoteOwner(): Observable<UserStructure> {
		return this.emote?.getOwnerID().pipe(
			switchMap(ownerID => this.userService.getOne(ownerID as string))
		) ?? EMPTY;
	}

	ngOnInit(): void {
		// Look up requested emote from route uri
		if (this.route.snapshot.paramMap.has('emote')) { // Route URI has emote param?
			this.restService.Emotes.Get(this.route.snapshot.paramMap.get('emote') as string, true).pipe(
				RestService.onlyResponse(),
				filter(res => res.body !== null), // Initiate a new emote structure instance

				tap(res => this.appService.pageTitleAttr.next([ // Update page title
					{ name: 'EmoteName', value: res.body?.name ?? '' },
					{ name: 'OwnerName', value: `by ${res.body?.owner_name ?? ''}` }
				])),
				map(res => this.emote = new EmoteStructure(this.restService).pushData(res.body)),
				switchMap(emote => this.getChannels().pipe(mapTo(emote))),

				// Update meta
				// Show this emote in discord etc!
				switchMap(emote => emote.getURL(4).pipe(
					tap(url => {
						const appURL = this.document.location.host + this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(emote.getID())]));
						const emoteData = emote.getSnapshot();
						this.metaService.addTags([
							// { name: 'og:title', content: this.appService.pageTitle },
							// { name: 'og:site_name', content: this.appService.pageTitle },
							{ name: 'og:description', content: `uploaded by ${emoteData?.owner_name}`},
							{ name: 'og:image', content: url ?? '' },
							{ name: 'og:image:type', content: emote.getSnapshot()?.mime ?? 'image/png' },
							{ name: 'theme-color', content: this.themingService.primary.hex() }
						]);

						// Discord OEmbed
						// TODO: Make this a proper service so it can be applied to other pages
						if (AppComponent.isBrowser.getValue() !== true) {
							const link = this.document.createElement('link');
							link.setAttribute('type', 'application/json+oembed');

							const data = {
								title: this.appService.pageTitle,
								author_name: `${emoteData?.name} ${emoteData?.global ? '(Global Emote)' : `(${this.channels.getValue()?.length} Channels)`}`,
								author_url: `https://${appURL}`,
								provider_name: `7TV.APP - It's like a third party thing`,
								provider_url: 'https://7tv.app'
							};
							if (!data) return undefined;
							if (data) link.setAttribute('href', `${this.document.location.origin}/og/oembed/emote.json` + `?data=${Buffer.from(JSON.stringify(data)).toString('base64')}`);
							this.document.head.appendChild(link);
						}
						return undefined;
					})
				)),

				switchMap(() => this.getSizes().pipe(
					tap(result => this.sizes.next(result))
				)),
				switchMap(() => this.readAuditActivity().pipe(
					tap(entries => this.audit.next(entries)),
					catchError(err => of(undefined))
				)),

				tap(() => this.cdr.markForCheck())
			).subscribe({
				error: (err: HttpErrorResponse) => {
					console.log(err);
					this.dialog.open(ErrorDialogComponent, {
						data: {
							errorName: 'Could not get emote',
							errorMessage: err.error?.error,
							errorCode: String(err.status)
						} as ErrorDialogComponent.Data
					});
					this.router.navigate(['/emotes']);
				}
			});
		}
	}
}

export namespace EmoteComponent {
	export interface SizeResult {
		scope: number;
		url: string;
	}

	export type AuditEntry = DataStructure.AuditLog.Entry & { action_user_instance?: UserStructure };

	export interface InteractButton {
		label: string;
		color: Color;
		icon?: string;
		disabled?: boolean;
		condition: Observable<boolean>;
		click?: (emote: EmoteStructure) => Observable<void>;
	}
}
