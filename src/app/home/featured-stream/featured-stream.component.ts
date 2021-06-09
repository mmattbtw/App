import { Component, OnInit } from '@angular/core';
import { TwitchPlayer } from 'twitch-player';

@Component({
	selector: 'app-home-featured-stream',
	templateUrl: 'featured-stream.component.html',
	styleUrls: ['featured-stream.component.scss']
})

export class HomeFeaturedStreamComponent implements OnInit {
	constructor() { }

	createTwitchPlayer(): TwitchPlayer {
		const player = TwitchPlayer.FromOptions('twitch-player', {
			width: 480,
			height: 360,
			video: 'xqcow'
		});

		return player;
	}

	ngOnInit(): void { }
}
