
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { asapScheduler, asyncScheduler, BehaviorSubject, from, iif, noop, Observable, of, scheduled } from 'rxjs';
import { concatAll, filter, map, mapTo, mergeMap, switchMap, take, toArray } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';
import { UserComponent } from 'src/app/user/user.component';
import { EmoteStructure } from 'src/app/util/emote.structure';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-user-home',
	templateUrl: 'user-home.component.html',
	styleUrls: ['user-home.component.scss']
})

export class UserHomeComponent implements OnInit {
	channelEmotes = new BehaviorSubject<EmoteStructure[]>([]);
	ownedEmotes = new BehaviorSubject<EmoteStructure[]>([]);

	blurred = new Set<string>();

	constructor(
		@Inject(UserComponent) private parent: UserComponent,
		private clientService: ClientService,
		private cdr: ChangeDetectorRef,
		public themingService: ThemingService
	) { }

	// tslint:disable-next-line:typedef
	get user(): Observable<UserStructure> {
		return this.parent.user.asObservable() as Observable<UserStructure>;
	}

	private shouldBlurEmote(emote: EmoteStructure): Observable<boolean> {
		return scheduled([
			emote.hasVisibility('HIDDEN'),
			emote.hasVisibility('PRIVATE')
		], asyncScheduler).pipe(
			concatAll(),
			toArray(),
			mergeMap(b => iif(() => b[0] === true || b[1] === true,
				this.clientService.hasPermission('EDIT_EMOTE_ALL').pipe(
					take(1),
					switchMap(bypass => iif(() => bypass,
						of(false),
						emote.getOwnerID().pipe(
							map(ownerID => ownerID !== this.clientService.id)
						)
					))
				),
				of(false)
			)),
			take(1)
		);
	}

	isBlurred(emote: EmoteStructure): boolean {
		return this.blurred.has(emote.getID());
	}

	ngOnInit(): void {
		this.user.pipe(
			filter(user => !!user),
			take(1),
			switchMap(user => scheduled([
				user.getEmotes().pipe(map(emotes => ({ type: 'channel', emotes }))),
				user.getOwnedEmotes().pipe(map(emotes => ({ type: 'owned', emotes })))
			], asapScheduler).pipe(
				concatAll(),
				take(2),
				mergeMap(s => from(s.emotes).pipe(
					mergeMap(em => this.shouldBlurEmote(em).pipe(map(blur => ({ blur, emote: em })))),
					map(x => x.blur ? this.blurred.add(x.emote.getID()) : noop()),
					mapTo(s)
				))
			))
		).subscribe({
			next: set => {
				console.log(set);
				switch (set.type) {
					case 'channel':
						this.channelEmotes.next(set.emotes);
						break;
					case 'owned':
						this.ownedEmotes.next(set.emotes);
						break;

				}
			},
			complete: () => this.cdr.markForCheck()
		});
	}
}
