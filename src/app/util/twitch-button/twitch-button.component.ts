import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { asyncScheduler, EMPTY, scheduled } from 'rxjs';
import { map, mergeAll, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/service/logger.service';
import { OAuthService } from 'src/app/service/oauth.service';
import { ThemingService } from 'src/app/service/theming.service';
import { API } from '@typings/API';
import { ClientService } from 'src/app/service/client.service';

@Component({
	selector: 'app-twitch-button',
	templateUrl: './twitch-button.component.html',
	styleUrls: ['./twitch-button.component.scss']
})
export class TwitchButtonComponent implements OnInit {
	@Input() size = 1;

	colors = {
		ripple: this.themingService.colors.twitch_purple.darken(.2).alpha(.4).toString(),
		border: this.themingService.colors.twitch_purple.darken(.115),
		bg: this.themingService.colors.twitch_purple
	};

	constructor(
		private httpClient: HttpClient,
		private oauthService: OAuthService,
		private logger: LoggerService,
		private clientService: ClientService,
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
	}

	open(): void {
		console.log('hi');
		scheduled([
			this.oauthService.openAuthorizeWindow<API.TwitchUser>().pipe(
				tap(data => this.clientService.pushData(data))
			),
			this.httpClient.get(`http://localhost:3000/auth`).pipe(
				map((res: TwitchButtonComponent.GetURLResult) => res.url as string),
				tap(url => this.oauthService.navigateTo(url))
			)
		], asyncScheduler).pipe(
			mergeAll(),
			switchMapTo(EMPTY)
		).subscribe({
			error: (err) => {
				this.logger.error('Could not redirect to authorization', err);
				this.oauthService.openedWindow?.close();
			}
		});
	}
}

export namespace TwitchButtonComponent {
	export interface GetURLResult {
		url?: string;
	}
}
