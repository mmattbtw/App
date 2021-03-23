import { trigger, transition, query, style, stagger, animate, keyframes, group, state } from '@angular/animations';
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Constants } from '@typings/src/Constants';
import { Subject, BehaviorSubject, Observable, EMPTY, of } from 'rxjs';
import { delay, filter, map, mergeAll, switchMap, take, takeUntil, tap, toArray } from 'rxjs/operators';
import { EmoteListService } from 'src/app/emotes/emote-list/emote-list.service';
import { EmoteSearchComponent } from 'src/app/emotes/emote-search/emote-search.component';
import { EmoteDeleteDialogComponent } from 'src/app/emotes/emote/delete-emote-dialog.component';
import { AppService } from 'src/app/service/app.service';
import { ClientService } from 'src/app/service/client.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { WindowRef } from 'src/app/service/window.service';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote-list',
	templateUrl: './emote-list.component.html',
	styleUrls: ['./emote-list.component.scss'],
	styles: ['.selected-emote-card { opacity: 0 }'],
	animations: [
		trigger('fadeout', [
			state('true', style({ transform: 'translateY(200%)', opacity: 0 })),

			transition('* => true', animate('100ms'))
		]),

		trigger('emotes', [
			transition('* => *', [
				query('.is-emote-card:enter', [
					style({ opacity: 0, transform: 'translateX(5em) translateY(-20em)' }),
					stagger(11, [
						animate('475ms ease-in-out', keyframes([
							style({ opacity: 0, offset: 0.475 }),
							style({ opacity: 1, transform: 'none', offset: 1 })
						]))
					])
				], { optional: true }),

				group([
					query('.is-emote-card:not(.selected-emote-card):leave', [
						style({ opacity: 1 }),
						stagger(-9.25, [
							animate('200ms', style({ transform: 'scale(0)' }))
						])
					], { optional: true }),

					query('.selected-emote-card', [
						style({ opacity: 1 }),
						animate('550ms', keyframes([
							style({ offset: 0, opacity: 1, transform: 'scale(1)' }),
							style({ offset: .2, transform: 'scale(.91)' }),
							style({ offset: .38, transform: 'scale(.64)' }),
							style({ offset: .44, transform: 'scale(.82)' }),

							style({ offset: 1, transform: 'scale(12) translateY(25%)', opacity: 0 })
						])),
					], { optional: true })
				])
			])
		])
	]
})
export class EmoteListComponent implements OnInit {
	destroyed = new Subject<any>().pipe(take(1)) as Subject<void>;
	selecting = new BehaviorSubject(false).pipe(takeUntil(this.destroyed)) as BehaviorSubject<boolean>;
	emotes = new BehaviorSubject<any>(Array(16).fill(new EmoteStructure(this.restService))).pipe(takeUntil(this.destroyed)) as BehaviorSubject<EmoteStructure[]>;
	totalEmotes = new BehaviorSubject<number>(0);
	contextEmote: EmoteStructure | null = null;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	pageOptions: EmoteListComponent.PersistentPageOptions | undefined;
	currentSearchQuery = '';

	contextMenuOptions = [
		{
			label: 'Open in New Tab',
			icon: 'open_in_new',
			click: emote => {
				const url = this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(emote.getID())]));

