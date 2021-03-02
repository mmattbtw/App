import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@typings/src/Constants';
import * as Color from 'color';
import { asyncScheduler, EMPTY, from, Observable, of, scheduled } from 'rxjs';
import { filter, map, mapTo, mergeAll, switchMap, tap, toArray } from 'rxjs/operators';
import { EmoteRenameDialogComponent } from 'src/app/emotes/emote/rename-emote-dialog.component';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote',
	templateUrl: './emote.component.html',
	styleUrls: ['./emote.component.scss']
})
export class EmoteComponent implements OnInit {
	/** The maximum height an emote can be. This tells where the scope text should be placed */
	MAX_HEIGHT = 128;

	emote: EmoteStructure | undefined;

	/**
	 * A list of interaction buttons to be rendered
	 */
	interactions = [
		{ // Add to channel
			label: 'add to channel', color: this.themingService.primary.desaturate(0.4), icon: 'add_circle',
			condition: this.clientService.getID().pipe(
				mapTo(true)
			),
			disabled: true
		},
		// { // Remove from channel
		// 	label: 'remove from channel', color: this.themingService.primary.desaturate(0.4).negate(), icon: 'remove_circle',
		// 	condition: this.clientService.getID().pipe(
		// 		mapTo(true)
		// 	)
		// },
		{ // Make this emote global (Moderator only)
			label: 'make global', color: this.themingService.accent, icon: 'star',
			condition: this.clientService.getRank().pipe(
				map(rank => rank >= Constants.Users.Rank.MODERATOR)
			)
		},
		{ // Remove this emote's global status (Moderator only)
			label: 'revoke global', color: this.themingService.accent.negate(),
			condition: this.clientService.getRank().pipe(
				switchMap(rank => (this.emote?.isGlobal() ?? EMPTY).pipe(map(isGlobal => ({ isGlobal, rank })))),
				map(({ isGlobal, rank }) => isGlobal && rank >= Constants.Users.Rank.MODERATOR)
			)
		},
		{ // Delete this emote
			label: 'Delete', color: this.themingService.warning, icon: 'delete',
			condition: this.clientService.getID().pipe(
				switchMap(id => this.clientService.getRank().pipe(map(rank => ({ rank, id })))),
				switchMap(({ id, rank }) => this.emote?.canEdit(String(id), rank) ?? EMPTY)
			),

			click: (emote) => this.restService.Emotes.Delete(String(emote.getID())).pipe(
				RestService.onlyResponse(),
				// Emote deleted: quit this page
				tap(() => this.router.navigate(['/emotes']))
			)
		}
	] as EmoteComponent.InteractButton[];

	constructor(
		private restService: RestService,
		private clientService: ClientService,
		private route: ActivatedRoute,
		private router: Router,
		private cdr: ChangeDetectorRef,
		private dialog: MatDialog,
		public themingService: ThemingService
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
			interaction.click(this.emote).subscribe();
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
			switchMap(newName => this.emote?.edit({ name: newName }) ?? EMPTY),
		).subscribe();
	}

	canEdit(): Observable<boolean> {
		if (!this.emote) return of(false);

		return this.clientService.getID().pipe(
			switchMap(id => this.clientService.getRank().pipe(map(rank => ({ id, rank })))),
			switchMap(({ id, rank }) => this.emote?.canEdit(id as string, rank) ?? EMPTY)
		);
	}

	ngOnInit(): void {
		// Look up requested emote from route uri
		if (this.route.snapshot.paramMap.has('emote')) { // Route URI has emote param?
			this.restService.Emotes.Get(this.route.snapshot.paramMap.get('emote') as string).pipe(
				RestService.onlyResponse(),
				filter(res => res.body !== null), // Initiate a new emote structure instance
				map(res => this.emote = new EmoteStructure(this.restService).pushData(res.body)),

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
