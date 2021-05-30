import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns/esm';
import { AppService } from 'src/app/service/app.service';

@Component({
	selector: 'app-legal-tos',
	templateUrl: 'tos.component.html',
	styleUrls: ['tos.component.scss']
})

export class LegalTOSComponent implements OnInit {
	updatedOn = 'May 30, 2021';

	constructor(
		private appService: AppService
	) { }

	get email(): string {
		return this.appService.contactEmail;
	}

	ngOnInit(): void { }
}
