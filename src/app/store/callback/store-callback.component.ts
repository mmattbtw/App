import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-store-callback',
	templateUrl: 'store-callback.component.html',
	styleUrls: ['store-callback.component.scss']
})
export class StoreCallbackComponent implements OnInit {
	gift = false;
	constructor(
		private route: ActivatedRoute,
		public themingService: ThemingService
	) {}

	ngOnInit(): void {
		const route = this.route.snapshot;
		if (route.queryParamMap.get('is_gift') === 'true') {
			this.gift = true;
		}
	}
}
