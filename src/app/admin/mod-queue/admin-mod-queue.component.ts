import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BitField } from '@typings/src/BitField';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { EmoteComponent } from 'src/app/emotes/emote/emote.component';
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
				mapTo(undefined)
			)
		}
	] as AdminModQueueComponent.EmoteQuickAction[];

	constructor(
		public themingService: ThemingService,
		private router: Router,
		private restService: RestService,
		private dataService: DataService,
		private dialog: MatDialog
	) { }

	openEmote(emote: EmoteStructure): void {
		const dialogRef = this.dialog.open(EmoteComponent, {});
		dialogRef.componentInstance.emote = emote;
		dialogRef.componentInstance.disableNotices = true;
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

	ngOnInit(): void {
		this.restService.v2.SearchEmotes(1, 150, {
			sortOrder: 1,
			filter: {
				visibility: DataStructure.Emote.Visibility.HIDDEN
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
		click: (emote: EmoteStructure) => Observable<void>;
	}
}
