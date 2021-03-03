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
			description: 'Manage Users'
		},
		{
			title: 'Emotes',
			description: 'Manage Emotes'
		},
		{
			title: 'Monitoring',
			icon: 'monitor',
			description: 'View traffic and ongoing backend tasks'
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
	}
}
