import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/service/app.service';

@Component({
	selector: 'app-legal-privacy',
	templateUrl: 'privacy.component.html',
	styleUrls: ['privacy.component.scss']
})

export class LegalPrivacyComponent implements OnInit {
	constructor(
		private appService: AppService
	) { }

	get email(): string {
		return this.appService.contactEmail;
	}

	ngOnInit(): void { }
}
