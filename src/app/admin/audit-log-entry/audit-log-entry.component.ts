import { Component, Input, OnInit } from '@angular/core';
import { ClientService } from 'src/app/service/client.service';
import { AuditLogEntry } from 'src/app/util/audit.structure';

@Component({
	selector: 'app-audit-log-entry',
	templateUrl: 'audit-log-entry.component.html',
	styleUrls: ['audit-log-entry.component.scss']
})

export class AuditLogEntryComponent implements OnInit {
	@Input() entry: AuditLogEntry | null = null;

	constructor(
		public clientService: ClientService
	) { }

	ngOnInit(): void {
		if (!this.entry) throw new Error('No Entry Given');


	}
}
