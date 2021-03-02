import { Component, OnInit } from '@angular/core';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-emotes',
	templateUrl: './emotes.component.html',
	styleUrls: ['./emotes.component.scss']
})
export class EmotesComponent implements OnInit {
	sidebarLinks = [
		{
			label: ''
		},
		{
			label: 'Global Emotes'
		},
		{

		},
		{

		}
	] as EmotesComponent.SidebarLink[];

	constructor(
		public themingService: ThemingService,
		public clientService: ClientService
	) { }

	ngOnInit(): void {

	}

}

export namespace EmotesComponent {
	export interface SidebarLink {
		label: string;
		path: string;
	}
}
