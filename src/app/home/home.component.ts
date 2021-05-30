import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChatterinoDialogComponent } from 'src/app/home/chatterino-dialog/chatterino-dialog.component';
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
				color: this.themingService.primary.darken(.2).opaquer(1).hex(),
				label: '1.5.0'
			}
		},
		{
			icon: 'chatterino',
			click: () => this.openChatterinoDownloadsMenu(),
			tag: {
				color: this.themingService.bg.darken(.75).hex(),
				label: 'NEW!',
				new: true
			}
		}
	] as HomeComponent.BrowserIcon[];

	footerOptions = [
		{
			name: 'Contact',
			path: 'mailto:cupofeggy@gmail.com'
		},
		{
			name: 'GitHub',
			path: 'https://github.com/SevenTV'
		},
		{
			name: 'Privacy Policy',
			click: () => this.router.navigate(['/legal', 'privacy'])
		},
		{
			name: 'Terms of Service',
			click: () => this.router.navigate(['/legal', 'tos'])
		}
	] as HomeComponent.FooterOptions[];

	logoSize = 64 * 3;
	discordWidget = new BehaviorSubject<RestService.Result.GetDiscordWidget | null>(null);

	constructor(
		private restService: RestService,
		private dialog: MatDialog,
		private router: Router,
		public themingService: ThemingService,
		public appService: AppService
	) { }

	openChatterinoDownloadsMenu(): void {
		this.dialog.open(ChatterinoDialogComponent, {

		});
	}

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
			new?: boolean;
		};
	}

	export interface FooterOptions {
		name: string;
		path?: string;
		click?: () => void;
	}
}
