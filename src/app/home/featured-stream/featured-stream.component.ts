import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-home-featured-stream',
	templateUrl: 'featured-stream.component.html',
	styleUrls: ['featured-stream.component.scss']
})

export class HomeFeaturedStreamComponent implements OnInit {
	featuredUser = new BehaviorSubject<UserStructure | null>(null);

	constructor(
		private restService: RestService,
		private dataService: DataService,
		public themingService: ThemingService
	) { }

	createTwitchPlayer(user: UserStructure): void {
		import('twitch-player').then(M => {
			const player = M.TwitchPlayer.FromOptions('twitch-player', {
				width: 474,
				height: 354,
				channel: user.getSnapshot()?.login,
				autoplay: true,
				muted: false,
				parent: ['localhost', '7tv.app']
			});
			player.setVolume(0.1);
		});
	}

	openStream(): void {
		this.featuredUser.pipe(
			map(usr => window.open(usr?.getTwitchURL(), '_blank'))
		).subscribe();
	}

	ngOnInit(): void {
		AppComponent.isBrowser.pipe(
			take(1),
			filter(b => b === true),

			switchMap(() => this.restService.v2.gql.query<{ featured_broadcast: string; }>({
				query: `
					query GetFeaturedBroadcast() {
						featured_broadcast()
					}
				`
			})),
			map(res => res?.body?.data.featured_broadcast),
			switchMap(login => !!login ? this.restService.v2.GetUser(login) : throwError('No Featured Broadcast')),
			map(res => this.dataService.add('user', res.user)[0])
		).subscribe({
			next: usr => {
				this.featuredUser.next(usr);
				this.createTwitchPlayer(usr);
			}
		});
	}
}
