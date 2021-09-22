import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, noop } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { WindowRef } from 'src/app/service/window.service';

@Component({
	selector: 'app-youtube-verify',
	templateUrl: 'yt-verify.component.html',
	styleUrls: ['yt-verify.component.scss']
})
export class YouTubeVerifyComponent implements OnInit, OnDestroy {
	currentStep = 0;
	channelIdentifier = new FormControl('', [Validators.required, Validators.minLength(2)]);
	requestingVerification = new BehaviorSubject(false);

	currentError = new BehaviorSubject('');

	token = '[7TV VERIFY]:"YEAHBUT7TV"';
	channelID = '';
	ytStudioURL = '';
	channelRetrieved = new BehaviorSubject(false);
	channelTitle = new BehaviorSubject('');
	channelThumbnailURL = new BehaviorSubject('');

	constructor(
		public themingService: ThemingService,
		private clientService: ClientService,
		private restService: RestService,
		private windowRef: WindowRef
	) {

	}

	startVerification(): void {
		this.requestingVerification.next(true);
		this.restService.createRequest<YouTubeVerifyComponent.RequestVerificationResponse>(
			'get',
			`/auth/youtube/request-verification?channel_id=${this.channelIdentifier.value}`,
			{ auth: true },
			'v2'
		).pipe(
			RestService.onlyResponse()
		).subscribe({
			next: res => {
				this.requestingVerification.next(false);
				this.currentError.next('');
				this.channelID = res.body?.channel_id ?? '';
				this.token = res.body?.verification_string ?? '';
				this.ytStudioURL = res.body?.manage_channel_url ?? '';
				this.channelTitle.next(res.body?.channel.snippet.title ?? '');
				this.channelThumbnailURL.next(res.body?.channel.snippet.thumbnails.medium.url ?? '');
				this.channelRetrieved.next(true);
				this.currentStep++;
			},
			error: (err: HttpErrorResponse) => {
				this.requestingVerification.next(false);
				this.currentError.next(err.error.reason);
				this.channelRetrieved.next(false);
			}
		});
	}

	copyToken(): void {
		this.windowRef.copyValueToClipboard(this.token);
	}

	openStudio(): void {
		window.open(this.ytStudioURL, '_blank');
	}

	verify(): void {
		this.restService.createRequest(
			'get',
			`/auth/youtube/verify?channel_id=${this.channelID}`,
			{ auth: true },
			'v2'
		).pipe(
			RestService.onlyResponse()
		).subscribe({
			next: () => {
				this.currentError.next('');
				this.currentStep++;
			},
			error: (err: HttpErrorResponse) => {
				this.currentError.next(err.error.reason);
			}
		});
	}

	ngOnInit(): void {
		this.clientService.isAuthenticated().pipe(
			map(yes => yes ? this.currentStep++ : noop())
		).subscribe();
	}

	ngOnDestroy(): void {
		this.requestingVerification.complete();
		this.currentError.complete();
	}
}

export namespace YouTubeVerifyComponent {
	export interface RequestVerificationResponse {
		token: string;
		verification_string: string;
		manage_channel_url: string;
		channel_id: string;
		channel: Channel;
	}

	export interface Channel {
		etag: string;
		id: string;
		kind: 'youtube#channel';
		snippet: {
			country: string;
			description: string;
			publishedAt: string;
			thumbnails: {
				default: Thumbnail;
				high: Thumbnail;
				medium: Thumbnail;
			}
			title: string;
		};
	}

	export interface Thumbnail {
		url: string;
		width?: number;
		height?: number;
	}
}
