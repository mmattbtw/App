import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BitField } from '@typings/src/BitField';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { filter, map, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { EmoteDeleteDialogComponent } from 'src/app/emotes/emote/delete-emote-dialog.component';
import { EmoteComponent } from 'src/app/emotes/emote/emote.component';
import { ClientService } from 'src/app/service/client.service';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-admin-mod-queue',
	templateUrl: 'admin-mod-queue.component.html',
	styleUrls: ['admin-mod-queue.component.scss']
})

export class AdminModQueueComponent implements OnInit {
	emotes = new BehaviorSubject<EmoteStructure[]>([]);
	total = new BehaviorSubject<number>(0);

	actions = [
		{
			label: 'Go to Emote',
			icon: 'link',
			click: emote => this.linkToEmotePage(emote)
		},
		{
			label: 'Confirm Emote',
			icon: 'done',
			click: emote => emote.edit({
				visibility: BitField.RemoveBits(emote.getSnapshot()?.visibility ?? 0, DataStructure.Emote.Visibility.HIDDEN)
			}).pipe(
				switchMap(() => this.emotes.pipe(
					take(1),
					map(list => this.emotes.next(list.filter(e => emote.getID() !== e.getID())))
				)),
				tap(() => this.clientService.openSnackBar(`Approved ${emote.getSnapshot()?.name} (ID: ${emote.getID()}) for public listing`, 'OK', { duration: 1500 })),
				mapTo(undefined)
			)
		},
		{
			label: 'Reject Emote',
			icon: 'close', iconColor: '#eb8c34',
			click: emote => emote.edit({
				visibility: BitField.AddBits(
					emote.getSnapshot()?.visibility ?? 0, DataStructure.Emote.Visibility.PERMANENTLY_UNLISTED
				)
			}).pipe(
				switchMap(() => this.emotes.pipe(
					take(1),
					map(list => this.emotes.next(list.filter(e => emote.getID() !== e.getID())))
				)),
				tap(() => this.clientService.openSnackBar(`Declined ${emote.getSnapshot()?.name} (ID: ${emote.getID()}) from public listing`, 'OK', { duration: 1500 })),
			)
		},
		{
			label: 'Delete Emote',
			icon: 'delete', iconColor: '#d45353',
			click: emote => this.dialog.open(EmoteDeleteDialogComponent, {
				data: { emote }
			}).afterClosed().pipe(
				filter(rsn => typeof rsn === 'string' && rsn.length > 0),
				switchMap(rsn => emote.delete(rsn)),
				switchMap(() => this.emotes.pipe(
					take(1),
					tap(emotes => this.emotes.next(emotes.filter(e => e.getSnapshot()?.id !== emote.getSnapshot()?.id))),
					tap(() => this.clientService.openSnackBar(`Deleted ${emote.getSnapshot()?.name} (ID: ${emote.getID()})`, 'OK', { duration: 1500 }))
				))
			)
		},
		{
			label: 'Remove Tag',
			icon: '', invisible: true,
			click: (emote, tag) => {
				const tags = emote.getSnapshot()?.tags ?? [];
				const i = tags.indexOf(tag as string);
				const emoteName = emote.getSnapshot()?.name;
				tags.splice(i, 1);

				return emote.edit({
					tags
				}).pipe(
					tap(() => this.clientService.openSnackBar(`Removed tag ${tag} from ${emoteName} (ID: ${emote.getID()})`, 'OK', { duration: 1500 }))
				);
			}
		}
	] as AdminModQueueComponent.EmoteQuickAction[];

	constructor(
		public themingService: ThemingService,
		private clientService: ClientService,
		private router: Router,
		private restService: RestService,
		private dataService: DataService,
		private dialog: MatDialog
	) { }

	openEmote(emote: EmoteStructure): void {
		this.restService.v2.GetEmote(emote.getID()).subscribe({
			next: e => {
				const dialogRef = this.dialog.open(EmoteComponent);
				dialogRef.componentInstance.emote = this.dataService.add('emote', e.emote)[0];
				dialogRef.componentInstance.disableNotices = true;
			}
		});
	}

	linkToEmotePage(emote: EmoteStructure): void {
		const url = this.router.createUrlTree(['/emotes', emote.getID()]);

		window.open(url.toString(), '_blank');
	}

	useAction(action: AdminModQueueComponent.EmoteQuickAction, emote: EmoteStructure): void {
		action.click(emote).subscribe({
			error: err => console.error(err)
		});
	}

	removeEmoteTag(event: MouseEvent, emote: EmoteStructure, tag: string): void {
		event.preventDefault();

		const action = this.actions[3];
		if (action.label !== 'Remove Tag') {
			throw Error('Wrong action for remove emote tag');
		}

		action.click(emote, tag).subscribe({
			error: err => console.error(err)
		});
	}

	ngOnInit(): void {
		this.restService.v2.SearchEmotes(1, 150, {
			sortOrder: 1,
			sortBy: 'age',
			filter: {
				visibility: DataStructure.Emote.Visibility.HIDDEN,
				visibility_clear: DataStructure.Emote.Visibility.PERMANENTLY_UNLISTED
			}
		}).pipe(
			map(({ emotes, total_estimated_size }) => {
				this.total.next(total_estimated_size);

				return this.dataService.add('emote', ...emotes);
			}),
			map(emotes => this.emotes.next(emotes))
		).subscribe({
			error: (err) => console.error(err)
		});
	}
}

export namespace AdminModQueueComponent {
	export interface EmoteQuickAction {
		label: string;
		icon: string;
		iconColor?: string;
		invisible?: boolean;
		click: (emote: EmoteStructure, extra?: any) => Observable<void>;
	}
}
