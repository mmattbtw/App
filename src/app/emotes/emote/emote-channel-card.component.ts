

import { Component, Input, OnInit } from '@angular/core';
import { ThemingService } from 'src/app/service/theming.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-emote-channel-card',
	templateUrl: 'emote-channel-card.component.html',
	styleUrls: ['emote-channel-card.component.scss']
})

export class EmoteChannelCardComponent implements OnInit {
	@Input() user: UserStructure | undefined;

	constructor(
		public themingService: ThemingService
	) { }

	ngOnInit(): void { }
}
