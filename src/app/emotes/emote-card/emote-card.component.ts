import { Component, Input, OnInit } from '@angular/core';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-emote-card',
	templateUrl: './emote-card.component.html',
	styleUrls: ['./emote-card.component.scss']
})
export class EmoteCardComponent implements OnInit {
	@Input() size = 8;

	constructor(
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
	}

}
