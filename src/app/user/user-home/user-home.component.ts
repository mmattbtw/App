
import { Component, Inject, OnInit } from '@angular/core';
import { asyncScheduler, BehaviorSubject, Observable, scheduled } from 'rxjs';
import { filter, map, mergeAll, switchMap } from 'rxjs/operators';
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

	constructor(
		@Inject(UserComponent) private parent: UserComponent,
		public themingService: ThemingService
	) { }

	// tslint:disable-next-line:typedef
	get user(): Observable<UserStructure> {
		return this.parent.user.asObservable() as Observable<UserStructure>;
	}

	ngOnInit(): void {
		this.user.pipe(
			filter(user => !!user),
			switchMap(user => scheduled([
				user.getEmotes().pipe(map(emotes => this.channelEmotes.next(emotes))),
				user.getOwnedEmotes().pipe(map(emotes => this.ownedEmotes.next(emotes)))
			], asyncScheduler).pipe(mergeAll()))
		).subscribe();
	}
}
