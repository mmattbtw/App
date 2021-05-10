import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppService } from 'src/app/service/app.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
	animations: [
		trigger('browserIcon', [
			transition(':enter', [
				style({ transform: 'scale(0)' }),
				animate('100ms', style({ transform: 'scale(1)' }))
			]),
			transition(':leave', [
				style({ transform: 'scale(1)' }),
				animate('100ms', style({ transform: 'scale(0)' }))
			])
		])
	]
})
export class HomeComponent implements OnInit {
	browserIcons = [
		{
			icon: 'chrome',
			click: () => window.open('https://chrome.google.com/webstore/detail/7tv/ammjkodgmmoknidbanneddgankgfejfh', '_blank'),
			tag: {
				color: this.themingService.primary.darken(.2).opaquer(1).hex(),
				label: '1.5.0'
			}
		},
		{
			icon: 'firefox',
			click: () => window.open('https://addons.mozilla.org/en-US/firefox/addon/7tv/', '_blank'),
			tag: {
				color: this.themingService.accent.darken(.4).hex(),
				label: 'NEW!'
			}
		},
		{
			icon: 'chatterino',
			click: () => window.open('hhttps://github.com/SevenTV/SevenTV#chatterino', '_blank'),
			tag: {
				color: this.themingService.bg.darken(.75).hex(),
				label: 'SOON'
			}
		}
	] as HomeComponent.BrowserIcon[];

	footerOptions = [
		{
			name: 'Contact'
		},
		{
			name: 'GitHub',
			path: 'https://github.com/SevenTV'
		},
		{
			name: 'Privacy Policy'
		},
	] as HomeComponent.FooterOptions[];

	logoSize = 64 * 3;
	discordWidget = new BehaviorSubject<RestService.Result.GetDiscordWidget | null>(null);

	constructor(
		private restService: RestService,
		public themingService: ThemingService,
		public appService: AppService
	) { }

	ngOnInit(): void {
		// Get Discord Widget
		this.restService.Discord.Widget().pipe(
			RestService.onlyResponse(),
			tap(res => this.discordWidget.next(res.body))
		).subscribe({
			error(): void {}
		});
	}

}

export namespace HomeComponent {
	export interface BrowserIcon {
		icon: string;
		click: (ev: MouseEvent) => void;
		tag?: {
			label: string;
			color: string;
		};
	}

	export interface FooterOptions {
		name: string;
		path: string;
	}
}
