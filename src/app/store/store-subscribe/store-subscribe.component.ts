import { Component, Input, OnInit } from '@angular/core';
import { EgVault } from 'src/app/service/rest/egvault.structure';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-store-subscribe',
	templateUrl: 'store-subscribe.component.html',
	styleUrls: ['store-subscribe.component.scss']
})

export class StoreSubscribeComponent implements OnInit {
	@Input() subscription: EgVault.Subscription | null = null;

	constructor(
		public themingService: ThemingService
	) { }

	ngOnInit(): void {}
}

export namespace StoreSubscribeComponent {
	export interface PerkList {
		name: string;
		checked: boolean;
	}
}
