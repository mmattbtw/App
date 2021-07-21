import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppService } from 'src/app/service/app.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
	featureList = [
		'All core functionality is free to use',
		'Up to 200 channel emote slots by default, free forever',
		'Support for wide and animated wide emotes (3:1 ratio)',
		'Monthly Community Events & Contests',
		'Downloadable for Chrome and Chromium-based browsers, Firefox, Chatterino & more',
		'Seamlessly integrates with your other Twitch extensions',
		'Uses the newer WebP image format, resulting in much lighter images',
		'Less opinionated: no content is removed so long as it is safe to show on stream and doesn\'t violate copyright',
		'Transparency: all moderator actions are recorded and visible publicly. No cheating involved.',
		'Active Development & Open Source'
	] as string[];

	// Work in progress
	faq = [
		{
			question: 'Someone re-uploaded an emote I made, can I acquire ownership of it?',
			answer: 'Yes, currently due to the lack of a built-in reporting system, the fastest way is by contacting a moderator on our discord server'
		}
	] as AboutComponent.QuestionAnswer[];

	discordInvite = new BehaviorSubject('');

	constructor(
		private restService: RestService,
		public appService: AppService,
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
		this.restService.Discord.Widget().pipe(
			RestService.onlyResponse()
		).subscribe({
			next: (res) => this.discordInvite.next(res.body?.instant_invite ?? '')
		});
	}

	ngOnDestroy(): void {
		this.discordInvite.complete();
	}

}

export namespace AboutComponent {
	export interface QuestionAnswer {
		question: string;
		answer: string;
	}
}
