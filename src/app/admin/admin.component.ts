import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
			title: 'Mod Queue',
			description: 'Take actions on items pending approval',
			icon: 'pending',
			routerLink: ['/admin', 'modq']
		},
		{
			title: 'WebSocket API',
			description: 'Manage the WebSocket API & Connections',
			icon: 'sensors',
			routerLink: ['/admin', 'ws']
		},
		// {
		// 	title: 'Emotes',
		// 	description: 'Manage Emotes',
		// 	routerLink: ['/admin', 'emotes']
		// },
		// {
		// 	title: 'Monitoring',
		// 	icon: 'monitor',
		// 	description: 'View traffic and ongoing backend tasks',
		// 	routerLink: ['/admin', 'monitor']
		// }
	] as AdminComponent.SidebarTab[];

	selectedTab = new BehaviorSubject<AdminComponent.SidebarTab>(this.sidebarTabs[0]);

	constructor(
		private router: Router,
		public themingService: ThemingService
	) { }

	switchTab(tab: AdminComponent.SidebarTab): void {
		for (const t of this.sidebarTabs) {
			t.active = false;
		}

		tab.active = false;
		this.selectedTab.next(tab);
		this.router.navigate(tab.routerLink);
	}

	ngOnInit(): void {

	}

}

export namespace AdminComponent {
	export interface SidebarTab {
		title: string;
		icon: string;
		description: string;
		routerLink: string[];
		active?: boolean;
	}
}
