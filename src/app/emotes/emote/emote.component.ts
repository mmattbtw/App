import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@typings/src/Constants';
import { asyncScheduler, BehaviorSubject, EMPTY, from, iif, Observable, of, scheduled, Subject, timer } from 'rxjs';
import { filter, map, mapTo, mergeAll, mergeMap, switchMap, takeUntil, tap, toArray } from 'rxjs/operators';
import { EmoteRenameDialogComponent } from 'src/app/emotes/emote/rename-emote-dialog.component';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { EmoteStructure } from 'src/app/util/emote.structure';
import * as Color from 'color';
import { HttpErrorResponse } from '@angular/common/http';
import { UserStructure } from 'src/app/util/user.structure';
import { UserService } from 'src/app/service/user.service';

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
	]
})
export class EmoteComponent implements OnInit {
	/** The maximum height an emote can be. This tells where the scope text should be placed */
	MAX_HEIGHT = 128;

	channels = new BehaviorSubject<UserStructure[]>([]);
	emote: EmoteStructure | undefined;
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
		{ // Delete this emote
			label: 'Delete', color: this.themingService.warning, icon: 'delete',
			condition: this.clientService.getID().pipe(
				switchMap(id => this.clientService.getRank().pipe(map(rank => ({ rank, id })))),
				switchMap(({ id, rank }) => this.emote?.canEdit(String(id), rank) ?? EMPTY)
			),

			click: (emote) => emote.delete().pipe(
				// Emote deleted: quit this page
				tap(() => this.router.navigate(['/emotes']))
			)
		}
	] as EmoteComponent.InteractButton[];

	constructor(
		private restService: RestService,
		private route: ActivatedRoute,
		private router: Router,
		private cdr: ChangeDetectorRef,
		private dialog: MatDialog,
		private userService: UserService,
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
			data: { emote: this.emote }
		});

		dialogRef.afterClosed().pipe(
			filter(newName => newName !== null),
			switchMap(newName => this.emote?.edit({ name: newName }) ?? EMPTY),
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

	ngOnInit(): void {
		// Look up requested emote from route uri
		if (this.route.snapshot.paramMap.has('emote')) { // Route URI has emote param?
			this.restService.Emotes.Get(this.route.snapshot.paramMap.get('emote') as string).pipe(
				RestService.onlyResponse(),
				filter(res => res.body !== null), // Initiate a new emote structure instance
				map(res => this.emote = new EmoteStructure(this.restService).pushData(res.body)),
				switchMap(() => this.getChannels()),

				tap(() => this.cdr.markForCheck())
			).subscribe({
				error: (err) => this.router.navigate(['/emotes'])
			});
		}
	}
}

export namespace EmoteComponent {
	export interface SizeResult {
		scope: number;
		url: string;
	}

	export interface InteractButton {
		label: string;
		color: Color;
		icon?: string;
		disabled?: boolean;
		condition: Observable<boolean>;
		click?: (emote: EmoteStructure) => Observable<void>;
	}
}
