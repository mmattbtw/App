import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
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
			click: () => window.open('https://chrome.google.com/webstore/detail/7tv/ammjkodgmmoknidbanneddgankgfejfh', '_blank')
		},
		{
			icon: 'firefox',
			click: () => window.open('https://github.com/SevenTV/SevenTV', '_blank')
		},
		{
			icon: 'chatterino',
			click: () => window.open('https://github.com/SevenTV/SevenTV', '_blank')
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

	constructor(
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
	}

}

export namespace HomeComponent {
	export interface BrowserIcon {
		icon: string;
		click: (ev: MouseEvent) => void;
	}

	export interface FooterOptions {
		name: string;
		path: string;
	}
}
