import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { asapScheduler, scheduled } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';

@Component({
	selector: 'app-chatterino-dialog',
	templateUrl: 'chatterino-dialog.component.html',
	styleUrls: ['chatterino-dialog.component.scss']
})

export class ChatterinoDialogComponent implements OnInit {
	@ViewChild('installTypeMenu', { static: true }) installTypeMenu: MatMenu | undefined;
	platforms = [] as ChatterinoDialogComponent.PlatformIcon[];
	windowsDownloads = [] as ChatterinoDialogComponent.WindowsDownload[];

	constructor(
		private restService: RestService
	) { }

	download(ev: MouseEvent, url: string | undefined): void {
		ev.preventDefault();
		if (!url) return undefined;
		if (ev.button !== 0 && ev.button !== 1) return undefined;

		window.open(url, '_blank');
	}

	ngOnInit(): void {
		scheduled([
			this.restService.createRequest<ChatterinoDialogComponent.ChatterinoVersion>('get', '/chatterino/version/win/stable', {}, 'v2').pipe(
				RestService.onlyResponse(),
				map(res => {
					this.windowsDownloads.push(
						{ label: 'INSTALLER', url: res.body?.download ?? '' },
						{ label: 'PORTABLE / STANDALONE EXE', url: res.body?.portable_download ?? '' }
					);

					return {
						label: 'Windows', icon: 'windows', svgIcon: true,
						menu: this.installTypeMenu
					} as ChatterinoDialogComponent.PlatformIcon;
				})
			),

			this.restService.createRequest<ChatterinoDialogComponent.ChatterinoVersion>('get', '/chatterino/version/linux/stable', {}, 'v2').pipe(
				RestService.onlyResponse(),
				map(res => ({
					label: 'Linux', icon: 'linux', svgIcon: true,
					url: res.body?.download
				} as ChatterinoDialogComponent.PlatformIcon))
			),

			this.restService.createRequest<ChatterinoDialogComponent.ChatterinoVersion>('get', '/chatterino/version/macos/stable', {}, 'v2').pipe(
				RestService.onlyResponse(),
				map(res => ({
					label: 'MacOS', icon: 'apple', svgIcon: true,
					url: res.body?.download
				}))
			)
		], asapScheduler).pipe(
			concatAll()
		).subscribe({
			next: p => this.platforms.push(p)
		});

		this.platforms.push(
			{
				label: 'Nightly Build',
				icon: 'nightlight',
				url: 'https://github.com/SevenTV/chatterino7/releases/tag/nightly-build'
			}
		);
	}
}

export namespace ChatterinoDialogComponent {
	export interface PlatformIcon {
		label: string;
		icon: string;
		svgIcon?: boolean;
		url?: string;
		disabled?: boolean;
		menu?: MatMenu;
	}

	export interface WindowsDownload {
		label: string;
		url: string;
	}

	export interface ChatterinoVersion {
		download: string;
		portable_download?: string;
		version: string;
	}
}
