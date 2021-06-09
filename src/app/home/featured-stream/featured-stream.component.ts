import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { UserStructure } from 'src/app/util/user.structure';
import { TwitchPlayer } from 'twitch-player';

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

	createTwitchPlayer(user: UserStructure): TwitchPlayer {
		const player = TwitchPlayer.FromOptions('twitch-player', {
			width: 474,
			height: 354,
			channel: user.getSnapshot()?.login,
			autoplay: true,
			muted: true,
			parent: ['localhost']
		});

		return player;
	}

	openStream(): void {
		this.featuredUser.pipe(
			map(usr => window.open(usr?.getTwitchURL(), '_blank'))
		).subscribe();
	}

	ngOnInit(): void {
		this.restService.v2.GetUser('vadikus007').pipe(
			map(res => this.dataService.add('user', res.user)[0])
		).subscribe({
			next: usr => {
				this.featuredUser.next(usr);
				this.createTwitchPlayer(usr);
			}
		});
	}
}
