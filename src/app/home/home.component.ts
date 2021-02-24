import { Component, OnInit } from '@angular/core';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	browserIcons = [
		{
			icon: 'chrome'
		},
		{
			icon: 'firefox'
		},
		{
			icon: 'chatterino'
		}
	] as HomeComponent.BrowserIcon[];

	footerOptions = [
		{
			name: 'Contact'
		},
		{
			name: 'Developers'
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
