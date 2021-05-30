import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns/esm';

@Component({
	selector: 'app-legal-tos',
	templateUrl: 'tos.component.html',
	styleUrls: ['tos.component.scss']
})

export class LegalTOSComponent implements OnInit {
	updatedOn = 'May 30, 2021';

	constructor() { }

	ngOnInit(): void { }
}
