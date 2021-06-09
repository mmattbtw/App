import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { ChatterinoDialogComponent } from 'src/app/home/chatterino-dialog/chatterino-dialog.component';
import { AppService } from 'src/app/service/app.service';
import { DataService } from 'src/app/service/data.service';
import { LoggerService } from 'src/app/service/logger.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { ViewportService } from 'src/app/service/viewport.service';
import { UserStructure } from 'src/app/util/user.structure';

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
				label: '1.5.2',
				new: false
			}
		},
		{
			icon: 'firefox',
			click: () => window.open('https://addons.mozilla.org/en-US/firefox/addon/7tv/', '_blank'),
			tag: {
				color: this.themingService.primary.darken(.2).opaquer(1).hex(),
				label: '1.5.1',
				new: false
			}
		},
		{
			icon: 'chatterino',
			click: () => this.openChatterinoDownloadsMenu(),
			tag: {
				color: this.themingService.primary.darken(.2).opaquer(1).hex(),
				label: '7.3.2',
				new: false
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

	featuredUser = new BehaviorSubject<UserStructure | null>(null);

	constructor(
		private restService: RestService,
		private dataService: DataService,
		private dialog: MatDialog,
		private router: Router,
		private logger: LoggerService,
		public themingService: ThemingService,
		public vp: ViewportService,
		public appService: AppService
	) { }

	openChatterinoDownloadsMenu(): void {
		this.dialog.open(ChatterinoDialogComponent, {

		});
	}

	openDiscordInvite(): void {
		this.discordWidget.pipe(
			take(1),
			map(w => window.open(w?.instant_invite, 'Discord', 'width=630,height=530'))
		).subscribe();
	}

	openTwitterLink(): void {
		setTimeout(() => {
			const handle = window.open('https://twitter.com/Official_7TV');
			handle?.blur();
			window.focus();
		}, 200);
	}

	ngOnInit(): void {
		// Get Discord Widget
		this.restService.Discord.Widget().pipe(
			RestService.onlyResponse(),
			tap(res => this.discordWidget.next(res.body))
		).subscribe({
			error(): void {}
		});

		// Get featured channel
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
			},
			error: err => {
				this.logger.warn('No featured broadcast active: ', err);
			}
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
