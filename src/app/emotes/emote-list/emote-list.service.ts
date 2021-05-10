

import { Injectable } from '@angular/core';
import { LocalStorageService } from 'src/app/service/localstorage.service';

import { BitField } from '@typings/src/BitField';
import { DataStructure } from '@typings/typings/DataStructure';
import { EMPTY, Observable, of } from 'rxjs';
import { switchMap, map, tap, filter, take } from 'rxjs/operators';
import { EmoteDeleteDialogComponent } from 'src/app/emotes/emote/delete-emote-dialog.component';
import { EmoteOwnershipDialogComponent } from 'src/app/emotes/emote/transfer-emote-dialog.component';
import { ClientService } from 'src/app/service/client.service';
import { MatDialog } from '@angular/material/dialog';
import { ThemingService } from 'src/app/service/theming.service';
import * as Color from 'color';
import { EmoteStructure } from 'src/app/util/emote.structure';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
@Injectable({providedIn: 'root'})
export class EmoteListService {
	currentPage = Number(this.localStorage.getItem('el_pagination_page')) ?? 0;
	currentPageSize = Number(this.localStorage.getItem('el_pagination_size')) ?? 0;

	searchForm = new FormGroup({
		name: new FormControl('', { updateOn: 'blur' }),
		globalState: new FormControl('include'),
		channel: new FormControl(false),
		sortBy: new FormControl('popularity'),
		sortOrder: new FormControl(0)
	});

	interactions = [
		{ // Add to channel
			label: 'add to channel', color: this.themingService.colors.twitch_purple, icon: 'add_circle',
			condition: emote => this.clientService.getEmotes().pipe(
				switchMap(emotes => emote?.isGlobal().pipe(map(isGlobal => ({ isGlobal, emotes }))) ?? EMPTY),
				map(({ emotes, isGlobal }) => !isGlobal && !emotes.includes(emote?.getID() as string))
			),
			click: emote => this.clientService.isAuthenticated().pipe(
				switchMap(ok => ok ? emote.addToChannel(this.clientService.id as string) : of(false))
			)
		},
		{ // Remove from channel
			label: 'remove from channel', color: this.themingService.warning.desaturate(0.4).negate(), icon: 'remove_circle',
			condition: emote => this.clientService.getEmotes().pipe(
				map(emotes => emotes.includes(emote?.getID() as string))
			),
			click: emote => this.clientService.isAuthenticated().pipe(
				switchMap(ok => ok ? emote.removeFromChannel(this.clientService.id as string) : of(false))
			)
		},
		{
			label: 'make private',
			icon: 'lock', color: this.themingService.bg.darken(0.35),
			condition: emote => emote?.canEdit(this.clientService).pipe(
				switchMap(canEdit => canEdit ? emote?.isPrivate().pipe(map(isPrivate => !isPrivate)) ?? EMPTY : of(false))
			),
			click: emote => emote.edit({ visibility: BitField.AddBits(emote.getVisibility(), DataStructure.Emote.Visibility.PRIVATE) })
		},
		{
			label: 'make public',
			icon: 'lock_open', color: this.themingService.bg.lighten(3),
			condition: emote => emote?.canEdit(this.clientService).pipe(
				switchMap(canEdit => canEdit ? emote?.isPrivate() ?? EMPTY : of(false))
			),
			click: emote => emote.edit({ visibility: BitField.RemoveBits(emote.getVisibility(), DataStructure.Emote.Visibility.PRIVATE) })
		},
		{ // Make this emote global (Moderator only)
			label: 'make global', color: this.themingService.accent, icon: 'star',
			condition: emote => this.clientService.hasPermission('EDIT_EMOTE_ALL').pipe(
				switchMap(hasPermission => (emote?.isGlobal() ?? EMPTY).pipe(map(isGlobal => ({ isGlobal, hasPermission })))),
				map(({ isGlobal, hasPermission }) => !isGlobal && hasPermission)
			),
			click: (emote) => emote.edit({ visibility: BitField.AddBits(emote.getVisibility(), DataStructure.Emote.Visibility.GLOBAL) })
		},
		{ // Remove this emote's global status (Moderator only)
			label: 'revoke global', color: this.themingService.accent.negate(), icon: 'star_half',
			condition: emote => this.clientService.hasPermission('EDIT_EMOTE_ALL').pipe(
				switchMap(hasPermission => (emote?.isGlobal() ?? EMPTY).pipe(map(isGlobal => ({ isGlobal, hasPermission })))),
				map(({ isGlobal, hasPermission }) => isGlobal && hasPermission)
			),
			click: (emote) => emote.edit({ visibility: BitField.RemoveBits(emote.getVisibility(), DataStructure.Emote.Visibility.GLOBAL) })
		},
		{
			label: 'Transfer Ownership', color: this.themingService.primary.lighten(0.1).negate(),
			icon: 'swap_horiz',
			condition: emote => emote?.canEdit(this.clientService),
			click: emote => {
				const dialogRef = this.dialog.open(EmoteOwnershipDialogComponent, {
					data: { emote }
				});

				return dialogRef.afterClosed().pipe(
					filter(newOwner => newOwner !== null),
					switchMap(newOwner => this.restService.v2.GetUser(newOwner).pipe(
						map(res => this.dataService.add('user', res.user)[0]),
						switchMap(user => user.getID().pipe(take(1)))
					)),
					switchMap(newOwnerID => emote?.edit({ owner_id: newOwnerID as string }, '', ['name', 'owner { id, display_name, login, profile_image_url }']) ?? EMPTY)
				);
			}
		},
		{ // Delete this emote
			label: 'Delete', color: this.themingService.warning, icon: 'delete',
			condition: emote => emote.canEdit(this.clientService),

			click: emote => {
				const dialogRef = this.dialog.open(EmoteDeleteDialogComponent, {
					data: { emote }
				});

				return dialogRef.afterClosed().pipe(
					filter(reason => reason !== null && typeof reason === 'string'),
					switchMap(reason => emote?.delete(reason) ?? EMPTY),
					tap(() => this.router.navigate(['/emotes']))
				);
			}
		}
	] as EmoteListService.InteractButton[];

	constructor(
		private localStorage: LocalStorageService,
		private clientService: ClientService,
		private dialog: MatDialog,
		private router: Router,
		private themingService: ThemingService,
		private restService: RestService,
		private dataService: DataService
	) {}

}

export namespace EmoteListService {
	export interface InteractButton {
		label: string;
		color: Color;
		icon?: string;
		disabled?: boolean;
		condition: (emote: EmoteStructure) => Observable<boolean>;
		click?: (emote: EmoteStructure) => Observable<void>;
	}
}
