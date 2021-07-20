import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { map } from 'rxjs/operators';

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
		private http: HttpClient
	) { }

	download(ev: MouseEvent, url: string | undefined): void {
		ev.preventDefault();
		if (!url) return undefined;
		if (ev.button !== 0 && ev.button !== 1) return undefined;

		window.open(url, '_blank');
	}

	ngOnInit(): void {
		this.platforms.push(
			{
				label: 'Linux',
				icon: 'linux',
				svgIcon: true,
				url: 'https://github.com/SevenTV/chatterino7/releases/download/7.3.3/Chatterino-x86_64.AppImage'
			},
			{
				label: 'Windows',
				icon: 'windows',
				svgIcon: true,
				menu: this.installTypeMenu
			},
			{
				label: 'MacOS',
				icon: 'apple',
				svgIcon: true,
				url: 'https://github.com/SevenTV/chatterino7/releases/download/7.3.3/Chatterino.dmg'
			},
			{
				label: 'Nightly Build',
				icon: 'nightlight',
				url: 'https://github.com/SevenTV/chatterino7/releases/tag/nightly-build'
			}
		);

		this.windowsDownloads.push(
			{
				label: 'INSTALLER',
				url: 'https://github.com/SevenTV/chatterino7/releases/download/7.3.3/Chatterino.Installer.exe'
			},
			{
				label: 'PORTABLE / STANDALONE EXE',
				url: 'https://github.com/SevenTV/chatterino7/releases/download/7.3.3/Chatterino.Portable.zip'
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
}