				return of(this.windowRef.getNativeWindow()?.open(url, '_blank'));
			}
		},
		{
			label: 'Copy Link',
			icon: 'link',
			click: emote => of(this.windowRef.copyValueToClipboard(''.concat(
				`https://${this.windowRef.getNativeWindow()?.location.host}`, // Get window location.host
				this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(emote.getID())]))
			)))
		},
		{ // Add to channel
			label: 'Add To Channel', icon: 'add_circle',
			condition: emote => this.clientService.getEmotes().pipe(
				switchMap(emotes => emote?.isGlobal().pipe(map(isGlobal => ({ isGlobal, emotes }))) ?? EMPTY),
				switchMap(({ isGlobal, emotes }) => this.clientService.isAuthenticated().pipe(map(isAuth => ({ isAuth, isGlobal, emotes })))),
				map(({ emotes, isGlobal, isAuth }) => isAuth && !isGlobal && !emotes.includes(emote?.getID() as string))
			),
			click: emote => emote.addToChannel()
		},
		{ // Remove from channel
			label: 'Remove From Channel', icon: 'remove_circle',
			condition: emote => this.clientService.getEmotes().pipe(
				map(emotes => emotes.includes(emote?.getID() as string))
			),
			click: emote => emote.removeFromChannel()
		},
		{
			label: 'Make Private',
			icon: 'lock',
			condition: emote => this.clientService.getID().pipe(
				switchMap(id => this.clientService.getRank().pipe(map(rank => ({ rank, id })))),
				switchMap(({ id, rank }) => emote?.canEdit(String(id), rank) ?? EMPTY),
				switchMap(canEdit => canEdit ? emote.isPrivate().pipe(map(isPrivate => !isPrivate)) : of(false))
			),
			click: emote => emote.edit({ private: true })
		},
		{
			label: 'Make Public',
			icon: 'lock_open',
			condition: emote => this.clientService.getID().pipe(
				switchMap(id => this.clientService.getRank().pipe(map(rank => ({ rank, id })))),
				switchMap(({ id, rank }) => emote?.canEdit(String(id), rank) ?? EMPTY),
				switchMap(canEdit => canEdit ? emote.isPrivate() : of(false))
			),
			click: emote => emote.edit({ private: false })
		},
		{
			label: 'Make Global',
			icon: 'star',
			condition: emote => this.clientService.getRank().pipe(
				switchMap(rank => (emote?.isGlobal() ?? EMPTY).pipe(map(isGlobal => ({ isGlobal, rank })))),
				map(({ isGlobal, rank }) => !isGlobal && rank >= Constants.Users.Rank.MODERATOR)
			),
			click: (emote) => emote.edit({ global: true })
		},
		{
			label: 'Revoke Global',
			icon: 'star_half',
			condition: emote => this.clientService.getRank().pipe(
				switchMap(rank => (emote?.isGlobal() ?? EMPTY).pipe(map(isGlobal => ({ isGlobal, rank })))),
				map(({ isGlobal, rank }) => isGlobal && rank >= Constants.Users.Rank.MODERATOR)
			),
			click: (emote) => emote.edit({ global: false })
		},
		{
			label: 'Delete',
			icon: 'delete', color: this.themingService.warning,
			condition: emote => this.clientService.getID().pipe(
				switchMap(id => this.clientService.getRank().pipe(map(rank => ({ rank, id })))),
				switchMap(({ id, rank }) => emote?.canEdit(String(id), rank) ?? EMPTY)
			),
			click: emote => {
				const dialogRef = this.dialog.open(EmoteDeleteDialogComponent, {
					data: { emote }
				});

				return dialogRef.afterClosed().pipe(
					filter(reason => reason !== null && typeof reason === 'string'),
					switchMap(reason => emote?.delete(reason) ?? EMPTY),
					switchMap(() => this.emotes.pipe(
						take(1),
						tap(emotes => this.emotes.next(emotes.filter(e => e.getID() !== emote.getID())))
					))
				);
			}
		}
	] as EmoteListComponent.ContextMenuButtons[];

	constructor(
		private restService: RestService,
		private clientService: ClientService,
		private renderer: Renderer2,
		private router: Router,
		private windowRef: WindowRef,
		private appService: AppService,
		private dialog: MatDialog,
		private localStorage: LocalStorageService,
		public svc: EmoteListService,
		public themingService: ThemingService
	) { }

	onContextInteract(button: EmoteListComponent.ContextMenuButtons, emote: EmoteStructure): void {
		if (typeof button.click === 'function' && !!emote) {
			button.click(emote).subscribe();
		}
	}

	selectEmote(el: any, emote: EmoteStructure): void {
		if (!emote.getID()) return undefined;

		this.selecting.next(true);
		this.renderer.addClass(el, 'selected-emote-card');
		this.emotes.next([]);

		setTimeout(() => {
			this.router.navigate(['emotes', emote.getID()]);
		}, 775);
	}

	handleSearchChange(change: Partial<EmoteSearchComponent.SearchChange>): void {
		const queryString = Object.keys(change).map(k => `${k}=${change[k as keyof EmoteSearchComponent.SearchChange]}`).join('&');

		this.appService.pushTitleAttributes({ name: 'SearchOptions', value: `- ${queryString}` });
		this.getEmotes(undefined, undefined, this.currentSearchQuery = queryString).pipe(
			toArray(),
			tap(() => this.emotes.next([])),
			delay(50),
			tap(emotes => this.emotes.next(emotes))
		).subscribe();
	}

	getEmotes(page = 1, pageSize = 16, queryString?: string): Observable<EmoteStructure> {
		return this.restService.Emotes.List(page, pageSize, queryString ?? this.currentSearchQuery).pipe(
			RestService.onlyResponse(),
			tap(res => this.totalEmotes.next(res.body?.total_estimated_size ?? 0)),
			tap(() => this.emotes.next([])),
			delay(200),
			map(res => res.body?.emotes ?? []),
			mergeAll(),
			map(data => new EmoteStructure(this.restService).pushData(data))
		);
	}

	/**
	 * Handle pagination changes
	 */
	onPageEvent(ev: PageEvent): void {
		// Save page options to localstorage
		const pageOptions = {
			page: ev.pageIndex,
			pageSize: ev.pageSize,
			length: ev.length
		} as EmoteListComponent.PersistentPageOptions;
		this.localStorage.setItem('pagination', JSON.stringify(pageOptions));

		// Save PageIndex title attr
		this.appService.pushTitleAttributes({ name: 'PageIndex', value: `- ${ev.pageIndex + 1}/${Number((ev.length / ev.pageSize).toFixed(0)) + 1}` });

		// Fetch new set of emotes
		this.getEmotes(ev.pageIndex + 1, ev.pageSize).pipe(
			toArray(),
			tap(emotes => this.emotes.next(emotes))
		).subscribe();
	}

	ngOnInit(): void {
		// Get persisted page options?
		const pageOptions = this.localStorage.getItem('pagination');
		if (!!pageOptions) { // If persistence options found set the page
			const o = JSON.parse(pageOptions) as EmoteListComponent.PersistentPageOptions; // Parse JSON from localStorage

			this.paginator?.page.next({
				pageIndex: o.page,
				pageSize: o.pageSize,
				length: o.length,
			});
			this.pageOptions = o;
		} else {
			this.getEmotes().pipe(
				toArray(),
				map(emotes => this.emotes.next(emotes))
			).subscribe();
		}
	}

}

export namespace EmoteListComponent {
	export interface ContextMenuButtons {
		label: string;
		icon: string;
		color?: string;
		click: (emote: EmoteStructure) => Observable<void>;
		condition?: (emote: EmoteStructure) => Observable<boolean>;
	}

	export interface PersistentPageOptions {
		pageSize: number;
		page: number;
		length: number;
	}
}
