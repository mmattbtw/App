import { Component, OnInit } from '@angular/core';
import { DataStructure } from '@typings/DataStructure';
import { Observable } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
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
