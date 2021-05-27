import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-chatterino-dialog',
	templateUrl: 'chatterino-dialog.component.html',
	styleUrls: ['chatterino-dialog.component.scss']
})

export class ChatterinoDialogComponent implements OnInit {
	platforms = [
		{
			label: 'Linux',
			icon: 'linux',
			url: 'https://github.com/SevenTV/chatterino7/releases/download/7.3.2/Chatterino-x86_64.AppImage'
		},
		{
			label: 'Windows',
			icon: 'windows',
			url: 'https://cdn.7tv.app/download/chatterino/7.3.2/win/chatterino-windows-x86-64.zip'
		},
		{
			label: 'MacOS',
			icon: 'apple',
			url: 'https://github.com/SevenTV/chatterino7/releases/download/7.3.2/Chatterino.dmg'
		}
	] as ChatterinoDialogComponent.PlatformIcon[];

	constructor() { }

	download(platform: ChatterinoDialogComponent.PlatformIcon): void{
		window.open(platform.url, '_blank');
	}

	ngOnInit(): void { }
}

export namespace ChatterinoDialogComponent {
	export interface PlatformIcon {
		label: string;
		icon: string;
		url: string;
		disabled?: boolean;
	}
}
