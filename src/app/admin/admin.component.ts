import { Component, OnInit } from '@angular/core';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
	sidebarTabs = [
		{
			title: 'Users',
			icon: 'people',
			description: 'Manage Users',
			routerLink: ['/admin', 'users']
		},
		{
			title: 'Audit Logs',
			description: 'View latest actions taken by users',
			icon: 'event_note',
			routerLink: ['/admin', 'audit']
		},
		{
			title: 'Emotes',
			description: 'Manage Emotes',
			routerLink: ['/admin', 'emotes']
		},
		{
			title: 'Monitoring',
			icon: 'monitor',
			description: 'View traffic and ongoing backend tasks',
			routerLink: ['/admin', 'monitor']
		}
	] as AdminComponent.SidebarTab[];

	constructor(
		public themingService: ThemingService
	) { }

	ngOnInit(): void {

	}

}

export namespace AdminComponent {
	export interface SidebarTab {
		title: string;
		icon: string;
		description: string;
		routerLink: string[];
	}
}
